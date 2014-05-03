(function(root, factory) {
    if(typeof exports === 'object') {
        module.exports = factory(require('lodash'), require('fools'));
    }
    else if(typeof define === 'function' && define.amd) {
        define('NSPACE', ['_', 'Fools'], factory);
    }
    else {
        root['NSPACE'] = factory(root._, root.Fools);
    }
}(this, function(_, Fools) {

var NSPACE = {
  reset: function(){
    mid = 0;
    rid = 0;
  }
};
var rid = 0;
NSPACE.Register = function (world, location) {
  this.loc = location;
  this.world = world;
  this.content = {};
  this.rid = ++rid;
};

_.extend(NSPACE.Register.prototype, {
  t: 'Register',

  serialize: function () {
    var out = _.clone(this.loc);
    out.content = _.clone(this.content);
    _.each(out.content, function(items, iType){
      out.content[iType] = _.reduce(items, function(out, item){
        if (item.serialize && _.isFunction(item.serialize)){
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

  get: function(iType){
    if (!this.has(iType)) {
      return [];
    }
    return this.content[iType].slice(0);
  },

  has: function(iType){
    return this.content.hasOwnProperty(iType) && this.content[iType].length;
  },

  add: function (item, iType) {
    if (!iType) {
      iType = '___content';
    }

    if (this.content[iType]) {
      this.content[iType].push(item);
    } else {
      this.content[iType] = [item];
    }
  },

  remove: function (item, iType) {
    //console.log('inspecting %s for %s', require('util').inspect(this.loc), iType);
    if (this.content.hasOwnProperty(iType) && this.content[iType] && _.isArray(this.content[iType])) {
    //  console.log('removing %s from %s', require('util').inspect(item), require('util').inspect(this.loc));
      this.content[iType] = _.difference(this.content[iType], [item]);
      if (!this.content[iType].length){
        delete this.content[iType];
      }
    }
  }

});
NSPACE.World = function (dims) {
  if (dims) {
    this.init(dims);
  } else {
    this.dims = {};
  }
};

_.extend(NSPACE.World.prototype, {

  serialize: function () {
    var reg = _.flatten(this.cells);
    reg = _.map(reg, function (r) {
      return r.serialize();
    });

    var dims = _.pluck(this.dimArray, 'name');
    dims.unshift(reg);

    return _.sortBy.apply(_, dims);
  },

  add: function (item, iType, loc) {
    this.goodType(iType, 'add');
    this.goodLoc(loc, 'add');
    var reg = this.getRegistry(loc);
    if (reg) {
      reg.add(item, iType);
    } else {
      throw ('cannot get registry');
    }
  },

  remove: function (item, iType, loc) {
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
      _.each(this.registries(), function (reg) {
        reg.remove(item, iType);
      });
    }
  },

  goodType: function(iType, msg){
    if (!(iType && (_.isString(iType) || _.isNumber(iType)))){
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
  goodLoc: function (loc, msg) {
    if (!(loc && _.isObject(loc))) {
      throw  'World.' + (msg || 'goodLoc') + ': missing or non-object location';
    }
    for (var dimName in this.dims) {
      if (!loc.hasOwnProperty(dimName)) {
        throw  'World.' + (msg || 'goodLoc') + ': loc missing parameter ' + dimName;
      } else if (!_.isNumber(loc[dimName])){
        throw 'World.' + (msg || 'goodLoc') + ': non numeric ' + dimName;
      }
    }
  },

  /**
   * returns the registries of all the locations
   * adjacent to the location BUT not at the location.
   * the range is +/1 i in the dimensions of search.
   * by default the dimensions of sort are all the dimensions in the world
   * however dimensions can also be passed in as subsequent parameters.
   * @param loc {object}
   */
  neighbors: function (loc) {
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

    var loop = Fools.loop(function (item) {

    });
    _.each(dims, function (name) {
      if (!this.dims.hasOwnProperty(name)) {
        throw ('neighbors:bad dim ' + name);
      }
      var dim = this.dims[name];
      var min = dim[0];
      var max = dim[1];

      loop.dim(name, min, max);
    }, this);
  },

  registries: function () {
    if (!this._registries) {
      this._registries = _.flatten(this.cells);
    }
    return this._registries;
  },

  getRegistry: function (loc) {
    this.goodLoc(loc, 'getRegistry');
    var self = this;
    var coords = _.pluck(this.dimArray, 'name');
    var reg = _.reduce(coords, function (cells, name) {
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
      return cells[index];
    }, this.cells);

    if (reg.t != 'Register') {
      throw ('World.getRegistry:bad request');
    }

    return reg;
  },
  
  goodDims: function(){
    var count = 0;
    for (var dim in this.dims){
      ++count;
      var range = this.dims[dim];
      if (range.length < 2){
        throw 'missing range data for ' + dim;
      }
      var min = range[0];
      if (!_.isNumber(min)) throw 'non numeric min for ' + dim;
      if (min != Math.floor(min)) throw 'fractional min for ' + dim;

      var max = range[1];
      if (!_.isNumber(max)) throw 'non numeric max for ' + dim;
      if (max != Math.floor(max)) throw 'fractional max for ' + dim;

      if (max < min){
        throw 'Bad range for ' + dim;
      }
    }
    
    if (count === 0){
      throw ('must have at least one dim');
    }
  },

  init: function (dims) {
    if (dims) {
      this.dims = dims;
    }
    this.goodDims();
    this._registries = false;

    this.dimArray = _.map(this.dims, function (range, name) {
      return{name: name, min: range[0], max: range[1]};
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

        return _.map(_.range(min, max + 1), function (value) {
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
/**
 * A member is a resident of the world at a single location.
 * @param world {NSPACE.World}
 * @param mType {string} the name of the member's type.
 * @param loc {object} a location in world space
 * @param stackLimit {int} >= 1 -- the number of members that can occupy the same coordinate. if 0, unlimited
 * @constructor
 */
var mid = 0;
NSPACE.Member = function (mType, world, loc, stackLimit) {
  this.mid = ++mid;
  this.world = world;
  this.loc = loc || null;
  this.mType = mType || '__member';
  this.stackLimit = stackLimit ? stackLimit : 1;
};

_.extend(NSPACE.Member.prototype, {

  serialize: function () {
    return {mid: this.mid};
  },

  /**
   * used to either add a member to a world or move it within its world
   * @param loc {object} a location in world space
   * @param world {NSPACE.World}
   */
  addToWorld: function (loc, world) {
    if (world) {
      this.world = world;
    }

    if (!this.canStack(loc || this.loc)){
      return false;
    }
    if (this.loc) {
      this.world.remove(this, this.mType, this.loc);
    }

    if (loc) {
      this.loc = loc;
    }
    this.world.add(this, this.mType, this.loc);
    return true;
  },

  canStack: function(loc){
    if (this.stackLimit <= 0){
      return true;
    }
    var reg = this.world.getRegistry(loc);
    if (!reg.has(this.mType)){
      return true;
    }

    var count = _.reduce(reg.get(this.mType), function(count, item){
      if (!item){
        return count;
      } else if (item.mid == this.mid) {
        return count;
      } else {
        return count + 1;
      }
    }, 0, this);

    return count < this.stackLimit;
  },

  remove: function (all) {
    this.world.remove(this, this.mType, all ? null : this.loc);
  },

  move: function (loc) {
    this.remove();
    this.addToWorld(loc);
  },

  moveAni: function (loc, msec, interval) {

    if (this._moving) {
      this.endMoveAni((this.moveAniTime() / this.move_msec) > 0.5);
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

  moveAniTime: function () {
    var t = new Date().getTime();
    return t - this.move_time;
  },

  slide: function () {
    var dur = this.moveAniTime();
    if (dur > this.move_msec) {
      this.endMoveAni(true);
    } else {
      this.from_stub.progress = this.to_stub.progress = this.progress = dur / this.move_msec;
    }
  },

  endMoveAni: function (moveToEnd) {
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
  }
});

return NSPACE;

}));
