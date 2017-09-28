/* eslint-disable */

/**
 * app.js
 *
 * This is the entry file for the application, only setup and boilerplate
 * code.
 */
// Needed for redux-saga es6 generator support
import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

// Import all the third party stuff
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, syncHistoryWithStore } from 'react-router-redux';
import injectTapEventPlugin from 'react-tap-event-plugin'
import rootSaga from './modules/sagas';
import FontFaceObserver from 'fontfaceobserver';
import 'normalize.css/normalize.css';
import './main.scss';

// Import selector for `syncHistoryWithStore`
import { selectLocationState } from './modules/router/router.selectors';

import configureStore from './modules/store';

// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(() => {
  document.body.classList.add('fontLoaded');
}, () => {
  document.body.classList.remove('fontLoaded');
});

// Needed for onTouchTap
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

// Create redux store with history
// this uses the singleton browserHistory provided by react-router
// Optionally, this could be changed to leverage a created history
// e.g. `const browserHistory = useRouterHistory(createBrowserHistory)();`
const browserHistory = createHistory();
const initialState = window.APP_STATE;
const store = configureStore(initialState, browserHistory);
delete window.APP_STATE;
store.runSaga(rootSaga);

if (process.env.NODE_ENV === 'development') {
  const DevToolsComponent = require('./utils/devtools.component').default;
  const devToolsRoot = window.document.createElement('div');

  window.document.body.appendChild(devToolsRoot);

  ReactDOM.render(
    <Provider store={store}>
      <DevToolsComponent />
    </Provider>,
    devToolsRoot
  );
}

const render = () => {
  const NextApp = require('./routes').default;

  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ConnectedRouter history={browserHistory}>
          <NextApp userAgent={navigator.userAgent} />
        </ConnectedRouter>
      </Provider>
    </AppContainer>,
    document.getElementById('app')
  );
};

if (!window.Intl) {
  (new Promise((resolve) => {
    resolve(require('intl'));
  }))
    .then(() => Promise.all([
      require('intl/locale-data/jsonp/en.js'),
      require('intl/locale-data/jsonp/de.js'),
    ]))
    .then(() => render())
    .catch((err) => {
      throw err;
    });
} else {
  render();
}

if (module.hot) {
  module.hot.accept('./routes', () => {
    render();
  });
}

// Install ServiceWorker and AppCache in the end since
// it's not most important operation and if main code fails,
// we do not want it installed
if (process.env.NODE_ENV === 'production') {
  require('offline-plugin/runtime').install(); // eslint-disable-line global-require, import/no-extraneous-dependencies
}
