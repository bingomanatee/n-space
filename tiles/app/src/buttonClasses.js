define(function(require, exports, module) {

    var _ = require('./lodash');

    module.exports = function(button, sharedClasses, onClasses, offClasses) {
        var classes = _.compact(['button'].concat(sharedClasses || []));
        var offClasses = _.compact(classes.concat(offClasses || []));
        var onClasses = _.compact(classes.concat(['selected']).concat(onClasses || []));

        button.onSurface.setClasses(onClasses);
        button.offSurface.setClasses(offClasses);
        button.offSurface.elementType = 'button';
        button.onSurface.elementType = 'button';
    };
});
