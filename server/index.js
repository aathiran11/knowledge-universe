require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const topicRoutes = require('./routes/topics');

const app = express();
app.use(cors());
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
