import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getLastCollectionUpdate, getServerStatus, getServerSettings } from '../reducers';
import dateFormat from 'dateformat';

import { getCollection, invalidateCollection } from '../actions/collectionActions';
import { requestServerStatus, requestRescanFiles, updateServerSettings } from '../actions/serverActions';

import ProgressBar from '../components/ProgressBar';

function formatDate(date) {
    return dateFormat(date, 'dd.mm.yy HH:MM:ss');
}

class Settings extends Component {

    constructor(props) {
        super(props);
        const { serverSettings } = props;
        this.state = {
            mp3Path: serverSettings.settings && serverSettings.settings.mp3Path || ''
        };
    }

    componentWillReceiveProps(nextProps) {
        const mp3Path = nextProps.serverSettings.settings && nextProps.serverSettings.settings.mp3Path || '';
        if (mp3Path !== this.state.mp3Path) {
            this.setState({ mp3Path });
        }
    }


    buttonClicked = event => {
        console.log('Button clicked', event.target.id);
        const {invalidateCollection, getCollection, requestServerStatus, requestRescanFiles, updateServerSettings} = this.props;
        if(event.target.id === 'reloadCollectionBtn') {
            invalidateCollection();
            getCollection();
        } else if(event.target.id === 'updateStatusBtn') {
            requestServerStatus(true);
        } else if(event.target.id === 'rescanBtn') {
            requestRescanFiles();
        } else if(event.target.id === 'updateSettingsBtn') {
            updateServerSettings('mp3Path', this.state.mp3Path);
        }
    };

    onChange = event => {
        this.setState({
            mp3Path: event.target.value
        });
    };

    renderProgressBar() {
        const status = this.props.serverStatus && this.props.serverStatus.status;
        if (status && status.scanning && status.scanStatistics) {
            return (
                <ProgressBar id='scan-progress' maxValue={100} value={status.scanStatistics.percentDone}
                                text={status.scanStatistics.percentDone + '%'} />
            );
        }
    }

    render = () => {

        const {lastUpdate, serverStatus, serverSettings} = this.props;
        const scanning = serverStatus && serverStatus.status && serverStatus.status.scanning;
        const ready = serverStatus && serverStatus.status && serverStatus.status.status ==='ready';
        let mp3PathInput;

        return (
            <div>
                <h3>Settings:</h3>
                <div className="form-horizontal">
                    <div className="form-group ">
                        <label className="col-xs-1 control-label" htmlFor="exampleInputEmail1">
                            mp3 path:
                        </label>
                        <div className="col-xs-5">
                            <div className="input-group">
                                <input id="mp3Path" type="text" className="form-control"
                                       placeholder="path to scan fro mp3 files"
                                       onChange = { this.onChange }
                                       ref={(input) => {
                                           mp3PathInput = input;
                                       }}
                                       value={ this.state.mp3Path }
                                />
                                <span className="input-group-btn">
                                            <button className="btn btn-primary" id="updateSettingsBtn"
                                                    onClick={this.buttonClicked}>update settings
                                            </button>
                                        </span>
                            </div>
                        </div>
                        <div className="col-xs-4">
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
                            { this.renderProgressBar() }
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
    updateServerSettings
};
export default connect(mapStateToProps, mapDispatchToProps)(Settings);
