const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const config = require('../config');
const auth = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloud_name,
  api_key: config.cloudinary.api_key,
  api_secret: config.cloudinary.api_secret
});

// Set up Multer for file upload
const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

// @route   POST api/upload
// @desc    Upload image to Cloudinary
// @access  Private
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No image file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
      {
        folder: 'cpim_liberation_news_images' // Optional: specify a folder in Cloudinary
      }
    );

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
