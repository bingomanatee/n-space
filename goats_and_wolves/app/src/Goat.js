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
    var Grass = require('./Grass');

    var id = 0;

    function Goat(world, i, j, options) {
        View.call(this, _.defaults({i: i, j: j, id: ++id}, options, Goat.DEFAULTS));
        this.world = world;
        this.bot = new NSPACE.WanderBot('goat', world, {i: i, j: j}, 1);
        this.mod = new Modifier({
            origin: [0.5, 0],
            transform: this._transform()
        });
        this._node.add(this.mod).add(this.surface());

        var self = this;

        var rule = this.bot.addScanRule(['i', 'j'], _.identity);
        rule.scan = function(a, b) {
            return a[Math.floor(Math.random() * a.length)];
        };

        this.behavior = Fools.gauntlet()
            .add(function(goat, good) {
                var check_death = Fools.fork(function(goat) {
                    return goat.hunger() > goat.options.maxHunger;
                })
                    .then(function(goat) {
                        debugger;
                        goat.die();
                        // stop
                        good();
                        return goat;
                    })
                    .else(function(goat) {
                        // continue
                        return goat;
                    });

                Fools.fork(function(goat) {
                    return !goat.options.alive;
                })
                    .then(function() {
                        // end of line
                        good();
                        return goat;
                    })
                    .else(
                    check_death
                )(goat);
            })
            .add(function(goat, good) {
                if (goat.options.fainted > 0) {
                    --goat.options.fainted;
                    good();
                }
                return goat;
            })
            .add(function(goat, good) {
                if (Math.random() > 0.95) {
                    goat.options.fainted = Math.random() * 10;
                    goat.mod.setTransform(goat._transform(), {duration: 300});
                    good();
                }
                return goat;
            })
            .add(function(goat, good) {

                var keep_eating = Fools.fork(function(goat) {
                    return goat._is_eating;
                })
                    .then(function(goat) {
                        good();
                        goat.eat();
                        return goat;
                    })
                    .else(function(goat) {
                    })
                    .err(function(err) {
                        console.log("goat err: ", err);
                    });

                var eat = Fools.fork(function(goat) {
                    return goat.canEat();
                })
                    .then(function(goat) {
                        goat.eat();
                        good();
                    }).else(function(goat) {
                        goat.stopEating();
                    });

                Fools.fork(function(goat) {
                    return  (goat.hunger() > 3);
                })
                    .then(eat)
                    .else(keep_eating)
                    .err(function(err) {
                        console.log('goat err 2 ', err);
                    })
                (goat);
            })
            .add(function(goat, good) {
                if (!goat._is_eating) {
                    goat.walk();
                }
                good();
            });

    }

    Goat.DEFAULTS = {
        type: 'goat',
        hunger: 0,
        fatigue: 0,
        size: 100,
        moves: 0,
        transSpeed: 200,
        fainted: 0,
        maxHunger: 20,
        alive: true
    };

    Goat.prototype = Object.create(View.prototype);

    var _c = _.template('rgb(<%= red %>,<%= green %>,<%= blue %>)');
    _.extend(Goat.prototype, {
        update: function() {
            if (this.hunger() > 5) {
                console.log('goat hunger: ', this.hunger());
            }
            this.behavior(this);
        },

        hunger: function() {
            return this.options.hunger;
        },

        canEat: function() {
            var grass = this.getGrass();
            if (!grass) {
                return false;
            } else {
                return grass.options.k > -5;
            }
        },

        eat: function() {
            this._is_eating = true;
            --this.options.hunger;
            this.surface().setClasses(['goat', 'eating']);

            if (this.hunger() <= 0) {
                this.stopEating();
            }

            var grass = this.getGrass();
            if (grass) {
                grass.eat();
            }
        },

        die: function() {
            console.log('DEAD GOAT');
            this.options.alive = false;
            this.mod.halt();
            this.mod.setTransform(this._transform());
            this.surface().setClasses(['goat', 'dead']);
        },

        getGrass: function() {
            var i = this.bot.member.loc.i;
            var j = this.bot.member.loc.j;
            return this.world.getRegistry({i: i, j: j}).getFirst('grass');
        },

        stopEating: function() {
            this.surface().setClasses(['goat']);
            this._is_eating = 0;
        },

        walk: function() {
            this.bot.move();
            this.surface().setClasses(['goat']);
            this.mod.setTransform(this._transform(), {duration: this.options.transSpeed}, function() {
            }.bind(this));
            ++this.options.hunger;
        },

        _transform: function() {
            var GRID_SIZE = this.options.GRID_SIZE;
            var pos = [
                    this.bot.member.loc.i * GRID_SIZE,
                    this.bot.member.loc.j * GRID_SIZE,
                0
            ];

            var out;

            out = Transform.thenMove(
                Transform.rotateX((this.options.fainted > 0) ? 0 : Math.PI / 2), pos);

            return out;
        },

        surface: function() {
            if (!this._surface) {
                this._surface = new Surface({
                    size: [this.options.size, this.options.size * 3 / 4],
                    classes: ['goat'],
                    transform: Transform.scale(0.5, 0.5, 0.5)
                });
            }
            return this._surface;
        }
    });

    module.exports = Goat;

})
;
