/* @flow */
/* global process:false module:false, require:false */
import * as React from 'react';
import { render } from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';
import { Provider } from 'react-redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from './reducers';
import Main from './containers/Main';
import getConfig from './config.js';

import type { Store, State } from './types';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const history = createHistory();
const routerMw = routerMiddleware(history);

const initialState: State = ({
    settings: {
        playRandomSong: false,
        playRandomAlbum: false,
        volume: 0.8,
        persisted: {
            selectedFont: localStorage.getItem('selectedFont') || 'Roboto'
        }
    }
}: any);

const store: Store = createStore(
    reducer,
    initialState,
    composeEnhancers(applyMiddleware(thunk, routerMw, createLogger()))
);


if (process.env.NODE_ENV === 'production') {
    console.log('Running in: production environment... and module.hot is: ', module.hot);
    console.log('Config:', getConfig());
} else {
    console.log('Running in: development environment... and module.hot is: ', module.hot);
}

const contextRoot = getConfig().contextRoot || '';

if(module.hot) {        // enable hot reload of reducers
    // $FlowFixMe
    module.hot.accept('./containers/Main', () => render(Main));

    module.hot.accept('./reducers/', () => {
        // eslint-disable-next-line      we need 'require' for dynamic imports
        const nextRootReducer = require('./reducers/index').default;
        store.replaceReducer(nextRootReducer);
    });
}

let elem = document.getElementById('app');
elem && render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <BrowserRouter basename={contextRoot}>
                <Route path="/" component={Main}/>
            </BrowserRouter>
        </ConnectedRouter>
    </Provider>, elem);
