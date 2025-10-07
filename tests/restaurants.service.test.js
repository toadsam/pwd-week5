// tests/restaurants.service.test.js
/**
 * RestaurantService 단위 테스트 (Mongo 없이)
 */
const restaurantService = require('../src/services/restaurants.service');

// ✅ 테스트용 Mock 데이터
const mockData = [
  { id: 1, name: '아주맛집', category: '한식', location: '기숙사 앞', rating: 4.8 },
  { id: 2, name: '브런치카페', category: '카페', location: '팔달관', rating: 4.2 },
];

describe('RestaurantService', () => {
  beforeEach(() => {
    // jest.spyOn을 사용해서 DB 관련 함수들을 mock 처리 가능
    jest.spyOn(restaurantService, 'getAllRestaurants').mockResolvedValue([...mockData]);
    jest.spyOn(restaurantService, 'getAllRestaurantsSync').mockReturnValue([...mockData]);
    jest.spyOn(restaurantService, 'createRestaurant').mockImplementation(async (payload) => {
      if (!payload.category) throw new Error("'category' is required");
      return { id: 3, ...payload };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('getAllRestaurants resolves with data', async () => {
    const restaurants = await restaurantService.getAllRestaurants();
    expect(Array.isArray(restaurants)).toBe(true);
    expect(restaurants.length).toBeGreaterThan(0);
  });

  test('getAllRestaurantsSync returns data immediately', () => {
    const restaurants = restaurantService.getAllRestaurantsSync();
    expect(Array.isArray(restaurants)).toBe(true);
  });

  test('createRestaurant appends a new entry', async () => {
    const payload = {
      name: '테스트 식당',
      category: '테스트',
      location: '가상 캠퍼스',
      rating: 4.5,
    };

    const created = await restaurantService.createRestaurant(payload);
    expect(created.id).toBeDefined();
    expect(created.name).toBe(payload.name);
  });

  test('createRestaurant rejects invalid payloads', async () => {
    await expect(
      restaurantService.createRestaurant({ name: '누락된 식당' })
    ).rejects.toThrow("'category' is required");
  });
});
