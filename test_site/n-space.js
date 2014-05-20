(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('fools'));
    }
    else if(typeof define === 'function' && define.amd) {
        define(function(require, exports, module) {
            module.exports = factory(require('lodash'), require('fools'));
        });
    }
    else {
        root['NSPACE'] = factory(root._, root.Fools);
    }
}(this, function(_, Fools) {

/*jshint strict:false */

/**
 * EventEmitter represents a channel for events.
 *
 * @class EventEmitter
 * @constructor
 */
function EventEmitter() {
    this.listeners = {};
    this._owner = this;
}

/**
 * Trigger an event, sending to all downstream handlers
 *   listening for provided 'type' key.
 *
 * @method emit
 *
 * @param {string} type event type key (for example, 'click')
 * @param {Object} event event data
 * @return {EventHandler} this
 */
EventEmitter.prototype.emit = function emit(type, event) {
    var handlers = this.listeners[type];
    if (handlers) {
        for (var i = 0; i < handlers.length; i++) {
            handlers[i].call(this._owner, event);
        }
    }
    return this;
};

/**
 * Bind a callback function to an event type handled by this object.
 *
 * @method "on"
 *
 * @param {string} type event type key (for example, 'click')
 * @param {function(string, Object)} handler callback
 * @return {EventHandler} this
 */
EventEmitter.prototype.on = function on(type, handler) {
    if (!(type in this.listeners)) {
        this.listeners[type] = [];
    }
    var index = this.listeners[type].indexOf(handler);
    if (index < 0) {
        this.listeners[type].push(handler);
    }
    return this;
};

/**
 * Alias for "on".
 * @method addListener
 */
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

/**
 * Unbind an event by type and handler.
 *   This undoes the work of "on".
 *
 * @method removeListener
 *
 * @param {string} type event type key (for example, 'click')
 * @param {function} handler function object to remove
 * @return {EventEmitter} this
 */
EventEmitter.prototype.removeListener = function removeListener(type, handler) {
    var index = this.listeners[type].indexOf(handler);
    if (index >= 0) {
        this.listeners[type].splice(index, 1);
    }
    return this;
};

/**
 * Call event handlers with this set to owner.
 *
 * @method bindThis
 *
 * @param {Object} owner object this EventEmitter belongs to
 */
EventEmitter.prototype.bindThis = function bindThis(owner) {
    this._owner = owner;
};

/*jshint strict:false */
/*global _ */
/*global Fools */

var NSPACE = {
    rid: 0,
    mid: 0,
    reset: function() {
        NSPACE.mid = 0;
        NSPACE.rid = 0;
    }
};
/*jshint strict:false */
/*global _ */
/*global Fools */
/*global EventEmitter */
/*global NSPACE */

var rid = 0;
NSPACE.Register = function(world, location) {
    this.loc = location;
    this.world = world;
    this.content = {};
    this.rid = ++rid;
};

_.extend(NSPACE.Register.prototype, {
    t: 'Register',

    equals: function(loc) {
        var self = this;

        function notEqual(dim) {
            return loc[dim.name] !== self.loc[dim.name];
        }

        var mismatch = _.find(this.world.dimArray, notEqual);

        return !mismatch;
    },

    serialize: function() {
        var out = _.clone(this.loc);
        out.content = _.clone(this.content);
        _.each(out.content, function(items, iType) {
            out.content[iType] = _.reduce(items, function(out, item) {
                if (item.serialize && _.isFunction(item.serialize)) {
                    out.push(item.serialize());
                } else {
                    out.push(item);
                }
                return out;
            }, []);
        });

        //  console.log('register serialize: %s', require('util').inspect(out, {depth: 10}));

        return out;
    },

    get: function(iType) {
        if (!this.has(iType)) {
            return [];
        }
        return this.content[iType].slice(0);
    },

    getFirst: function(iType) {
        var items = this.get(iType);
        return _.first(items);
    },

    has: function(iType) {
        return this.content.hasOwnProperty(iType) && this.content[iType].length;
    },

    add: function(item, iType, replace) {
        if (!iType) {
            iType = '___content';
        }

        if ((!replace) && this.content[iType]) {
            this.content[iType].push(item);
        } else {
            this.content[iType] = [item];
        }
    },

    remove: function(item, iType) {
        //console.log('inspecting %s for %s', require('util').inspect(this.loc), iType);
        if (this.content.hasOwnProperty(iType) && this.content[iType] && _.isArray(this.content[iType])) {
            //  console.log('removing %s from %s', require('util').inspect(item), require('util').inspect(this.loc));
            this.content[iType] = _.difference(this.content[iType], [item]);
            if (!this.content[iType].length) {
                delete this.content[iType];
            }
        }
    },

    neighbors: function(){
        var args = _.toArray(arguments);
        args.unshift(this.loc);
        return this.world.neighbors.apply(this.world, args);
    }

});

/*jshint strict:false */
/*global _ */
/*global Fools */
/*global EventEmitter */
/*global NSPACE */
/*jshint -W089 */
/*global console */
NSPACE.World = function(dims) {
    if (dims) {
        this.init(dims);
    } else {
        this.dims = {};
    }
};

_.extend(NSPACE.World.prototype, {

    serialize: function() {
        var reg = _.flatten(this.cells);
        reg = _.map(reg, function(r) {
            return r.serialize();
        });

        var dims = this.dimNames();
        dims.unshift(reg);

        return _.sortBy.apply(_, dims);
    },

    dimNames: function() {
        return _.pluck(this.dimArray, 'name');
    },

    add: function(item, iType, loc) {
        this.goodType(iType, 'add');
        this.goodLoc(loc, 'add');
        var reg = this.getRegistry(loc);
        if (reg) {
            reg.add(item, iType);
        } else {
            throw ('cannot get registry');
        }
    },

    remove: function(item, iType, loc) {
        this.goodType(iType);
        if (loc) {
            this.goodLoc(loc, 'remove');
            var reg = this.getRegistry(loc);
            if (reg) {
                reg.remove(item, iType);
            } else {
                throw ('cannot get registry');
            }
        } else {
            _.each(this.registries(), function(reg) {
                reg.remove(item, iType);
            });
        }
    },

    goodType: function(iType, msg) {
        if (!(iType && (_.isString(iType) || _.isNumber(iType)))) {
            throw 'World.' + (msg || 'goodType') + ': missing or non-string /number type';
        }
    },

    /**
     * validates veracity of loc -- has all required dimensions, and is object.
     * does NOT validate range.
     *
     * note -- does NOT care if there are EXTRA dimensions/data in loc.
     * @param loc {Object}
     * @param msg {String} -- optional
     */
    goodLoc: function(loc, msg) {
        if (!(loc && _.isObject(loc))) {
            throw  'World.' + (msg || 'goodLoc') + ': missing or non-object location';
        }
        for (var dimName in this.dims) {
            if (!loc.hasOwnProperty(dimName)) {
                throw  'World.' + (msg || 'goodLoc') + ': loc missing parameter ' + dimName;
            } else if (!_.isNumber(loc[dimName])) {
                throw 'World.' + (msg || 'goodLoc') + ': non numeric ' + dimName;
            }
        }
    },

    /**
     * validates that location's values are within the world range.
     * @param loc {Object} a location in world space
     * @param goodCheck {Boolean} optional -- validate that the loc is a valid location;
     * @returns {boolean}
     */
    locInRange: function(loc, goodCheck) {
        if (goodCheck) {
            try {
                this.goodLoc(loc);
            } catch (err) {
                return false;
            }

        }
        return !_.find(loc, function(value, name) {
            var range = this.dims[name];
            if (value < range[0]) {
                return true;
            } else if (value > range[1]) {
                return true;
            } else {
                return false;
            }
        }, this);
    },

    neighborsExcept: function(loc) {
        var args = _.toArray(arguments);
        var neighbors = this.neighbors.apply(this, args);
        return _.reject(neighbors, function(reg) {
            if (reg.equals(loc)) {
                //console.log('found ', require('util').inspect(loc));
                return true;
            } else {
                //console.log(reg.serialize(), '!=', require('util').inspect(loc));
                return false;
            }
        });
    },

    /**
     * returns the registries of all the locations
     * adjacent to the location INCLUDING the location.
     * the range is +/1 i in the dimensions of search.
     * by default the dimensions of sort are all the dimensions in the world
     * however dimensions can also be passed in as subsequent parameters.
     * @param loc {object}
     */
    neighbors: function(loc) {
        this.goodLoc(loc, 'neighbors');

        var dims;

        if (arguments.length > 1) {
            if (_.isArray(arguments[1])) {
                dims = arguments[1];
            } else {
                dims = _.toArray(arguments).slice(1);
            }
        } else {
            dims = _.pluck(this.dimArray, 'name');
        }

        var out = [];
        var loop = Fools.loop(function(item) {
            //   console.log('getting neighbor', require('util').inspect(item));
            var l = _.defaults({}, item, loc);

            if (!this.locInRange(l)) {
                return;
            }
            out.push(this.getRegistry(l));
        }.bind(this));
        _.each(dims, function(name) {
            if (!this.dims.hasOwnProperty(name)) {
                throw ('neighbors:bad dim ' + name);
            }
            var dim = this.dims[name];
            var min = loc[name] - 1;
            var max = loc[name] + 1;

            loop.dim(name, min, max);
        }, this);

        loop();
        return out;
    },

    registries: function() {
        if (!this._registries) {
            this._registries = _.flatten(this.cells);
        }
        return this._registries;
    },

    getRegistry: function(loc) {
        this.locInRange(loc, true);
        var self = this;
        var coords = _.pluck(this.dimArray, 'name');
        var reg = _.reduce(coords, function(cells, name) {
            if (!cells){
                throw 'no cells for ' + name;
            }
            if (!(loc.hasOwnProperty(name))) {
                throw ('World.getRegistry:loc missing property ' + name);
            }
            var index = loc[name];
            if (!self.dims.hasOwnProperty(name)) {
                throw ('World.getRegistry:non-dimension ' + name);
            }
            var dim = self.dims[name];
            // console.log('getting registry from index %s - %s of %s', index, dim[0], name);
            index -= dim[0];
            try {
                if (index >= 0 && index <= cells.length && cells[index]){
                    return cells[index];
                } else {
                    throw 'out of bound index for ' + name + ': ' + index;
                }
            } catch (e){
                console.log('retrieval error: ', e);
                throw e;
            }
        }, this.cells);

        if (reg.t !== 'Register') {
            throw ('World.getRegistry:bad request');
        }

        return reg;
    },

    goodDims: function() {
        var count = 0;
        for (var dim in this.dims) {
            ++count;
            var range = this.dims[dim];
            if (range.length < 2) {
                throw 'missing range data for ' + dim;
            }
            var min = range[0];
            if (!_.isNumber(min)) {
                throw 'non numeric min for ' + dim;
            }
            if (min !== Math.floor(min)) {
                throw 'fractional min for ' + dim;
            }

            var max = range[1];
            if (!_.isNumber(max)) {
                throw 'non numeric max for ' + dim;
            }
            if (max !== Math.floor(max)) {
                throw 'fractional max for ' + dim;
            }

            if (max < min) {
                throw 'Bad range for ' + dim;
            }
        }

        if (count === 0) {
            throw ('must have at least one dim');
        }
    },

    ifRange: function(range, ifInRange, ifOutsideRange, ifErr) {

        var g = Fools.each();
       // debugger;

        _.each(range, function(value, dim){
             if (_.isNumber(value)){
                 g.add(function(reg){
                     return (reg.loc[dim] === value);
                 });
             } else if (_.isArray(value)){
                 g.add(function(reg){
                     return (reg.loc[dim] >= value[0] && reg.loc[dim] <= value[1]);
                 });
             } else if (_.isFunction(value)){
                 return value(reg.loc[dim]);
             }
        });

        var f = Fools.fork(g)
            .then(ifInRange)
            .else(ifOutsideRange)
            .err(ifErr || _.identity);

        _.each(this.registries(),f);
    },

    init: function(dims) {
        if (dims) {
            this.dims = dims;
        }
        this.goodDims();
        this._registries = false;

        this.dimArray = _.map(this.dims, function(range, name) {
            return {name: name, min: range[0], max: range[1]};
        });

        //  console.log('dimArray: %s', require('util').inspect(this.dimArray));
        var self = this;

        function digestDims(dim, others, location) {
            if (!dim) {
                if (others.length) {
                    return digestDims(others[0], others.slice(1), location);
                }
            } else {
                var name = dim.name;
                var min = dim.min;
                var max = dim.max;
                min = Math.floor(min);

                return _.map(_.range(min, max + 1), function(value) {
                    var loc = {};
                    loc[name] = value;
                    _.extend(loc, location);
                    if (others.length) {
                        return digestDims(null, others, loc);
                    } else {
                        return new NSPACE.Register(self, loc);
                    }
                });
            }
        }

        this.cells = digestDims(null, this.dimArray);

    }
});

/*jshint strict:false */
/*global _ */
/*global Fools */
/*global EventEmitter */
/*global NSPACE */

/**
 * A member is a resident of the world at a single location.
 * @param world {NSPACE.World}
 * @param mType {string} the name of the member's type.
 * @param loc {object} a location in world space
 * @param stackLimit {int} >= 1 -- the number of members that can occupy the same coordinate. if 0, unlimited
 * @constructor
 */
var mid = 0;
NSPACE.Member = function(mType, world, loc, stackLimit) {
    this.mid = ++mid;
    this.world = world;
    this.loc = loc || null;
    this.mType = mType || '__member';
    this.stackLimit = stackLimit ? stackLimit : 1;
    EventEmitter.call(this);
};

_.extend(NSPACE.Member.prototype, {

    serialize: function() {
        return {mid: this.mid, loc: _.clone(this.loc)};
    },

    neighbors: function() {
        return this.world.neighbors(this.loc);
    },

    neighborsExcept: function() {
        return this.world.neighborsExcept(this.loc);
    },

    /**
     * used to either add a member to a world or move it within its world
     * @param loc {object} a location in world space
     * @param world {NSPACE.World}
     */
    addToWorld: function(loc, world) {
        if (world) {
            this.world = world;
        }

        if (!this.canStack(loc || this.loc)) {
            return false;
        }
        if (this.loc) {
            this.world.remove(this, this.mType, this.loc);
        }

        if (loc) {
            this.loc = loc;
        }
        this.world.add(this, this.mType, this.loc);
        this.emit('at', this, this.loc);
        return true;
    },

    canStack: function(loc) {
        if (this.stackLimit <= 0) {
            return true;
        }
        var reg = this.world.getRegistry(loc);
        if (!reg.has(this.mType)) {
            return true;
        }

        var count = _.reduce(reg.get(this.mType), function(count, item) {
            if (!item) {
                return count;
            } else if (item.mid === this.mid) {
                return count;
            } else {
                return count + 1;
            }
        }, 0, this);

        return count < this.stackLimit;
    },

    remove: function(all) {
        if (this.loc) {
            this.emit('leaving', this, this.loc);
        }
        this.world.remove(this, this.mType, all ? null : this.loc);
        this.emit('removed', this);
    },

    move: function(loc) {
        this.remove();
        this.addToWorld(loc);
    },

    moveAni: function(loc, msec, interval) {
        //@TODO: check for non-move

        if (this._moving) {
            this.emit('move stop', this, this.to_stub.loc);
            this.endMoveAni((this.moveAniTime() / this.move_msec) > 0.5, true);
        }

        this.move_msec = Math.max(10, msec);

        this.from_stub = {
            loc: _.clone(this.loc),
            member: this
        };

        this.to_stub = {
            loc: _.clone(loc),
            member: this
        };

        this.remove();
        //@TODO: inspect world for stackability
        this.world.add(this.from_stub, this.mType, this.loc);
        this.world.add(this.to_stub, this.mType, loc);

        if (!interval) {
            interval = Math.max(10, Math.min(100, Math.round(this.move_msec / 4)));
        }

        this._moving = setInterval(this.slide.bind(this), interval);
        this.move_time = new Date().getTime();
    },

    moveAniTime: function() {
        var t = new Date().getTime();
        return t - this.move_time;
    },

    slide: function() {
        var dur = this.moveAniTime();
        if (dur > this.move_msec) {
            this.endMoveAni(true);
        } else {
            this.from_stub.progress = this.to_stub.progress = this.progress = dur / this.move_msec;
            this.emit('slide progress', this, this.slideLoc());
        }
    },

    slideLoc: function() {

        var fromLoc = _.clone(this.from_stub.loc);
        var toLoc = _.clone(this.to_stub.loc);
        var progress = this.progress;
        var p2 = 1 - progress;
        _.each(fromLoc, function(value, dim) {
            fromLoc[dim] = value * p2;
            toLoc[dim] *= progress;
            toLoc[dim] += fromLoc[dim];
        });

        return toLoc;
    },

    endMoveAni: function(moveToEnd, noEmit) {
        this.world.remove(this.from_stub, this.mType);
        this.world.remove(this.to_stub, this.mType);
        clearInterval(this._moving);
        this._moving = null;
        // relocating to the most relevant start place
        if (moveToEnd) {
            this.move(this.to_stub.loc);
        } else {
            this.move(this.from_stub.loc);
        }
        delete(this.to_stub);
        delete(this.from_stub);
        delete(this.progress);

        if (!noEmit) {
            this.emit('move end', this, this.loc);
        }
    }
});

_.extend(NSPACE.Member.prototype, EventEmitter.prototype);
/*jshint strict:false */
/*global _ */
/*global Fools */
/*global EventEmitter */
/*global NSPACE */

NSPACE.WanderBotScanRule = function(bot, dims, reductor) {
    this.bot = bot;
    this.world = bot.world;
    this.dims = dims;

    this.reductor = reductor;
};

NSPACE.WanderBotScanRule.checkStack = function(bot, next) {
    return function(out, reg) {
        if (!bot.member.canStack(reg.loc)) {
            return out;
        } else {
            return next ? next(out, reg) : reg;
        }
    };
};

NSPACE.WanderBotScanRule.forwardBackward = function(dim, bot) {

    return function(out, reg) {
        return out && (reg.loc[dim] < out.loc[dim]) ? out : reg;
    };
};

NSPACE.WanderBotScanRule.forward = function(dim, bot) {

    return function(out, reg) {
        var botValue = bot.loc()[dim];
        if (reg.loc[dim] <= botValue) {
            return out;
        }
        return reg;
    };
};

NSPACE.WanderBotScanRule.backwardForward = function(dim, bot) {

    return function(out, reg) {
        return out && (reg.loc[dim] > out.loc[dim]) ? out : reg;
    };
};

NSPACE.WanderBotScanRule.backward = function(dim, bot) {

    return function(out, reg) {
        var botValue = bot.loc()[dim];
        if (reg.loc[dim] >= botValue) {
            return out;
        }
        return reg;
    };
};

_.extend(NSPACE.WanderBotScanRule.prototype, {

    scan: function(neighborsExcept) {
        var neighbors = this.dimNeighbors(neighborsExcept);
        return _.reduce(neighbors, this.reductor, null);
    },

    loc: function() {
        return this.bot.loc();
    },

    dimNeighbors: function(neighbors) {
        var self = this;
        if (this.dims && this.dims.length) {
            var names = _.difference(this.world.dimNames(), this.dims); // the dimensions that must NOT vary
            return _.reduce(neighbors, function(out, reg) {
                var match = _.find(names, function(name) {
                    var value = self.loc()[name];
                    var regValue = reg.loc[name];
                    if (value !== regValue) {
                        return name;
                    } else {
                        return false;
                    }
                });

                if (!match) {
                    out.push(reg);
                }

                return out;
            }, []);
        } else {
            return neighbors;
        }
    },

    test: function() {
        var self = this;

        return function(neighbors, isGood) {
            var reg = self.scan(neighbors);
            if (reg) {
                isGood();
            }
            return reg;
        };
    }
});

NSPACE.WanderBot = function(mType, world, loc, stackLimit) {
    this.member = new NSPACE.Member(mType, world, loc, stackLimit);
    this.world = world;
    this.scanRules = [];
};

_.extend(NSPACE.WanderBot.prototype, {

    loc: function() {
        return this.member.loc;
    },

    serialize: function() {
        return _.extend({wanderBot: true}, this.member.serialize());
    },

    addScanRule: function(dims, reductor) {
        var rule = new NSPACE.WanderBotScanRule(this, dims, reductor);
        this.scanRules.push(rule);
        return rule;
    },

    scan: function() {
        var gauntlet = Fools.gauntlet();

        gauntlet.if_last = function(input) {
            return false;
        };

        _.each(this.scanRules, function(rule) {
            gauntlet.add(rule.test());
        });

        var neighborsExcept = this.member.neighborsExcept();

        // console.log('calling gauntlet: %s', require('util').inspect(gauntlet));
        var out = gauntlet(neighborsExcept);

        return out;
    },

    moveTo: function(loc) {
        this.member.move(loc);
    },

    move: function() {
        var openSpace = false;
        try {
             openSpace = this.scan();
        } catch(err){

        }

        if (!openSpace) {
            return;
        }

        this.member.move(openSpace.loc);

    },

    moveAni: function(time) {

        var openSpace = this.scan();

        if (!openSpace) {
            return;
        }

        this.member.moveAni(openSpace.loc, time);
    }

});


return NSPACE;

}));