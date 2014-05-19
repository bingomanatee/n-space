define(function (require, exports, module) {

    var _ = require('lodash');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var NSPACE = require('./n-space');
    var settings = require('./Settings');
    var Fools = require('./fools');

    var tid = 0;
    var WORLD_I = 200;
    var WORLD_J = 200;

    function Tile(reg, meters, params) {
        this.reg = reg;
        this.params = params;
        this.id = ++tid;
        this.meters = meters;
    }

    Tile.cache = [];

    Tile.mouseDown = function (evt, surface) {
        var abs_i = surface.i + Tile.center.i;
        var abs_j = surface.j + Tile.center.j;

        var coords = {i: abs_i, j: abs_j};

        var display = require('./Display');
        var reg = Tile.world.getRegistry(coords);

        function _colorReg(reg) {
            if (!Tile.world.locInRange(reg.loc)) {
                return;
            }
            var tile;
            if (!reg.has('tile')) {
                tile = new Tile(reg, settings.options.metersPerTile, { });
                reg.add(tile, 'tile', true);
            } else {
                tile = reg.getFirst('tile');
            }
            tile.setTerrain(settings.options.terrain);
            display.redrawFromTile(tile);
        }

        if (event.shiftKey && (!(settings.options.terrain == 'town'))) {
            var regs = reg.neighbors();
            if (event.altKey) {
                regs = _.flatten(_.map(regs, function (reg) {
                    return reg.neighbors();
                }));
                regs = _.flatten(_.map(regs, function (reg) {
                    return reg.neighbors();
                }));
            }

            _.each(regs, _colorReg);

        } else {
            if (Tile.world.locInRange(coords)) {
                _colorReg(reg);
                display.redrawFromSurface(surface);
            } else {
                console.log('out of range click: ', coords);
            }
        }

    };

    Tile.initWorld = function (i, j) {
        var oldWorld = Tile.world;
        Tile.world = new NSPACE.World({i: [-i, i], j: [-j, j]});

        if (oldWorld){
           Tile.world.copy(oldWorld);
        }
    };

    Tile.initWorld(WORLD_I, WORLD_J);

    Tile.center = {i: 0, j: 0};

    Tile.recenter = function () {
        Tile.center = {i: 0, j: 0};
    };

    Tile.terrain_encoding = {
        'mtn': 'A',
        'forest': 'P',
        'desert': '_',
        'grass': '"'
    };

    Tile.terrain = function () {
        return Fools.loop(function (iIter, rows) {

                var i_min = Tile.world.dims.i[0];
                var i_max = Tile.world.dims.i[1];

                var loop = Fools.loop(function (jIter, memo) {
                    var iter = _.extend(iIter, jIter);
                    var reg = Tile.world.getRegistry(iter);
                    var tile = reg.has('tile') ? reg.getFirst('tile') : false;
                    var c = ' ';
                    if (tile) {
                        if (tile.params.terrain) {
                            c = Tile.terrain_encoding[tile.params.terrain] || ' ';
                        }
                    }
                    memo.push(c);
                    return memo;
                }).dim('i', i_min, i_max);

                var cols = loop([]);
                rows.push(cols.join(''));
                return rows;
            }
        ).dim('j', Tile.world.dims.j[0], Tile.world.dims.j[1])([]);
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
            if (terrain == 'town') {
                this.params.town = 'town';
            } else {
                this.params.terrain = terrain;
            }
        },

        toJSON: function () {
            var out = _.clone(this.reg.loc);
            _.extend(out, this.params);

            return out;
        }

    });

    module.exports.Tile = Tile;

});
