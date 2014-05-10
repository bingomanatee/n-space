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

    function Toolbar(options, buttons) {
        View.call(this, _.defaults({}, options, Toolbar.DEFAULTS));

        this.buttons = [];
        this.back = new ContainerSurface({
            size: this.containerSize(),
            properties: {
                backgroundColor: this.options.color
            },
            classes: _.compact(['control-surface'].concat(this.options.backClasses.slice(0)))
        });

        var titleSurface = new Surface({
            content: this.options.title
        });

        titleSurface.elementType = 'h2';
        this.back.add(titleSurface);

        this.addButtons(buttons);

        this._node.add(new Modifier({origin: [0, 0]})).add(this.back);
        var gridMod = new Modifier({
            origin: [0, 0],
            size: this.containerSize(true),
            transform: Transform.translate(this.options.padding / 2, this.options.padding / 2 + this.options.headingSize, 0)
        });

        this.buttonGrid = new Grid({
            dimensions: [this.columns(), this.rows()],
            cellSize: [this.options.buttonSize, this.options.buttonSize]
        });

        this.back.add(gridMod).add(this.buttonGrid);
        this.buttonGrid.sequenceFrom(this._buttons());
        this.back.setSize(this.containerSize());
    }

    Toolbar.DEFAULTS = {
        columns: 2,
        rows: undefined,
        buttonSize: 36,
        padding: 4,
        color: 'rgb(200,220,210)',
        buttonColor: 'rgb(225,225,230)',
        backClasses: ['toolbar'],
        buttonClasses: ['button'],
        headingSize: 20
    };

    Toolbar.prototype = Object.create(View.prototype);

    _.extend(Toolbar.prototype, {
        containerSize: function (inner) {
            return [
                    this.columns() * (this.options.buttonSize + this.options.padding) + this.options.padding / 2,
                    this.rows() * (this.options.padding + this.options.buttonSize) + this.options.padding / 2
                        + (inner ? 0 : this.options.headingSize)];
        },

        columns: function () {
            if (this.options.columns) {
                return this.options.columns;
            } else {
                return Math.ceil(this.buttons.length / this.options.rows);
            }
        },

        rows: function () {
            if (this.options.rows) {
                return this.options.rows;
            } else {
                return Math.ceil(this.buttons.length / this.options.columns);
            }
        },

        addButtons: function (buttons) {
            if (!buttons) {
                return;
            }
            this.buttons = this.buttons.concat(buttons);

            this.back.setSize(this.containerSize());

        },

        buttonClick: function(button, id){
          console.log('buton clicked: ', button, id);
        },

        _buttons: function () {
            var buttons = _.map(this.buttons, function (button, i) {
                var out = new ToggleButton({
                    content: '<p>' +  button.label + '</p>',
                    size: [this.options.buttonSize, this.options.buttonSize]
                });

                out.options.inTransition = {curve: 'easeInOut', duration: 50};

                var props = {
                    padding: this.options.padding / 2,
                    backgroundColor: this.options.buttonColor
                };

                buttonClasses(out, button.classes, button.onClasses, button.offClasses);

                out.onSurface.setProperties(props);
                out.offSurface.setProperties(props);

                return out;
            }, this);

            buttonMenu(buttons, this.buttonClick.bind(this));
            return buttons;
        }
    });
    module.exports = Toolbar;

});
