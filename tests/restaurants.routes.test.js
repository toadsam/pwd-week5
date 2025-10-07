
jest.spyOn(console, 'error').mockImplementation(() => {}); // 에러로그 안 보이게

// tests/restaurants.routes.test.js
const request = require('supertest');
const createApp = require('../src/app');
const restaurantService = require('../src/services/restaurants.service');

describe('Restaurant routes', () => {
  let app;

  beforeEach(() => {
    // ✅ mock은 app 생성 전에 해야 한다
    jest.spyOn(restaurantService, 'getAllRestaurants').mockResolvedValue([
      { id: 1, name: '한식집', category: '한식', location: '정문 앞' },
    ]);

    jest.spyOn(restaurantService, 'getAllRestaurantsSync').mockReturnValue([
      { id: 1, name: '한식집', category: '한식', location: '정문 앞' },
    ]);

    jest.spyOn(restaurantService, 'getRestaurantById').mockImplementation(async (id) => {
      if (id === '1') return { id: 1, name: '한식집', category: '한식' };
      throw new Error(`Restaurant with id ${id} not found`);
    });

    jest.spyOn(restaurantService, 'createRestaurant').mockImplementation(async (payload) => {
      if (!payload.category) throw new Error("'category' is required");
      return { id: 2, ...payload };
    });

    // ✅ mock 설정 후 app 생성
    app = createApp();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ✅ 실제 테스트들
  test('GET /api/restaurants returns a list', async () => {
    const res = await request(app).get('/api/restaurants');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data[0].name).toBe('한식집');
  });

  test('GET /api/restaurants/sync-demo flags synchronous execution', async () => {
    const res = await request(app).get('/api/restaurants/sync-demo');
    expect(res.status).toBe(200);
    expect(res.body.meta.execution).toBe('synchronous');
  });

  test('GET /api/restaurants/:id returns an item', async () => {
    const res = await request(app).get('/api/restaurants/1');
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
    expect(res.body.data.name).toBe('한식집');
  });

  test('GET /api/restaurants/:id handles missing items', async () => {
    const res = await request(app).get('/api/restaurants/999');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toContain('not found');
  });

  test('POST /api/restaurants validates payload', async () => {
    const res = await request(app)
      .post('/api/restaurants')
      .send({ name: '테스트' }) // category 누락
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('category');
  });

  test('POST /api/restaurants creates a restaurant', async () => {
    const payload = {
      name: '새로운 식당',
      category: '카페',
      location: '캠퍼스 타운',
    };

    const res = await request(app)
      .post('/api/restaurants')
      .send(payload)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe(payload.name);
    expect(res.body.data.category).toBe(payload.category);
  });
});
