// src/routes/restaurants.routes.js
const express = require('express');
const restaurantService = require('../services/restaurants.service');

const router = express.Router();

/**
 * ✅ 인기 맛집 조회
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const data = await restaurantService.getPopularRestaurants(limit);
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

/**
 * ✅ 전체 조회
 */
router.get('/', async (req, res) => {
  try {
    const data = await restaurantService.getAllRestaurants();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

/**
 * ✅ 단일 조회 (id 기반)
 * - 없으면 404 반환 (테스트 호환)
 */
router.get('/:id', async (req, res) => {
  try {
    const data = await restaurantService.getRestaurantById(req.params.id);
    if (!data) {
      return res.status(404).json({ error: { message: 'Restaurant not found' } });
    }
    res.status(200).json({ data });
  } catch (err) {
    // ✅ “not found” 문구 포함 시 404로 처리 (Jest 테스트 호환)
    if (err.message && err.message.toLowerCase().includes('not found')) {
      return res.status(404).json({ error: { message: err.message } });
    }
    res.status(500).json({ error: { message: err.message } });
  }
});

/**
 * ✅ 생성 (POST)
 * - 필수 필드 누락 시 400
 */
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

/**
 * ✅ 수정 (PUT)
 * - 존재하지 않으면 404
 */
router.put('/:id', async (req, res) => {
  try {
    const updated = await restaurantService.updateRestaurant(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: { message: 'Restaurant not found' } });
    }
    res.status(200).json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

/**
 * ✅ 삭제 (DELETE)
 * - 존재하지 않으면 404
 * - 성공 시 204 No Content
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await restaurantService.deleteRestaurant(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: { message: 'Restaurant not found' } });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

module.exports = router;
