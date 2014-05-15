define(function (require, exports, module) {

    var _ = require('lodash');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var NSPACE = require('./n-space');
    var settings = require('./Settings');

    function Tile(reg, params) {
        this.reg = reg;
        this.params = params;
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
            var tile;
            if (!reg.has(coords, 'tile')) {
                tile = new Tile(reg, {
                    terrain: settings.options.terrain
                });
                reg.add(tile, 'tile', true);
            } else {
                tile = reg.getFirst('tile');
                tile.params.terrian = settings.options.terrain;
            }

            var display = require('./Display');
            display.redrawFromSurface(surface);

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
            this.terrain = terrain;
            this._tileSurface.setClasses(['tile', this.terrain, 'unselectable']);
        }

    });

    module.exports.Tile = Tile;

});
