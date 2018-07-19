//@flow
import React, {Component} from 'react'
import {Image} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import type {SearchState} from "../../helpers/SearchHelper"

export type Props = {
    searchState: SearchState,
    setRef?: () => void
};

type State = {
};


export default class GMap extends Component<Props, State>  {

    static defaultProps = {

    };

    render() {
        const data = _.flatten(_.get(this.props, 'searchState.data', []))
        return (<MapView
            style={{flex:1, marginTop: 5}}
            provider={'google'}
            ref={this.props.setRef}>
            {data && data.map(function (result, i) {

                const item = result.resource || result
                const userInfo = result.user ? ` by ${result.user.first_name} ${result.user.last_name}` : ''
                return <Marker key={i}
                               coordinate={item.description}
                               title={`${item.title}${userInfo}`}
                               description={item.description.address}
                />
            })}
        </MapView>
        );
    }

}

