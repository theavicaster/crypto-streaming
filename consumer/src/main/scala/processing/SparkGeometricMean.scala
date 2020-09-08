package processing

import baseline.SparkStructuredStreaming
import org.apache.spark.sql.DataFrame
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming.StreamingQuery
import schema.CryptoSchema
import utilities.GeometricMean

object SparkGeometricMean {
  def main(args: Array[String]): Unit = {
    StreamingPriceGeometricMean("Geometric Mean Prices")
  }
}

class StreamingPriceGeometricMean(appName: String)
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

  val geo_mean: GeometricMean.type = GeometricMean

  val windowedDF: DataFrame = castedDF
    .withWatermark("timestamp", WATERMARK_THRESHOLD)
    .groupBy(
      window(col("timestamp"), WINDOW_DURATION, SLIDE_DURATION),
      col("symbolCoin"))
    .agg(geo_mean(col("price")).as("geometricMean"))

  windowedDF.printSchema()

  val queryAggregate: StreamingQuery = windowedDF
    .writeStream
    .outputMode("update")
    .format("console")
    .option("truncate", "false")
    .start()

  queryAggregate.awaitTermination()

}

object StreamingPriceGeometricMean{
  def apply(appName: String): StreamingPriceGeometricMean =
    new StreamingPriceGeometricMean(appName)
}

/*
sbt package && \
/opt/spark/bin/spark-submit \
--class processing.SparkGeometricMean --master local[*] \
--packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.0.0 \
target/scala-2.12/consumer_2.12-1.0.jar
 */
