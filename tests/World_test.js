var NSPACE = require('./../n-space');
var tap = require('tap');
var util = require('util');

tap.test('world', function (t) {

  t.test('type checking', function (tc) {

    var world = new NSPACE.World({i: [0, 2], j: [0, 2]});

    tc.test('goodDim', function (gd) {

      var errors = 0;
      var expectedErrors = 0;

      try {
        ++expectedErrors;
        new NSPACE.World({});
      } catch (err) {
        gd.ok(true, err);
        ++errors;
      }

      try {
        ++expectedErrors;
        new NSPACE.World({i: 1, j: [0, 2]});
      } catch (err) {
        gd.ok(true, err);
        ++errors;
      }

      try {
        ++expectedErrors;
        new NSPACE.World({i: [1, -1], j: [0, 2]});
      } catch (err) {
        gd.ok(true, err);
        ++errors;
      }

      try {
        new NSPACE.World({i: [1,3], j: [0, 2]});
      } catch (err) {
        gd.ok(true, err);
        ++errors;
      }

      try {
        new NSPACE.World({i: [1,1], j: [0, 2]});
      } catch (err) {
        gd.ok(false, err);
        ++errors;
      }

      gd.equal(errors, expectedErrors, 'found ' + expectedErrors + ' errors');

      gd.end();
    });

    tc.test('goodType', function (gt) {

      var errors = 0;

      try {
        world.goodType();
      } catch (err) {
        gt.ok(true, err);
        ++errors;
      }

      try {
        world.goodType([]);
      } catch (err) {
        gt.ok(true, err);
        ++errors;
      }

      try {
        world.goodType({});
      } catch (err) {
        gt.ok(true, err);
        ++errors;
      }

      try {
        world.goodType({});
      } catch (err) {
        gt.ok(true, err);
        ++errors;
      }

      try {
        world.goodType('');
      } catch (err) {
        gt.ok(true, err);
        ++errors;
      }

      try {
        world.goodType('foo');
      } catch (err) {
        gt.ok(false, err);
        ++errors;
      }

      try {
        world.goodType(3); // numbers are a fine type
      } catch (err) {
        gt.ok(false, err);
        ++errors;
      }

      gt.equal(errors, 5, 'five errors found');

      gt.end();

    });

    tc.test('goodLoc', function (gl) {

      var errors = 0;

      try {
        world.goodLoc();
      } catch (err) {
        gl.ok(true, err);
        ++errors;
      }

      try {
        world.goodLoc('foo');
      } catch (err) {
        gl.ok(true, err);
        ++errors;
      }

      try {
        world.goodLoc({i: 1, k: 1});
      } catch (err) {
        gl.ok(true, err);
        ++errors;
      }

      try {
        world.goodLoc({i: 1, j: 'one'});
      } catch (err) {
        gl.ok(true, err);
        ++errors;
      }

      try {
        world.goodLoc({i: 1, j: 1});
      } catch (err) {
        gl.ok(false, err);
        ++errors;
      }

      try {
        world.goodLoc({i: 10, j: 10});
      } catch (err) {
        gl.ok(false, err);
        ++errors;
      }

      gl.equal(errors, 4, 'four errors found');

      gl.end();
    });
    tc.end();

  });

  t.test('dims', function (d) {
    NSPACE.reset();
    var world = new NSPACE.World({x: [0, 4], y: [0, 4]});

    //    console.log(util.inspect(world.serialize(), {depth: 8}));

    d.deepEqual(world.serialize(), [
      { y: 0, x: 0, content: {} },
      { y: 1, x: 0, content: {} },
      { y: 2, x: 0, content: {} },
      { y: 3, x: 0, content: {} },
      { y: 4, x: 0, content: {} },
      { y: 0, x: 1, content: {} },
      { y: 1, x: 1, content: {} },
      { y: 2, x: 1, content: {} },
      { y: 3, x: 1, content: {} },
      { y: 4, x: 1, content: {} },
      { y: 0, x: 2, content: {} },
      { y: 1, x: 2, content: {} },
      { y: 2, x: 2, content: {} },
      { y: 3, x: 2, content: {} },
      { y: 4, x: 2, content: {} },
      { y: 0, x: 3, content: {} },
      { y: 1, x: 3, content: {} },
      { y: 2, x: 3, content: {} },
      { y: 3, x: 3, content: {} },
      { y: 4, x: 3, content: {} },
      { y: 0, x: 4, content: {} },
      { y: 1, x: 4, content: {} },
      { y: 2, x: 4, content: {} },
      { y: 3, x: 4, content: {} },
      { y: 4, x: 4, content: {} }
    ], '2d array');

    var world2 = new NSPACE.World({x: [1, 2], y: [1, 2], z: [3, 4]});

    d.deepEqual(world2.serialize(), [
      { z: 3, y: 1, x: 1, content: {} },
      { z: 4, y: 1, x: 1, content: {} },
      { z: 3, y: 2, x: 1, content: {} },
      { z: 4, y: 2, x: 1, content: {} },
      { z: 3, y: 1, x: 2, content: {} },
      { z: 4, y: 1, x: 2, content: {} },
      { z: 3, y: 2, x: 2, content: {} },
      { z: 4, y: 2, x: 2, content: {} }
    ], 'nonzero 3d array');

    d.end();
  });

  t.test('add', function (a) {

    a.test('removing with location', function (al) {
      NSPACE.reset();

      var world = new NSPACE.World({x: [1, 3], y: [1, 3]});

      var foo = {n: 1, m: 2};
      var loc = {x: 2, y: 3};
      world.add(foo, 'foo', loc);

      // console.log('worldafter: ', util.inspect(world.serialize(), {depth: 8}) );

      al.deepEqual(world.serialize(), [
        { y: 1, x: 1, content: {} },
        { y: 2, x: 1, content: {} },
        { y: 3, x: 1, content: {} },
        { y: 1, x: 2, content: {} },
        { y: 2, x: 2, content: {} },
        { y: 3, x: 2, content: { foo: [
          { n: 1, m: 2 }
        ] } },
        { y: 1, x: 3, content: {} },
        { y: 2, x: 3, content: {} },
        { y: 3, x: 3, content: {} }
      ], 'foo added to world');

      world.remove(foo, 'foo', loc);

      al.deepEqual(world.serialize(), [
        { y: 1, x: 1, content: {} },
        { y: 2, x: 1, content: {} },
        { y: 3, x: 1, content: {} },
        { y: 1, x: 2, content: {} },
        { y: 2, x: 2, content: {} },
        { y: 3, x: 2, content: {} },
        { y: 1, x: 3, content: {} },
        { y: 2, x: 3, content: {} },
        { y: 3, x: 3, content: {} }
      ], 'foo removed');

      al.end();
    });

    a.test('removing without location', function (awl) {
      NSPACE.reset();

      var world = new NSPACE.World({x: [1, 3], y: [1, 3]});

      var foo = {n: 1, m: 2};
      world.add(foo, 'foo', {x: 2, y: 3});

      // console.log('worldafter: ', util.inspect(world.serialize(), {depth: 8}) );

      awl.deepEqual(world.serialize(), [
        { y: 1, x: 1, content: {} },
        { y: 2, x: 1, content: {} },
        { y: 3, x: 1, content: {} },
        { y: 1, x: 2, content: {} },
        { y: 2, x: 2, content: {} },
        { y: 3, x: 2, content: { foo: [
          { n: 1, m: 2 }
        ] } },
        { y: 1, x: 3, content: {} },
        { y: 2, x: 3, content: {} },
        { y: 3, x: 3, content: {} }
      ], 'foo added to world');

      world.remove(foo, 'foo');

      awl.deepEqual(world.serialize(), [
        { y: 1, x: 1, content: {} },
        { y: 2, x: 1, content: {} },
        { y: 3, x: 1, content: {} },
        { y: 1, x: 2, content: {} },
        { y: 2, x: 2, content: {} },
        { y: 3, x: 2, content: {} },
        { y: 1, x: 3, content: {} },
        { y: 2, x: 3, content: {} },
        { y: 3, x: 3, content: {} }
      ], 'foo removed');

      awl.end();
    });

    a.end();
  });

  t.end();
});
