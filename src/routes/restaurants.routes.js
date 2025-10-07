// src/routes/restaurants.routes.js
const express = require('express');
const restaurantService = require('../services/restaurants.service');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const data = await restaurantService.getAllRestaurants();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.get('/sync-demo', (req, res) => {
  try {
    const data = restaurantService.getAllRestaurantsSync();
    res.status(200).json({ data, meta: { execution: 'synchronous' } });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await restaurantService.getRestaurantById(req.params.id);
    res.status(200).json({ data });
  } catch (err) {
    if (err.message.includes('not found')) {
      res.status(404).json({ error: { message: err.message } });
    } else {
      res.status(500).json({ error: { message: err.message } });
    }
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await restaurantService.createRestaurant(req.body);
    res.status(201).json({ data });
  } catch (err) {
    if (err.message.includes('required')) {
      res.status(400).json({ error: { message: err.message } });
    } else {
      res.status(500).json({ error: { message: err.message } });
    }
  }
});

module.exports = router;
