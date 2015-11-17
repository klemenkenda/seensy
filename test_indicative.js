var Indicative = new (require("indicative"));

var rules = {
    name: 'required|alpha'
}

var data = {
    name: 'jonhy123'
}

Indicative
    .validate(rules, data)
    .catch(function (error) {
        console.log('Error');
    });