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
    var InputSurface = require('famous/surfaces/InputSurface');

    // size constants
    var RANGE_SLIDER_HEIGHT = 16;
    var RANGE_SLIDER_WIDTH = 130;

    var RANGE_MIN_SIZE = 10;
    var RANGE_SLIDER_LABEL_WIDTH = 30;
    var RANGE_MAX_SIZE = 100;

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

        this._initGridButtons();
        this._initRangeSlider();
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

        _rangeTitle: function(){
            return  'Tile Size: ' + this.gridSize;
        },

        _initRangeSlider: function () {

            /* ------------ range slider ---------------- */

            this.gridSize = Math.round(( RANGE_MIN_SIZE + RANGE_MAX_SIZE) / 2);

            var rangeSlider = new InputSurface({
                'type': 'range',
                min: RANGE_MIN_SIZE,
                max: RANGE_MAX_SIZE,
                size: [RANGE_SLIDER_WIDTH, RANGE_SLIDER_HEIGHT],
                value: this.gridSize
            });

            rangeSlider.on('change', function(value){
                var n = parseInt(value.target.value);
                this.gridSize = n;
                this._eventInput.emit('grid size', n);
                console.log('range value: ', n);

                title.setContent(this._rangeTitle());
            }.bind(this));

            var sliderRo = this.back.add(new Modifier({
                size: [150, 30],
                origin: [0, 0],
                transform: Transform.translate(170, this.options.headingSize * 2)
            }));

            /* --------------- range title ------------------ */

            var title = new Surface({
                content: this._rangeTitle(),
                size: [RANGE_SLIDER_WIDTH, true]
            });

            title.elementType = 'h3';

            sliderRo.add(new Modifier({
                transform: Transform.translate(0, -RANGE_SLIDER_HEIGHT),
                origin: [0, 0]
            })).add(title);
            sliderRo.add(rangeSlider);

            /* ---------------- min label ----------------- */

            var minLabel = new Surface({
                size: [RANGE_SLIDER_LABEL_WIDTH, RANGE_SLIDER_HEIGHT],
                content: '' + RANGE_MIN_SIZE,
                properties: {
                    textAlign: 'right',
                    paddingRight: '2px'
                }
            });

            minLabel.elementType = 'label';

            sliderRo.add(new Modifier({
                transform: Transform.translate(-RANGE_SLIDER_LABEL_WIDTH, 0, 0)
            })).add(minLabel);

            /* ------------- max label ------------------- */

            var maxLabel = new Surface({
                size: [RANGE_SLIDER_LABEL_WIDTH, RANGE_SLIDER_HEIGHT],
                content: '' + RANGE_MAX_SIZE,
                properties: {
                    textAlign: 'right',
                    paddingRight: '2px'
                }
            });

            maxLabel.elementType = 'label';

            sliderRo.add(new Modifier({
                transform: Transform.translate(RANGE_SLIDER_WIDTH, 0, 0)
            })).add(maxLabel);
        },

        _initGridButtons: function () {

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

            buttonMenu([hexButton, squareButton], this.onModeButton.bind(this));
            squareButton.select();
            this.gridMode = 1;
        },

        onModeButton: function (button, mode) {
            console.log('grid mode: ', mode);
        }
    })
    ;
})
;