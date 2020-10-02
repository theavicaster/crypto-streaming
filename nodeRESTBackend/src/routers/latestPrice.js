const express = require('express');
const cassandraClient = require('../db/cassandra');
const router = new express.Router();

router.get('/latestPrice', async (req, res) => {
  try {
    const query = 'SELECT * FROM realtime_prices GROUP BY symbol_coin';
    const latestPrices = await cassandraClient.execute(query, [], {
      prepare: true,
    });
    res.status(201).send(latestPrices.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

router.get('/latestPrice/:symbol_coin', async (req, res) => {
  const symbol_coin = req.params.symbol_coin;

  try {
    const query = 'SELECT * FROM realtime_prices WHERE symbol_coin = ? LIMIT 1';
    const latestPrice = await cassandraClient.execute(query, [symbol_coin], {
      prepare: true,
    });
    if (latestPrice.rowLength == 0) {
      return res.status(404).send();
    }
    res.status(201).send(latestPrice.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

module.exports = router;
