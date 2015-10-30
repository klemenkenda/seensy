// TODO - check: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind

function setup(app, handlers) {
    // root - http://localhost:XYZ/
    app.get('/', handlers.service.handleGetRouterPaths.bind(handlers.service));

    // http://localhost:XYZ/close-base
    app.get('/close-base', handlers.service.handleCloseBase.bind(handlers.service));    
}

exports.setup = setup;