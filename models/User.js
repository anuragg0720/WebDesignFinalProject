const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'super-admin', 'husky-admin', 'support'],
      default: 'student',
    },
    displayName: {
      type: String,
      required: true,
    },
    // Optional profile fields, mainly for students
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    courseEnrolled: { type: String },
    intake: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
