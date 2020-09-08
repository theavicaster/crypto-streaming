package processing

import baseline.SparkStructuredStreaming
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming.StreamingQuery
import schema.CryptoSchema
import utilities.WeightedAverage

object SparkWeightedAverage {
  def main(args: Array[String]): Unit = {
    StreamingPriceWeightedAverage("Weighted Average Prices")
  }
}

class StreamingPriceWeightedAverage(appName: String)
  extends SparkStructuredStreaming(appName: String) {

  val inputDF: DataFrame = spark
    .readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", KAFKA_BOOTSTRAP_SERVERS)
    .option("subscribe", "crypto_topic")
    .load()

  val parsedDF: DataFrame = inputDF.select(
      from_json( col("value").cast("string"), CryptoSchema.schema)
      .as("cryptoUpdate"))
      .select("cryptoUpdate.*")

  val castedDF: DataFrame = parsedDF
    .withColumn("price", parsedDF("price").cast("double"))

  castedDF.printSchema()

  val wtd_avg: WeightedAverage.type = WeightedAverage

  val windowedDF: DataFrame = castedDF
    .withWatermark("timestamp", WATERMARK_THRESHOLD)
    .groupBy(
      window(col("timestamp"), WINDOW_DURATION, SLIDE_DURATION),
      col("symbolCoin"))
    .agg(wtd_avg(col("price")).as("weightedAverage"))

  windowedDF.printSchema()

  val queryAggregate: StreamingQuery = windowedDF
    .writeStream
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()

  queryAggregate.awaitTermination()

}

object StreamingPriceWeightedAverage {
  def apply(appName: String): StreamingPriceWeightedAverage =
    new StreamingPriceWeightedAverage(appName)
}

/*
sbt package && \
/opt/spark/bin/spark-submit \
--class processing.SparkWeightedAverage --master local[*] \
--packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.0.0 \
target/scala-2.12/consumer_2.12-1.0.jar
 */
