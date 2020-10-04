import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './components/Home';
import CoinChart from './components/CoinChart';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" render={(props) => <Home {...props} />} />
        <Route
          exact
          path="/:symbol/:id"
          render={(props) => <CoinChart {...props} />}
        />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
