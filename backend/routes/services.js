// GET /api/services?suburb=Carlton&need_type=social_connection
// Lists support services with optional suburb / need-type filters.

const express = require('express');
const { db } = require('../db');
const { NEED_TO_CATEGORY } = require('../recommender');

const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const { suburb, need_type } = req.query;
    const filters = [];
    const params = [];

    if (suburb) {
      const area = db
        .prepare('SELECT id FROM areas WHERE id = ? OR LOWER(name) = LOWER(?)')
        .get(suburb, suburb);
      if (area) {
        filters.push('area_id = ?');
        params.push(area.id);
      }
    }
    if (need_type && NEED_TO_CATEGORY[need_type]) {
      filters.push('category_id = ?');
      params.push(NEED_TO_CATEGORY[need_type]);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const services = db
      .prepare(`SELECT * FROM support_services ${where} ORDER BY distance_km ASC`)
      .all(...params);

    res.json({ services, count: services.length });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
