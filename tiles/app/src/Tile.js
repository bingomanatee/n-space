define(function (require, exports, module) {

    var _ = require('lodash');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var NSPACE = require('./n-space');
    var settings = require('./Settings');

    var tid = 0;
    function Tile(reg, params) {
        this.reg = reg;
        this.params = params;
        this.id = ++tid;
    }

    Tile.cache = [];

    Tile.mouseDown = function (evt, surface) {
        var abs_i = surface.i + Tile.center.i;
        var abs_j = surface.j + Tile.center.j;

        var coords = {i: abs_i, j: abs_j};
        Tile.world.ifRange(coords, function () {
            if (!settings.options.terrain) {
                return;
            }
            var reg = Tile.world.getRegistry(coords);
            var regs;
            if (event.shiftKey && (!settings.options.terrain == 'town')){
                regs = reg.neighbors();
                if (event.altKey){
                    regs = _.flatten(_.map(regs, function(reg){
                        return reg.neighbors();
                    }));
                    regs = _.flatten(_.map(regs, function(reg){
                        return reg.neighbors();
                    }));
                }
            } else {
                regs = [reg];
            }

            _.each(regs, function(reg){
                var tile;
                if (!reg.has('tile')) {
                    tile = new Tile(reg, { });
                    reg.add(tile, 'tile', true);
                } else {
                    tile = reg.getFirst('tile');
                }
                tile.setTerrain( settings.options.terrain)
                reg.add(tile, 'tile', true);
            });

            var display = require('./Display');
            if (event.shiftKey) {
                display.redraw(true);
            } else {
                display.redrawFromSurface(surface);
            }

        }, _.identity);
    };

    Tile.world = new NSPACE.World({i: [-100, 100], j: [-100, 100]});

    Tile.center = {i: 0, j: 0};

    Tile.recenter = function(){
        Tile.center = {i: 0, j: 0};
    };

    // returns a flat array
    function _cache(world) {
        var data = _.compact(_.map(world.registries(), function (reg) {
            var terrain = false;
            if (reg.has('tile')) {
                var tile = reg.getFirst('tile');
                terrain = tile.terrain || false;
            }

            if (!terrain) {
                return [];
            }

            return [reg.loc.i, reg.loc.j, terrain];
        }));

        return _.flatten(data);
    }

    _.extend(Tile.prototype, {

        i: function () {
            return this.reg ? this.reg.loc.i : 0;
        },

        j: function () {
            return this.reg ? this.reg.loc.j : 0;
        },

        setTerrain: function (terrain) {
            if (terrain == 'town'){
                this.params.town = 'town';
            } else {
                this.params.terrain = terrain;
            }
        }

    });

    module.exports.Tile = Tile;

});
