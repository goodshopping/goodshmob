import React, {Component} from 'react';
import {StyleSheet, View, Button} from 'react-native';
import  * as appActions from '../actions/app'
import {connect} from "react-redux";

class MainScreen extends Component {

    constructor(){
        super();
    }

    render() {
        return (
            <View style={styles.container}>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
    }
});

export default connect()(MainScreen);