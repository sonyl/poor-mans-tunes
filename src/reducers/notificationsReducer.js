import { SEND_NOTIFICATION, DISMISS_NOTIFICATION } from '../actions/actionKeys';


const notifications = (state = [], props) => {
    switch (props.type) {
        case SEND_NOTIFICATION: {
            return [
                ...state,
                props.alert
            ];
        }
        case DISMISS_NOTIFICATION: {
            // find the index of the alert that was dismissed
            const idx = state.indexOf(props.alert);
            if (idx >= 0) {
                return [
                    ...state.slice(0, idx),
                    ...state.slice(idx + 1)
                ];
            }
        }
    }
    return state;
};

export default notifications;
