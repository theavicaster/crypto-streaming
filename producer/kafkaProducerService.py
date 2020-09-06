from kafka import KafkaProducer
from json import dumps
from utils import initLogger, getConfigPath, readConfigFile
from apiService import APIService
import time

LOGGER = initLogger("KAFKA_PRODUCER_LOG")
CONFIG_FILE_PATH = getConfigPath()

KAFKA_CONFIG_SETTINGS = readConfigFile(CONFIG_FILE_PATH, "kafka")
PRODUCER_SETTINGS = readConfigFile(CONFIG_FILE_PATH, "producer.settings")
KAFKA_TOPIC = PRODUCER_SETTINGS["topic"]
URL = PRODUCER_SETTINGS["url"]
SLEEP_DURATION = int(PRODUCER_SETTINGS["timeout.seconds"])

producer = KafkaProducer(value_serializer=lambda v: dumps(v).encode('utf-8'),
                         bootstrap_servers=KAFKA_CONFIG_SETTINGS["bootstrap_servers"])


def produceMessage(filteredJson):
    for coinData in filteredJson:
        nameCoin = coinData["nameCoin"]
        try:
            producer.send(
                topic=KAFKA_TOPIC,
                value=coinData)
        except Exception as e:
            LOGGER.error(f"Coin : {nameCoin} has exception : {e}")


if __name__ == "__main__":
    api = APIService()
    while True:
        rawJson = api.getJson(URL)
        filteredJson = api.filterJson(rawJson)
        produceMessage(filteredJson)
        LOGGER.info(f"Messages produced to Kafka topic : {KAFKA_TOPIC}")
        time.sleep(SLEEP_DURATION)
