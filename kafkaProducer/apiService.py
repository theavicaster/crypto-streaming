import requests
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
from utils import currentUnixTime, initLogger

LOGGER = initLogger("API_SERVICE_LOG")


class APIService:
    def getJson(self, url):
        try:
            response = requests.get(url)
            statusCode = response.status_code
            assert statusCode == 200, f"Response status code is : {statusCode}"
            LOGGER.info("Received JSON response")
            return response.json()
        except (AssertionError, ConnectionError, Timeout, TooManyRedirects) as e:
            LOGGER.error(f"Exception occurred : {e}")
            return {}

    def parseCoinData(self, coinData):
        try:
            return {"name_coin": coinData["name"],
                    "symbol_coin": coinData["symbol"],
                    "id": coinData["id"],
                    "uuid": coinData["uuid"],
                    "number_of_markets": coinData["numberOfMarkets"],
                    "volume": coinData["volume"],
                    "market_cap": coinData["marketCap"],
                    "total_supply": coinData["totalSupply"],
                    "price": coinData["price"],
                    "percent_change_24hr": coinData["change"],
                    "timestamp": currentUnixTime()}
        except Exception as e:
            LOGGER.error(f"Exception occurred : {e}")
            return {}

    def filterJson(self, rawJson):
        filteredJson = map(lambda coinData: self.parseCoinData(coinData),
                           rawJson["data"]["coins"])
        LOGGER.info("Parsed JSON response")
        return filteredJson
