import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { ZnsRouteConnect } from './zns-route-connect';
import { store } from './store';
import { store as appSandboxStore } from './app-sandbox/store';
import { Provider } from 'react-redux';
import { Provider as EscapeManagerProvider } from './lib/escape-manager';
import * as serviceWorker from './serviceWorker';
import { Router, Redirect, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { ContextProvider as Web3ReactContextProvider } from './lib/web3/web3-react';
import { config } from './config';

import { AppSandboxContainer } from './app-sandbox/container';

const history = createBrowserHistory();

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <EscapeManagerProvider>
        <Router history={history}>
          <Web3ReactContextProvider>
            <Route path='/' exact>
              <Redirect to={`/${config.defaultZnsRoute}`} />
            </Route>
            <Route path='/:znsRoute' component={ZnsRouteConnect} />
          </Web3ReactContextProvider>
        </Router>
      </EscapeManagerProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

ReactDOM.render((
    <Provider store={appSandboxStore}>
      <Router history={history}>
        <AppSandboxContainer />
      </Router>
    </Provider>
  ),
  document.getElementById('app-sandbox')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
