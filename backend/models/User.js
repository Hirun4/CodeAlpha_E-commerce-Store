const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    country: String
  },
  phone: String,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  shippingInfo: {
    title: { type: String },
    street: { type: String },
    city: { type: String },
    zipCode: { type: String },
    country: { type: String }
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);