/**
 * Created by dave on 5/15/14.
 */
define(function(require, exports, module) {

    var _ = require('lodash');
    var ContainerSurface = require('famous/surfaces/ContainerSurface');
    var Surface = require('famous/core/Surface');
    var Transform = require('famous/core/Transform');
    var StateModifier = require('famous/modifiers/StateModifier');
    var Draggable = require('famous/modifiers/Draggable');

    var View = require('famous/core/View');
    var Fools = require('fools');
    var Tile = require('./Tile');
    var NSPACE = require('./n-space');
    var Z = 10;

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
        j_range: 10,
        gridScale: 1
    };

    Display.prototype = Object.create(View.prototype);

    _.extend(Display.prototype, {

        center: function(){
            this.drag.setPosition([0,0]);
        },

        move: function(dir) {
            return function(evt) {
                this._move(evt, dir);
            }.bind(this);

        },

        setScale: function(scale) {
            this.options.gridScale = scale;
            this.scaleMod.setTransform(
                this._transformScaleMod()
            );
        },

        _move: function(evt, dir) {

            //console.log('event: ', evt);
            var n = evt.shiftKey ? 5 : 1;
            var i_offset = 0;
            var j_offset = 0;

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

            this.scaleMod.setTransform(
                this._transformScaleMod(i_offset, j_offset),
                {duration: 0}, this.redraw.bind(this));

        },

        _transformScaleMod: function(i_offset, j_offset) {
            if (!i_offset) {
                i_offset = 0;
            }
            if (!j_offset) {
                j_offset = 0;
            }

            var scale = Transform.scale(this.options.gridScale, this.options.gridScale, this.options.gridScale);
            if (this.rotateX || this.rotateY){
                if (Math.abs(this.rotateX) > Math.abs(this.rotateY)){
                    scale = Transform.multiply(scale, Transform.rotateX(-this.rotateX));
                } else {
                    scale = Transform.multiply(scale, Transform.rotateY(this.rotateY));
                }
            }
            var out = Transform.thenMove(scale,
                [i_offset, j_offset, Z]);
            // console.log('tsm: ', out);
            return out;
        },

        redraw: function(noTransform) {
            //  console.log('start redraw');
            if (!noTransform) {
                this.scaleMod.setTransform(this._transformScaleMod());
            }
            _.each(this.surfaces, function(surface) {
                if (!this.redrawFromSurface(surface)) {
                    surface.setClasses(['tile', 'empty', 'unselectable']);
                }
            }.bind(this));
            //  console.log('end redraw');
        },

        redrawFromSurface: function(surface) {
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
            } else {
                surface.setClasses(['tile', 'empty', 'unselectable']);
            }
            // });

            return found;
        },

        redrawFromTile: function(tile) {
            var rel_i = tile.reg.loc.i + Tile.Tile.center.i;
            var rel_j = tile.reg.loc.j + Tile.Tile.center.j;
            var coords = {i: rel_i, j: rel_j};

            this.surfaceSpace.ifRange(coords, function() {
                var surface = this.surfaceSpace.getRegistry(coords).getFirst('surface');
                if (surface) {
                    surface.setClasses(['tile', tile.params.terrain, 'unselectable']);
                }
            }.bind(this), _.identity);
        },

        endDrag: function(e) {
            this.rotateX = this.rotateY = 0;
            if (this._dragInit){
                Tile.Tile.center.i = -Math.round(e.position[0] / this.options.pixelsPerTile);
                Tile.Tile.center.j = -Math.round(e.position[1] / this.options.pixelsPerTile);
                this.redraw();
            }
        },

        showDrag: function(e) {

            var i = Math.round((e.position[0] - this._dragFirst[0]) * this.options.gridScale) + this._dragStartCenter.i;
            var j = Math.round((e.position[1] - this._dragFirst[1]) * this.options.gridScale) + this._dragStartCenter.j;

            var jn = Math.sqrt(Math.abs(j));
            if (j < 0) {
                jn *= -1;
            }

            var ir = Math.sqrt(Math.abs(i));
            if (i < 0){
                ir *= -1;
            }

            this.rotateX = (jn * Math.PI)/200;
            this.rotateY = (ir * Math.PI)/170;

            if (!this._dragInit) {
                var travel = Math.abs(e.position[0] - this._dragFirst[0]) + Math.abs(e.position[1] - this._dragFirst[1]);
                if (travel > 50) {
                    Tile.Tile.center.i = i;
                    Tile.Tile.center.j = j;
                    this._dragInit = true;
                    this.dragged = true;
                } else {
                    return;
                }
            } else {
                this.scaleMod.setTransform(this._transformScaleMod(i, j));
            }

        },

        startDrag: function(e) {
            // console.log('start drag');
            this._dragInit = false;
            this._dragFirst = e.position.slice(0);
            this._dragStartCenter = _.clone(Tile.Tile.center);
        },

        makeSurfaces: function() {
            this.scaleMod = new StateModifier({
                transform: this._transformScaleMod(),
                size: [
                    window.innerWidth, window.innerHeight
                ],
                origin: [0.5, 0.5]
            });

            this.drag = new Draggable();

            this.drag.on('start', function(e) {
                this.startDrag(e);
            }.bind(this));

            this.drag.on('update', function(e) {
                this.showDrag(e);
            }.bind(this));

            this.drag.on('end', function(e) {
                this.endDrag(e);
            }.bind(this));

            this.cs = new ContainerSurface({
                size: [
                    window.innerWidth, window.innerHeight
                ]
            });
            this.root = this._node.add(this.scaleMod).add(this.cs);
            this.surfaces = [];
            var size = this.options.pixelsPerTile;

            Fools.loop(function(iter) {

                var mod = new StateModifier({
                    size: [size, size],
                    origin: [0.5, 0.5],
                    transform: Transform.translate(iter.i * size, iter.j * size, 0)
                });

                var surface = new Surface({
                    classes: ['tile', 'empty', 'unselectable'],
                    mod: mod,
                    size: [this.options.pixelsPerTile + 2, size + 2]
                });
                _.extend(surface, iter);

                surface.on('mousedown', function() {
                    this.dragged = false;
                }.bind(this));

                surface.on('click', function(evt) {
                    if (!this.dragged) {
                        Tile.Tile.mouseDown(evt, surface);
                    }
                }.bind(this));

                surface.pipe(this.drag);

                this.cs.add(mod).add(surface);
                this.surfaces.push(surface);
                this.surfaceSpace.add(surface, 'surface', iter);
                surface.mod = mod;

            }.bind(this))
                .dim('i', -this.options.i_range, this.options.i_range)
                .dim('j', -this.options.j_range, this.options.j_range)();
        }

    });

    module.exports = new Display({
        i_range: Math.min(25, Math.max(15, 4 + Math.floor(window.innerWidth / 100))),
        j_range: Math.min(18, Math.max(10, 4 + Math.floor(window.innerHeight / 100)))
    });

});
