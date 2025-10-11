// src/services/restaurants.service.js
const path = require('path');
const { readFileSync } = require('fs');
const mongoose = require('mongoose');
const Restaurant = require('../models/restaurant.model');

const DATA_PATH = path.join(__dirname, '..', 'data', 'restaurants.json');

// ------------------- 기본 유틸 -------------------
function readSeedDataSync() {
  const raw = readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function getNextRestaurantId() {
  const max = await Restaurant.findOne().sort('-id').select('id').lean();
  return (max?.id || 0) + 1;
}

// ------------------- 조회 관련 -------------------
function getAllRestaurantsSync() {
  const data = readSeedDataSync();
  return JSON.parse(JSON.stringify(data));
}

async function getAllRestaurants() {
  const docs = await Restaurant.find({}).lean();
  return docs;
}

async function getRestaurantById(id) {
  let doc;

  // ✅ _id(ObjectId)로 먼저 시도
  if (mongoose.Types.ObjectId.isValid(id)) {
    doc = await Restaurant.findById(id).lean();
  } else {
    // ✅ 숫자형/문자열 id로 시도
    const numericId = Number(id);
    doc = await Restaurant.findOne({
      $or: [{ id: numericId }, { id: id.toString() }],
    }).lean();
  }

  return doc || null;
}

async function getPopularRestaurants(limit = 5) {
  const docs = await Restaurant.find({})
    .sort({ rating: -1 })
    .limit(limit)
    .lean();
  return docs;
}

// ------------------- 생성 -------------------
async function createRestaurant(payload) {
  const requiredFields = ['name', 'category', 'location'];
  const missingField = requiredFields.find((field) => !payload[field]);
  if (missingField) {
    const error = new Error(`'${missingField}' is required`);
    error.statusCode = 400;
    throw error;
  }

  const nextId = await getNextRestaurantId();
  const doc = await Restaurant.create({
    id: nextId,
    name: payload.name,
    category: payload.category,
    location: payload.location,
    priceRange: payload.priceRange ?? '정보 없음',
    rating: payload.rating ?? 0,
    description: payload.description ?? '',
    recommendedMenu: Array.isArray(payload.recommendedMenu)
      ? payload.recommendedMenu
      : [],
    likes: 0,
    image: payload.image ?? '',
  });
  return doc.toObject();
}

// ------------------- 수정 -------------------
async function updateRestaurant(id, payload) {
  let updated;

  if (mongoose.Types.ObjectId.isValid(id)) {
    // ✅ _id(ObjectId) 기준 수정
    updated = await Restaurant.findByIdAndUpdate(
      id,
      {
        $set: {
          name: payload.name,
          category: payload.category,
          location: payload.location,
          priceRange: payload.priceRange,
          rating: payload.rating,
          description: payload.description,
          recommendedMenu: Array.isArray(payload.recommendedMenu)
            ? payload.recommendedMenu
            : undefined,
          image: payload.image,
        },
      },
      { new: true, runValidators: true, lean: true }
    );
  } else {
    // ✅ 숫자형 or 문자열 id 기준 수정
    const numericId = Number(id);
    updated = await Restaurant.findOneAndUpdate(
      { $or: [{ id: numericId }, { id: id.toString() }] },
      {
        $set: {
          name: payload.name,
          category: payload.category,
          location: payload.location,
          priceRange: payload.priceRange,
          rating: payload.rating,
          description: payload.description,
          recommendedMenu: Array.isArray(payload.recommendedMenu)
            ? payload.recommendedMenu
            : undefined,
          image: payload.image,
        },
      },
      { new: true, runValidators: true, lean: true }
    );
  }

  return updated;
}

// ------------------- 삭제 -------------------
async function deleteRestaurant(id) {
  let deleted;

  if (mongoose.Types.ObjectId.isValid(id)) {
    // ✅ _id(ObjectId) 기준 삭제
    deleted = await Restaurant.findByIdAndDelete(id).lean();
  } else {
    // ✅ 숫자형 or 문자열 id 기준 삭제
    const numericId = Number(id);
    deleted = await Restaurant.findOneAndDelete({
      $or: [{ id: numericId }, { id: id.toString() }],
    }).lean();
  }

  return deleted;
}

// ------------------- 시드 초기화 -------------------
async function resetStore() {
  const seed = readSeedDataSync();
  await Restaurant.deleteMany({});
  await Restaurant.insertMany(seed);
}

async function ensureSeededOnce() {
  const count = await Restaurant.estimatedDocumentCount();
  if (count > 0) return { seeded: false, count };
  const seed = readSeedDataSync();
  await Restaurant.insertMany(seed);
  return { seeded: true, count: seed.length };
}

// ------------------- export -------------------
module.exports = {
  getAllRestaurants,
  getAllRestaurantsSync,
  getRestaurantById,
  getPopularRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  resetStore,
  ensureSeededOnce,
};
