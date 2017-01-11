import React from 'react';
import { Router, Route, browserHistory } from 'react-router';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';

import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './reducers';
import Main from './containers/Main';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk, createLogger())));

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store);

console.log('Store:', store);
render(
    <Provider store={store}>
        <div>
            <Router history={history} >
                <Route path="/" component={Main}>
                    <Route path="/:artist" component={Main}>
                        <Route path="/:artist/:album" component={Main}/>
                    </Route>
                </Route>
            </Router>
        </div>
    </Provider>, document.getElementById('app')
);
