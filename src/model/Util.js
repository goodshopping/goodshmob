import Base from "./Base";
import * as Models from "./"

export function parse(data) {

    if (data.included) {
        let byId = {};

        data.included.map((source) => {

            let obj: Base = this.createObject(source);
            if (obj) {
                byId[obj.type] = byId[obj.type] || {};
                byId[obj.type][obj.id] = obj;
            }
        });
    }


    let result = [];
    data.data.map((o) => result.push(createObject(o)));


    return result;
}

class ParseError extends Error {

}

let formatMsg = function (msg, type, source) {
    return `${msg} for type=${type}, and source=${source}`;
};
let thrown = function (msg, type, source) {
    throw new ParseError(formatMsg(msg, type, source));
};


//1. create object instance (from type)
//2. flatten attributes
function createFlatObject(source) {

    let type: string;
    //if (!source.id) throw new ParseError("expecting id");
    type = source.type;

    if (!type) {
        console.error(formatMsg("expecting type", type, source));
        return null;
    }

    console.debug(`creating object for type=${type}`);

    if (!type.endsWith("s")) thrown(`expecting plural`, type, source);

    type = type.substr(0, type.length - 1);

    let moduleId = type.substr(0, 1).toUpperCase() + type.substr(1, type.length - 1);
    let clazz = Models[moduleId];
    if (!clazz) thrown(`model not found`, type, source);

    let obj = new clazz;

    //let obj: Base = new Base();
    if (source.attributes) {
        Object.assign(obj, source.attributes);
    }
    return obj;

}

/*
    1. create flat object
    2. fill relationship
    3. flatten relationships

    if the store is provided, and contains the element for type x id,
    then this element will be used to popoulate the resulting object.
     */
export function createObject(source: Source, store: any): Base {

    let result = createFlatObject(source);

    if (source.relationships) {
        let relResult = {};
        Object.getOwnPropertyNames(source.relationships).map((relVal)=>{
            let relObj: Base = createFlatObject(relVal);

            if (relObj) {

                if (store && store[relObj.type]) {
                    let stored = store[relObj.type][relObj.id];
                    if (stored) {
                        Object.assign(relObj, stored);
                    }
                }
                relResult[relKey] = relObj;
            }
        });

        Object.assign(result, relResult);
    }



    return result;
}