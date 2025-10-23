const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  type: {
    type: String,
    enum: ['alert', 'message', 'news'],
    default: 'news'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  newsLink: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('news', NewsSchema);
