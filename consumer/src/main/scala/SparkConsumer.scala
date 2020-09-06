import org.apache.spark.sql._
import org.apache.spark.sql.functions._
import org.apache.spark.sql.streaming._
import org.apache.spark.sql.types._

object SparkConsumer {
  def main(args : Array[String]): Unit = {

    val spark = SparkSession
      .builder()
      .appName("Spark Consumer")
      .getOrCreate()

    import spark.implicits._

    val schema = new StructType()
      .add("nameCoin", DataTypes.StringType )
      .add("symbolCoin", DataTypes.StringType)
      .add("numberOfMarkets", DataTypes.LongType)
      .add("volume", DataTypes.LongType)
      .add("marketCap", DataTypes.LongType)
      .add("totalSupply", DataTypes.LongType)
      .add("price", DataTypes.StringType)
      .add("percentChange24hr", DataTypes.DoubleType)
      .add("timestamp", DataTypes.LongType)

    val inputDF = spark
      .readStream
      .format("kafka")
      .option("kafka.bootstrap.servers", "localhost:9092")
      .option("subscribe", "crypto_topic")
      .load()

    val rawDF = inputDF.selectExpr("CAST(value as STRING)").as[String]

    val parsedDF =  rawDF.select(from_json($"value", schema)
                                    .as("cryptoUpdate"))
                            .select("cryptoUpdate.*")

    val castedDF = parsedDF
      .withColumn("price", parsedDF("price").cast("double"))
      .withColumn("totalSupply", parsedDF("totalSupply").cast("long"))

    castedDF.printSchema()

    val query = castedDF
      .writeStream
      .outputMode("update")
      .format("console")
      .start()

    query.awaitTermination()
  }
}

/*
sbt package && \
/opt/spark/bin/spark-submit \
--class StreamHandler --master local[*] \
--packages org.apache.spark:spark-sql-kafka-0-10_2.12:3.0.0 \
target/scala-2.12/consumer_2.12-1.0.jar
 */
