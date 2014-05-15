/**
 * Created by dave on 5/15/14.
 */
define(function (require, exports, module) {

    var _ = require('lodash');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var View = require('famous/core/View');
    var Fools = require('fools');
    var Tile = require('./Tile');
    var NSPACE = require('./n-space');

    function Display(options) {
        View.call(this, _.defaults({}, options, Display.DEFAULTS));
        this.surfaceSpace = new NSPACE.World({
            i: [-this.options.i_range, this.options.i_range],
            j: [-this.options.j_range, this.options.j_range]
        });
        this.makeSurfaces();
    }

    Display.DEFAULTS = {
        pixelsPerTile: 50,
        i_range: 15,
        j_range: 10
    };

    Display.prototype = Object.create(View.prototype);

    _.extend(Display.prototype, {

        move: function (dir) {
            return function (evt) {
                this._move(evt, dir);
            }.bind(this)

        },

        _move: function (evt, dir) {

            //console.log('event: ', evt);
            var n = evt.shiftKey ? 5 : 1;
            var i_offset = 0, j_offset = 0;

            switch (dir) {
                case 'bottom':
                    Tile.Tile.center.j += n;
                    j_offset = -this.options.pixelsPerTile;
                    break;

                case 'top':
                    Tile.Tile.center.j -= n;
                    j_offset = this.options.pixelsPerTile;
                    break;

                case 'right':
                    Tile.Tile.center.i += n;
                    i_offset = -this.options.pixelsPerTile;
                    break;

                case 'left':
                    Tile.Tile.center.i -= n;
                    i_offset = this.options.pixelsPerTile;
                    break;
            }

            this.scaleMod.halt();
            this.scaleMod.setTransform(Transform.translate(
                    i_offset, j_offset, -10),
                {duration: 250}, this.redraw.bind(this));


        },

        redraw: function () {
            console.log('start redraw');
            debugger;
            _.each(this.surfaces, function (surface) {
                if (!this.redrawFromSurface(surface)) {
                    surface.setClasses(['tile', 'empty', 'unselectable']);
                }
            }.bind(this));
            debugger;
            this.scaleMod.setTransform(Transform.translate(0, 0, -10));
            debugger;
            console.log('end redraw');
        },

        redrawFromSurface: function (surface) {
            var rel_i = surface.i + Tile.Tile.center.i;
            var rel_j = surface.j + Tile.Tile.center.j;
            var coords = {i: rel_i, j: rel_j};

            var found = false;
            //   Tile.Tile.world.ifRange(coords, function(){
            var reg = Tile.Tile.world.getRegistry(coords);
            if (reg.has('tile')) {
                var tile = reg.getFirst('tile');
                surface.setClasses(['tile', tile.params.terrain, 'unselectable']);
                found = true;
            }
            // });

            return found;
        },

        redrawFromTile: function (tile) {
            var rel_i = tile.reg.loc.i + Tile.Tile.center.i;
            var rel_j = tile.reg.loc.j + Tile.Tile.center.j;
            var coords = {i: rel_i, j: rel_j};

            this.surfaceSpace.ifRange(coords, function () {
                var surface = this.surfaceSpace.getRegistry(coords).getFirst('surface');
                if (surface) {
                    surface.setClasses(['tile', tile.params.terrain, 'unselectable']);
                }
                ;
            }.bind(this), _.identity);
        },

        makeSurfaces: function () {
            this.scaleMod = new StateModifier({
            });

            this.root = this._node.add(this.scaleMod);
            this.surfaces = [];

            Fools.loop(function (iter) {

                var mod = new StateModifier({
                    transform: Transform.translate(iter.i * this.options.pixelsPerTile, iter.j * this.options.pixelsPerTile, 0)
                });

                var surface = new Surface({
                    classes: ['tile', 'empty', 'unselectable'],
                    mod: mod,
                    size: [this.options.pixelsPerTile, this.options.pixelsPerTile]
                });
                _.extend(surface, iter);

                surface.on('mousedown', function (evt) {
                    Tile.Tile.mouseDown(evt, surface)
                }.bind(this));

                this.root.add(mod).add(surface);
                this.surfaces.push(surface);
                this.surfaceSpace.add(surface, 'surface', iter);

            }.bind(this))
                .dim('i', -this.options.i_range, this.options.i_range)
                .dim('j', -this.options.j_range, this.options.j_range)();
        }

    });

    module.exports = new Display();

});