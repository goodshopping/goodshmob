// @flow

import type {Node} from 'react'
import React, {Component} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {connect} from "react-redux"
import type {Color, Lineup} from "../../types"
import {ViewStyle} from "../../types"
import {logged} from "../../managers/CurrentUser"
import {Navigation} from 'react-native-navigation'
import {Colors} from "../colors"
import Icon from 'react-native-vector-icons/FontAwesome'
import {STYLES} from "../UIStyles"
import {GoodshContext} from "../UIComponents"
import {GLineupAction, L_FOLLOW, LineupRights} from "../lineupRights"
import {followLineupPending} from "../lineup/actions"
import {SFP_TEXT_BOLD} from "../fonts"
import PersonRowI from "../activity/components/PeopleRow"
import {createStructuredSelector} from "reselect"
import {
    LINEUP_ACTIONS_SELECTOR, LINEUP_AUTHOR, LINEUP_FOLLOWED_SELECTOR,
    LINEUP_FOLLOWS_COUNT_SELECTOR,
    LINEUP_SAVING_COUNT_SELECTOR,
    LINEUP_SELECTOR
} from "../../helpers/Selectors"

export type State = {

}
export type Props = {
    lineup: Lineup,
    style?: ViewStyle,
    children?: Node,

    savingsCount?: number,
    followersCount?: number,
    actions?: GLineupAction[],
}

@connect(() => createStructuredSelector(
    {
        lineup: LINEUP_SELECTOR(),
        savingsCount: LINEUP_SAVING_COUNT_SELECTOR(),
        followersCount: LINEUP_FOLLOWS_COUNT_SELECTOR(),
        followed: LINEUP_FOLLOWED_SELECTOR(),
        actions: LINEUP_ACTIONS_SELECTOR(),
        author: LINEUP_AUTHOR(),
    }
))
@logged
export default class LineupTitle extends Component<Props, State> {

    render() {
        return <LineupTitlePure {...this.props} />
    }
}

@connect()
export class LineupTitlePure extends Component<Props, State> {

    render() {

        let {lineup, style, children, author} = this.props

        if (!lineup) return null

        return (
            <GoodshContext.Consumer>
                { ({userOwnResources}) => (
                    <View style={[style, {
                        flex:1,
                        paddingBottom: 5,
                    }]}>
                        <View style={{
                            // flex: 1,
                            flexDirection: 'row',

                            // backgroundColor: 'purple'
                        }}>

                            <View style={{
                                flex:1,
                                flexDirection: 'row',
                            }}>
                                <Text style={STYLES.SECTION_TITLE}>
                                    {lineup.name}
                                    {' '}

                                    {
                                        this.getMedals(lineup)
                                    }

                                </Text>
                            </View>

                            {
                                children
                            }

                        </View>
                        {
                            (!userOwnResources )&& author && author.firstName && (
                                <View style={{
                                    flex: 0,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                }}>
                                    <Text style={styles.smallText}>{i18n.t('search.by')}</Text>
                                    <PersonRowI
                                        person={author}
                                        noImage={true}
                                        style={{flex: 0, marginLeft: 4}} //TODO: rm when removed in UserRowI
                                        textStyle={{color: Colors.greyish}}
                                    />
                                </View>)
                        }
                    </View>
                )}

            </GoodshContext.Consumer>

        );
    }

    getMedals(lineup: Lineup) {
        const it = (function* () {
            yield true
            yield false
        })();

        let canFollow = this.props.actions.indexOf(L_FOLLOW) >= 0
        return [
            this.renderMedal(_.get(this.props, 'savingsCount.total', -1), "th-large", it),
            this.renderMedal(_.get(this.props, 'followersCount.total', -1), "user", it, this.props.followed ? Colors.brownishGrey : undefined),
            (canFollow &&
                <Text
                    key={"follow"}
                    onPress={()=>{
                        followLineupPending(this.props.dispatch, lineup)
                    }}
                    style={{
                        color: Colors.black,
                        fontSize: 14,
                        fontFamily: SFP_TEXT_BOLD
                    }}> • {i18n.t('actions.follow').toLowerCase()}</Text>
            )
        ];
    }

    renderMedal(count: number, icon: string, displayDot: () => boolean, color: Color = Colors.greyish) {
        const iconSize = 15;

        // fixme : this is bad
        if (__IS_ANDROID__) {
            return count > 0 && <Text style={[styles.medalsContainer, {paddingLeft: 10, marginLeft: 10}]} key={icon}>
                {icon === 'th-large' && <Text style={[styles.smallText, {marginLeft: 4, color,
                    alignSelf: 'flex-end',
                    // backgroundColor: 'red',
                }]}>({count})</Text>}
                {icon === 'star' && <Text style={[styles.smallText, {color, marginHorizontal: 6}]}>★</Text>}
                {icon === 'star' && <Text style={[styles.smallText, {marginLeft: 4, color,
                    alignSelf: 'flex-end',
                    // backgroundColor: 'red',
                }]}>{count}</Text>}
            </Text>;
        }

        return count > 0 && <Text key={icon}>
            {displayDot.next().value && this.renderMedalDot()}
            <Icon name={icon} size={iconSize} color={color}/>
            <Text style={[styles.smallText, {marginLeft: 4, color,
                alignSelf: 'flex-end',
                // backgroundColor: 'red',
            }]}>{' '}{count}{' '}</Text>
        </Text>;
    }

    renderMedalDot() {
        return <Text style={[styles.smallText, {color: Colors.greyish, marginHorizontal: 6}]}>  </Text>
    }
}


const styles = StyleSheet.create({
    smallText: {
        fontSize: 14,
        color: Colors.greyish
    },
    medalsContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },

})
