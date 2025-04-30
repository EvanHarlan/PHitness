import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters long"]
  },
  termsAccepted: {
    type: Boolean,
    required: [true, "You must accept the terms and conditions"],
    default: true
  },
  username: {
    type: String,
    unique: true, // Ensures the username is unique
    minLength: [3, "Username must be at least 3 characters long"]
  },
  age: {
    type: Number,
    min: [13, "Age must be at least 18"],
    max: [100, "Age cannot be more than 100"]
  },
  avatar: {
    type: String,
    default: "default"
  },
  bio:{
    type: String,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sentRequests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  profileVisibility: {
    type: String,
    enum: ['public', 'friends', 'private'],
    default: 'friends'
    },
  dailyStreak: {
    current: { type: Number, default: 0 },
    lastLogged: { type: Date, default: null }
    },
  maxLift: {
    type: Number,
    default: 0,
    },
  achievements: [{
  title: { type: String, required: true },
  dateUnlocked: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare entered password with stored hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;