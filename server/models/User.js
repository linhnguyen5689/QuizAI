const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      maxlength: 50,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      maxlength: 100,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    passwordHash: {
      type: String,
      required: true,
      maxlength: 255,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    displayName: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    profilePicture: {
      type: String,
      maxlength: 255,
      default: "images/df_avatar.png",
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginStreak: {
      type: Number,
      default: 0,
    },
    lastLoginDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    accountType: {
      type: String,
      enum: ["standard", "admin"],
      default: "standard",
    }, verificationToken: {
      type: String,
      default: null,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
    },
    lastUsedVerificationToken: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordTokenExpiry: {
      type: Date,
      default: null,
    },
    preferences: {
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      categories: [
        {
          type: String,
          trim: true,
        },
      ],
      quizLength: {
        type: Number,
        min: 1,
        max: 50,
        default: 10,
      },
      timeLimit: {
        type: Number,
        min: 0,
        default: 0,
      },
    },
    statistics: {
      quizzesTaken: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      lastQuizDate: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (this.isModified("passwordHash")) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  }
  next();
});

// Check so sánh mật khẩu
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Tạo verification token
userSchema.methods.generateVerificationToken = async function () {
  const token =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  this.verificationToken = token;
  this.verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ
  await this.save();
  return token;
};

// Tìm user theo email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// tìm user theo username
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

// Method to check if reset password token is valid
userSchema.methods.isResetPasswordTokenValid = function () {
  return (
    this.resetPasswordToken &&
    this.resetPasswordTokenExpiry &&
    this.resetPasswordTokenExpiry > new Date()
  );
};

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ verificationToken: 1 });
userSchema.index({ resetPasswordToken: 1 });

const User = mongoose.model("User", userSchema);

module.exports = User;
