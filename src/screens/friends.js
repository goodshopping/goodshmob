// @flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import FriendCell from "./components/FriendCell";
import * as Api from "../utils/Api";
import Feed from "./components/feed"
import ApiAction from "../utils/ApiAction";
import type {Id, Item, User} from "../types";
import {buildData} from "../utils/DataUtils";
import * as Nav from "./Nav";
import Screen from "./components/Screen";

type Props = {
    userId: Id,
    navigator:any,
    renderItem:(item:Item)=>Node,

    onPressItem:? (item: User)=>void,
    data?: any,
};

type State = {
};

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});

@connect(mapStateToProps)
export default class FriendsScreen extends Screen<Props, State> {


    // constructor(props: Props){
    //     super(props);
    //     props.navigator.addOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    // }
    //
    // onNavigatorEvent(event) {
    //     if (event.type === 'NavBarButtonPress') {
    //         if (event.id === Nav.CANCEL) {
    //             this.props.navigator.dismissModal();
    //         }
    //     }
    // }

    render() {

        const {
            userId,
            renderItem,
            ...attributes
        } = this.props;

        let user: User = buildData(this.props.data, "users", userId);

        let friends, callFactory, action;
        if (user && user.friends) {
            friends = user.friends;
            callFactory = () => actions.fetchFriendsCall(userId);
            action = actionTypes.LOAD_FRIENDS;
        }
        else {
            friends = [];
            callFactory = () => actions.getUser(userId);
            action = actionTypes.GET_USER;
        }

        return (<Feed
            {...attributes}
            data={friends}
            renderItem={({item}) => renderItem(item)}
            fetchSrc={{
                callFactory,
                action
            }}
            // cannotFetch={!super.isVisible()}
        />);
    }


    renderItem({item} : {item: Item}) {
        const {onPressItem} = this.props;
        return (
            <TouchableOpacity
                onPress={onPressItem}>
                <FriendCell
                    friend={item}
                    onPressItem={this.props.onPressItem}
                />
            </TouchableOpacity>
        )
    }
}

const actionTypes = (() => {

    const LOAD_FRIENDS = new ApiAction("load_friends");
    const GET_USER_W_FRIENDS = new ApiAction("get_user_w_friends");

    return {LOAD_FRIENDS, GET_USER: GET_USER_W_FRIENDS};
})();


const actions = (() => {
    return {
        fetchFriendsCall: (userId: string) => {

            return new Api.Call().withMethod('GET')
                .withRoute(`users/${userId}/friends`)
                .addQuery({
                    include: "creator"
                });
        },
        getUser: (userId): Api.Call => new Api.Call()
            .withMethod('GET')
            .withRoute(`users/${userId}`)
            .addQuery({
                    include: "friends"
                }
            ),
    };
})();



const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
