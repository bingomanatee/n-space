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