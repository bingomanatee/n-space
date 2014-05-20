/* globals define */
/* globals console */

define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine = require('famous/core/Engine');
    var Modifier = require('famous/modifiers/StateModifier');
    var Transform = require('famous/core/Transform');
    var Surface = require('famous/core/Surface');
    var View = require('famous/core/View');
    var NSPACE = require('./n-space');
    var _ = require('./lodash');
    var Fools = require('./fools');

    var id = 0;

    function Grass(world, i, j, options) {

        this.world = world;
        View.call(this, _.defaults({i: i, j: j, id: ++id}, options, Grass.DEFAULTS));
        this.mod = new Modifier({
            origin: [0.5, 0],
            size: [this.options.width, this.options.height],
            transform: this._transform()
        });
        this._node.add(this.mod).add(this.surface());

        world.add(this, 'grass', {i: i, j: j});
        this.update();
    }

    Grass.DEFAULTS = {
        width: 400,
        height: 400,
        scale: 0.5,
        i: 0,
        j: 0,
        k: 0,
        GRID_SIZE: 100
    };

    Grass.prototype = Object.create(View.prototype);

    _.extend(Grass.prototype, {

        _transform: function() {
            var GRID_SIZE = this.options.GRID_SIZE;
            var pos = [
                    this.options.i * GRID_SIZE,
                    this.options.j * GRID_SIZE,
                    0
            ];

            var out = Transform.thenMove(
                Transform.rotateX(Math.PI / 2), pos);

            return Transform.multiply(out, Transform.scale(this.options.scale, this.options.scale, this.options.scale));
        },

        eat: function() {
            this.mod.halt();
            --this.options.k;
            this.update();
        },

        surface: function() {
            if (!this._surface) {
                this._surface = new Surface({
                    classes: ['grass']
                });
            }

            return this._surface;
        },
        update: function(){

            var index = Math.min(5, 1 - this.options.k);

            this.surface().setClasses(['grass', 'grass-' + index]);
        }
    });

    module.exports = Grass;

});
