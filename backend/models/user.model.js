import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Name is required"]
  },
  email:{
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true
  },
  password:{
    type: String,
    required: [true, "Password is required"],
    minLength: [6, "Password must be at least 6 characters long"]
  },
}, {
  timestamps: true // This is optional but recommended
});

// Hash the password before saving it to the database
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next(); // Only hash if password is modified or new
  
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