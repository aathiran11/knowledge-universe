require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const topicRoutes = require('./routes/topics');

const app = express();

// In production, set FRONTEND_URL to your deployed frontend's URL (e.g. Vercel) so only
// that origin can call the API. Falls back to allowing everything for local dev.
const allowedOrigin = process.env.FRONTEND_URL || '*';
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Knowledge Universe API is alive' });
});

app.use('/api/topics', topicRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
