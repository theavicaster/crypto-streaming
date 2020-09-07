package processing

import baseline.SparkStructuredStreaming
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming.StreamingQuery
import schema.CryptoSchema

object SparkRollingAverage {
  def main(args: Array[String]): Unit = {
    StreamingPriceRollingAverage("Rolling Average Prices")
  }
}

class StreamingPriceRollingAverage(appName: String)
  extends SparkStructuredStreaming(appName: String) {

  val inputDF: DataFrame = spark
    .readStream
    .format("kafka")
    .option("kafka.bootstrap.servers", "localhost:9092")
    .option("subscribe", "crypto_topic")
    .load()

  val parsedDF: DataFrame = inputDF.select(
      from_json( col("value").cast("string"), CryptoSchema.schema)
      .as("cryptoUpdate"))
      .select("cryptoUpdate.*")


  val castedDF: DataFrame = parsedDF
    .withColumn("price", parsedDF("price").cast("double"))

  castedDF.printSchema()

  val windowedDF: DataFrame = castedDF
    .withWatermark("timestamp", watermarkThreshold)
    .groupBy(
      window(col("timestamp"), windowDuration, slideDuration),
      col("symbolCoin")
    )
    .agg(mean(col("price")))

  windowedDF.printSchema()

  val queryAggregate: StreamingQuery = windowedDF
    .writeStream
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()

  queryAggregate.awaitTermination()

}

object StreamingPriceRollingAverage{
  def apply(appName: String): StreamingPriceRollingAverage =
    new StreamingPriceRollingAverage(appName)
}


/*
sbt package && \
/opt/spark/bin/spark-submit \
--class processing.SparkRollingAverage --master local[*] \
--packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.0.0 \
target/scala-2.12/consumer_2.12-1.0.jar
 */
