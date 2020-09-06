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
            return {"nameCoin": coinData["name"],
                    "symbolCoin": coinData["symbol"],
                    "numberOfMarkets": coinData["numberOfMarkets"],
                    "volume": coinData["volume"],
                    "marketCap": coinData["marketCap"],
                    "totalSupply": coinData["totalSupply"],
                    "price": coinData["price"],
                    "percentChange24hr": coinData["change"],
                    "timestamp": currentUnixTime()}
        except Exception as e:
            LOGGER.error(f"Exception occurred : {e}")
            return {}

    def filterJson(self, rawJson):
        filteredJson = map(lambda coinData: self.parseCoinData(coinData),
                           rawJson["data"]["coins"])
        LOGGER.info("Parsed JSON response")
        return filteredJson
