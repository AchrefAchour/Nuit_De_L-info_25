const { Contributor } = require('../models');
const { generateToken } = require('../middlewares/auth');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await Contributor.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Create new user
    const user = await Contributor.create({
      name,
      email,
      password,
      role: role || 'contributor',
    });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully.',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await Contributor.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    // Validate password
    const isValid = await user.validatePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);

    res.json({
      message: 'Login successful.',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login.' });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user.toJSON() });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user info.' });
  }
};

// Update current user
const updateMe = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    await req.user.update({ name, avatar });

    res.json({
      message: 'Profile updated successfully.',
      user: req.user.toJSON(),
    });
  } catch (error) {
    console.error('Update me error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate current password
    const isValid = await req.user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    // Update password
    await req.user.update({ password: newPassword });

    res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
};

