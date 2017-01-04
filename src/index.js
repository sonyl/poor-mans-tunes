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
import DevTools from './containers/DevTools';

import 'grommet/scss/vanilla/index';

const store = createStore(
    reducer,
    compose(
        applyMiddleware(thunk, createLogger()),
        DevTools.instrument()
    )
);

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

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
            <DevTools />
        </div>
    </Provider>, document.getElementById('app')
);
