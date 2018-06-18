// @flow
import React, {type Node} from 'react'
import {
    Animated,
    Easing,
    Image,
    Linking,
    Share,
    StyleSheet,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View
} from 'react-native'
import {connect} from "react-redux"
import {logged} from "../../../managers/CurrentUser"
import type {Id, Item, ItemType} from "../../../types"
import {ACTIVITY_CELL_BACKGROUND, Colors} from "../../colors"
import {SFP_TEXT_ITALIC} from "../../fonts"
import GImage from '../../components/GImage'

import {firstName} from "../../../helpers/StringUtils"
import Carousel from 'react-native-looped-carousel'
import { createSelector } from 'reselect'
import {buildData, sanitizeActivityType} from "../../../helpers/DataUtils"
import * as Api from "../../../managers/Api"
import {FETCH_ITEM} from "../../lineup/actionTypes"
import {fetchItemCall} from "../../lineup/actions"

type Props = {
    item: Item,
    itemId: Item,
    itemType: ItemType,
    showAllImages?: boolean,
    liked?: boolean,
    bodyStyle?: *,
    rightComponent?: Node
};

type State = {
    width?: number,
};

const getItemSelector = createSelector(
    [
        (state, props) => _.get(state, `data.${sanitizeActivityType(props.item.type)}.${props.item.id}`),
        state => state.data
    ],
    (rawItem, data) => rawItem && buildData(data, rawItem.type, rawItem.id)

)

//i want to listen to "data" but only for "itemType x itemId" store update
@connect((state, props) => ({
        itemId: props.itemId || props.item.id,
        item: getItemSelector(state, props)
    })
)
@logged
export default class ItemBody extends React.Component<Props, State> {

    static defaultProps = {
        showAllImages: false
    }

    state = {}

    componentDidMount() {
        if (!this.props.item) {
            Api.safeDispatchAction.call(
                this,
                this.props.dispatch,
                fetchItemCall(this.props.itemId).createActionDispatchee(FETCH_ITEM),
                'fetchItem'
            )
        }
    }

    componentWillReceiveProps(nextProps: Props) {
        if (nextProps.liked && !this.props.liked) {
            this.showYeah();
        }
    }

    render() {

        const {item, bodyStyle} = this.props;
        if (!item) return null
        return (
            <View onLayout={this._onLayoutDidChange}>
                {/*Image And Button*/}
                {this.renderImage()}

                {(
                    <View style={[styles.body, bodyStyle]}>
                        <View style={styles.bodyInner}>
                            <View style={styles.flex1}>
                                <Text style={[styles.title]} numberOfLines={2}>{item.title}</Text>
                                <Text style={[styles.subtitle]}>{item.subtitle}</Text>
                            </View>
                            {this.props.rightComponent}
                        </View>
                    </View>
                )}
            </View>
        )
    }

    _onLayoutDidChange = e => {
        const layout = e.nativeEvent.layout;
        this.setState({  width: layout.width });
    };

    renderImage() {
        const {item} = this.props;
        let images = _.get(item, 'images', [])

        // When resource is a book, to show cover first
        if (images && item.provider === 'Amazon') {
            images.unshift(item.image)
            images = _.uniq(images)
        }

        // For when resource is a Spotify song
        if (images && images.length === 0) {
            images = [item.image]
        }
        let imageHeight = 288;

        const resize = images && (
            item.type === 'CreativeWork'
            || item.type === 'TvShow'
            || item.type === 'Movie'
        )? 'contain' : 'cover';

        const opacity = this.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        });

        return <View style={[styles.imageContainer,{height: imageHeight,}]}>

            {/*<BoxShadow setting={shadowOpt}>*/}

            {this.props.showAllImages && <Carousel
                delay={4000}
                style={styles.imageContainer}
                autoplay
                swipe={this.props.showAllImages}
                bullets={false}>
                {images.map((image, i) => {
                    return <GImage
                        source={image ? {uri: image} : require('../../../img/goodsh_placeholder.png')}
                        key={image}
                        resizeMode={resize}
                        style={[styles.image, {height: imageHeight, width: this.state.width}]}
                    />

                }) }
            </Carousel>}
            {!this.props.showAllImages &&
            <GImage
                source={item.image ? {uri: item.image} : require('../../../img/goodsh_placeholder.png')}
                resizeMode={resize}
                style={[styles.image, {height: imageHeight, width: this.state.width}]}
            />}

            {
                <Animated.View style={[styles.yheaaContainer, {opacity}]} pointerEvents={this.props.showAllImages ? 'none' : 'auto'}>
                    <Image resizeMode={'cover'} style={{}} source={require('../../../img2/yeaahAction.png')}/>
                </Animated.View>
            }
            {/*</BoxShadow>*/}
        </View>
    }

    animatedValue = new Animated.Value(0);

    showYeah() {
        this.animatedValue.setValue(1);
        Animated.timing(
            this.animatedValue,
            {
                toValue: 0,
                duration: 400,
                delay: 600,
                easing: Easing.ease
            }
        ).start(() => {
        })
    }
}


const styles = StyleSheet.create({
    body: {padding: 15, paddingBottom: 0, backgroundColor: ACTIVITY_CELL_BACKGROUND},
    bodyInner: {flexDirection: 'row'},
    flex1: {flex:1},
    title: {fontSize: 19, color: Colors.black, marginBottom: 4, marginRight: 5},
    subtitle: {fontSize: 14, color: Colors.greyish},
    description: {fontSize: 14, fontFamily: SFP_TEXT_ITALIC, color: Colors.brownishGrey},
    imageContainer: {flex:1, alignSelf: 'center', width: "100%", backgroundColor: 'transparent'},
    image: {alignSelf: 'center', backgroundColor: ACTIVITY_CELL_BACKGROUND, width: "100%"},
    yheaaContainer: {position: 'absolute', width: "100%", height: "100%",backgroundColor: 'rgba(0,0,0,0.3)',alignItems: 'center',justifyContent: 'center'},
    tag: {flexDirection:'row', alignItems: 'center'},
});