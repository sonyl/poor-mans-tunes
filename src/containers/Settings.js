/* @flow */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLastCollectionUpdate, getServerStatus, getServerSettings } from '../reducers';
import dateFormat from 'dateformat';

import { getCollection, invalidateCollection } from '../actions/collectionActions';
import { requestServerStatus, requestRescanFiles, updateServerSettings } from '../actions/serverActions';
import { setPersistedValue } from '../actions/settingsActions';

import RescanProgressBar from '../components/RescanProgressBar';
import Select from '../components/Select';

import type { ServerStatus, ServerSettings } from '../types';

function formatDate(date) {
    return dateFormat(date, 'dd.mm.yy HH:MM:ss');
}

function getSettingsString(settings: ServerSettings, key: string): string {
    return settings && typeof settings[key] === 'string'  && settings[key]  || '';
}

type Props = {
    lastUpdate: string,
    serverSettings: { settings: ServerSettings, error?: string, lastUpdated?: string},
    serverStatus: {status: ServerStatus, error?: string, lastUpdated?: string},
    invalidateCollection: ()=> void,
    getCollection: ()=> void,
    requestServerStatus: ()=> void,
    requestRescanFiles: ()=> void,
    updateServerSettings: (string, string)=> void,
    setPersistedValue: (string, string | {})=> void
};
type State = {
    audioPath: string
};

class Settings extends Component<Props, State> {

    state: State;

    constructor(props: Props) {
        super(props);
        const { serverSettings } = props;
        this.state = {
            audioPath: getSettingsString(serverSettings.settings, 'audioPath')
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        const audioPath = getSettingsString(nextProps.serverSettings.settings, 'audioPath');
        if (audioPath !== this.state.audioPath) {
            this.setState({ audioPath });
        }
    }


    buttonClicked = event => {
        console.log('Button clicked', event.target.id);
        const {invalidateCollection, getCollection, requestServerStatus, requestRescanFiles, updateServerSettings} = this.props;
        if(event.target.id === 'reloadCollectionBtn') {
            invalidateCollection();
            getCollection();
        } else if(event.target.id === 'updateStatusBtn') {
            requestServerStatus();
        } else if(event.target.id === 'rescanBtn') {
            requestRescanFiles();
        } else if(event.target.id === 'updateSettingsBtn') {
            updateServerSettings('audioPath', this.state.audioPath);
        }
    };

    onChange = event => {
        this.setState({
            audioPath: event.target.value
        });
    };

    selectChanged(newValue: string) {
        console.log('selectChanged %s', newValue);
        this.props.setPersistedValue('selectedFont', newValue);
    }

    render = () => {

        const {lastUpdate, serverStatus, serverSettings, requestServerStatus} = this.props;
        const scanning = serverStatus && serverStatus.status && serverStatus.status.scanning;
        const ready = serverStatus && serverStatus.status && serverStatus.status.status ==='ready';
        let audioPathInput;

        return (
            <div>
                <h3>Settings:</h3>
                <h4>Server:</h4>
                <div className="form-horizontal">
                    <div className="form-group ">
                        <label className="col-xs-2 control-label" htmlFor="exampleInputEmail1">
                            audio path:
                        </label>
                        <div className="col-xs-5">
                            <div className="input-group">
                                <input id="audioPath" type="text" className="form-control"
                                    placeholder="path to scan for audio files"
                                    onChange = { this.onChange }
                                    ref={(input) => {
                                        audioPathInput = input;
                                    }}
                                    value={ this.state.audioPath }
                                />
                                <span className="input-group-btn">
                                    <button className="btn btn-primary" id="updateSettingsBtn"
                                        onClick={this.buttonClicked}>update settings
                                    </button>
                                </span>
                            </div>
                        </div>
                        <div className="col-xs-5">
                            {JSON.stringify(serverSettings)}
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-xs-3">
                            <button className="btn btn-default btn-lg btn-block" id="updateStatusBtn"
                                onClick={this.buttonClicked}>update status
                            </button>
                        </div>
                        <div className="col-xs-9">
                            {JSON.stringify(serverStatus)}
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="col-xs-3">
                            <button className="btn btn-default btn-lg btn-block" id="rescanBtn"
                                disabled={scanning} onClick={this.buttonClicked}>
                                rescan files
                            </button>
                        </div>
                        <div className="col-xs-8" style={{'marginTop': '10px'}}>
                            <RescanProgressBar done={()=> requestServerStatus() } active={scanning} />
                        </div>
                        <div className="col-xs-1"/>
                    </div>
                    <div className="form-group">
                        <div className="col-xs-3">
                            <button className="btn btn-default btn-lg btn-block" id="reloadCollectionBtn"
                                disabled={!ready} onClick={this.buttonClicked}>
                                reload collection
                            </button>
                        </div>
                        <div className="col-xs-9">
                            last update:&nbsp; { lastUpdate ? formatDate(lastUpdate) : 'unknown'}
                        </div>
                    </div>
                </div>
                <h4>Client:</h4>
                <div className="form-group">
                    <div className="row">
                        <Select className="col-xs-3" id="selectFont" label="Select a font:"
                            options={['Roboto', 'Rationale']} selected="Roboto"
                            onChange={this.selectChanged.bind(this)}
                        />
                    </div>
                </div>
            </div>

        );
    }
}

const mapStateToProps = state => ({
    lastUpdate: getLastCollectionUpdate(state),
    serverStatus: getServerStatus(state),
    serverSettings: getServerSettings(state)
});

const mapDispatchToProps = {
    getCollection,
    invalidateCollection,
    requestServerStatus,
    requestRescanFiles,
    updateServerSettings,
    setPersistedValue
};
export default connect(mapStateToProps, mapDispatchToProps)(Settings);
