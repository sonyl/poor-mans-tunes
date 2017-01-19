/* global process:false module:false */
import React from 'react';
import { render } from 'react-dom';
import { BrowserRouter as Router, Match, Miss} from 'react-router';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import reducer from './reducers';
import Main from './containers/Main';
import getConfig from './config.js';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(reducer, composeEnhancers(applyMiddleware(thunk, createLogger())));

if (process.env.NODE_ENV === 'production') {
    console.log('Running in: production environment... and module.hot is: ', module.hot);
    console.log('Config:', getConfig());
} else {
    console.log('Running in: development environment... and module.hot is: ', module.hot);
}

const contextRoot = getConfig().contextRoot || '';

render(
    <Provider store={store}>
        <div>
            <Router basename={contextRoot} >
                <Match pattern="/" component={Main} />
            </Router>
        </div>
    </Provider>, document.getElementById('app')
);
