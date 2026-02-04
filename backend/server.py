from fastapi import FastAPI, APIRouter, HTTPException, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import secrets
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Resend configuration
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
JWT_SECRET = os.environ.get('JWT_SECRET', 'your_jwt_secret_here_change_in_production')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============= Models =============
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# Auth Models
class AdminRegisterRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AdminLoginResponse(BaseModel):
    token: str
    email: str
    message: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    token: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    token: str
    new_password: str


class EmailRequest(BaseModel):
    recipient_email: EmailStr
    subject: str
    html_content: str


# ============= Helper Functions =============
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_token() -> str:
    """Generate a random token"""
    return secrets.token_urlsafe(32)


def create_jwt_token(email: str) -> str:
    """Create a JWT token"""
    payload = {
        'email': email,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')


def verify_jwt_token(token: str) -> Optional[str]:
    """Verify a JWT token and return email"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload.get('email')
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def send_email_async(recipient_email: str, subject: str, html_content: str):
    """Send email using Resend"""
    params = {
        "from": SENDER_EMAIL,
        "to": [recipient_email],
        "subject": subject,
        "html": html_content
    }

    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {recipient_email}, ID: {email.get('id')}")
        return email
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise


# ============= Routes =============
@api_router.get("/")
async def root():
    return {"message": "VipBarbeiro API"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks


# ============= Authentication Routes =============
@api_router.post("/auth/register")
async def register_admin(request: AdminRegisterRequest):
    """Register a new admin user - DEV MODE: Auto-verified"""
    # Check if any admin already exists
    existing_admins = await db.admin_users.find_one({})
    if existing_admins:
        raise HTTPException(status_code=400, detail="Admin já registrado. Use a recuperação de senha se esqueceu suas credenciais.")
    
    # Check if email already exists
    existing_user = await db.admin_users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    
    # Create new admin user - AUTO VERIFIED for development
    hashed_password = hash_password(request.password)
    
    new_admin = {
        "email": request.email,
        "passwordHash": hashed_password,
        "isVerified": True,  # AUTO VERIFIED - Development mode
        "verificationToken": None,
        "resetToken": None,
        "resetTokenExpiry": None,
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    
    await db.admin_users.insert_one(new_admin)
    
    # Generate JWT token for immediate login
    token = create_jwt_token(request.email)
    
    return {
        "message": "Conta criada com sucesso! Você já pode fazer login.",
        "email": request.email,
        "token": token,
        "auto_verified": True
    }


@api_router.post("/auth/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verify admin email"""
    user = await db.admin_users.find_one({"email": request.email, "verificationToken": request.token})
    
    if not user:
        raise HTTPException(status_code=400, detail="Token de verificação inválido ou expirado")
    
    # Update user as verified
    await db.admin_users.update_one(
        {"email": request.email},
        {
            "$set": {
                "isVerified": True,
                "verificationToken": None,
                "updatedAt": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Generate JWT token
    token = create_jwt_token(request.email)
    
    return {
        "message": "Email verificado com sucesso!",
        "token": token,
        "email": request.email
    }


@api_router.post("/auth/login", response_model=AdminLoginResponse)
async def login_admin(request: AdminLoginRequest):
    """Login admin user"""
    user = await db.admin_users.find_one({"email": request.email})
    
    if not user:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if not verify_password(request.password, user['passwordHash']):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos")
    
    if not user.get('isVerified', False):
        raise HTTPException(status_code=401, detail="Email não verificado. Verifique sua caixa de entrada.")
    
    token = create_jwt_token(request.email)
    
    return AdminLoginResponse(
        token=token,
        email=request.email,
        message="Login realizado com sucesso"
    )


@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Request password reset"""
    user = await db.admin_users.find_one({"email": request.email})
    
    if not user:
        # Don't reveal if email exists
        return {"message": "Se o email existir, você receberá instruções para redefinir sua senha."}
    
    # Generate reset token
    reset_token = generate_token()
    reset_expiry = datetime.utcnow() + timedelta(hours=1)
    
    await db.admin_users.update_one(
        {"email": request.email},
        {
            "$set": {
                "resetToken": reset_token,
                "resetTokenExpiry": reset_expiry.isoformat(),
                "updatedAt": datetime.utcnow().isoformat()
            }
        }
    )
    
    # Send reset email
    reset_link = f"{FRONTEND_URL}/admin/reset-password?email={request.email}&token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #d4a855; color: white; padding: 20px; text-align: center; }}
            .content {{ background-color: #f9f9f9; padding: 30px; }}
            .button {{ display: inline-block; padding: 12px 30px; background-color: #d4a855; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🪒 VipBarbeiro</h1>
            </div>
            <div class="content">
                <h2>Redefinir Senha</h2>
                <p>Recebemos uma solicitação para redefinir sua senha.</p>
                <p>Clique no botão abaixo para criar uma nova senha:</p>
                <center>
                    <a href="{reset_link}" class="button">Redefinir Senha</a>
                </center>
                <p>Ou copie e cole este link no seu navegador:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">{reset_link}</p>
                <p>Este link expira em 1 hora.</p>
            </div>
            <div class="footer">
                <p>Se você não solicitou esta redefinição, ignore este email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    try:
        await send_email_async(request.email, "Redefinir Senha - VipBarbeiro", html_content)
    except Exception as e:
        logger.error(f"Failed to send reset email: {str(e)}")
    
    return {"message": "Se o email existir, você receberá instruções para redefinir sua senha."}


@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with token"""
    user = await db.admin_users.find_one({"email": request.email, "resetToken": request.token})
    
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado")
    
    # Check if token expired
    if user.get('resetTokenExpiry'):
        expiry = datetime.fromisoformat(user['resetTokenExpiry'])
        if datetime.utcnow() > expiry:
            raise HTTPException(status_code=400, detail="Token expirado. Solicite um novo.")
    
    # Update password
    hashed_password = hash_password(request.new_password)
    
    await db.admin_users.update_one(
        {"email": request.email},
        {
            "$set": {
                "passwordHash": hashed_password,
                "resetToken": None,
                "resetTokenExpiry": None,
                "updatedAt": datetime.utcnow().isoformat()
            }
        }
    )
    
    return {"message": "Senha redefinida com sucesso!"}


@api_router.post("/auth/check-admin-exists")
async def check_admin_exists():
    """Check if any admin user exists"""
    admin = await db.admin_users.find_one({})
    return {"exists": admin is not None}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
