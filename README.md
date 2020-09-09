# Real-time Cryptocurrency Price Updates
```
+------------------+        +------------------+        +------------------+        +------------------+
|                  |        |                  |        |                  |        |                  |
|  REST Endpoint   +------->|  Kafka Producer  +------->|  Spark Consumer  +------->|  Cassandra Sink  +
|    Real-time     |        |     Python       |        |      Scala       |        | Constant Updates |
+------------------+        +------------------+        +------------------+        +------------------+
```

## Usage Instructions

### Kafka Producer

Uses 
- Python 3.8.2  
- Apache Kafka 2.6.0


##### Zookeeper

*  Navigate to Kafka installation directory and start Zookeeper in your shell.
```
cd $KAFKA_HOME
bin/zookeeper-server-start.sh config/zookeeper.properties 
```

##### Kafka Server

*  Navigate to Kafka installation directory and start Kafka server in your shell.
```
cd $KAFKA_HOME
bin/kafka-server-start.sh config/server.properties
```

##### Kafka Topic

*  Navigate to Kafka installation directory and create a Kafka topic *"crypto_topic"*.
```
cd $KAFKA_HOME
bin/kafka-topics.sh --bootstrap-server localhost:9092 --topic crypto_topic \
--create --partitions 3 --replication-factor 1
```

* Check if the topic is created.
```
kafka-topics --bootstrap-server localhost:9092 --list
```

##### Python Producer

* Navigate to directory where the project is cloned.
* Create and activate your virtual environment.
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
python3 producer/kafkaProducerService.py
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

* Open Cassandra Query Language shell.
```
cqlsh
```

* Create the necessary tables.
* DDL is found in *cqlqueries.txt*


### Spark Consumer

Uses 
- Apache Spark 2.4.6
- SBT 1.3.13
- Java 1.8.0_265 OpenJDK

#### Package and Submit

*  Navigate to */consumer* directory.
*  Run the following in your shell.
*  $SPARK_HOME is the Spark installation directory.
```
sbt package && \
$SPARK_HOME/spark-submit \
--class processing.SparkRealTimePriceUpdates --master local[*] \
--packages com.datastax.spark:spark-cassandra-connector_2.11:2.4.3,\
org.apache.spark:spark-sql-kafka-0-10_2.11:2.4.6 \
$ target/scala-2.11/consumer_2.11-1.0.jar
```










