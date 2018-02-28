// @flow
import React, {Component} from 'react';
import type {Id} from "../../types";
import {CheckBox} from "react-native-elements";
import {connect} from "react-redux";
import {logged} from "../../managers/CurrentUser"

import Snackbar from "react-native-snackbar"
import ModalTextInput from "./modalTextInput";
import {patchLineup} from "../lineup/actions";

type Props = {
    lineupId: Id,
    initialLineupName: string,
    navigator: any,
    containerStyle:? any,
};

type State = {
    description: string,
    isUpdating?: boolean
};

@connect()
@logged
export default class ChangeLineupName extends Component<Props, State> {

    static navigatorStyle = {
        navBarHidden: true,
        screenBackgroundColor: 'transparent',
        modalPresentationStyle: 'overFullScreen',
        tapBackgroundToDismiss: true
    };

    constructor(props) {
        super(props);
        this.state= {description: props.initialDescription || ''};
    }


    render() {
        const {initialLineupName, navigator} = this.props;


        return <ModalTextInput
            initialText={initialLineupName}
            navigator={navigator}
            requestAction={input=>this.updateLineupName(input)}
            placeholder={i18n.t("create_list_controller.placeholder")}
            numberOfLines={1}
            maxLength={100}
            height={200}
        />
    }


    updateLineupName(name: string) {
        let editedLineup = {id: this.props.lineupId, name};

        return this.props.dispatch(patchLineup(editedLineup))
            .then(()=> {
                this.setState({changeLinupTitleId: null})
            })
            .then(()=> Snackbar.show({title: i18n.t("activity_item.buttons.modified_list")}))
            ;
    }

}
