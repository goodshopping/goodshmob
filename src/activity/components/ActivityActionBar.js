// @flow

import React from 'react';

import {Image, Linking, Share, StyleSheet, Text, TouchableHighlight, TouchableOpacity, View} from 'react-native';
import * as UI from "../../screens/UIStyles";
import type {Activity, Item, List, Url} from "../../types";
import i18n from '../../i18n/i18n'
import {saveItem} from "../../screens/actions";
import type {Description, Visibility} from "../../screens/save";
import {connect} from "react-redux";

export type ActivityActionType = 'comment' | 'share' | 'save' | 'buy';
const ACTIONS = ['comment', 'share', 'save', 'buy'];

@connect()
export default class ActivityActionBar extends React.Component {

    props: {
        activity: Activity,
        navigator: any,
        actions?: Array<ActivityActionType>
    };


    render() {

        let activity = this.props.activity;

        //let activity: Model.Activity = this.props.activity;
        let resource = activity.resource;

        let commentsCount = activity.comments ? activity.comments.length : 0;

        let goodshed = resource && resource.meta ? resource.meta["goodshed"] : false;

        const actions : Array<ActivityActionType> = this.props.actions || ACTIONS;

        return <View style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingLeft: 10,
            paddingRight: 10
        }}>

            {actions.indexOf('comment') >= 0 && this.renderButton(require('../../img/comment.png'), i18n.t("activity_item.buttons.comment", {count: commentsCount}), () => this.comment(activity))}

            {actions.indexOf('share') >= 0 && this.renderButton(require('../../img/send.png'), i18n.t("activity_item.buttons.share"), () => this.send(activity))}
            {
                goodshed ?
                    actions.indexOf('save') >= 0 && this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.saved"), null, true)
                    :
                    actions.indexOf('save') >= 0 && this.renderButton(require('../../img/save-icon.png'), i18n.t("activity_item.buttons.save"), () => this.save(activity))
            }
            {actions.indexOf('buy') >= 0 && this.renderButton(require('../../img/buy-icon.png'), i18n.t("activity_item.buttons.buy"), () => this.buy(activity))}

        </View>;
    }


    renderButton(img: Url, text: string, handler: ()=>void, active:boolean = false) {
        let color = active ? UI.Colors.green: UI.Colors.black;
        return (<TouchableOpacity onPress={handler}>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 6}}>

                    <Image source={img} style={{width: 16, height: 16, margin: 8, resizeMode: 'contain', tintColor: color}}/>
                    <Text style={{fontFamily: 'Chivo', textAlign: 'center', fontSize: 10, color: color}}>{text}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    save(activity: Activity) {


        this.props.navigator.showModal({
            screen: 'goodsh.LineupListScreen', // unique ID registered with Navigation.registerScreen
            title: "Ajouter à une liste",
            animationType: 'none',
            passProps: {
                activity,
                canFilterOverItems: false,
                onLineupPressed: (lineup: List) => {

                    //this.props.navigator.dismissModal({animationType: 'none'});

                    this.props.navigator.showLightBox({
                        screen: 'goodsh.SaveScreen', // unique ID registered with Navigation.registerScreen
                        style: {
                            backgroundBlur: "light", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                            tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
                        },
                        passProps: {
                            activity,
                            containerStyle: {width: 300, height: 500},
                            onDescription:
                                (description: Description,
                                 visibility: Visibility) => {
                                    setTimeout(() => {
                                        this.props.dispatch(
                                            saveItem(activity.resource.id, lineup.id, visibility, description)
                                        ).then(() => {
                                            this.props.navigator.dismissLightBox();
                                            this.props.navigator.dismissAllModals({animationType: 'none'});
                                        });
                                    }, 500)
                                }
                        },
                    });
                }


            },
        });



    }

    comment(activity: Activity) {
        this.props.navigator.push({
            screen: 'goodsh.CommentsScreen', // unique ID registered with Navigation.registerScreen
            title: "Commentaires", // navigation bar title of the pushed screen (optional)
            passProps: {
                activityId: activity.id,
                activityType: activity.type
            },
        });
    }

    send(activity: Activity) {
        const {resource} = activity;

        this.props.navigator.showLightBox({
            screen: 'goodsh.ShareScreen', // unique ID registered with Navigation.registerScreen
            style: {
                backgroundBlur: "light", // 'dark' / 'light' / 'xlight' / 'none' - the type of blur on the background
                tapBackgroundToDismiss: true // dismisses LightBox on background taps (optional)
            },
            passProps:{
                itemId: resource.id,
                itemType: resource.type,
                //navigator: this.props.navigator
            },
        });


        // Share.share({
        //     message: 'BAM: we\'re helping your business with awesome React Native apps',
        //     url: 'http://bam.tech',
        //     title: 'Wow, did you see that?'
        // }, {
        //     // Android only:
        //     dialogTitle: 'Share BAM goodness',
        //     // iOS only:
        //     excludedActivityTypes: [
        //         'com.apple.UIKit.activity.PostToTwitter'
        //     ]
        // })
    }

    buy(activity: Activity) {
        let resource = activity.resource;
        let url = resource.url;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                console.log("Don't know how to open URI: " + url);
            }
        });
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});