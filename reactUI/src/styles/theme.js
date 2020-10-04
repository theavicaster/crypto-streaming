import { createMuiTheme } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#f2a365',
    },
    secondary: {
      main: '#1b1b2f',
    },
    text: {
      primary: '#ffff',
    },
  },
  typography: {
    fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
    fontSize: 14,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    h4: {
      fontFamily: '"Raleway"',
    },
  },
});

export default theme;
