const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  title: { type: String, required: true },
  tagline: { type: String, required: true },
  color: { type: String, default: '#6b7280' },
  images: [{ type: String }], // array of image URLs
  videoUrl: { type: String }, // optional YouTube embed URL (click-to-play modal)
  backgroundVideo: { type: String }, // optional YouTube video ID, plays muted/looped behind the planet
  related: [{ type: String, lowercase: true }], // array of slugs
}, { timestamps: true });

module.exports = mongoose.model('Topic', topicSchema);
