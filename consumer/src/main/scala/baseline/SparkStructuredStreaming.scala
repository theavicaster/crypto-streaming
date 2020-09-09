package baseline

import java.io.{FileNotFoundException, InputStream}
import java.util.Properties

import org.apache.spark.sql.SparkSession


abstract class SparkStructuredStreaming(appName: String) {

  val resourceStream: InputStream = getClass.getResourceAsStream("/config.properties")
  val CONFIG: Properties = new Properties()

  if (resourceStream != null) {
    CONFIG.load(resourceStream)
  } else {
    throw new FileNotFoundException("Configuration file could not be loaded")
  }

  val KAFKA_BOOTSTRAP_SERVERS: String = CONFIG.getProperty("kafka.bootstrap.servers")
  val KAFKA_TOPIC: String = CONFIG.getProperty("kafka.topic")

  val WATERMARK_THRESHOLD: String = CONFIG.getProperty("watermark.threshold")
  val WINDOW_DURATION: String = CONFIG.getProperty("window.duration")
  val SLIDE_DURATION: String = CONFIG.getProperty("slide.duration")

  val CASSANDRA_CONNECTION_HOST: String = CONFIG.getProperty("spark.cassandra.connection.host")
  val CASSANDRA_CONNECTION_PORT: String = CONFIG.getProperty("spark.cassandra.connection.port")

  val spark: SparkSession = SparkSession
    .builder()
    .appName(appName)
    .config("spark.cassandra.connection.host", CASSANDRA_CONNECTION_HOST)
    .config("spark.cassandra.connection.port", CASSANDRA_CONNECTION_PORT)
    .getOrCreate()
  spark.sparkContext.setLogLevel("ERROR")

}