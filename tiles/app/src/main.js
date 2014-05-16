/* globals define */
/* globals NSPACE */
define(function (require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Tile = require('./Tile');
    var Toolbar = require('./Toolbar');
    var settings = require('./Settings');
    var display = require('./Display');

    var cursorButton = require('./cursorButton');

    // sizing constants
    var TOOL_MARGIN = 15;
    var TOOLBAR_BUTTON_SIZE = 60;
    var TOOLBAR_BUTTON_PADDING = 6;
    var CONTROL_BACK_COLOR = 'rgba(56, 100, 100, 0.125)';

    // create the main context
    var mainContext = Engine.createContext();
    mainContext.setPerspective(1000);

    /* ================= main ================== */

    var settingsXoffset = (2 * TOOL_MARGIN) + (2 * TOOLBAR_BUTTON_SIZE) + (2 * TOOLBAR_BUTTON_PADDING);

    var settingsMod = new Modifier({origin: [0, 0],
        transform: Transform.translate(settingsXoffset, TOOL_MARGIN, 0)
    });

    mainContext.add(settingsMod).add(settings);

    var terrainToolbar = (function initToolbar() {

        var terrainToolbar = new Toolbar({
            buttonSize: TOOLBAR_BUTTON_SIZE,
            color: CONTROL_BACK_COLOR,
            padding: TOOLBAR_BUTTON_PADDING,
            title: 'Terrain Type'
        }, [
            {
                label: 'Forest',
                classes: ['forest'],
                click: function () {
                    settings.options.terrain = terrainToolbar.terrain = 'forest'

                }
            },
            {
                label: 'Desert',
                classes: ['desert'],
                click: function () {
                    settings.options.terrain = terrainToolbar.terrain = 'desert'
                }
            },
            {
                label: 'Grass',
                classes: ['grass'],
                click: function () {
                    settings.options.terrain = terrainToolbar.terrain = 'grass'
                }
            },
            {
                label: 'Mtn',
                classes: ['mtn'],
                click: function () {
                    settings.options.terrain = terrainToolbar.terrain = 'mtn'
                }
            }

        ]);

        return terrainToolbar;
    })();

    var toolbarMod = new Modifier({
        origin: [0, 0],
        transform: Transform.translate(TOOL_MARGIN, TOOL_MARGIN
        )});

    mainContext.add(toolbarMod).add(terrainToolbar);

    /* ------------- cursor buttons ----------------- */


    var leftButton = cursorButton('left');
    leftButton.on('mousedown', display.move('left'));
    mainContext.add(new Modifier({origin: [0, 0.5]})).add(leftButton);

    var rightButton = cursorButton('right');
    rightButton.on('mousedown', display.move('right'));
    mainContext.add(new Modifier({origin: [1, 0.5]})).add(rightButton);

    var topButton = cursorButton('top');
    topButton.on('mousedown', display.move('top'));
    mainContext.add(new Modifier({origin: [0.5, 0]})).add(topButton);

    var bottomButton = cursorButton('bottom');
    bottomButton.on('mousedown', display.move('bottom'));
    mainContext.add(new Modifier({origin: [0.5, 1]})).add(bottomButton);

    /* ------------------ tile display --------------------- */

    mainContext.add(new Modifier({
        origin: [0.5, 0.5],
        transform: Transform.translate(0, 0, -10)
    })).add(display);


});
