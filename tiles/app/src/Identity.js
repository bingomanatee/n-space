define(function (require, exports, module) {

    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Surface = require('famous/core/Surface');
    var ToggleButton = require('famous/widgets/ToggleButton');
    var Modifier = require('famous/modifiers/StateModifier');
    var View = require('famous/core/View');
    var _ = require('./lodash');

    var Transform = require('famous/core/Transform');
    var buttonClasses = require('./buttonClasses');
    var buttonMenu = require('./buttonMenu');
    var InputSurface = require('famous/surfaces/InputSurface');
    var Tile = require('./Tile');
    var Toolbar = require('./Toolbar');
    var display = require('./Display');
    var RenderNode = require('famous/core/RenderNode');

    // size constants
    var RANGE_SLIDER_HEIGHT = 16;
    var RANGE_SLIDER_WIDTH = 130;

    var RANGE_MIN_SIZE = 20;
    var RANGE_SLIDER_LABEL_WIDTH = 30;
    var RANGE_MAX_SIZE = 200;
    var IDENTITY_WIDTH = 400;
    var CONTROL_BACK_COLOR = 'rgb(240,255,240)';
    var IDENTITY_HEIGHT = 120;

    var ZOOM_BUTTON_WIDTH = 100;
    var TS_TITLE_WIDTH = 250;

    function Identity(options) {
        View.call(this, _.defaults({}, options, Identity.DEFAULTS));

        this.options.metersPerTile = this.options.metersPerTile || 100;

        this.back = new ContainerSurface({
            size: [this.options.width, this.options.height],
            properties: {
                marginLeft: this.options.margin,
                marginRight: this.options.margin
            },
            classes: ['control-surface', 'identity']
        });

        this._initTitle();
        this._initSaveButton();
        this._node.add(this.back);
        //   this._updateTileScaleTitle();
    }

    Identity.DEFAULTS = {
        width: IDENTITY_WIDTH,
        height: 150,
        buttonSize: 36,
        headingSize: 15,
        padding: 4,
        margin: 10,
        metersPerTile: 100,
        buttonHeight: 25,
        color: 'rgb(225,225,225)',
        buttonColor: 'rgb(225,225,230)',
        backClasses: ['toolbar'],
        buttonClasses: ['button']
    };

    Identity.prototype = Object.create(View.prototype);

    _.extend(Identity.prototype, {

        onSave: function(){
            var Dialog = require('./Dialog');

            var d = new Dialog();
            var mod = new Modifier({origin: [0.5, 0.5]});

            var dnode = require('./main').add(mod).add(d);

            d.onSave = function(){
                console.log('closing dlog');
                d.hide(mod);
            };

            d.content.setContent(Tile.Tile.terrain().join("*\n"));
            d.content.setProperties({
                fontFamily: 'Courier',
                fontSize: '8pt',
                whiteSpace: 'pre'
            })

        },

        _initTitle: function () {

            var title = new Surface({
                content: 'Identity',
                size: [true, this.options.headingSize]
            });
            title.elementType = 'h2';

            this.back.add(title);
        },

        _rangeTitle: function () {
            return 'Zoom: ' + this.gridSize;
        },

        _initSaveButton: function () {
            var saveButton = new Surface({
                content: 'Save',
                classes: ['button'],
                size: [100, this.options.buttonHeight]
            });

            saveButton.elementType = 'button';

            saveButton.on('click', this.onSave.bind(this));

            this.saveButtonNode = this.back.add(new Modifier({
                origin: [1, 1]
            }));

            this.saveButtonNode.add(saveButton);
        },

        _initCenterButton: function () {
            var saveButton = new Surface({
                content: 'Center',
                classes: ['button'],
                size: [100, this.options.buttonHeight]
            });

            saveButton.elementType = 'button';

            saveButton.on('click', function () {
                Tile.Tile.recenter();
                display.center();
                display.redraw();
            });

            this.centerButtonNode = this.back.add(new Modifier({
                origin: [1, 1],
                transform: Transform.translate(0, -this.options.buttonHeight - 5)
            }));

            this.centerButtonNode.add(saveButton);
        },

        _initRangeSlider: function () {

            /* ------------ range slider ---------------- */

            this.gridSize = 100;

            var rangeSlider = new InputSurface({
                'type': 'range',
                min: RANGE_MIN_SIZE,
                max: RANGE_MAX_SIZE,
                size: [RANGE_SLIDER_WIDTH, RANGE_SLIDER_HEIGHT],
                value: this.gridSize
            });

            function _setMin(value) {
                console.log('range slider ', value);
                rangeSlider._currTarget.setAttribute('min', RANGE_MIN_SIZE);
                rangeSlider._currTarget.setAttribute('max', RANGE_MAX_SIZE);
                rangeSlider.removeListener('deploy', _setMin);
            }

            rangeSlider.on('deploy', _setMin);

            rangeSlider.on('change', function (value) {
                var n = parseInt(value.target.value);
                this.gridSize = n;
                this._eventInput.emit('grid size', n);
                display.setScale(n / 100);
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
                transform: Transform.translate(0, -RANGE_SLIDER_HEIGHT - 4),
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
                columns: 1,
                size: [true, this.options.buttonHeight]
            });
            hexButton.deselect();

            buttonClasses(hexButton, ['mode-button']);

            this.modeChoiceRenderNode = this.back.add(new Modifier({
                transform: Transform.translate(
                    this.options.margin,
                    this.options.headingSize, 0)
            }));
            this.modeChoiceRenderNode.add(hexButton);

            var squareButton = new ToggleButton({
                content: 'Squares',
                classes: ['button'],
                size: [true, this.options.buttonHeight]
            });

            buttonClasses(squareButton, ['mode-button']);

            this.modeChoiceRenderNode.add(new Modifier({
                transform: Transform.translate(0, this.options.buttonHeight * 1.5, 0)
            })).add(squareButton);

            buttonMenu([hexButton, squareButton], this.onModeButton.bind(this));
            squareButton.select();
            this.gridMode = 1;
        },

        _initZoomButton: function () {

            this.zoomInButton = new ToggleButton({
                size: [ZOOM_BUTTON_WIDTH, this.options.buttonHeight],
                content: 'Tile Unit'
            });

            this.zoomInButton.on('click', this.onZoomIn.bind(this));
            buttonClasses(this.zoomInButton);

            this.back.add(new Modifier({origin: [0, 1]})).add(this.zoomInButton);

        },

        _initTileScaleTitle: function () {

            var surface = new Surface({
                content: 'meters per hex: ' + this.options.metersPerTile
            });

            surface.elementType = 'h3';
            this.tileScaleTitle = surface;
            this.back.add(new Modifier({
                transform: Transform.translate(ZOOM_BUTTON_WIDTH + 10, 0),
                size: [TS_TITLE_WIDTH, this.options.buttonHeight],
                origin: [0, 1]
            })).add(surface);
        },

        _updateTilescaleLabel: function (size) {
            if (size) {
                this.options.metersPerTile = size;
            }

            this.tileScaleTitle.setContent('meters per hex: ' + this.options.metersPerTile);
        },

        onZoomIn: function () {

            var self = this;
            var sizeChoices = [
                {
                    m: 2,
                    label: '2m/tile - house/room',
                    classes: ['tilescale', 'tilescale-2m'],
                    click: function () {
                        _changeSize(2);
                    }
                },
                {
                    m: 10,
                    label: '10m/tile - block',
                    classes: ['tilescale', 'tilescale-10m'],
                    click: function () {
                        _changeSize(10);
                    }
                },
                {
                    m: 100,
                    label: '100m/tile - town',
                    classes: ['tilescale', 'tilescale-100m'],
                    click: function () {
                        _changeSize(100);
                    }
                },
                {
                    m: 1000,
                    label: '1km/tile - city',
                    classes: ['tilescale', 'tilescale-1km'],
                    click: function () {
                        _changeSize(1000);
                    }
                },
                {
                    m: 10000,
                    label: '10km/tile - state',
                    classes: ['tilescale', 'tilescale-10km'],
                    click: function () {
                        _changeSize(10000);
                    }
                },
                {
                    m: 100000,
                    label: '100km/tile - country',
                    classes: ['tilescale', 'tilescale-100km'],
                    click: function () {
                        _changeSize(100000);
                    }
                }
            ];

            function _changeSize(size) {
                console.log('rn: ', renderNode, size);
                renderNode._child = null; // and click your heels.
                self._updateTilescaleLabel(size);
                self.meters = size;
                self.zoomInButton.deselect();
            }

            var dialog = new Toolbar({
                buttonSize: 240,
                buttonHeight: 40,
                columns: 1,
                padding: 4,
                title: 'meters per tile'
            }, sizeChoices);

            var renderNode = this.back.add(new Modifier({
                origin: [0, 0],
                transform: Transform.translate(0, this.back.getSize()[1])
            }));

            renderNode.add(dialog);

        },

        onModeButton: function (button, mode) {
            console.log('grid mode: ', mode);
            this.gridMode = mode;

            this.updateTiles();
        }
    });

    module.exports = new Identity({
        color: CONTROL_BACK_COLOR,
        height: IDENTITY_HEIGHT
    });

});
