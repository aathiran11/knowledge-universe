const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  color: { type: String, default: '#6b7280' },
  images: [{ type: String }],
  videoUrl: { type: String },
  related: [{ type: String, lowercase: true }],
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
