# Real-time Cryptocurrency Price Updates

```
+------------------+    +------------------+    +------------------+    +------------------+    +------------------+ 
|  REST Endpoint   +--->|  Kafka Producer  +--->|  Spark Consumer  +--->|  Cassandra Sink  +--->| Node.js Backend  |
|    Real-time     |    |     Python       |    |      Scala       |    | Constant Updates |    |  REST Endpoints  |
+------------------+    +------------------+    +------------------+    +------------------+    +------------------+
```

* Cryptocurrency prices are fetched in real-time from [Coinranking API](https://coinranking.com/page/cryptocurrency-api)

* JSON response is parsed, necessary fields extracted, and sent through to a Kafka topic via a Kafka Producer in Python

* Spark Structured Streaming application in Scala consumes the messages from the Kafka topic, transforms into required data types via a schema, and calculates aggregates on real-time messages

* Aggregates are calculated using window functions to calculate rolling average for each currency over a timespan. Currently supported aggregates are -

  * Moving Arithmetic Mean
  * Moving Geometric Mean
  * Moving Harmonic Mean

* Cassandra sink is used to persist both real-time prices as well as calculated aggregates from Spark

* Node.js and Express is used to create REST Endpoints to fetch the latest data from Cassandra


## Docker Installation

* Download and install [Docker Engine](https://hub.docker.com/search?q=&type=edition&offering=community&operating_system=linux) for your operating system. (Linux recommended)

* Download and install [Docker Compose](https://docs.docker.com/compose/install/)

* Navigate to the directory where the project is cloned

* In your terminal, run 

```
docker-compose up
```

* Check the logs on the terminal and wait till cryptocurrency messages are being published

* In another terminal, from the project home directory run 
```
bash start-services.sh
```

* To monitor Spark jobs, visit `localhost:8080` in your browser

* Wait a few minutes for the job to execute as it is downloading packages, Spark UI will be updated with master and worker when the job begins

* Visit `localhost:5000` to get the data as JSON. REST Endpoints are -
    - `/latestPrice` fetches the latest price of every coin
    - `/latestPrice/symbol_coin` fetches the latest price of the selected coin.
    - Eg. `/latestPrice/BTC` fetches -
    ```
  {
    "symbol_coin": "BTC",
    "timestamp": "2020-10-02T15:31:56.000Z",
    "id": "1",
    "market_cap": "195148831212",
    "name_coin": "Bitcoin",
    "number_of_markets": "19526",
    "percent_change_24hr": "-3.12",
    "price": "10545.2298078033",
    "total_supply": "18505887",
    "uuid": "Qwsogvtv82FCd",
    "volume": "18990315583"
  }
    ```
    - `/latestAggregate` fetches the latest calculated aggregates of every coin
    - `/latestAggregate/symbol_coin` fetches the latest calculated aggregate of the selected coin in the most recent sliding window
    -  Eg. `/latestAggregate/ETH` fetches -
    ```
    {
      "symbol_coin": "ETH",
      "end_time": "2020-09-23T07:58:30.000Z",
      "arithmetic_mean": "336.0199798016828",
      "geometric_mean": "336.01994915594116",
      "harmonic_mean": "336.0199185102891",
      "start_time": "2020-09-23T07:53:30.000Z"
    }
    ```

* To shut services down, run

```
docker-compose down
```


## Manual Installation

### Kafka Producer

Uses

- Python 3.8.2  
- Apache Kafka 2.6.0


#### Zookeeper

* Navigate to Kafka installation directory and start Zookeeper in your shell

```
cd $KAFKA_HOME
bin/zookeeper-server-start.sh config/zookeeper.properties 
```

#### Kafka Server

* Navigate to Kafka installation directory and start Kafka server in your shell

```
cd $KAFKA_HOME
bin/kafka-server-start.sh config/server.properties
```

#### Kafka Topic

* Navigate to Kafka installation directory and create a Kafka topic *"crypto_topic"*

```
cd $KAFKA_HOME
bin/kafka-topics.sh --bootstrap-server localhost:9092 --topic crypto_topic \
--create --partitions 3 --replication-factor 1
```

* Check if the topic is created.

```
kafka-topics --bootstrap-server localhost:9092 --list
```

#### Python Producer

* Navigate to `/kafkaProducer`
* In `config.ini` change

```
[kafka]
bootstrap_servers=kafka:9092
```

to

```
[kafka]
bootstrap_servers=localhost:9092
```

* Create and activate your virtual environment

```
python3 -m venv cryptoEnv
source cryptoEnv/bin/activate
```

* Install dependencies.

```
pip install -r requirements.txt
```

* Start the producer service.

```
python3 kafkaProducerService.py
```

### Cassandra Sink

Uses

- Apache Cassandra 3.11.8
- Java 1.8.0_265 OpenJDK

#### Create Tables

* Start Cassandra service.

```
sudo service cassandra start
```

* Check status of nodes.

```
nodetool status
```

* Open Cassandra Query Language shell

```
cqlsh
```

* Create the necessary tables.
* DDL is found in `cassandraData/cqlqueries.cql`

### Spark Consumer

Uses

- Apache Spark 2.4.5
- SBT 1.3.13
- Java 1.8.0_265 OpenJDK

#### Package and Submit



*  Navigate to `/sparkConsumer`
*  In `src/main/resources/config.properties` change
```
kafka.bootstrap.servers=kafka:9092
spark.cassandra.connection.host=cassandra
```

to

```
kafka.bootstrap.servers=localhost:9092
spark.cassandra.connection.host=localhost
```

*  Run the following in your shell, where `$SPARK_HOME` is the Spark installation directory

```
sbt package && \
$SPARK_HOME/bin/spark-submit --master local[*] --class processing.SparkRealTimePriceUpdates \
--packages com.datastax.spark:spark-cassandra-connector_2.11:2.4.3,org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.5 \
target/scala-2.11/sparkconsumer_2.11-1.0-RELEASE.jar
```

* Monitor Spark from `localhost:8080` on your browser

### Node.js Backend

Uses

- Node.js 14.11.0

#### Start Server

*  Navigate to `/nodeRESTBackend`
*  In `src/config.json` change
```
"cassandraContactPoint" : "cassandra:9042",
```

to

```
"cassandraContactPoint" : "localhost:9042",
```

* Install packages
```
npm install
```

* Start the server
```
node src/server.js
```