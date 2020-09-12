name := "sparkConsumer"

version := "1.0-RELEASE"

scalaVersion := "2.11.12"

libraryDependencies ++= {
  val sparkVersion = "2.4.5"
  val cassandraConnectorVersion = "2.4.3"
  Seq(
    "org.apache.spark" %% "spark-core" % sparkVersion % "provided",
    "org.apache.spark" %% "spark-sql" % sparkVersion % "provided",
    "com.datastax.spark" %% "spark-cassandra-connector" % cassandraConnectorVersion
  )
}
