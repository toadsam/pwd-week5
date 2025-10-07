// src/controllers/restaurants.controller.js
const restaurantService = require('../services/restaurants.service');
const asyncHandler = require('../utils/asyncHandler');

const normaliseMenu = (menu) => {
  if (!menu) return [];
  if (Array.isArray(menu)) return menu;
  if (typeof menu === 'string') {
    return menu
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

exports.getRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantService.getAllRestaurants();
  res.json({ data: restaurants });
});

exports.getPopularRestaurants = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const restaurants = await restaurantService.getPopularRestaurants(limit);
  res.json({ data: restaurants });
});

exports.getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(req.params.id);

  if (!restaurant) {
    // ✅ “throw”로 던져야 wrapAsync가 catch함
    throw new Error('Restaurant not found'); // 메시지에 'not found' 포함
  }

  res.json({ data: restaurant });
});

exports.createRestaurant = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    recommendedMenu: normaliseMenu(req.body?.recommendedMenu)
  };

  // ✅ category 필드 검증 추가
  if (!payload.category) {
    throw new Error("'category' is required"); // 메시지에 'required' 포함
  }

  const restaurant = await restaurantService.createRestaurant(payload);
  res.status(201).json({ data: restaurant });
});

exports.updateRestaurant = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    recommendedMenu: normaliseMenu(req.body?.recommendedMenu)
  };

  const updated = await restaurantService.updateRestaurant(req.params.id, payload);
  if (!updated) {
    throw new Error('Restaurant not found');
  }
  res.json({ data: updated });
});

exports.deleteRestaurant = asyncHandler(async (req, res) => {
  const deleted = await restaurantService.deleteRestaurant(req.params.id);
  if (!deleted) {
    throw new Error('Restaurant not found');
  }
  res.status(204).send();
});
