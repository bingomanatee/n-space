var NSPACE = require('./../n-space');
var tap = require('tap');
var util = require('util');

tap.test('member', function (mt) {

  mt.test('add', function (a) {
    NSPACE.reset();

    var world = new NSPACE.World({x: [0, 4], y: [1, 2]});

    var member = new NSPACE.Member('bar', world);

    member.addToWorld({x: 1, y: 2});

    a.deepEqual(world.serialize(), [
      { y: 1, x: 0, content: {} },
      { y: 2, x: 0, content: {} },
      { y: 1, x: 1, content: {} },
      { y: 2, x: 1, content: { bar: [
        { mid: 1 }
      ] } },
      { y: 1, x: 2, content: {} },
      { y: 2, x: 2, content: {} },
      { y: 1, x: 3, content: {} },
      { y: 2, x: 3, content: {} },
      { y: 1, x: 4, content: {} },
      { y: 2, x: 4, content: {} }
    ], 'bar in world');

    member.remove();

    a.deepEqual(world.serialize(), [
      { y: 1, x: 0, content: {} },
      { y: 2, x: 0, content: {} },
      { y: 1, x: 1, content: {} },
      { y: 2, x: 1, content: {} },
      { y: 1, x: 2, content: {} },
      { y: 2, x: 2, content: {} },
      { y: 1, x: 3, content: {} },
      { y: 2, x: 3, content: {} },
      { y: 1, x: 4, content: {} },
      { y: 2, x: 4, content: {} }
    ], 'bar in world');

    a.end();
  });

  mt.test('move', function (m) {
    NSPACE.reset();

    var world = new NSPACE.World({x: [0, 4], y: [1, 2]});

    var member = new NSPACE.Member('traveller', world, {y: 1, x: 1});
    member.addToWorld();

    m.deepEqual(world.serialize(), [
      { y: 1, x: 0, content: {} },
      { y: 2, x: 0, content: {} },
      { y: 1, x: 1, content: {
        traveller: [
          { mid: 1 }
        ]
      } },
      { y: 2, x: 1, content: {} },
      { y: 1, x: 2, content: {} },
      { y: 2, x: 2, content: {} },
      { y: 1, x: 3, content: {} },
      { y: 2, x: 3, content: {} },
      { y: 1, x: 4, content: {} },
      { y: 2, x: 4, content: {} }
    ], 'bar in world');

    var destLoc = {x: 2, y: 2};
    member.moveAni(destLoc, 1000);

    m.deepEqual(member.to_stub.loc, destLoc, 'to stub loc is set');
    setTimeout(function () {
      // console.log('move state: %s', util.inspect(member));
      m.ok(member._moving, 'moving');
      m.ok(member.progress > 0, 'have left the station');
      m.ok(member.progress < 1, 'not there yet');

      setTimeout(function () {
        m.deepEqual(member.loc, destLoc, 'at dest');
        m.ok(!m._moving, 'no longer moving');
        m.end();
      }, 1000);
    }, 500);
  });

  mt.test('stacking', function (s) {

    var world = new NSPACE.World({x: [0, 2], y: [0, 2]});

    var m = new NSPACE.Member('stacker', world, {x: 1, y: 1});

    m.stackLimit = 2;

    s.ok(m.addToWorld());

    var m2 = new NSPACE.Member('stacker', world, {x: 1, y: 1});
    m2.stackLimit = 2;

    s.ok(m2.addToWorld());

    var m3 = new NSPACE.Member('stacker', world, {x: 1, y: 1});
    m3.stackLimit = 2;

    s.ok(!m3.addToWorld(), 'failed to a third item with a two stack limit');
    s.end();

  });

  mt.end();
});