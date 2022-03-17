exports.gradesInfo = (formObject, mandatory) => {
    fieldsMissing = [];

    for (const attribute in formObject) {
        if (attribute == 'notes') continue;
        else if(!formObject[attribute]) fieldsMissing.push(mandatory[attribute]);
    }
    
    if (fieldsMissing.length == 0) return { error: false };
    else return { error: true, msg: "Mandatory Fields (" + fieldsMissing.reduce((text, value, i, array) => text + (i < array.length - 1 ? ', ' : ' and ') + value) + ") are missing!" };
}

exports.nodePermissions = (wallet, school, isMaster) => {
    fieldsMissing = [];

    if (!wallet) fieldsMissing.push("Wallet");
    if (!school) fieldsMissing.push("School");

    if (fieldsMissing.length == 0) return { error: false };
    else return { error: true, msg: "Mandatory Fields (" + fieldsMissing.reduce((text, value, i, array) => text + (i < array.length - 1 ? ', ' : ' and ') + value) + ") are missing!" };
}