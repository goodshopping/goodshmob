// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import {connect} from "react-redux";
import type {Id, Item} from "../types";
import FriendsScreen from "./friends";
import FriendCell from "./components/FriendCell";
import {currentUserId} from "../CurrentUser";
import {TabBar, TabViewAnimated} from 'react-native-tab-view';
import * as UIStyles from "./UIStyles";
import i18n from '../i18n/i18n'
import ApiAction from "../utils/ApiAction";
import Feed from "./components/feed";
import * as Api from "../utils/Api";
import Immutable from 'seamless-immutable';
import {buildData} from "../utils/DataUtils";

type Props = {
    navigator:any
};

type State = {
};

const FETCH_PEOPLE_YOU_MAY_KNOW = new ApiAction("people_you_may_know");

@connect((state, ownProps) => ({
    peopleYouMayKnow: state.peopleYouMayKnow,
    data: state.data,
}))
export class CommunityScreen extends Component<Props, State> {

    state = {
        index: 0,
        routes: [
            {key: `friends`, title: i18n.t("community_screen.tabs.friends")},
            {key: `notifications`, title: i18n.t("community_screen.tabs.notifications")}
        ],
    };

    render() {
        return (
            <TabViewAnimated
                style={styles.container}
                navigationState={this.state}
                renderScene={this.renderScene.bind(this)}
                renderHeader={this.renderHeader.bind(this)}
                onIndexChange={this.handleIndexChange.bind(this)}
            />
        )
    }

    renderFriends() {
        const {navigator} = this.props;
        return (
            <FriendsScreen
                userId={currentUserId()}
                navigator={navigator}
                renderItem={(item) => this.renderItem(item)}
                ListFooterComponent={this.renderFriendsSuggestion.bind(this)}
            />
        )
    }

    renderFriendsSuggestion() {
        let peopleYouMayKnow = this.props.peopleYouMayKnow.list;
        return (
            <View>
                {/*<Text>People you may know</Text>*/}
                {/*<Feed*/}
                    {/*data={peopleYouMayKnow}*/}
                    {/*renderItem={this.renderItem.bind(this)}*/}
                    {/*fetchSrc={{*/}
                        {/*callFactory: ()=> this.fetchPeopleYouMayKnow(currentUserId()),*/}
                        {/*action: FETCH_PEOPLE_YOU_MAY_KNOW,*/}
                    {/*}}*/}
                    {/*hasMore={false}*/}
                {/*/>*/}
            </View>
        );
    }

    handleIndexChange(index: number) {
        this.setState({ index });
    }

    fetchPeopleYouMayKnow(user_id: Id) {
        console.info("==fetchPeopleYouMayKnow==");
        return new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${user_id}/people_you_may_know`);
    }

    renderHeader(props: *) {
        return <TabBar {...props}
                       indicatorStyle={styles.indicator}
                       style={styles.tabbar}
                       tabStyle={styles.tab}
                       labelStyle={styles.label}/>;
    }

    renderScene({ route }: *) {
        if (route.key === 'friends') {
            return this.renderFriends();
        }
        return null
    };

    renderItem(item: Item) : Node {
        let user = buildData(this.props.data, "users", item.id);
        return (
            <FriendCell
                friend={user}
            />
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    indicator: {
        backgroundColor: UIStyles.Colors.green,
    },
    tab: {
        opacity: 1,
    },
    label: {
        color: '#000000',
    },
    tabbar: {
        backgroundColor: 'white',
    },
    indicator: {
        backgroundColor: UIStyles.Colors.green,
    },
    tab: {
        opacity: 1,
        //width: 90,
    },
    label: {
        color: '#000000',
    },
});

export const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action) => {
        return Api.reduceList(state, action, {fetchFirst: FETCH_PEOPLE_YOU_MAY_KNOW});
    }
})();

