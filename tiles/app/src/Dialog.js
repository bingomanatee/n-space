define(function (require, exports, module) {

    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Surface = require('famous/core/Surface');
    var ToggleButton = require('famous/widgets/ToggleButton');
    var Modifier = require('famous/modifiers/StateModifier');
    var RenderNode = require('famous/core/RenderNode');
    var View = require('famous/core/View');
    var _ = require('./lodash');

    var Transform = require('famous/core/Transform');
    var buttonClasses = require('./buttonClasses');
    var buttonMenu = require('./buttonMenu');
    var InputSurface = require('famous/surfaces/InputSurface');
    var Tile = require('./Tile');
    var Toolbar = require('./Toolbar');
    var display = require('./Display');

    // size constants
    var DIALOG_WIDTH = 400;
    var DIALOG_HEIGHT = 400;

    function Dialog(options) {
        View.call(this, _.defaults({}, options, Dialog.DEFAULTS));
        if (!this.options.width) {
            this.options.width = Math.max(DIALOG_WIDTH, window.innerWidth / 2);
        }

        if (this.options.maxWidth) {
            this.options.width = Math.min(this.options.maxWidth, this.options.width);
        }
        if (!this.options.height) {
            this.options.height = Math.max(DIALOG_HEIGHT, window.innerHeight * 0.75);
        }

        if (this.options.maxHeight) {
            this.options.height = Math.min(this.options.maxHeight, this.options.height);
        }

        this.back = new ContainerSurface({
                size: [this.options.width, this.options.height],
                properties: {
                    marginLeft: this.options.margin,
                    marginRight: this.options.margin
                },
                classes: ['control-surface', 'dialog']
            }
        );
        this._node.add(this.back);

        this._initTitle();
        this._initSaveButton();

        this.content = new Surface({
            classes: ['dialog-content'],
            size: [this.options.width - 40, this.options.height - 100]
        });

        this._node.add(new Modifier({origin: [0.5,0.5]})).add(this.content);
    }

    Dialog.DEFAULTS = {
        width: 0,
        height: 0,
        maxWidth: 600,
        maxHeight: 600,
        buttonSize: 36,
        headingSize: 15,
        padding: 4,
        margin: 10,
        title: 'Alert',
        metersPerTile: 100,
        buttonHeight: 25,
        color: 'rgb(225,225,225)',
        buttonColor: 'rgb(225,225,230)',
        backClasses: ['toolbar'],
        buttonClasses: ['button']
    };

    Dialog.prototype = Object.create(View.prototype);

    _.extend(Dialog.prototype, {

        onSave: function () {
            throw 'Must override onSave';
        },

        hide: function (mod) {
            mod.setTransform(Transform.translate(0, -1000, 200), {duration: 1200}, function () {
                RenderNode.call(dnode);
            });
            mod.setOpacity(0, {duration: 1000})
        },

        _initTitle: function () {

            var title = new Surface({
                content: this.options.title,
                size: [true, this.options.headingSize]
            });
            title.elementType = 'h2';

            this.back.add(title);
        },

        _initSaveButton: function () {
            var saveButton = new Surface({
                content: 'Done',
                classes: ['button'],
                size: [100, this.options.buttonHeight]
            });

            //  saveButton.elementType = 'button'; ??? strange fail

            saveButton.on('deploy', function () {
                saveButton._currTarget.setAttribute('type', 'button');
                saveButton.onclick = function () {
                    console.log('foo');
                }
            });

            var self = this;
            saveButton.on('click', function () {
                console.log('save dlog button clicked');
                self.onSave();
            });

            this.saveButtonNode = this.back.add(new Modifier({
                origin: [1, 1]
            }));

            this.saveButtonNode.add(saveButton);
        }
    });

    module.exports = Dialog;

})
;
