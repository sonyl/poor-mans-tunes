/* @flow */

import * as React from 'react';
import { createLog } from '../utils';

declare type Handler = (Object) => void;
declare class EventSource {
    constructor(uri: string): EventSource;
    onerror: (Handler)=> void;
    addEventListener(string, Handler): void;
    close(): void
}

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'withEventSource');

export type WithEventSourceConfig = {
    eventUrl: string;
    events: {
        [string]: {
            mapper: (string)=> mixed,
            setProperty?: string,
            callFunc?: string
        }
    };
};

type State = {events: {[string]: mixed}};
type Props = {
    active: boolean
};

const withEventSource = (config: WithEventSourceConfig) => (WrappedComponent: React.ComponentType<any>) =>
    class extends React.Component<Props, State> {
        state: State;
        evtSource: ?EventSource;

        constructor(props: Props) {
            super(props);
            log('WrappedComponent:constructor', 'props=%o', props);
            this.state = {
                events: {}
            };
        }

        componentWillReceiveProps(nextProps: Props) {
            log('WrappedComponent:componentWillReceiveProps', 'nextProps=%o', nextProps);
            if (this.props.active !== nextProps.active) {
                if (nextProps.active) {
                    this.setState({events: {}});
                    log('WrappedComponent:componentWillReceiveProps', 'starting');
                    this.startStatusReceiver();
                } else {
                    log('WrappedComponent:componentWillReceiveProps', 'stopping');
                    this.stopStatusReceiver();
                }
            }
        }

        stopStatusReceiver() {
            if (this.evtSource) {
                this.evtSource.close();
                this.evtSource = null;
            }
        }

        startStatusReceiver() {
            this.evtSource = new EventSource(config.eventUrl);

            this.evtSource.onerror = e => {
                log('evtSource.onerror', 'EventSource failed:  %o', e.data);
                this.stopStatusReceiver();
            };

            const events = config.events;
            Object.keys(events).forEach(event => {
                const eventCfg = events[event];
                this.evtSource && this.evtSource.addEventListener(event, e => {
                    log('evtSource.EventListener', 'received "%s" status: %s', event, e.data);
                    const mappedEvent = eventCfg.mapper(e.data);
                    if(eventCfg.setProperty) {
                        this.setState({
                            events: {
                                ...this.state.events,
                                [eventCfg.setProperty]: mappedEvent
                            }
                        });
                        log('evtSource.EventListener', 'setState: "%s" %o', event, mappedEvent);
                    } else if(eventCfg.callFunc && typeof this.props[eventCfg.callFunc] === 'function') {
                        this.props[eventCfg.callFunc](mappedEvent);
                        log('evtSource.EventListener', 'call function: %s(%o)', event, mappedEvent);
                    }
                });
            });
        }

        render() {
            if (this.props.active) {
                return <WrappedComponent {...this.state.events} />;
            }
            return null;
        }
    };

export default withEventSource;

