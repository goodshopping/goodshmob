// @flow

import * as Api from "../../managers/Api";
import {Call} from "../../managers/Api";
import type {Id, List} from "../../types";
import {CREATE_LINEUP, DELETE_LINEUP, EDIT_LINEUP, SAVE_ITEM} from "./actionTypes";
import type {PendingAction} from "../../helpers/ModelUtils";
import {pendingActionWrapper} from "../../helpers/ModelUtils";
import type {Visibility} from "../screens/additem";


//defining lineup creation cycle
type LINEUP_CREATION_PAYLOAD = {listName: string}
export const LINEUP_CREATION : PendingAction<LINEUP_CREATION_PAYLOAD> = pendingActionWrapper(
    CREATE_LINEUP,
    (payload: LINEUP_CREATION_PAYLOAD) => new Call()
        .withMethod('POST')
        .withRoute("lists")
        .withBody({
            "list": {
                "name": payload.listName
            }
        })
);


type LINEUP_DELETION_PAYLOAD = {lineupId: Id}

export const LINEUP_DELETION: PendingAction<LINEUP_DELETION_PAYLOAD>  = pendingActionWrapper(
    DELETE_LINEUP,
    (payload: LINEUP_DELETION_PAYLOAD) => new Call()
        .withMethod('DELETE')
        .withRoute(`lists/${payload.lineupId}`)
);

export function saveItem(itemId: Id, lineupId: Id, privacy = 0, description = '') {

    let body = {
        saving: { list_id: lineupId, privacy, description}
    };
    if (description) {
        Object.assign(body.saving, {description});
    }
    console.log("saving item, with body:");
    console.log(body);

    let call = new Api.Call()
        .withMethod('POST')
        .withRoute(`items/${itemId}/savings`)
        .withBody(body)
        .addQuery({'include': '*.*'});

    return call.disptachForAction2(SAVE_ITEM, {lineupId});
}

export function bookmarkDispatchee(payload: SAVING_CREATION_PAYLOAD) {

    return SAVING_CREATION.pending(payload, {});
}

export type SAVING_CREATION_PAYLOAD = {itemId: Id, lineupId: Id, privacy: Visibility, description: string}

export const SAVING_CREATION: PendingAction<SAVING_CREATION_PAYLOAD>  = pendingActionWrapper(
    SAVE_ITEM,
    ({itemId, lineupId, privacy, description}: SAVING_CREATION_PAYLOAD) => new Api.Call()
        .withMethod('POST')
        .withRoute(`items/${itemId}/savings`)
        .withBody({saving: { list_id: lineupId, privacy, description}})
        .addQuery({'include': '*.*'})
);


export function fetchItemCall(itemId: Id) {
    return new Api.Call()
        .withMethod('GET')
        .withRoute(`items/${itemId}`)
        .addQuery({'include': '*.*'});
}



export function patchLineup(editedLineup: List) {
    let call = new Api.Call()
        .withMethod('PATCH')
        .withRoute(`lists/${editedLineup.id}`)
        .withBody(editedLineup)
    ;
    return call.disptachForAction2(EDIT_LINEUP, {lineupId: editedLineup.id});
}





