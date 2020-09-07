package schema

import org.apache.spark.sql.types.{DataTypes, StructType}

object CryptoSchema {

  val schema: StructType = new StructType()
    .add("nameCoin", DataTypes.StringType )
    .add("symbolCoin", DataTypes.StringType)
    .add("numberOfMarkets", DataTypes.LongType)
    .add("volume", DataTypes.LongType)
    .add("marketCap", DataTypes.LongType)
    .add("totalSupply", DataTypes.LongType)
    //price is casted separately to Double from String
    .add("price", DataTypes.StringType)
    .add("percentChange24hr", DataTypes.DoubleType)
    .add("timestamp", DataTypes.TimestampType)

}
