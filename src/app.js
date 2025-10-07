const express = require('express');
const cors = require('cors');
const restaurantsRouter = require('./routes/restaurants.routes');
const submissionsRouter = require('./routes/submissions.routes');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');
const mongoose = require('mongoose');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    if (process.env.NODE_ENV === 'test') {
      return res.json({ status: 'ok', db: 'mocked' });
    }
    const state = mongoose.connection.readyState;
    res.json({ status: 'ok', db: state });
  });

  // ✅ 테스트용 sync-demo 라우트 이미 있음
  app.get('/api/restaurants/sync-demo', (req, res) => {
    try {
      const data = [{ id: 1, name: '테스트 한식집', category: '한식', location: '정문 앞' }];
      res.status(200).json({ data, meta: { execution: 'synchronous' } });
    } catch (err) {
      res.status(500).json({ error: { message: err.message } });
    }
  });

  app.use('/api/restaurants', restaurantsRouter);
  app.use('/api/submissions', submissionsRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
