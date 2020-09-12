#!/usr/bin/bash

docker exec -dit $(docker-compose ps -q cassandra) cqlsh -f /var/lib/cassandra/cql-queries.cql &&
docker exec -dit $(docker-compose ps -q spark-consumer-worker) bash /spark/bin/spark-submit --master spark://spark-master:7077 \
--jars sparkConsumer/sparkconsumer_2.11-1.0-RELEASE.jar \
--class processing.SparkRealTimePriceUpdates \
--packages com.datastax.spark:spark-cassandra-connector_2.11:2.4.3,org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.5 \
sparkConsumer/sparkconsumer_2.11-1.0-RELEASE.jar



