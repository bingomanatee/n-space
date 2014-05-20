/* globals define */
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/core/Modifier');
    var Transform = require('famous/core/Transform');
    var ImageSurface = require('famous/surfaces/ImageSurface');
    var NSPACE = require('./n-space');
    var Goat = require('./goat');
    var Grass = require('./grass')

    // create the main context
    var mainContext = Engine.createContext();
    mainContext.setPerspective(1000);

    // your app here
    var world = new NSPACE.World({i: [-8, 8], j: [-5, 20]});

    var center =  mainContext.add(new Modifier({
        origin: [0.5, 0.5],
        transform: Transform.multiply(Transform.moveThen([0, 400, 1000], Transform.rotateX(-Math.PI / 2)), Transform.identity)
    }));
    var goats = _.map(_.range(0, 40), function(i) {

        var goat = new Goat(world, i % 5, Math.floor(i / 5), {GRID_SIZE: 80});
       center.add(goat);
        return goat;
    });

    _.each(world.registries(), function(reg){
        center.add(new Grass(world, reg.loc.i, reg.loc.j));
    });

    var delay = 500;

    function update() {
        _.each(goats, function(goat) {
            goat.update();
        });

        setTimeout(function() {
            requestAnimationFrame(update);
        }, delay);
    }

    update();

});
