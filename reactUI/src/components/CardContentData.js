import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  cardContentDiv: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
  },
}));

const CardContentData = ({ leftText, rightText }) => {
  const classes = useStyles();
  return (
    <div className={classes.cardContentDiv}>
      <Typography align="left" variant="body2">
        {leftText}
      </Typography>
      <Typography align="right" variant="body2" color="primary">
        {rightText}
      </Typography>
    </div>
  );
};

export default CardContentData;
