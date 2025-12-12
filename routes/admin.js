const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/users', auth(['super-admin', 'husky-admin']), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @openapi
 * /api/admin/students:
 *   get:
 *     summary: Get all student users
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/students', auth(['super-admin', 'husky-admin', 'faculty']), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('-passwordHash');
    res.json(students);
  } catch (err) {
    console.error('List students error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @openapi
 * /api/admin/faculty:
 *   post:
 *     summary: Create a new faculty user
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
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
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Faculty created
 */
router.post('/faculty', auth(['super-admin', 'husky-admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

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
      role: 'faculty',
      displayName,
      firstName,
      lastName,
    });

    res.status(201).json({
      id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
    });
  } catch (err) {
    console.error('Create faculty error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
