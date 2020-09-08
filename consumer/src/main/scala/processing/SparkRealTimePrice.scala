package processing

import baseline.SparkStructuredStreaming
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming.StreamingQuery
import schema.CryptoSchema

object SparkRealTimePrice {
  def main(args: Array[String]): Unit = {
    StreamingPrice("Real-time Prices")
  }
}

class StreamingPrice(appName: String)
  extends SparkStructuredStreaming(appName: String) {

  val inputDF: DataFrame = spark
    .readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
    .option("subscribe", KAFKA_TOPIC)
    .load()

  val parsedDF: DataFrame = inputDF.select(
      from_json( col("value").cast("string"), CryptoSchema.schema)
      .as("cryptoUpdate"))
      .select("cryptoUpdate.*")

  val castedDF: DataFrame = parsedDF
    .withColumn("price", parsedDF("price").cast("double"))

  castedDF.printSchema()

  val queryPrice: StreamingQuery = castedDF
    .writeStream
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()

  queryPrice.awaitTermination()

}

object StreamingPrice{
  def apply(appName: String): StreamingPrice =
    new StreamingPrice(appName)
}


/*
sbt package && \
/opt/spark/bin/spark-submit \
--class processing.SparkRealTimePrice --master local[*] \
--packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.0.0 \
target/scala-2.12/consumer_2.12-1.0.jar
 */
