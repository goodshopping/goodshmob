// @flow
import {Component} from 'react';
import type {NavigableProps} from "../../types";
import {toUppercase} from "../../helpers/StringUtils";
import * as Nav from "../Nav";
import {sendMessage} from "../../managers/Messenger";


export type ScreenVisibility = 'unknown' | 'visible' | 'hidden';

export type ScreenState = {
    visible: boolean,
    dirty: boolean
}

export type ScreenProps = NavigableProps & {
    visible?: boolean,
    onClickClose?: () => void
}

export default class Screen<P, S> extends Component<P & ScreenProps,  ScreenState> {

    state = {visible: false, dirty: false};

    constructor(props:P) {
        super(props);
        let navigator = props.navigator;
        if (!navigator) throw "please provide navigator";
        navigator.addOnNavigatorEvent((event) => {
            //console.debug("home:onNavigatorEvent" , event);

            let id = event.id;


            if (event.type === "ScreenChangedEvent") {


                console.debug(`Screen ${this.constructor.name} visib event ${id}`);

                let visible: boolean;
                switch (id) {
                    case 'didAppear':
                        visible = true
                        break;
                    case 'didDisappear':
                        visible = false
                        break;
                    default: return
                }


                this.setState({visible}, () => {
                    let method = 'component' + toUppercase(id);
                    // $FlowFixMe
                    if (this[method]) this[method]();
                });

                if (visible && this.state.dirty) {
                    //screen dirty, re-rendering
                    superLog("screen dirty, re-rendering");
                    this.setState({dirty: false});
                }

            }

            if (event.type === 'NavBarButtonPress') { // this is the event type for button presses
                if (event.id === Nav.CLOSE_MODAL) { // this is the same id field from the static navigatorButtons definition
                    (this.props.onClickClose || navigator.dismissModal)();
                }
            }
        });
    }

    // askRenderOnVisible: boolean;

    shouldComponentUpdate(nextProps, nextState) {
        if (!__ENABLE_PERF_OPTIM__) return true;

        if (!this.getVisible(nextProps, nextState)) {
            // this.askRenderOnVisible = true;
            superLog(`[${this.constructor.name}]: shouldComponentUpdate skipped - ${JSON.stringify(this.state)}`);
            if (!this.state.dirty) {
                this.setState({dirty: true});
            }
            return false;
        }
        return true;
    }

    componentDidCatch() {
        sendMessage('rendering error', {timeout: 60000, action: {
                title: 'post forceUpdate',
                onPress: () => {
                    setTimeout(()=> this.forceUpdate(), 1000)
                },
            }
        })
    }


    isVisible() {
        return this.getVisible(this.props, this.state);
    }

    getVisible(props, state) {
        return props && props.visible || state && state.visible;
    }

    getVisibility() {
        return this.isVisible() ? 'visible' : 'hidden'
    }

//because when navigating back, a render may change the nav bar title. this is a flaw in wix nav
    setNavigatorTitle(navigator, {title, subtitle}) {
        if (this.isVisible()) {
            navigator.setTitle({title});
            navigator.setSubTitle({subtitle});
        }
    }
}
