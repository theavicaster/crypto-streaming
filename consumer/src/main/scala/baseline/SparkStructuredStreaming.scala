package baseline

import java.io.{FileNotFoundException, InputStream}
import java.util.Properties

import org.apache.spark.sql.SparkSession


abstract class SparkStructuredStreaming(appName: String) {

  val resourceStream: InputStream = getClass.getResourceAsStream("/config.properties")
  val config: Properties = new Properties()

  if (resourceStream != null) {
    config.load(resourceStream)
  }
  else {
    throw new FileNotFoundException("Configuration file could not be loaded")
  }

  val watermarkThreshold: String = config.getProperty("watermark.threshold")
  val windowDuration: String = config.getProperty("window.duration")
  val slideDuration: String = config.getProperty("slide.duration")

  val spark: SparkSession = SparkSession
    .builder()
    .appName(appName)
    .getOrCreate()
  spark.sparkContext.setLogLevel("ERROR")

}