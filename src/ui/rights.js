// @flow


import type {Activity} from "../types";
import {sanitizeActivityType} from "../helpers/DataUtils";
import {currentUserId} from "../managers/CurrentUser";

export default class ActionRights {

    activity: Activity;

    constructor(activity: Activity) {
        this.activity = activity;
    }

    canBuy() {
        let resource = this.activity.resource;
        return resource && sanitizeActivityType(resource.type) === 'creativeWorks';
    }

    canLike() {

        return !this.isAsk() && !this.liked();
    }

    canSave() {
        if (!this.activity.resource) return false;
        return !this.canUnsave();
    }

    canUnsave() {
        if (!this.activity.resource) return false;
        return this.isGoodshed2() && this.byMe();
    }

    liked() {
        return this.activity.meta && this.activity.meta["liked"];
    }

    canUnlike() {
        return this.liked();
    }

    isAsk() {
        return this.activity.type === 'asks';
    }


    byMe() {
        return this.activity.user.id === currentUserId();
    }

    isGoodshed2() {
        let resource = this.activity.resource;
        let savedIn = _.get(resource, 'meta.savedIn', []);
        let target = this.activity.target;
        let goodshed;
        if (target && target.type === 'lists') {
            goodshed = _.indexOf(savedIn, target.id) > -1;
        }
        return goodshed;
    }
}