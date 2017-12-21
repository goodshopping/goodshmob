// @flow

import type {Node} from 'react';
import React from 'react';


import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import type {User} from "../../types";
import UserRowI from "./UserRowI";
import {Colors} from "../../ui/colors";

type Props = {
    user: User,
    children?: Node,
    small?: boolean,
    text?: string,
    style?: any,
    navigator: *
};

type State = {
};

export default class UserRow extends React.Component<Props, State> {

    render() {
        return <UserRowI
            {...this.props}
            rightComponent={!!this.props.text &&
            <Text style={{
                fontSize: 9,
                color: Colors.grey1,
                marginLeft: 4
            }}>{this.props.text}
            </Text>
            }
        />
    }
}