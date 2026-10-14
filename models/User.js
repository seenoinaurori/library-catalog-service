const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false,
      validate: {
        validator: (value) => {
          const bytes = Buffer.byteLength(value, 'utf8');
          return bytes >= 8 && bytes <= 72;
        },
        message: 'Password must be between 8 and 72 UTF-8 bytes.',
      },
    },
    role: {
      type: String,
      enum: ['patron', 'librarian'],
      default: 'patron',
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
