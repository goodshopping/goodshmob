// @flow

import React from 'react'
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native'
import {connect} from "react-redux"
import {currentUserId, logged} from "../../managers/CurrentUser"
import {ViewStyle} from "../../types"
import FriendsScreen from "./friends"

import ApiAction from "../../helpers/ApiAction"
import * as Api from "../../managers/Api"
import Immutable from 'seamless-immutable'
import Screen from "../components/Screen"
import {Colors} from "../colors"
import ShareButton from "../components/ShareButton"

type Props = {
    navigator:any,
    style?: ViewStyle
};

type State = {
};

const FETCH_PEOPLE_YOU_MAY_KNOW = ApiAction.create("people_you_may_know", "retrieve the user network he might know");

@logged
@connect((state, ownProps) => ({
    data: state.data,
}))
export class CommunityScreen extends Screen<Props, State> {

    render() {
        return (
            <FriendsScreen
                userId={currentUserId()}
                navigator={this.props.navigator}
                //renderItem={(item) => this.renderItem(item)}
                ListHeaderComponent={<ShareButton text={i18n.t('actions.invite')}/>}
                style={{backgroundColor: Colors.white}}
            />
        )
    }
}

export const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action) => {
        return Api.reduceList(state, action, {fetchFirst: FETCH_PEOPLE_YOU_MAY_KNOW});
    }
})();
