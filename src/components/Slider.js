/* @flow */

import React, { Component }  from 'react';
import PropTypes from 'prop-types';

type Props = {
    id: string,
    className?: string,
    defaultValue?: number,
    disabled?: boolean,
    min: number,
    max: number,
    name?: string,
    onChange?: (event: {value: number})=>void,
    step: number,
    value: string | number
};
type DefaultProps = void;
type State = {
    value: string | number
};

export default class Slider extends Component<DefaultProps, Props, State> {

    state: State;

    static propTypes = {
        id: PropTypes.string.isRequired,
        className: PropTypes.string,
        defaultValue: PropTypes.number,
        disabled: PropTypes.bool,
        max: PropTypes.number,
        min: PropTypes.number,
        name: PropTypes.string,
        onChange: PropTypes.func,
        step: PropTypes.number,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    };

    constructor(props: Props) {
        super(props);

        this.state = {
            value: props.value
        };
    }

    handleChange(e: Event & { currentTarget: HTMLInputElement}) {
        this.setState({value: e.currentTarget.value});
        const value = parseFloat(e.currentTarget.value);
        this.props.onChange && this.props.onChange({value});
    }

    componentWillReceiveProps(nextProps: Props) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    render() {
        const { className, disabled, ...props } = this.props;

        return (
            <span className={className}>
                <input
                    type='range'
                    {...props}
                    disabled={disabled}
                    onChange={ (e) => !disabled && this.handleChange && this.handleChange(e) }
                    value={ this.state.value }
                />
            </span>
        );
    }
}