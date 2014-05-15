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
            i: [-this.options.range, this.options.range],
            j: [-this.options.range, this.options.range]
        });
        this.makeSurfaces();
    }

    Display.DEFAULTS = {
        pixelsPerTile: 50,
        range: 25
    };

    Display.prototype = Object.create(View.prototype);

    _.extend(Display.prototype, {

        redrawFromTile: function(tile){
            var rel_i = tile.reg.loc.i + Tile.Tile.center.i;
            var rel_j = tile.reg.loc.j + Tile.Tile.center.j;
            var coords = {i: rel_i, j: rel_j};

            this.surfaceSpace.ifRange(coords, function(){
               var surface = this.surfaceSpace.getRegistry(coords).getFirst('surface');
                if (surface){
                    surface.setClasses(['tile', tile.params.terrain, 'unselectable']);
                };
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
                .dim('i', -this.options.range, this.options.range)
                .dim('j', -this.options.range, this.options.range)();
        }

    });

    module.exports = new Display();

});