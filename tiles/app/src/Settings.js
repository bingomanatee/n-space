define(function (require, exports, module) {

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

    function Settings(options, buttons) {
        View.call(this, _.defaults({}, options, Settings.DEFAULTS));

        this.back = new ContainerSurface({
            size: [this.options.width, this.options.height],
            content: '<h2>Settings</h2>',
            properties: {
                backgroundColor: this.options.color,
                marginLeft: this.options.margin,
                marginRight: this.options.margin
            },
            classes: ['control-surface', 'settings']
        });

        var title = new Surface({
            content: 'Settings',
            size: [true, this.options.headingSize]
        });
        title.elementType = 'h2';

        this.back.add(title);

        this._node.add(this.back);

        var hexButton = new ToggleButton({
            content: 'Hexagons',
            classes: ['button'],
            size: [true, this.options.buttonHeight]
        });
        hexButton.deselect();

        buttonClasses(hexButton, ['mode-button']);

        var squareButton = new ToggleButton({
            content: 'Squares',
            classes: ['button'],
            size: [true, this.options.buttonHeight]
        });
        squareButton.select();

        buttonClasses(squareButton, ['mode-button']);

        this.modeChoiceRenderNode = this.back.add(new Modifier({
            transform: Transform.translate(
                this.options.margin,
                this.options.headingSize, 0)
        }));
        this.modeChoiceRenderNode.add(hexButton);

        this.modeChoiceRenderNode.add(new Modifier({
            transform: Transform.translate(0, this.options.buttonHeight * 1.5, 0)
        })).add(squareButton);

        buttonMenu([squareButton, hexButton])

    }

    module.exports = Settings;

    Settings.DEFAULTS = {
        width: 400,
        height: 150,
        buttonSize: 36,
        headingSize: 15,
        padding: 4,
        margin: 10,
        buttonHeight: 25,
        color: 'rgb(225,225,225)',
        buttonColor: 'rgb(225,225,230)',
        backClasses: ['toolbar'],
        buttonClasses: ['button']
    };

    Settings.prototype = Object.create(View.prototype);

    _.extend(Settings.prototype, {

    });
});