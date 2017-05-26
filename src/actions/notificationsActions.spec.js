/* eslint-env node, jest */
import {createStore as _createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';
import * as actions from './notificationsActions';

const createStore = (initialState = {}) => {
    return _createStore(
        reducer,
        initialState,
        applyMiddleware(thunk)
    );
};

describe('notifications actions', () => {
    let store;

    beforeEach(() => {
        store = createStore();
    });

    describe('sendNotification', () => {
        it('should add an info alert to the end of the notifications', () => {
            store.dispatch(actions.sendNotification('HiHo'));
            expect(store.getState().notifications.length).toEqual(1);
            expect(store.getState().notifications[0].type).toEqual('info');
            expect(store.getState().notifications[0].headline).not.toBeDefined();

        });
    });
    describe('sendDangerNotification', () => {
        it('should add an danger alert with headline the end of the notifications', () => {
            store.dispatch(actions.sendDangerNotification('headline', 'HiHo'));
            expect(store.getState().notifications.length).toEqual(1);
            expect(store.getState().notifications[0].type).toEqual('danger');
            expect(store.getState().notifications[0].headline).toEqual('headline');
        });
    });

    describe('dismissNotification', () => {

        it('should remove the notification', () => {
            const msg = actions.sendNotification('HiHo');
            store.dispatch(msg);
            expect(store.getState().notifications.length).toEqual(1);
            store.dispatch(actions.dismissNotification(msg.alert));
            expect(store.getState().notifications.length).toEqual(0);
        });
    });
});
