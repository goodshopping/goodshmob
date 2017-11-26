//@flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {View, ActivityIndicator, FlatList, RefreshControl, Text} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../utils/DataUtils";
import ApiAction from "../../utils/ApiAction";
import * as Api from "../../utils/Api";
import {isEmpty} from "lodash";
import type {Id, RequestState, Url} from "../../types";
import {renderSimpleButton} from "../UIStyles";

export type FeedSource = {
    callFactory: ()=>Api.Call,
    useLinks:? boolean,
    action: ApiAction,
    options?: any
}


type Props<T> = {
    data: Array<T>,
    renderItem: Function,
    fetchSrc: FeedSource,
    hasMore: boolean,
    ListHeaderComponent?: Node,
    ListFooterComponent?: Node,
    empty: string,
    style: any
};

type State = {
    isFetchingFirst?: RequestState,
    isFetchingMore?: RequestState,
    firstLoad?: number,
    isPulling?: boolean,
    lastEmptyResultMs?: number,
    moreLink?: Url
};

@connect()
export default class Feed<T> extends Component<Props<T>, State>  {

    keyExtractor = (item, index) => item.id;

    state = {};

    render() {
        assertUnique(this.props.data);

        const {
            data,
            renderItem,
            fetchSrc,
            hasMore,
            empty,
            ListHeaderComponent,
            ...attributes
        } = this.props;

        let empt = isEmpty(data);
        let nothingInterestingToDisplay = empt && !this.isFetchingFirst();

        let firstEmptyLoader = this.state.firstLoad && empt;

        if (nothingInterestingToDisplay) {
            if (this.state.isFetchingFirst === 'ko') {
                return this.renderFail(()=>this.fetchIt());
            }
            if (empty) return <Text>{empty}</Text>;
        }
        return (
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={this.keyExtractor}
                refreshControl={this.renderRefreshControl()}
                onEndReached={ this.onEndReached.bind(this) }
                onEndReachedThreshold={0.1}
                ListFooterComponent={!firstEmptyLoader && this.renderFetchMoreLoader()}
                style={{...this.props.style,  minHeight: 50}}
                ListHeaderComponent={!firstEmptyLoader && ListHeaderComponent}
                {...attributes}
            />
        );
    }

    isFetchingFirst() {
        return this.state.isFetchingFirst === 'sending';
    }

    isFetchingMore() {
        return this.state.isFetchingMore === 'sending';
    }

    componentDidMount() {
        console.debug("componentDidMount " + JSON.stringify(this.props.fetchSrc.action));
        if (this.state.firstLoad) return;
        this.setState({firstLoad: 1});
        this.fetchIt()
            .catch(err=>{console.warn("error while firstLoad:" + err)})
            .then(()=>this.setState({firstLoad: 2}));

    }

    fetchIt(afterId?: Id) {

        return new Promise((resolve, reject) => {

            let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';

            if (this.state[requestName] === 'sending') {
                reject(requestName + " is already running. state="+JSON.stringify(this.state));
            }
            else {
                let {fetchSrc}= this.props;

                if (!fetchSrc) return;

                this.setState({[requestName]: 'sending'});

                const {callFactory, useLinks} = fetchSrc;
                let call;
                //backend api is not unified yet
                if (this.state.moreLink) {
                    call = Api.Call.parse(this.state.moreLink);
                }
                else {
                    call = callFactory();
                    if (afterId && !useLinks) {
                        call.addQuery({id_after: afterId});
                    }
                }

                this.props
                    .dispatch(call.disptachForAction2(fetchSrc.action, fetchSrc.options))
                    .then(({data, links})=> {
                        console.debug("disptachForAction3 " + JSON.stringify(this.props.fetchSrc.action));
                        if (!data) {
                            this.setState({[requestName]: 'ko'});
                            return reject(`no data provided for ${fetchSrc.action}`);
                        }
                        this.setState({[requestName]: 'ok'});

                        let hasNoMore = data.length === 0;
                        if (hasNoMore) {
                            this.setState({lastEmptyResultMs: Date.now()});
                        }

                        //handle links
                        if (
                            useLinks
                            && links && links.next
                            && (afterId || !this.state.moreLink)
                        ) {

                            this.setState({moreLink: links.next});
                        }
                        resolve(data);
                    }, err => {
                        console.warn("feed error:" + err);
                        this.setState({[requestName]: 'ko'});
                    })
            }
        });
    }

    fetchMore() {
        let c = this.props.data;
        if (!c) return;
        let last = c[c.length-1];
        if (!last) return;
        this.fetchIt(last.id);
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});
        this.fetchIt()
            .catch(err=>{console.warn("error while fetching:" + err)})
            .then(()=>this.setState({isPulling: false}));
    }

    renderRefreshControl() {
        let displayLoader = (this.isFetchingFirst() && isEmpty(this.props.data)) || this.state.isPulling;
        return (<RefreshControl
            refreshing={!!displayLoader}
            onRefresh={this.onRefresh.bind(this)}
        />);
    }

    renderFetchMoreLoader() {
        return (<View>
                {this.props.ListFooterComponent}
                {
                    this.state.isFetchingMore === 'sending' &&
                    <ActivityIndicator
                        animating={this.isFetchingMore()}
                        size="small"
                        style={{margin: 12}}
                    />
                }
                {
                    this.state.isFetchingMore === 'ko' && this.renderFail(() => this.fetchMore())
                }
            </View>
        )
    }


    renderFail(fetch) {
        return (
            <View style={{padding: 12}}>
                <Text style={{alignSelf: "center"}}>Le chargement a échoué...</Text>
                {renderSimpleButton("Réessayer", fetch)}
            </View>
        );
    }

    hasMore() {
        let last = this.state.lastEmptyResultMs;
        if (last && Date.now() - last < 1000 * 10) {
            console.log("throttled -> hasMore=false");
            return false;
        }
        if (typeof this.props.hasMore !== 'undefined') return this.props.hasMore;
        return true;
    }

    onEndReached() {
        console.debug("onEndReached");
        if (this.hasMore()) {
            this.fetchMore();
        }
        else {
            console.info("== end of feed ==")
        }
    }
}


