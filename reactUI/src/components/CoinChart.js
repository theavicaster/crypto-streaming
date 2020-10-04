import React, { useEffect, useState, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Grid, Card, Button, IconButton } from '@material-ui/core';
import AppsIcon from '@material-ui/icons/Apps';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Chart from 'chart.js';
import CoinCard from './CoinCard';

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 300,
    maxWidth: 1000,
    backgroundColor: theme.palette.secondary.main,
    padding: '1rem',
    boxShadow: '0rem 0rem 1rem black',
  },
  gridContainer: {
    paddingTop: '20px',
  },
}));

const jitter = (data) => {
  const numericData = parseFloat(data);
  const jitterAmount = Math.random() * (1.01 - 0.99) + 0.99;

  return numericData * jitterAmount;
};

const CoinChart = (props) => {
  const {
    firstPrice,
    firstTimestamp,
    firstArithmeticMean,
    firstGeometricMean,
    firstHarmonicMean,
  } = props.location.state;
  const { symbol, id } = props.match.params;

  const classes = useStyles();

  const chartRef = useRef(null);
  const [coinChart, setcoinChart] = useState({});
  const [coinPrice, setCoinPrice] = useState({
    price: 0,
    priceChange: 0,
    totalSupply: 0,
    marketCap: 0,
    totalVolume: 0,
    timestamp: '',
  });
  const [coinAggregate, setCoinAggregate] = useState({
    arithmeticMean: 0,
    geometricMean: 0,
    harmonicMean: 0,
  });
  const [coinData, setCoinData] = useState(null);

  const formatTime = (timestamp) => timestamp.slice(11, 19);

  useEffect(() => {
    const getCoin = async () => {
      const data = await axios.get(
        `https://api.coinranking.com/v1/public/coin/${id}`
      );

      setCoinData(data.data.data.coin);
    };

    getCoin();

    const ctx = chartRef.current.getContext('2d');

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [formatTime(firstTimestamp)],
        datasets: [
          {
            label: 'Price',
            data: [jitter(firstPrice)],
            borderColor: '#3e95cd',
            fill: false,
          },
          {
            label: 'Arithmetic Mean',
            data: [jitter(firstArithmeticMean)],
            borderColor: '#8e5ea2',
            fill: false,
          },
          {
            label: 'Geometric Mean',
            data: [jitter(firstGeometricMean)],
            borderColor: '#3cba9f',
            fill: false,
          },
          {
            label: 'Harmonic Mean',
            data: [jitter(firstHarmonicMean)],
            borderColor: '#e8c3b9',
            fill: false,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: 'Real-Time Dashboard',
          fontFamily: 'Raleway',
          fontSize: 45,
          fontStyle: 'normal',
          fontColor: '#f2a365',
        },
        tooltips: {
          titleFontFamily: 'Roboto',
          bodyFontFamily: 'Roboto',
          displayColors: true,
        },
        legend: {
          labels: {
            fontColor: 'white',
            fontFamily: 'Roboto',
            fontSize: 14,
          },
        },
        layout: {
          padding: {
            left: 25,
            right: 25,
            top: 0,
            bottom: 25,
          },
        },
        scales: {
          yAxes: [
            {
              gridLines: {
                display: true,
                color: '#30475e',
              },
              ticks: {
                fontColor: '#f2a365',
                fontFamily: 'Roboto',
                fontSize: 12,
              },
            },
          ],
          xAxes: [
            {
              gridLines: {
                display: true,
                color: '#30475e',
              },
              ticks: {
                fontColor: '#f2a365',
                fontFamily: 'Roboto',
                fontSize: 12,
              },
            },
          ],
        },
      },
    });

    setcoinChart(chart);
  }, [
    firstPrice,
    firstArithmeticMean,
    firstGeometricMean,
    firstHarmonicMean,
    firstTimestamp,
    id,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const getPrice = async () => {
        const { data } = await axios.get(
          `http://localhost:5000/latestPrice/${symbol}`
        );

        setCoinPrice({
          price: data.price,
          priceChange: data.percent_change_24hr,
          totalSupply: data.total_supply,
          marketCap: data.market_cap,
          totalVolume: data.volume,
          timestamp: data.timestamp,
        });
      };

      const getAggregate = async () => {
        const { data } = await axios.get(
          `http://localhost:5000/latestAggregate/${symbol}`
        );

        setCoinAggregate({
          arithmeticMean: data.arithmetic_mean,
          geometricMean: data.geometric_mean,
          harmonicMean: data.harmonic_mean,
        });
      };

      getAggregate();
      getPrice();

      if (coinPrice.price !== 0) {
        coinChart.data.labels.push(formatTime(coinPrice.timestamp));
        coinChart.data.datasets[0].data.push(jitter(coinPrice.price));
        coinChart.data.datasets[1].data.push(
          jitter(coinAggregate.arithmeticMean)
        );
        coinChart.data.datasets[2].data.push(
          jitter(coinAggregate.geometricMean)
        );
        coinChart.data.datasets[3].data.push(
          jitter(coinAggregate.harmonicMean)
        );

        coinChart.update();
      }
    }, 10000);

    return () => clearInterval(interval);
  });

  return (
    <Grid container>
      <Grid item sm={1} />

      <Grid
        container
        item
        xs={12}
        sm={10}
        spacing={4}
        className={classes.gridContainer}
        justify="center"
        align="center"
      >
        <Grid item xs={12} sm={10}>
          <Card className={classes.card}>
            <canvas id="coinChart" ref={chartRef} />
            <Button
              style={{ margin: '5px' }}
              variant="outlined"
              color="primary"
              onClick={() => {
                const prices = coinChart.data.datasets[0];
                prices.hidden = !prices.hidden;
                coinChart.update();
              }}
            >
              Toggle Price
            </Button>
            <Button
              style={{ margin: '5px' }}
              variant="outlined"
              color="primary"
              onClick={() => {
                const amDS = coinChart.data.datasets[1];
                amDS.hidden = !amDS.hidden;
                const gmDS = coinChart.data.datasets[2];
                gmDS.hidden = !gmDS.hidden;
                const hmDS = coinChart.data.datasets[3];
                hmDS.hidden = !hmDS.hidden;
                coinChart.update();
              }}
            >
              Toggle Aggregates
            </Button>

            <Link to="/">
              <IconButton aria-label="home" color="primary">
                <AppsIcon />
              </IconButton>
            </Link>
          </Card>
        </Grid>

        {coinData && (
          <Grid item xs={12}>
            <CoinCard coinData={coinData} />
          </Grid>
        )}
      </Grid>

      <Grid item sm={1} />
    </Grid>
  );
};

export default CoinChart;
