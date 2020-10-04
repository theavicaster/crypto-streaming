import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
  Card,
  CardHeader,
  CardMedia,
  CardContent,
  CardActionArea,
  CardActions,
  Collapse,
  IconButton,
  Typography,
} from '@material-ui/core';
import LanguageIcon from '@material-ui/icons/Language';
import RedditIcon from '@material-ui/icons/Reddit';
import GitHubIcon from '@material-ui/icons/GitHub';
import TwitterIcon from '@material-ui/icons/Twitter';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import CardContentData from './CardContentData';
import { Link } from 'react-router-dom';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 250,
    maxWidth: 500,
    backgroundColor: theme.palette.secondary.main,
    padding: '1rem',
    boxShadow: '0rem 0rem 1rem black',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  cardContentDiv: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
  innerText: {
    color: 'secondary',
  },
}));

const roundNumber = (numString) => parseFloat(numString).toFixed(5);

const CoinCard = ({
  coinData: {
    name,
    id,
    uuid,
    color,
    description,
    iconUrl,
    websiteUrl,
    links,
    symbol,
  },
  maxWidth,
}) => {
  const classes = useStyles();
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
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
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
  }, [symbol]);

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
    }, 60000);

    return () => clearInterval(interval);
  });

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const findLink = (linkType) => links.find((link) => link.type === linkType);

  const addColorToHtml = (html) => {
    if (!html) return html;

    if (!color) {
      color = '#f2a365';
    }

    return html
      .replaceAll('<h1>', `<h1 style="color:${color};font-family:'Raleway'">`)
      .replaceAll('<h2>', `<h2 style="color:${color};font-family:'Raleway'">`)
      .replaceAll('<h3>', `<h3 style="color:${color};font-family:'Raleway'">`);
  };

  return (
    <Card className={classes.root}>
      <Link
        to={{
          pathname: `/${symbol}/${id}`,
          state: {
            firstPrice: coinPrice.price,
            firstTimestamp: coinPrice.timestamp,
            firstArithmeticMean: coinAggregate.arithmeticMean,
            firstGeometricMean: coinAggregate.geometricMean,
            firstHarmonicMean: coinAggregate.harmonicMean,
          },
        }}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <CardActionArea>
          <CardHeader
            title={name}
            titleTypographyProps={{ variant: 'h4' }}
            subheader={`Latest Price: ${roundNumber(coinPrice.price)}$`}
            subheaderTypographyProps={{ variant: 'body1', color: 'primary' }}
          />
          <CardMedia className={classes.media} image={iconUrl} />
          <CardContent>
            <CardContentData
              leftText={'Latest Arithmetic Mean Price:'}
              rightText={`${roundNumber(coinAggregate.arithmeticMean)}$`}
            />
            <CardContentData
              leftText={'Latest Geometric Mean Price:'}
              rightText={`${roundNumber(coinAggregate.geometricMean)}$`}
            />
            <CardContentData
              leftText={'Latest Harmonic Mean Price:'}
              rightText={`${roundNumber(coinAggregate.harmonicMean)}$`}
            />
            <CardContentData
              leftText={`24 Hour Price Change:`}
              rightText={`${coinPrice.priceChange}%`}
            />
            <CardContentData
              leftText={`Total Supply:`}
              rightText={`${coinPrice.totalSupply}`}
            />
            <CardContentData
              leftText={`Market Cap:`}
              rightText={`${coinPrice.marketCap}`}
            />
            <CardContentData
              leftText={`Total Volume:`}
              rightText={`${coinPrice.totalVolume}`}
            />
          </CardContent>
        </CardActionArea>
      </Link>
      <CardActions disableSpacing>
        {websiteUrl && (
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
            <IconButton aria-label="coin homepage" color="primary">
              <LanguageIcon />
            </IconButton>
          </a>
        )}
        {findLink('reddit') && (
          <a
            href={findLink('reddit').url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton aria-label="reddit" color="primary">
              <RedditIcon />
            </IconButton>
          </a>
        )}
        {findLink('github') && (
          <a
            href={findLink('github').url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton aria-label="github" color="primary">
              <GitHubIcon />
            </IconButton>
          </a>
        )}
        {findLink('twitter') && (
          <a
            href={findLink('twitter').url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconButton aria-label="twitter" color="primary">
              <TwitterIcon />
            </IconButton>
          </a>
        )}
        <IconButton
          className={clsx(classes.expand, {
            [classes.expandOpen]: expanded,
          })}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
          color="primary"
        >
          <ExpandMoreIcon />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography>
            <div
              class={classes.innerText}
              dangerouslySetInnerHTML={{
                __html: addColorToHtml(description),
              }}
            />
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CoinCard;
