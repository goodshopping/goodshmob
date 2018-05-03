// @flow

import React from 'react';
import {Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {isEmpty} from "lodash";
import type {List} from "../../types";
import {Colors} from "../colors";
import Icon from 'react-native-vector-icons/Entypo';

type Props = {
    lineup: List,
    skipChevron?: boolean,
    style?: *,
};

type State = {
};

export default class LineupTitle extends React.Component<Props, State> {

    static displayName = "LineupTitle";

    render() {
        const  {lineup, skipChevron, style} = this.props;
        let savingCount = _.get(lineup, `meta.savingsCount`, null);
        let countString = savingCount  !== null ? ' (' + savingCount + ')' : '';
        let title = lineup.name;

        return <Text style={[styles.lineupTitle, style]}>
            {title}
            <Text style={{color: Colors.greyish}}>
                {countString}

                {__DEBUG_SHOW_IDS__ && <Text
                    style={{color: Colors.grey3}}
                >{` id=(#${lineup.id.substr(0, 5)})`}</Text>}
            </Text>
            {/*{!skipChevron && <Icon name="chevron-right" size={16} color={Colors.greyishBrown}/>}*/}
        </Text>;
    }
}

const styles = StyleSheet.create({
    lineupTitle: {
        fontSize: 17,
    }
});
