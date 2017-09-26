// @flow

import * as Api from "../utils/Api"
import * as types from './actionTypes';
import { CALL_API } from 'redux-api-middleware'


export function loadFeed() {
    let call = new Api.Call()
        .withRoute("activities")
        .withQuery({include: "user,resource,target"});

    return Api.sendAction(types.LOAD_FEED, call);
}

export function loadMoreFeed(nextUrl:string) {
    let call = new Api.Call.parse(nextUrl)
        .withQuery({include: "user,resource,target"});

    return Api.sendAction(types.LOAD_MORE_FEED, call);
}



