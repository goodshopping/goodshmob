//TODO: add flow

import type {Node} from 'react';
import React, {Component} from 'react';
import {ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import {connect} from "react-redux";
import {assertUnique} from "../../utils/DataUtils";
import ApiAction from "../../utils/ApiAction";
import * as Api from "../../utils/Api";
import {isEmpty} from "lodash";
import type {Id} from "../../types";

export type FeedSource = {
    callFactory: ()=>Api.Call,
    action: ApiAction,
    options?: any
}


type Props<T> = {
    data: Array<T>,
    renderItem: Function,
    fetchSrc: FeedSource,
    hasMore: boolean,
    ListHeaderComponent?: Node,
    style: any
};

type State = {
    isFetchingFirst: boolean,
    isFetchingMore: boolean,
    isPulling: boolean,
    lastEmptyResultMs: number
};

@connect()
export default class Feed<T> extends Component<Props<T>, State>  {

    keyExtractor = (item, index) => item.id;

    constructor(){
        super();
        this.state =  {isFetchingFirst: false, isFetchingMore: false, isPulling: false};
    }

    render() {
        assertUnique(this.props.data);

        const {
            data,
            renderItem,
            fetchSrc,
            hasMore,
            ...attributes
        } = this.props;

        return (
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={this.keyExtractor}
                refreshControl={this.renderRefreshControl()}
                onEndReached={ this.onEndReached.bind(this) }
                onEndReachedThreshold={0}
                ListFooterComponent={this.renderFetchMoreLoader()}
                style={{...this.props.style,  minHeight: 50}}
                {...attributes}
            />
        );
    }

    componentDidMount() {
        this.fetchIt();
    }

    fetchIt(afterId?: Id) {
        return new Promise((resolve, reject) => {

            let requestName = afterId ? 'isFetchingMore' : 'isFetchingFirst';

            if (this.state[requestName]) {
                reject();
            }
            else {
                let {fetchSrc}= this.props;

                if (!fetchSrc) return;

                this.setState({[requestName]: true});

                let call = fetchSrc.callFactory();

                if (afterId) call.addQuery({id_after: afterId});

                this.props
                    .dispatch(call.disptachForAction2(fetchSrc.action, fetchSrc.options))
                    .then((data)=> {
                        let hasNoMore = data.length === 0;
                        this.setState({[requestName]: false});
                        if (hasNoMore) {
                            this.setState({lastEmptyResultMs: Date.now()});
                        }
                        resolve();
                    })
            }
        });
    }

    fetchMore() {
        let c = this.props.data;
        c && this.fetchIt(c[c.length-1].id);
    }

    onRefresh() {
        if (this.state.isPulling) return;
        this.setState({isPulling: true});
        this.fetchIt().then(()=>this.setState({isPulling: false}));
    }

    renderRefreshControl() {
        let displayLoader = (this.state.isFetchingFirst && isEmpty(this.props.data)) || this.state.isPulling;
        return (<RefreshControl
            refreshing={displayLoader}
            onRefresh={this.onRefresh.bind(this)}
        />);
    }

    renderFetchMoreLoader() {
        return (this.state.isFetchingMore ?
            <ActivityIndicator
                animating={this.state.isFetchingMore}
                size = "small"
            />:null)
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
        if (this.hasMore()) {
            this.fetchMore();
        }
        else {
            console.info("== end of feed ==")
        }
    }
}


