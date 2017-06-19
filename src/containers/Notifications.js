/* @flow */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { AlertList } from 'react-bs-notifier';

import { dismissNotification } from '../actions/notificationsActions';

import type { Alert } from '../types';

type Props = {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
    timeout: number,
    alerts: Alert[],
    dismissAlert: (Alert)=>void;
}
type DefaultProps = {
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left',
    timeout: number,
}
type State = void;

class Notifications extends Component<DefaultProps, Props, State> {

    onAlertDismiss = alert => {
        this.props.dismissAlert(alert);
    };

    render() {
        return (
            <AlertList alerts={ this.props.alerts } onDismiss={ this.onAlertDismiss } timeout={this.props.timeout}/>
        );
    }

    static propTypes = {
        position: PropTypes.oneOf(['top-right', 'top-left', 'bottom-right', 'bottom-left']),
        timeout: PropTypes.number,
        alerts: PropTypes.arrayOf(
            PropTypes.shape({
                id: PropTypes.any.isRequired,
                type: PropTypes.oneOf(['info', 'success', 'warning', 'danger']),
                headline: PropTypes.string,
                message: PropTypes.oneOfType([PropTypes.string, PropTypes.node, PropTypes.object]).isRequired
            })
        ).isRequired,
        dismissAlert: PropTypes.func
    };

    static defaultProps = {
        position: 'top-right',
        timeout: 2000
    }
}

const mapStateToProps = state => ({
    alerts: state.notifications
});

const mapDispatchToProps = {
    dismissAlert: dismissNotification
};

export default connect(mapStateToProps, mapDispatchToProps)(Notifications);


