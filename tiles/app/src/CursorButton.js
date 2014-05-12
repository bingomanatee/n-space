/*jslint unparam: false*/
define(function(require, exports, module) {
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Surface = require('famous/core/Surface');
    var ToggleButton = require('famous/widgets/ToggleButton');
    var Modifier = require('famous/modifiers/StateModifier');
    var View = require('famous/core/View');
    var _ = require('./lodash');
    var Grid = require('famous/views/GridLayout');
    var Transform = require('famous/core/Transform');
    var buttonClasses = require('./buttonClasses');
    var buttonMenu = require('./buttonMenu');
    var InputSurface = require('famous/surfaces/InputSurface');

    /**
     * note - cursorbutton is a Function -- not a class.
     */

    module.exports = function(dir) {
        var button = new ToggleButton({
            size: [40, 40],
            content: '<img src="content/images/cursor_button_' + dir + '.png" />'
        });

        return button;
    };

});
