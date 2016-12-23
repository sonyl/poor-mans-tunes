import React, { Component, PropTypes }  from 'react';
import CSSClassnames from 'grommet/utils/CSSClassnames';

const INPUT = CSSClassnames.INPUT;

export default class Slider extends Component {

    static propTypes = {
        defaultValue: PropTypes.number,
        disabled: PropTypes.bool,
        id: PropTypes.string,
        max: PropTypes.number,
        min: PropTypes.number,
        name: PropTypes.string,
        onChange: PropTypes.func,
        step: PropTypes.number,
        value: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    };

    constructor(props) {
        super(props);

        this.state = {
            value: props.value
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.setState({value: e.target.value});
        if(this.props.onChange) {
            this.props.onChange(e);
        }
    }

    componentWillReceiveProps(nextProps) {
        // You don't have to do this check first, but it can help prevent an unneeded render
        if (nextProps.value !== this.state.value) {
            this.setState({ value: nextProps.value });
        }
    }

    render() {
        const { className, disabled, ...props } = this.props;

        const handleChange = (! disabled ? this.handleChange : undefined);

        return (
            <span className={className}>
                <input className={INPUT}
                    type='range'
                    ref={ref => this._inputRef = ref}
                    {...props}
                    tabIndex="0"
                    disabled={disabled}
                    onChange={ handleChange }
                    onInput={ handleChange }
                    value={ this.state.value }
                />
            </span>
        );
    }
}