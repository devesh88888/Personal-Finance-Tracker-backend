const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createUser, getUserByEmail } = require('../models/userModel');

const ALLOWED_ROLES = new Set(['admin', 'user', 'read-only']);
const normalizeRole = (r) =>
  (typeof r === 'string' ? r.trim().toLowerCase() : 'user');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: John Doe }
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: secret123 }
 *               role:
 *                 type: string
 *                 enum: [admin, user, read-only]
 *     responses:
 *       201: { description: User registered }
 *       400: { description: Validation error }
 */
const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const normalizedRole = ALLOWED_ROLES.has(normalizeRole(role))
      ? normalizeRole(role)
      : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser(name, email, hashedPassword, normalizedRole);

    // You redirect to login after register, but returning the role helps debugging/UI if needed
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: normalizedRole }
    });
  } catch (err) {
    res.status(500).json({ message: 'Registration error', error: err.message });
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user and return a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, example: john@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200:
 *         description: User authenticated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     role: { type: string }
 *       400: { description: Invalid credentials }
 */
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const normalizedRole = ALLOWED_ROLES.has(normalizeRole(user.role))
      ? normalizeRole(user.role)
      : 'user';

    const token = jwt.sign(
      { id: user.id, role: normalizedRole },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: normalizedRole }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
};

module.exports = { register, login };
