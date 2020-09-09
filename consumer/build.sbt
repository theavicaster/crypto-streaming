name := "consumer"

version := "1.0"

scalaVersion := "2.11.12"

libraryDependencies ++= {
  val sparkVersion = "2.4.6"
  val cassandraVersion = "2.4.3"
  Seq(
    "org.apache.spark" %% "spark-core" % sparkVersion % "provided",
    "org.apache.spark" %% "spark-sql" % sparkVersion % "provided",
    "com.datastax.spark" %% "spark-cassandra-connector" % cassandraVersion
  )
}
