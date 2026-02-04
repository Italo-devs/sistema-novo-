const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Hash de senha usando bcrypt
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verifica se a senha corresponde ao hash
 */
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Gera um token JWT
 */
function generateToken(email) {
  return jwt.sign(
    { email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Verifica e decodifica um token JWT
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Gera um token aleatório para reset/verificação
 */
function generateRandomToken() {
  return require('crypto').randomBytes(32).toString('hex');
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateRandomToken,
};
