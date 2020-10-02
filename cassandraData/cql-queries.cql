CREATE KEYSPACE IF NOT EXISTS crypto_updates
  WITH REPLICATION = {
   'class' : 'SimpleStrategy',
   'replication_factor' : 1
  };


CREATE TABLE IF NOT EXISTS crypto_updates.realtime_prices(
	name_coin VARCHAR,
	symbol_coin VARCHAR,
	id BIGINT,
	uuid VARCHAR,
	number_of_markets BIGINT,
	volume BIGINT,
	market_cap BIGINT,
	total_supply DECIMAL,
	price DECIMAL,
	percent_change_24hr DECIMAL,
	timestamp TIMESTAMP,
	PRIMARY KEY (symbol_coin, timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC);


CREATE TABLE IF NOT EXISTS crypto_updates.rolling_aggregates(
	symbol_coin VARCHAR,
	arithmetic_mean DECIMAL,
	geometric_mean DECIMAL,
	harmonic_mean DECIMAL,
	start_time TIMESTAMP,
	end_time TIMESTAMP,
	PRIMARY KEY (symbol_coin, end_time)
) WITH CLUSTERING ORDER BY (end_time DESC);