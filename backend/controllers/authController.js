const { Contributor, sequelize } = require('../models');
const { generateToken } = require('../middlewares/auth');

// Register new user
const register = async (req, res) => {
  try {
    // Email is already normalized by customSanitizer in routes
    const { name, email, password, role } = req.body;

    console.log('[AUTH] Register attempt:', { name, email, role: role || 'contributor' });

    // Email should already be normalized by customSanitizer, but normalize again to be safe
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Check if email already exists (case-insensitive)
    const existingUser = await Contributor.findOne({ 
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        normalizedEmail
      )
    });
    
    if (existingUser) {
      console.log('[AUTH] Email already exists:', normalizedEmail);
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Create new user with normalized email
    const user = await Contributor.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role || 'contributor',
    });

    console.log('[AUTH] User created successfully:', { id: user.id, email: user.email, role: user.role });

    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully.',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('[AUTH] Register error:', error);
    res.status(500).json({ error: 'Failed to register user.' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    // Email is already normalized by customSanitizer in routes
    const { email, password } = req.body;

    console.log('[AUTH] Login attempt for email:', email);
    console.log('[AUTH] Password provided:', password ? 'Yes' : 'No');

    // Email should already be normalized by customSanitizer, but normalize again to be safe
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Find user by email (case-insensitive search)
    const user = await Contributor.findOne({ 
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('email')),
        normalizedEmail
      )
    });

    if (!user) {
      console.log('[AUTH] User not found for email:', email);
      // Also check if any users exist with similar email
      const allUsers = await Contributor.findAll({ attributes: ['id', 'email', 'role'] });
      console.log('[AUTH] All users in database:', allUsers.map(u => ({ id: u.id, email: u.email, role: u.role })));
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    console.log('[AUTH] User found:', { id: user.id, email: user.email, role: user.role, isActive: user.isActive });

    // Check if user is active
    if (!user.isActive) {
      console.log('[AUTH] User account is deactivated');
      return res.status(401).json({ error: 'Account is deactivated.' });
    }

    // Validate password
    console.log('[AUTH] Validating password...');
    const isValid = await user.validatePassword(password);
    console.log('[AUTH] Password validation result:', isValid);
    
    if (!isValid) {
      console.log('[AUTH] Invalid password for user:', user.email);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = generateToken(user);
    console.log('[AUTH] Login successful, token generated for user:', user.email);

    res.json({
      message: 'Login successful.',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
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

