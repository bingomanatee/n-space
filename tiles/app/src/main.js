/* globals define */
/* globals NSPACE */
define(function (require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');

    var Toolbar = require('./Toolbar');
    var Settings = require('./Settings');

    // sizing constants
    var TOOL_MARGIN = 15;
    var TOOLBAR_BUTTON_SIZE = 60;
    var TOOLBAR_BUTTON_PADDING = 6;
    var SETTINGS_HEIGHT = (2 * TOOLBAR_BUTTON_SIZE) + (2.5 * TOOLBAR_BUTTON_PADDING);
    var CONTROL_BACK_COLOR = 'rgba(56, 100, 100, 0.125)';

    // create the main context
    var mainContext = Engine.createContext();

    // your app here
    var toolbarMod = new Modifier({
        origin: [0, 0],
        transform: Transform.translate(TOOL_MARGIN, TOOL_MARGIN
        )});

    var toolbar = new Toolbar({
        buttonSize: TOOLBAR_BUTTON_SIZE,
        color: CONTROL_BACK_COLOR,
        padding: TOOLBAR_BUTTON_PADDING,
        title: 'Terrain Type'
    }, [
        {
            label: 'Forest',
            classes: ['forest']
        },
        {
            label: 'Road',
            classes: ['road']
        },
        {
            label: 'Grass',
            classes: ['grass']
        },
        {
            label: 'Mtn',
            classes: ['mtn']
        }

    ]);
    mainContext.add(toolbarMod).add(toolbar);

    var settingsXoffset = (2 * TOOL_MARGIN) + (2 * TOOLBAR_BUTTON_SIZE) + (2 * TOOLBAR_BUTTON_PADDING);

    var settingsMod = new Modifier({origin: [0, 0],
        transform: Transform.translate(
            settingsXoffset, TOOL_MARGIN, 0)
    });

    var settings = new Settings({
        color: CONTROL_BACK_COLOR,
        height: SETTINGS_HEIGHT
    });

    mainContext.add(settingsMod).add(settings);

    window.$TILES = new NSPACE.World().dim('i', -100, 100).dim('j', -100, 100);
});