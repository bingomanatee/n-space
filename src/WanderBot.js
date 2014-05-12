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
        this.scanRules.push(new NSPACE.WanderBotScanRule(this, dims, reductor));
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
        var openSpace = this.scan();

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