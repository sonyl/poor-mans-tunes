/* @flow */

import React, { Component } from 'react';

function btnClassNames(size) {
    let classNames = 'btn btn-default';
    switch(size) {
        case 'extra-small': classNames += ' btn-xs'; break;
        case 'small': classNames += ' btn-sm'; break;
        case 'large': classNames += ' btn-lg'; break;
    }
    return classNames;
}


type ClickHandler = (buttonName: string, label: string)=> void;

type Props = {
    className?: string,
    actions: {label: string, icon?: any, onClick: ClickHandler, disabled?: boolean}[],
    size: 'extra-small' | 'small' | 'medium' | 'large'
};
type State = {
    open: boolean
};

export default class SplitButton extends Component<Props, State> {
    static defaultProps: {
        size: 'medium'
    };

    state: State;

    constructor(props: Props) {
        super(props);

        this.state = {
            open: false
        };
    }


    toggleState() {
        this.setState({open: !this.state.open});
    }

    onClick(e: SyntheticEvent<HTMLButtonElement>) {
        e.preventDefault();
        const name = e.currentTarget.name;

        if(this.state.open) {
            this.setState({open: false});
        }

        if(name) {
            const {actions} = this.props;
            const action = actions[parseInt(name)];
            if(action && action.onClick) {
                action.onClick(name, action.label);
            }
        }
    }

    onBlur() {
        setTimeout(() => { // if(nothing is clicked in dropdown after 200ms, the SplitButtin has lost focus, -> close()
            if(this.state.open) {
                this.setState({open: false});
            }
        }, 200);
    }

    render(){

        const { actions, size, className='' } = this.props;
        const divClassName = 'btn-group' + (this.state.open ? ' open' : '') + (className ? ' ' + className : '');

        function getLabel(index) {
            if(actions[index]) {
                if(actions[index].icon) {
                    return (<span>{actions[index].icon} &nbsp; {actions[index].label}</span>);
                } else  {
                    return (<span>{actions[index].label}</span>);
                }

            }
        }

        function getDisabled(index): boolean {
            return actions[index] ? !!actions[index].disabled : true;
        }

        function getClassName(index): ?string {
            return getDisabled(index) ? 'disabled': null;
        }

        return(
            <div className={divClassName}>
                <button type="button" className={btnClassNames(size)} onClick={e=>this.onClick(e)} name="0"
                    disabled={getDisabled(0)}
                >
                    { getLabel(0) }
                </button>
                <button type="button" className={btnClassNames(size) + ' dropdown-toggle'} onClick={e=>this.toggleState()}
                    onBlur={e=>this.onBlur()}>
                    <span className="caret"/>
                </button>
                <ul className="dropdown-menu">
                    {
                        actions.slice(1).map((a, i) => (
                            <li key={i+1} className={getClassName(i+1)}>
                                <a href="#" onClick={e=>this.onClick(e)} name={i+1}>
                                    {getLabel(i+1)}
                                </a>
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}

