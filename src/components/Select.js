// @flow

import React, { Component }  from 'react';


type Props = {
    id: string,
    className: string,
    label: string,
    options: string[],
    selected: string,
    onChange: (string)=>void
};
type State = {
    selected: string;
};

export default class Select extends Component<Props, State> {

    static defaultProps = {
        className: ''
    };

    state: State;

    constructor(props: Props) {
        super(props);

        this.state = {selected: props.selected};
    }

    onChange({currentTarget}: SyntheticEvent<HTMLSelectElement>) {
        const selected = currentTarget.value;
        this.setState({selected});
        this.props.onChange(selected);
    }

    render() {
        const { id, className, options, label} = this.props;

        return (
            <div className={className}>
                <label htmlFor={id}>{label}</label>
                <select className="form-control" id={id} onChange={(e)=>this.onChange(e)} value={this.state.selected}>
                    {
                        options.map(o => (
                            <option key={o}>
                                {o}
                            </option>
                        ))
                    }
                </select>
            </div>
        );
    }
}
