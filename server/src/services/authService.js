const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

class AuthService {
  /**
   * Generate JWT token for user
   */
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }

  /**
   * Register new user
   */
  async register({ name, email, password, role = 'operator' }) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      const err = new Error('A user with this email address already exists');
      err.statusCode = 400;
      throw err;
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'operator',
      lastLogin: new Date(),
    });

    await user.save();

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Authenticate user & issue JWT
   */
  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const err = new Error('Invalid email or password');
      err.statusCode = 401;
      throw err;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    };
  }
}

module.exports = new AuthService();
