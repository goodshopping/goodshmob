// @flow
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {connect} from "react-redux";
import {MainBackground} from "./UIComponents";
import Immutable from 'seamless-immutable';
import * as Api from "../utils/Api";
import Feed from "./components/feed";
import type {Activity, ActivityType, Comment, Id} from "../types";
import ApiAction from "../utils/ApiAction";
import {buildData, buildNonNullData, doDataMergeInState, sanitizeActivityType} from "../utils/DataUtils";
import UserActivity from "../activity/components/UserActivity";
import i18n from '../i18n/i18n'
import FeedSeparator from "../activity/components/FeedSeparator";
import * as UI from "./UIStyles";

type Props = {
    activityId: Id,
    activityType: ActivityType,
};

type State = {
    newComment?: string,
    isAddingComment?: boolean
};

class CommentsScreen extends Component<Props, State> {

    state = {};

    render() {
        let activity = this.getActivity();

        // let comments = (activity.comments || []).reduce((res, com)=> {
        //     let comment = buildData(this.props.data, com.type, com.id);
        //     if (comment) {
        //         res.push(comment);
        //     }
        //     return res;
        // }, []);
        let comments = activity.comments;

        return (
            <MainBackground>
                <View style={styles.container}>
                    <Feed
                        data={comments}
                        renderItem={this.renderItem.bind(this)}
                        fetchSrc={{
                            callFactory:()=>actions.loadComments(activity),
                            action:actionTypes.LOAD_COMMENTS,
                            options: {activityId: activity.id, activityType: activity.type}
                        }}
                        hasMore={false}
                        ItemSeparatorComponent={()=> <FeedSeparator/>}
                        ListHeaderComponent={
                            <View style={{padding: 12, backgroundColor:"transparent"}}>
                                <UserActivity
                                    activityTime={activity.createdAt}
                                    user={activity.user}/>

                                <Text>{activity.description}</Text>
                            </View>
                        }
                        ListFooterComponent={
                            <View style={styles.inputContainer}>
                                <TextInput
                                    editable={!this.state.isAddingComment}
                                    style={styles.input}
                                    onSubmitEditing={() => this.addComment(activity)}
                                    value={this.state.newComment}
                                    onChangeText={newComment => this.setState({newComment})}
                                    placeholder={i18n.t("activity_comments_screen.add_comment_placeholder")}
                                />
                            </View>
                        }
                    />
                </View>
            </MainBackground>
        );
    }

    getActivity() {
        return buildNonNullData(this.props.data, this.props.activityType, this.props.activityId);
    }

    addComment(activity: Activity) {
        if (this.state.isAddingComment) return;
        this.setState({isAddingComment: true});
        this.props.dispatch(actions.addComment(activity, this.state.newComment))
            .then(()=>{
                this.setState({newComment: '', isAddingComment: false});
            });

    }

    renderItem({item}) {
        let comment : Comment = buildData(this.props.data, "comments", item.id);
        if (!comment) return null;

        return (
            <View style={{padding: 12, backgroundColor:"white"}}>
                <UserActivity
                    activityTime={comment.createdAt}
                    user={comment.user}/>

                <Text>{comment.content}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent'
    },
    input:{
        height: 40,
    },
    inputContainer:{
        // height: 40,
        borderColor: UI.Colors.grey1,
        borderWidth: 0.5,
        borderRadius: 20,
        paddingLeft: 14,
        paddingRight: 14,
        margin: 10,
        backgroundColor: 'white'
    },
});

const mapStateToProps = (state, ownProps) => ({
    data: state.data,
});


const actionTypes = (() => {

    const LOAD_COMMENTS = new ApiAction("load_comments");
    const ADD_COMMENT = new ApiAction("add_comment");

    return {LOAD_COMMENTS, ADD_COMMENT};
})();


const actions = (() => {
    return {

        loadComments: (activity: Activity) => {

            let activityType = sanitizeActivityType(activity.type);

            return new Api.Call()
                .withMethod('GET')
                .withRoute(`${activityType}/${activity.id}/comments`);
        },

        addComment: (activity: Activity, content: string) => {
            let activityType = sanitizeActivityType(activity.type);
            return new Api.Call()
                .withMethod('POST')
                .withRoute(`${activityType}/${activity.id}/comments`)
                .addQuery({include: "user"})
                .withBody({comment: {content: content}})
                .disptachForAction2(actionTypes.ADD_COMMENT, {activityId: activity.id, activityType: activity.type})
                ;
        }
    };
})();



const reducer = (() => {
    const initialState = Immutable(Api.initialListState());

    return (state = initialState, action = {}) => {

        switch (action.type) {
            case actionTypes.LOAD_COMMENTS.success(): {
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;

                state = doDataMergeInState(state, path, action.payload.data);
                break;
            }
            case actionTypes.ADD_COMMENT.success(): {

                let {id, type} = action.payload.data;
                let {activityId, activityType} = action.options;
                activityType = sanitizeActivityType(activityType);
                let path = `${activityType}.${activityId}.relationships.comments.data`;
                state = doDataMergeInState(state, path, [{id, type}]);
                break;
            }

        }
        //let desc = {fetchFirst: actionTypes.LOAD_COMMENTS};
        //return Api.reduceList(state, action, desc);
        return state;
    }
})();

let screen = connect(mapStateToProps)(CommentsScreen);

export {reducer, screen, actions};
