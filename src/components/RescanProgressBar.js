/* @flow */

import React from 'react';
import withEventSource from './withEventSource';
import ProgressBar from './ProgressBar';
import { createLog } from '../utils';

import type { WithEventSourceConfig } from './withEventSource';
import type { ScanStatistics } from '../types';

const ENABLE_LOG = false;
const log = createLog(ENABLE_LOG, 'RescanProgressBar');

type Props = {
    scanStats?: ScanStatistics,
    done: () => void;
};

const RescanProgressBar = (props: Props) => {
    log('RescanProgressBar', 'props=%o', props);
    const percentDone = props.scanStats && props.scanStats.percentDone || 0;
    return (
        <ProgressBar id='scan-progress' maxValue={100} value={ percentDone }
            text={percentDone + '%'}
        />
    );
};

const config: WithEventSourceConfig = {
    eventUrl: '/api/scanstats',
    events: {
        status: {
            mapper: JSON.parse,
            setProperty: 'scanStats'
        },
        finish: {
            mapper: JSON.parse,
            callFunc: 'done'
        }
    }
};

export default withEventSource(config)(RescanProgressBar);