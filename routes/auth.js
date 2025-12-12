const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const router = express.Router();

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticate a user with email and password and return a JWT token.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '2h' }
    );

    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @openapi
 * /api/signup:
 *   post:
 *     summary: Register a new student user
 *     description: Create a student account with profile details.
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               courseEnrolled:
 *                 type: string
 *               intake:
 *                 type: string
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Student created
 *       400:
 *         description: Validation error
 */
router.post('/signup', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      courseEnrolled,
      intake,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = `${firstName} ${lastName}`.trim();

    const user = await User.create({
      email,
      passwordHash,
      role: 'student',
      displayName,
      firstName,
      lastName,
      phone,
      courseEnrolled,
      intake,
    });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '2h' }
    );

    res.status(201).json({ token, user: payload });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



const { sendMail } = require('../services/emailService');

/**
 * Request a password reset email.
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // In a real app, generate a secure token and store it.
    const resetLink = 'https://husky-ai-reset.example.com/reset?email=' + encodeURIComponent(email);

    await sendMail({
      to: email,
      subject: 'Reset your Husky AI password',
      text: `You requested to reset your Husky AI password. Use this link: ${resetLink}`,
      html: `<p>You requested to reset your Husky AI password.</p><p><a href="${resetLink}">Click here to reset</a></p>`,
    });

    res.json({
      message:
        'If this email is registered, a password reset link will be sent shortly.',
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * Newsletter signup endpoint.
 */
router.post('/newsletter', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    await sendMail({
      to: email,
      subject: 'Welcome to Husky AI Newsletter',
      text: 'Thanks for joining Husky AI’s newsletter! You will now receive updates and tips.',
      html: '<p>Thanks for joining <strong>Husky AI</strong>’s newsletter! You will now receive updates and tips.</p>',
    });

    res.json({ message: "You've joined Husky AI's newsletter." });
  } catch (err) {
    console.error('Newsletter signup error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
