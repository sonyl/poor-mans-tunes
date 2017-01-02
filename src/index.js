/* global process:false */

import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './reducers';
import Main from './containers/Main';
import DevTools from './containers/DevTools';

import 'grommet/scss/vanilla/index';

// const store = createStore(
//     reducer,
//     applyMiddleware(...middleware)
// );
const store = createStore(
    reducer,
    compose(
        applyMiddleware(thunk, createLogger()),
        DevTools.instrument()
    )
);


console.log('Store:', store);
render(
    <Provider store={store}>
        <div>
            <Main />
            <DevTools />
        </div>
    </Provider>, document.getElementById('app')
);
