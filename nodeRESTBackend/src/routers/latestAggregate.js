const express = require('express');
const cassandraClient = require('../db/cassandra');
const config = require('../config.json');
const router = new express.Router();

router.get('/latestAggregate', async (req, res) => {
  try {
    const query = 'SELECT * FROM rolling_aggregates GROUP BY symbol_coin';
    const latestAggregates = await cassandraClient.execute(query, [], {
      prepare: true,
    });
    res.status(201).send(latestAggregates.rows);
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

router.get('/latestAggregate/:symbol_coin', async (req, res) => {
  const symbol_coin = req.params.symbol_coin;
  const currentUnixTime = Math.floor(Date.now() / 1000);
  // rounded to latest slide duration window
  const latestEndTime =
    currentUnixTime - (currentUnixTime % config.slideDurationSeconds);
  // Cassandra stores timestamps in milliseconds
  const latestEndTimeMilli = latestEndTime * 1000;

  try {
    const query =
      'SELECT * FROM rolling_aggregates WHERE symbol_coin = ? AND end_time = ?';
    const latestAggregate = await cassandraClient.execute(
      query,
      [symbol_coin, latestEndTimeMilli],
      { prepare: true }
    );
    if (latestAggregate.rowLength == 0) {
      return res.status(404).send();
    }
    res.status(201).send(latestAggregate.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

module.exports = router;
