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