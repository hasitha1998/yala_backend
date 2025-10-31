import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: String,
  status: String,
  content: String,
  featuredImage: String,
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;  