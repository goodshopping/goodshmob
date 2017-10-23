//@flow


export const NavStyles = Object.freeze({
    navBarButtonColor: 'black',
});

export const Colors = Object.freeze({
    black: '#000000',
    blue: '#408be7',
    grey1: '#767676',
    grey2: '#AAAAAA',
    green: '#1ec',
    white: '#fff'
});
export const CARD = (cardMargin) => {
    return {
        backgroundColor: "white",
        marginLeft: cardMargin,
        marginRight: cardMargin,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowOffset: {width: 2, height: 2},
        borderRadius: 4,
        shadowRadius: 2,
        elevation: 2,
        marginTop: 5,
        marginBottom: 5
    }
};
export const SIDE_MARGINS = (margin) => {
    return {
        marginLeft: margin,
        marginRight: margin,
    }
};
export const TP_MARGINS = (margin) => {
    return {
        marginTop: margin,
        marginBottom: margin,
    }
};


export const TEXT_LIST = {fontSize: 14, color: Colors.blue};
export const TEXT_NOT_IMPORTANT = {fontSize: 12, color: Colors.grey2};