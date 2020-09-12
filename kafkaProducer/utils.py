import time
import os
import configparser
from pathlib import Path
import logging

PROJECT_HOME_PATH = Path(__file__).parents[0]
LOGGING_HOME_PATH = os.path.join(PROJECT_HOME_PATH, "logs")
if not os.path.exists(LOGGING_HOME_PATH):
    os.mkdir(LOGGING_HOME_PATH)
LOGGING_FILE_PATH = os.path.join(LOGGING_HOME_PATH, "{}.log")
CONFIG_FILE_PATH = os.path.join(PROJECT_HOME_PATH, "config.ini")


def currentUnixTime():
    return int(round(time.time()))


def getConfigPath():
    return CONFIG_FILE_PATH


def readConfigFile(configFilePath, section):
    config = configparser.ConfigParser()
    config.read(configFilePath)
    return dict(config.items(section))


def initLogger(loggerName):
    logger = logging.getLogger(loggerName)
    logger.setLevel(logging.INFO)
    formatter = logging.Formatter("%(asctime)-7s: %(levelname)-1s %(message)s")

    fileHandler = logging.FileHandler(LOGGING_FILE_PATH.format(loggerName))
    fileHandler.setLevel(logging.INFO)
    fileHandler.setFormatter(formatter)
    streamHandler = logging.StreamHandler()
    streamHandler.setFormatter(formatter)

    logger.addHandler(fileHandler)
    logger.addHandler(streamHandler)
    return logger
