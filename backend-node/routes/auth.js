const express = require('express');
const { body, validationResult } = require('express-validator');
const AdminUser = require('../models/AdminUser');
const {
  hashPassword,
  verifyPassword,
  generateToken,
  generateRandomToken,
} = require('../utils/auth');

const router = express.Router();

/**
 * POST /api/auth/check-admin-exists
 * Verifica se já existe algum admin cadastrado
 */
router.post('/check-admin-exists', async (req, res) => {
  try {
    const exists = await AdminUser.exists();
    res.json({ exists });
  } catch (error) {
    console.error('Erro em check-admin-exists:', error);
    res.status(500).json({ 
      error: 'Erro ao verificar admin',
      detail: error.message 
    });
  }
});

/**
 * POST /api/auth/register
 * Registra um novo admin (modo desenvolvimento: auto-verificado)
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres'),
  ],
  async (req, res) => {
    try {
      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          detail: errors.array()[0].msg 
        });
      }

      const { email, password } = req.body;

      // Verifica se já existe admin
      const adminExists = await AdminUser.exists();
      if (adminExists) {
        return res.status(400).json({
          error: 'Admin já registrado',
          detail: 'Admin já registrado. Use a recuperação de senha se esqueceu suas credenciais.',
        });
      }

      // Verifica se email já existe
      const existingUser = await AdminUser.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Email já cadastrado',
          detail: 'Este email já está cadastrado',
        });
      }

      // Cria hash da senha
      const passwordHash = await hashPassword(password);

      // Cria novo admin (modo desenvolvimento: auto-verificado)
      const newAdmin = {
        email,
        passwordHash,
        isVerified: true, // Auto-verificado para desenvolvimento
        verificationToken: null,
        resetToken: null,
        resetTokenExpiry: null,
      };

      await AdminUser.create(newAdmin);

      // Gera token JWT para login automático
      const token = generateToken(email);

      res.status(201).json({
        message: 'Conta criada com sucesso! Você já pode fazer login.',
        email,
        token,
        auto_verified: true,
      });
    } catch (error) {
      console.error('Erro em register:', error);
      res.status(500).json({
        error: 'Erro ao criar conta',
        detail: error.message,
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Faz login do admin
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    try {
      // Validação
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          detail: errors.array()[0].msg,
        });
      }

      const { email, password } = req.body;

      // Busca usuário
      const user = await AdminUser.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          detail: 'Email ou senha incorretos',
        });
      }

      // Verifica senha
      const isPasswordValid = await verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          error: 'Credenciais inválidas',
          detail: 'Email ou senha incorretos',
        });
      }

      // Verifica se está verificado
      if (!user.isVerified) {
        return res.status(401).json({
          error: 'Email não verificado',
          detail: 'Email não verificado. Verifique sua caixa de entrada.',
        });
      }

      // Gera token
      const token = generateToken(email);

      res.json({
        message: 'Login realizado com sucesso',
        token,
        email,
      });
    } catch (error) {
      console.error('Erro em login:', error);
      res.status(500).json({
        error: 'Erro ao fazer login',
        detail: error.message,
      });
    }
  }
);

/**
 * POST /api/auth/verify-email
 * Verifica o email do admin
 */
router.post(
  '/verify-email',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('token').notEmpty().withMessage('Token é obrigatório'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          detail: errors.array()[0].msg,
        });
      }

      const { email, token } = req.body;

      const user = await AdminUser.findByEmail(email);
      if (!user || user.verificationToken !== token) {
        return res.status(400).json({
          error: 'Token inválido',
          detail: 'Token de verificação inválido ou expirado',
        });
      }

      // Atualiza usuário como verificado
      await AdminUser.update(email, {
        isVerified: true,
        verificationToken: null,
      });

      // Gera token JWT
      const jwtToken = generateToken(email);

      res.json({
        message: 'Email verificado com sucesso!',
        token: jwtToken,
        email,
      });
    } catch (error) {
      console.error('Erro em verify-email:', error);
      res.status(500).json({
        error: 'Erro ao verificar email',
        detail: error.message,
      });
    }
  }
);

/**
 * POST /api/auth/forgot-password
 * Solicita reset de senha
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email inválido')],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Email inválido',
          detail: errors.array()[0].msg,
        });
      }

      const { email } = req.body;

      // Sempre retorna sucesso (não revela se email existe)
      const user = await AdminUser.findByEmail(email);
      
      if (user) {
        const resetToken = generateRandomToken();
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

        await AdminUser.update(email, {
          resetToken,
          resetTokenExpiry,
        });

        // Aqui você enviaria o email (não implementado)
        console.log(`Reset token para ${email}: ${resetToken}`);
      }

      res.json({
        message: 'Se o email existir, você receberá instruções para redefinir sua senha.',
      });
    } catch (error) {
      console.error('Erro em forgot-password:', error);
      res.status(500).json({
        error: 'Erro ao processar solicitação',
        detail: error.message,
      });
    }
  }
);

/**
 * POST /api/auth/reset-password
 * Redefine a senha com token
 */
router.post(
  '/reset-password',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('new_password')
      .isLength({ min: 8 })
      .withMessage('Senha deve ter no mínimo 8 caracteres'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Dados inválidos',
          detail: errors.array()[0].msg,
        });
      }

      const { email, token, new_password } = req.body;

      const user = await AdminUser.findByEmail(email);
      if (!user || user.resetToken !== token) {
        return res.status(400).json({
          error: 'Token inválido',
          detail: 'Token inválido ou expirado',
        });
      }

      // Verifica se token expirou
      if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
        return res.status(400).json({
          error: 'Token expirado',
          detail: 'Token expirado. Solicite um novo.',
        });
      }

      // Atualiza senha
      const passwordHash = await hashPassword(new_password);
      await AdminUser.update(email, {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      });

      res.json({
        message: 'Senha redefinida com sucesso!',
      });
    } catch (error) {
      console.error('Erro em reset-password:', error);
      res.status(500).json({
        error: 'Erro ao redefinir senha',
        detail: error.message,
      });
    }
  }
);

module.exports = router;
