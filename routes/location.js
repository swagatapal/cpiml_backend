const express = require('express');
const router = express.Router();
const statesCities = require('../data/states_cities.json');

// @route    GET /api/location/states
// @desc     Get all states
// @access   Public
router.get('/states', (req, res) => {
  const states = statesCities.map(item => item.state);
  res.json(states);
});

// @route    GET /api/location/all
// @desc     Get all states with their cities
// @access   Public
router.get('/all', (req, res) => {
  res.json(statesCities);
});

module.exports = router;

// @route    GET /api/location/cities/:stateName
// @desc     Get cities by state name
// @access   Public
router.get('/cities/:stateName', (req, res) => {
  const stateName = req.params.stateName;
  const stateData = statesCities.find(item => item.state === stateName);

  if (stateData) {
    res.json(stateData.cities);
  } else {
    res.status(404).json({ msg: 'State not found' });
  }
});
