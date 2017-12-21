// @flow

import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {connect} from "react-redux";
import type {Id, List, NavigableProps, Saving} from "../../types";
import ItemCell from "../components/ItemCell";
import LineupCell from "../components/LineupCell";
import {AlgoliaClient, createResultFromHit, createResultFromHit2, makeAlgoliaSearch} from "../../helpers/AlgoliaUtils";
import UserConnectItem from "./userConnectItem";
import UserRowI from "../activity/components/UserRowI";
import {SearchStyles} from "../UIStyles";
import {currentUserId} from "../../managers/CurrentUser";
import Screen from "../components/Screen";
import Config from 'react-native-config'
import SearchScreen from "./search";
import {Colors} from "../colors";

type Props = NavigableProps & {
};

type State = {
    connect: {[Id]: number}
};

@connect()
export default class NetworkSearchScreen extends Screen<Props, State> {


    static navigatorStyle = SearchStyles;

    state: State = {connect: {}};

    render() {


        let renderItem = ({item})=> {

            let isLineup = item.type === 'lists';


            if (isLineup) {
                let user = item.user;


                let userXml = (
                    <View  style={{flex:1}}>
                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8}}>
                            <Text style={{fontSize: 12, color: Colors.grey1, marginLeft: 8, marginRight: 3}}>by</Text>
                            <UserRowI
                                user={item.user}
                                navigator={this.props.navigator}
                                noImage={true}
                            />
                        </View>
                    </View>
                );

                return (
                    <TouchableOpacity
                        onPress={() => this.onLineupPressed(item)}>
                        <View>
                            <LineupCell
                                lineup={item}
                                titleChildren={userXml}
                                titleChildrenBelow={true}
                            />
                        </View>
                    </TouchableOpacity>
                )
            }
            else {
                let saving = item;

                let resource = saving.resource;

                //TODO: this is hack
                if (!resource) return null;

                return (
                    <TouchableOpacity onPress={()=>this.onSavingPressed(saving)}>
                        <ItemCell item={resource}/>
                    </TouchableOpacity>
                )
            }
        };

        let renderUser = ({item}) => {
            return (
                <UserConnectItem user={item}/>
            );
        };

        let index = new Promise(resolve => {
            AlgoliaClient.createAlgoliaIndex(Config.ALGOLIA_SAVING_INDEX).then(index => {
                index.setSettings({
                        searchableAttributes: [
                            'item_title',
                            'list_name'
                        ],
                        attributeForDistinct: 'item_id',
                        distinct: true,
                        attributesForFaceting: ['user_id', 'type'],
                    }
                );
                resolve(index);
            });
        });

        let query = {
            filters: `NOT type:List AND NOT user_id:${currentUserId()}`,
        };

        let categories = [
            {
                type: "savings",
                index,
                query,
                tabName: "network_search_tabs.savings",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit,
                renderItem,
            },
            {
                type: "users",
                index: AlgoliaClient.createAlgoliaIndex('User_staging'),
                //index: client.initIndex('User_staging'),
                query: {
                    filters: `NOT objectID:${currentUserId()}`,

                },
                tabName: "network_search_tabs.users",
                placeholder: "search_bar.network_placeholder",
                parseResponse: createResultFromHit2,
                renderItem: renderUser,
            },

        ];

        let navigator = this.props.navigator;
        // return (
        //     <AlgoliaSearchScreen
        //         categories={categories}
        //         navigator={navigator}
        //     />
        // );

        let search = makeAlgoliaSearch(categories, navigator);

        return <SearchScreen
            searchEngine={{search}}
            categories={categories}
            navigator={navigator}
        />;
    }


    onSavingPressed(saving: Saving) {
        this.props.navigator.push({
            screen: 'goodsh.ActivityDetailScreen', // unique ID registered with Navigation.registerScreen
            title: "#Details", // navigation bar title of the pushed screen (optional)
            titleImage: require('../../img2/headerLogoBlack.png'), // iOS only. navigation bar title image instead of the title text of the pushed screen (optional)
            passProps: {activityId: saving.id, activityType: saving.type}, // Object that will be passed as props to the pushed screen (optional)
        });
    }

    onLineupPressed(lineup: List) {
        this.props.navigator.push({
            screen: 'goodsh.LineupScreen', // unique ID registered with Navigation.registerScreen
            passProps: {
                lineupId: lineup.id,
            },
        });
    }
}
