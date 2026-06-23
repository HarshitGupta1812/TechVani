import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import zod from 'zod';
import User from '../models/User.js';

const router = express.Router();

const signupSchema = zod.object({
  username: zod.string().min(3, 'Username must be at least 3 characters').max(30),
  email: zod.string().email('Invalid email format'),
  password: zod.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = zod.object({
  email: zod.string().email('Invalid email format'),
  password: zod.string().min(1, 'Password is required')
});

const validateBody = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    return res.status(400).json({ errors: error.errors.map(e => e.message) });
  }
};

router.post('/signup', validateBody(signupSchema), async (req, res) => {
  const { username, email, password } = req.body;
  try {
    let existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email or username already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser._id, username: newUser.username, email: newUser.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during signup' });
  }
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

export default router;