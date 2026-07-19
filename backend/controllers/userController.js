const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const mockDb = require('../config/mockDb');

// @desc    Update user profile details
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, monthlyBudgetLimit, profilePicture } = req.body;
    const userId = req.user._id;

    if (global.useMockDb) {
      // Check if email is already taken by another user
      if (email && email.toLowerCase() !== req.user.email.toLowerCase()) {
        const emailTaken = mockDb.findUserByEmail(email);
        if (emailTaken) {
          return res.status(400).json({ success: false, message: 'Email is already in use' });
        }
      }

      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (monthlyBudgetLimit !== undefined) updates.monthlyBudgetLimit = Number(monthlyBudgetLimit);
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;

      const updatedUser = mockDb.updateUser(userId, updates);
      
      const userResponse = { ...updatedUser };
      delete userResponse.password;

      return res.json({
        success: true,
        user: userResponse
      });
    } else {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (email && email !== user.email) {
        const emailTaken = await User.findOne({ email });
        if (emailTaken) {
          return res.status(400).json({ success: false, message: 'Email is already in use' });
        }
        user.email = email;
      }

      if (name) user.name = name;
      if (monthlyBudgetLimit !== undefined) user.monthlyBudgetLimit = Number(monthlyBudgetLimit);
      if (profilePicture !== undefined) user.profilePicture = profilePicture;

      const updatedUser = await user.save();

      return res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture,
          monthlyBudgetLimit: updatedUser.monthlyBudgetLimit
        }
      });
    }
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not update profile' });
  }
};

// @desc    Change user password
// @route   PUT /api/users/password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide old and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    const userId = req.user._id;

    if (global.useMockDb) {
      const user = mockDb.findUserById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect old password' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      mockDb.updateUser(userId, { password: hashedPassword });

      return res.json({ success: true, message: 'Password updated successfully' });
    } else {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.matchPassword(oldPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect old password' });
      }

      user.password = newPassword;
      await user.save();

      return res.json({ success: true, message: 'Password updated successfully' });
    }
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not update password' });
  }
};

// @desc    Delete user account and all their records
// @route   DELETE /api/users/account
// @access  Private
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    if (global.useMockDb) {
      mockDb.deleteUser(userId);
      return res.json({ success: true, message: 'Account and all data successfully deleted' });
    } else {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Delete user transactions
      await Expense.deleteMany({ user: userId });
      await Income.deleteMany({ user: userId });

      // Delete the user themselves
      await user.deleteOne();

      return res.json({ success: true, message: 'Account and all data successfully deleted' });
    }
  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({ success: false, message: 'Server error, could not delete account' });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  deleteAccount
};
