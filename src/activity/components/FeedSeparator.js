// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableWithoutFeedback, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";

type Props = {
    vMargin?: number
};

type State = {
};
export default class FeedSeparator extends React.Component<Props, State> {
    render() {
        return <View style={[styles.sep, UI.TP_MARGINS(this.props.vMargin)]}/>;
    }
}

const styles = StyleSheet.create({
    sep: {
        width: "100%", height: StyleSheet.hairlineWidth, backgroundColor: UI.Colors.grey2
    }
});
