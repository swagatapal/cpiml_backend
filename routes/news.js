const express = require('express');
const router = express.Router();
const { check, validationResult, body } = require('express-validator');
const auth = require('../middleware/auth'); // We will create this middleware next
const authorize = require('../middleware/authorize'); // Import the authorize middleware
const News = require('../models/News');
const User = require('../models/User');
const admin = require('../firebase'); // Import the initialized firebase-admin

// @route   POST api/news
// @desc    Create a news item
// @access  Private (Admin only)
router.post(
  '/',
  auth,
  authorize(['admin']),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('type', 'News type is required').isIn(['alert', 'message', 'news']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const { title, description, image, type, newsLink } = req.body; // Destructure newsLink

      const newNews = new News({
        title,
        description,
        image,
        type,
        newsLink, // Save newsLink
        author: req.user.id
      });

      const news = await newNews.save();

      // Send push notification to all users
      const users = await User.find({ 'fcmTokens': { $ne: [] } }); // Get users with FCM tokens
      const registrationTokens = users.map(user => user.fcmTokens).flat();

      // Debug: Check the admin object and messaging service here
      console.log('Debug in routes/news.js: Admin object is:', admin);
      console.log('Debug in routes/news.js: Type of admin.messaging is:', typeof admin.messaging);
      
      const messagingService = admin.messaging(); // Capture the result of admin.messaging()
      console.log('Debug in routes/news.js: Result of admin.messaging() is:', messagingService);

      if (admin && messagingService && registrationTokens.length > 0) { // Check messagingService instead of admin.messaging
        const message = {
          notification: {
            title: `New ${news.type} - ${news.title}`,
            // body: news.description
            body: news.type
          },
          data: {
            newsId: news.id,
            type: news.type
          },
          tokens: registrationTokens,
        };

        messagingService.sendEachForMulticast(message)
          .then((response) => {
            console.log(response.successCount + ' messages were sent successfully');
            if (response.failureCount > 0) {
              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  console.error(`Failed to send message to token ${registrationTokens[idx]}:`, resp.error);
                  // Optionally, remove invalid tokens from your database
                }
              });
            }
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          });
      }
      
      res.json(news);

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/news
// @desc    Get all news items
// @access  Public
router.get('/', async (req, res) => {
  try {
    const news = await News.find().populate('author', ['name', 'email']).sort({ date: -1 });
    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/news/my-news
// @desc    Get all news items created by the authenticated admin user
// @access  Private (Admin only)
router.get('/my-news', auth, authorize(['admin']), async (req, res) => {
  try {
    const news = await News.find({ author: req.user.id }).populate('author', ['name', 'email']).sort({ date: -1 });
    res.json(news);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/news/:id
// @desc    Get news item by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', ['name', 'email']);

    if (!news) {
      return res.status(404).json({ msg: 'News not found' });
    }

    res.json(news);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'News not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/news/:id
// @desc    Delete a news item
// @access  Private (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ msg: 'News not found' });
    }

    // Check user
    if (news.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await news.deleteOne();

    res.json({ msg: 'News removed' });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'News not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/news/:id
// @desc    Update a news item
// @access  Private (Admin only)
router.put(
  '/:id',
  auth,
  authorize(['admin']),
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('type', 'News type is required').isIn(['alert', 'message', 'news']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, image, type, newsLink } = req.body; // Destructure newsLink

    // Build news object
    const newsFields = {};
    if (title) newsFields.title = title;
    if (description) newsFields.description = description;
    if (image) newsFields.image = image;
    if (type) newsFields.type = type;
    if (newsLink) newsFields.newsLink = newsLink; // Allow newsLink to be updated

    try {
      let news = await News.findById(req.params.id);

      if (!news) return res.status(404).json({ msg: 'News not found' });

      // Check user
      if (news.author.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      news = await News.findByIdAndUpdate(
        req.params.id,
        { $set: newsFields },
        { new: true }
      );

      res.json(news);
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'News not found' });
      }
      res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
