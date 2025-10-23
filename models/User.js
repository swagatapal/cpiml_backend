const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  fcmTokens: [
    {
      type: String
    }
  ],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});

module.exports = mongoose.model('user', UserSchema);
