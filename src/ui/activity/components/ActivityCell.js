// @flow

import React from 'react';
import {Image, Linking, Share, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {connect} from "react-redux";
import {buildNonNullData, sanitizeActivityType} from "../../../helpers/DataUtils";
import type {Activity, ActivityType, Id} from "../../../types"
import ActivityBody from "./ActivityBody";
import ActivityActionBar from "./ActivityActionBar";
import {Avatar} from "../../UIComponents";
import {seeUser} from "../../Nav";
import GTouchable from "../../GTouchable";
import * as activityAction from "../actions";
import {getPendingLikeStatus} from "../../rights";

export type ActivityDisplayContext = {

}

type Props = {
    data: any,
    activity: Activity,
    activityId: Id,
    activityType: ActivityType,
    navigator: any,
    onPressItem: (any) => void,
    skipLineup:? boolean;
    skipDescription:? boolean;
};

type State = {
};


@connect((state, ownProps) => ({
    data: state.data,
    pending: state.pending
}))
export default class ActivityCell extends React.Component<Props, State> {

    refKeys: any;

    render() {

        let activity = this.getActivity();
        this.refKeys = this.makeRefObject(this.props);




        let target = activity.target;
        let postedToUser = target && target.type === 'users' && target;
        // const {skipLineup, withFollowButton} = this.props;
        // if (skipLineup) return null;

        let avatarDim = 34;
        let halfAvatar = avatarDim / 2;
        let avatarTopMargin = halfAvatar;


        const padding = 10;
        let planeTranslate = 10;

        // image = null;
        const dim = 16;
        // const translateY = -10;
        const translateY = -25;
        const translateX = 25;

        const navigator = this.props.navigator;
        return (
            <View>
                <View style={{zIndex: 2}}>
                    <View style={{left: padding, flexDirection: 'row', }}>
                        <GTouchable onPress={()=> seeUser(navigator, activity.user)}>
                            <Avatar user={activity.user} style={{dim: avatarDim}}/>
                        </GTouchable>
                        {postedToUser && <Image style={[{width: dim, height: dim, transform: [{translateY: -20}, {translateX: 15}, { rotate: '20deg'}]}]} source={require('../../../img2/sendIcon.png')}/>}
                    </View>
                    {postedToUser && <View style={{position: 'absolute', right: padding, flexDirection: 'row'}}>

                        <Image style={[{width: dim, height: dim, transform: [{translateY}, {translateX: -translateX}, { rotate: '70deg'}]}]} source={require('../../../img2/sendIcon.png')}/>
                        <GTouchable onPress={()=> seeUser(navigator, postedToUser)}>
                            <Avatar user={postedToUser} style={{dim: avatarDim}}/>
                        </GTouchable>
                    </View>}
                </View>

                <View style={{top: - (avatarDim + padding)}}>
                    <GTouchable activeOpacity={0.9} onPress={this.props.onPressItem}  onDoublePress={() => {
                        let liked = this.isLiked(activity);
                        const toggleLike = liked?  activityAction.unlike : activityAction.like;
                        this.props.dispatch(toggleLike(activity.id, activity.type));
                    }}>
                        <ActivityBody
                            activity={activity}
                            liked={this.isLiked(activity)}
                            navigator={this.props.navigator}
                            skipLineup={this.props.skipLineup}
                        />
                    </GTouchable>

                    {/*<FeedSeparator/>*/}


                    <ActivityActionBar
                        activityId={activity.id}
                        activityType={activity.type}
                        navigator={this.props.navigator}
                    />

                </View>
            </View>
        )
    }

    isLiked(activity) {
        const pendingLikeStatus = getPendingLikeStatus(this.props.pending, activity);
        return pendingLikeStatus ?
            pendingLikeStatus > 0
            : activity.meta && activity.meta["liked"];
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (!ENABLE_PERF_OPTIM) return true;

        if (!this.hasChanged(nextProps)) {
            superLog('ActivityCell render saved');
            return false;
        }
        return true;
    }

    hasChanged(nextProps:Props): boolean {
        let oldRefKeys = this.refKeys;
        if (!oldRefKeys) return true;

        let nextRefKeys = this.makeRefObject(nextProps);

        let refKeys = this.getRefKeys(nextProps);

        for (let i = 0; i < refKeys.length; i++) {
            let refKey = refKeys[i];
            // $FlowFixMe
            if (oldRefKeys[refKey] !== nextRefKeys[refKey]) return true;
        }
        return false;

    }


    makeRefObject(nextProps:Props) {
        let refKeys = this.getRefKeys(nextProps);

        return refKeys.reduce((res, key)=> {
            // $FlowFixMe
            res[key] = _.get(nextProps, key);
            return res;
        }, {});
    }

    getRefKeys(nextProps: Props) {
        let activityType = sanitizeActivityType(nextProps.activityType);
        let base = `data.${activityType}.${nextProps.activityId}`;
        return [base, `${base}.meta`, 'pending'];
    }

    getActivity() {
        return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }
}
