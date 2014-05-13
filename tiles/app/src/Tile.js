define(function(require, exports, module) {

    var _ = require('lodash');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');

    function Tile(reg, params) {
        this.reg = reg;
        this.params = params;

        this.makeSurface();
    }

    var $root;

    Tile.tileRoot = function(root) {
        if (root) {
            $root = root;
        }
        return $root;
    };

    Tile.cache = [];

    // returns a flat array
    function _cache(world) {
        var data = _.compact(_.map(world.registries(), function(reg) {
            var terrain = false;
            if (reg.has('tile')) {
                var tile = reg.getFirst('tile');
                terrain = tile.terrain || false;
            }

            if (!terrain) return [];

            return [reg.loc.i, reg.loc.j, terrain];
        }));

        return _.flatten(data);
    }

    Tile.center = {i: 0, j: 0};
    _.extend(Tile.prototype, {

        visibleTile: function() {
            var rel_i = this.reg.loc.i - Tile.center.i;
            var rel_j = this.reg.loc.j - Tile.center.j;

            return (rel_i >= -20 && rel_j <= 20) && (rel_j >= -20 && rel_j < 20);
        },

        updateParams: function(params) {
            this.params = params;
            if (this.visibleTile()) {
                this._ensureSurface();
                this.updateSurfaceAndMod();
            } else {
                this._removeSurface();
            }
        },

        _removeSurface: function(){

            if (this._tileNode){
                this._tileNode._object = null;
                this._tileNode._child = null;
                this._tileNode._hasMultipleChildren = false;
                this._tileNode._isRenderable = false;
                this._tileNode._isModifier = false;
                this._tileNode = null;
            }
            this._tileSurface = null;
        },

        _ensureSurface: function(){
            if (!this._tileNode) {
                this.makeMod();
            }
            if (!this._tileSurface) {
                this.makeSurface();
            }
            this._tileNode.add(this._tileSurface);
        },

        i: function() {
            return this.reg ? this.reg.loc.i : 0;
        },

        j: function() {
            return this.reg ? this.reg.loc.j : 0;
        },

        setTerrain: function(terrain) {
            this.terrain = terrain || Tile.terrainToolbar.terrain;
            this._tileSurface.setClasses(['tile', this.terrain, 'unselectable']);
        },

        updateSurfaceAndMod: function() {
            var size = this.params.size;
            this._tileMod.setTransform(
                Transform.translate(
                        this.reg.loc.i * size,
                        this.reg.loc.j * size,
                    0
                )
            );
            this._tileSurface.setSize([size, size])
        },

        makeMod: function() {
            this._tileMod = new StateModifier({
                size: [this.params.size, this.params.size],
                transform: Transform.translate(
                        this.reg.loc.i * this.params.size,
                        this.reg.loc.j * this.params.size,
                    0
                )
            });

            this._tileNode = $root.add(this._tileMod);
        },

        makeSurface: function() {
            this._tileSurface = new Surface({
                properties: {
                    backgroundColor: 'grey'
                },
                classes: ['tile', 'empty', 'unselectable']
            });
            this._tileSurface.on('mousedown', function(evt) {

                if (!Tile.terrainToolbar.terrain) {
                    return;
                }

                var world = this.reg.world;
                this.setTerrain();

                var last = Tile.lastShiftClickedTile;

                if (last) {

                    var min_i = Math.min(last.i(), this.i());
                    var max_i = Math.max(last.i(), this.i());

                    var min_j = Math.min(last.j(), this.j());
                    var max_j = Math.max(last.j(), this.j());

                    _.each(_.range(min_i, max_i + 1), function(i) {
                        _.each(_.range(min_j, max_j + 1), function(j) {
                            try {
                                var reg = world.getRegistry({i: i, j: j});
                                if (reg.has('tile')) {
                                    var tile = reg.getFirst('tile');
                                    tile.setTerrain();
                                }
                            } catch (err) {

                            }
                        })
                    });
                }

                Tile.lastShiftClickedTile = evt.shiftKey ? this : '';

                Tile.cache.push(_cache(world));
                if (Tile.cache.length > 8) {
                    Tile.cache.shift();
                }

            }.bind(this));
        }

    });

    module.exports = Tile;

});
