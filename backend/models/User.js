const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },

    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },

    // For Trainer's view (Strict Requirement)
    plainPassword: {
      type: String,
      select: false
    },

    role: {
      type: String,
      enum: ['student', 'trainer', 'admin'],
      default: 'student'
    },

    // ✅ OPTIONAL: Track exams assigned to student
    assignedExams: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
      }
    ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true // ✅ auto createdAt & updatedAt
  }
);

// 🔐 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 🔑 Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
