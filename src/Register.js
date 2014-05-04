var rid = 0;
NSPACE.Register = function (world, location) {
  this.loc = location;
  this.world = world;
  this.content = {};
  this.rid = ++rid;
};

_.extend(NSPACE.Register.prototype, {
  t: 'Register',

  equals: function (loc) {
    var self = this;

    function notEqual(dim) {
      return loc[dim.name] != self.loc[dim.name];
    }

    var mismatch =_.find(this.world.dimArray, notEqual);

    return !mismatch;
  },

  serialize: function () {
    var out = _.clone(this.loc);
    out.content = _.clone(this.content);
    _.each(out.content, function (items, iType) {
      out.content[iType] = _.reduce(items, function (out, item) {
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

  get: function (iType) {
    if (!this.has(iType)) {
      return [];
    }
    return this.content[iType].slice(0);
  },

  has: function (iType) {
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
      if (!this.content[iType].length) {
        delete this.content[iType];
      }
    }
  }

});