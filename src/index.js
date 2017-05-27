/* global process:false module:false, require:false */
import React from 'react';
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

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const history = createHistory();
const routerMw = routerMiddleware(history);

const store = createStore(
    reducer,
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
    module.hot.accept('./reducers/', () => {
        // eslint-disable-next-line      we need 'require' for dynamic imports
        const nextRootReducer = require('./reducers/index').default;
        store.replaceReducer(nextRootReducer);
    });
}

render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <BrowserRouter basename={contextRoot} >
                <Route path="/" component={Main} />
            </BrowserRouter>
        </ConnectedRouter>
    </Provider>, document.getElementById('app')
);
