/* @flow */

import * as React from 'react';
import ScaleModal from 'boron/ScaleModal';
import { sanitizeHtml } from '../utils';

type Props = {
    title: string,
    body: string
};
type State = void;

class Modal extends React.Component<Props, State> {

    modal: ScaleModal;

    constructor(props: Props) {
        super(props);
    }

    show = () => {
        if(this.modal) this.modal.show();
    };

    hide = () => {
        if(this.modal) this.modal.hide();
    };

    render() {
        const modalStyle = {
            height: '90vh',
            overflowY: 'auto',
            fontSize: '18px'
        };

        const contentStyle = {
            paddingLeft: '10px'
        };

        const { body, title } = this.props;

        return (
            <ScaleModal ref={ modal => this.modal = modal } modalStyle={modalStyle} contentStyle={contentStyle}>
                <div className="modal-content">
                    <div className="modal-header">
                        <button type="button" className="close" style={{fontSize: '36px'}}
                            onClick={this.hide}>&times;</button>
                        <h4 className="modal-title" id="myModalLabel">{title}</h4>
                    </div>
                    {
                        body ?
                            <div className="modal-body" dangerouslySetInnerHTML={sanitizeHtml(body)}/>
                            :
                            <div />
                    }
                    <div className="modal-footer">
                        <button className="btn btn-primary btn-md" onClick={this.hide}>Close</button>
                    </div>
                </div>
            </ScaleModal>

        );
    }
}

export default Modal;