import * as Api from "../utils/Api"
import * as types from './activitiesTypes';
import * as Util from "../utils/ModelUtils"
let fixtures = require("../fixtures/activities_fixtures2.json");

export function fetchActivities(callback?) {
    return async (dispatch, getState) => {

        // let call = new Api.Call()
        //     .withRoute("activities")
        //     .withQuery({include: "user,resource,target"});
        //
        //
        // submit(call, dispatch, callback);

        dispatch({
            type: types.APPEND_FETCHED_ACTIVITIES,
            activities: Util.parse(fixtures)
            });
    };
}

export function fetchMoreActivities(nextUrl:string, callback?) {
    return async (dispatch, getState) => {

        let call = new Api.Call.parse(nextUrl)
            .withQuery({include: "user,resource,target"});

        submit(call, dispatch, callback);
    };
}

let submit = function (call, dispatch, callback) {
    call.get()
        .then((response) => {

            dispatch({
                type: types.APPEND_FETCHED_ACTIVITIES,
                activities: Util.parse(response),
                links: response.links});



            callback && callback();
        });
};



