const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: String,
  status: String,
  content: String,
  featuredImage: String,
});

module.exports = mongoose.model('Blog', blogSchema);