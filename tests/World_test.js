var NSPACE = require('./../n-space');
var tap = require('tap');
var util = require('util');
var _ = require('lodash');

tap.test('world', function(t) {

    t.test('type checking', function(tc) {

        var world = new NSPACE.World({i: [0, 2], j: [0, 2]});

        tc.test('goodDim', function(gd) {

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
                new NSPACE.World({i: [1, 3], j: [0, 2]});
            } catch (err) {
                gd.ok(true, err);
                ++errors;
            }

            try {
                new NSPACE.World({i: [1, 1], j: [0, 2]});
            } catch (err) {
                gd.ok(false, err);
                ++errors;
            }

            gd.equal(errors, expectedErrors, 'found ' + expectedErrors + ' errors');

            gd.end();
        });

        tc.test('goodType', function(gt) {

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

        tc.test('goodLoc', function(gl) {

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

        tc.test('locInRange', function(lin) {
            var inRange = 0;
            var inRangeExpected = 0;
            var tests = 0;

            ++inRangeExpected;
            ++tests;
            inRange += world.locInRange({i: 0, j: 0}) ? 1 : 0;

            ++inRangeExpected;
            ++tests;
            inRange += world.locInRange({i: 1, j: 1}) ? 1 : 0;

            inRange += world.locInRange({i: 0, j: -1}) ? 1 : 0;
            ++tests;

            inRange += world.locInRange({i: -1, j: -1}) ? 1 : 0;
            ++tests;

            ++inRangeExpected;
            inRange += world.locInRange({i: 2, j: 2}) ? 1 : 0;
            ++tests;

            inRange += world.locInRange({i: 2, j: 3}) ? 1 : 0;
            ++tests;

            lin.equal(inRange, inRangeExpected, inRangeExpected + ' locs in range in ' + tests + ' tests');
            lin.end();
        });

        tc.end();

    });

    t.test('dims', function(d) {
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

    t.test('add', function(a) {

        a.test('removing with location', function(al) {
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

        a.test('removing without location', function(awl) {
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

    t.test('neighbors', function(n) {
        var world = new NSPACE.World({x: [0, 5], y: [0, 5], z: [0, 5]});

        var neighbors = world.neighbors({x: 2, y: 2, z: 2});

        function _ser(n) {
            return n.serialize();
        }

        var ns = neighbors.map(_ser);
        n.deepEqual(ns, [
            { z: 1, y: 1, x: 1, content: {} },
            { z: 1, y: 1, x: 2, content: {} },
            { z: 1, y: 1, x: 3, content: {} },
            { z: 1, y: 2, x: 1, content: {} },
            { z: 1, y: 2, x: 2, content: {} },
            { z: 1, y: 2, x: 3, content: {} },
            { z: 1, y: 3, x: 1, content: {} },
            { z: 1, y: 3, x: 2, content: {} },
            { z: 1, y: 3, x: 3, content: {} },
            { z: 2, y: 1, x: 1, content: {} },
            { z: 2, y: 1, x: 2, content: {} },
            { z: 2, y: 1, x: 3, content: {} },
            { z: 2, y: 2, x: 1, content: {} },
            { z: 2, y: 2, x: 2, content: {} },
            { z: 2, y: 2, x: 3, content: {} },
            { z: 2, y: 3, x: 1, content: {} },
            { z: 2, y: 3, x: 2, content: {} },
            { z: 2, y: 3, x: 3, content: {} },
            { z: 3, y: 1, x: 1, content: {} },
            { z: 3, y: 1, x: 2, content: {} },
            { z: 3, y: 1, x: 3, content: {} },
            { z: 3, y: 2, x: 1, content: {} },
            { z: 3, y: 2, x: 2, content: {} },
            { z: 3, y: 2, x: 3, content: {} },
            { z: 3, y: 3, x: 1, content: {} },
            { z: 3, y: 3, x: 2, content: {} },
            { z: 3, y: 3, x: 3, content: {} }
        ], 'neighbors from middle');

        var neighborsE = world.neighborsExcept({x: 2, y: 2, z: 2});

        var nsE = neighborsE.map(_ser);
        n.deepEqual(nsE, [
            { z: 1, y: 1, x: 1, content: {} },
            { z: 1, y: 1, x: 2, content: {} },
            { z: 1, y: 1, x: 3, content: {} },
            { z: 1, y: 2, x: 1, content: {} },
            { z: 1, y: 2, x: 2, content: {} },
            { z: 1, y: 2, x: 3, content: {} },
            { z: 1, y: 3, x: 1, content: {} },
            { z: 1, y: 3, x: 2, content: {} },
            { z: 1, y: 3, x: 3, content: {} },
            { z: 2, y: 1, x: 1, content: {} },
            { z: 2, y: 1, x: 2, content: {} },
            { z: 2, y: 1, x: 3, content: {} },
            { z: 2, y: 2, x: 1, content: {} },
            { z: 2, y: 2, x: 3, content: {} },
            { z: 2, y: 3, x: 1, content: {} },
            { z: 2, y: 3, x: 2, content: {} },
            { z: 2, y: 3, x: 3, content: {} },
            { z: 3, y: 1, x: 1, content: {} },
            { z: 3, y: 1, x: 2, content: {} },
            { z: 3, y: 1, x: 3, content: {} },
            { z: 3, y: 2, x: 1, content: {} },
            { z: 3, y: 2, x: 2, content: {} },
            { z: 3, y: 2, x: 3, content: {} },
            { z: 3, y: 3, x: 1, content: {} },
            { z: 3, y: 3, x: 2, content: {} },
            { z: 3, y: 3, x: 3, content: {} }
        ], 'neighborsExcept from middle');

        var neighbors2 = world.neighbors({x: 2, y: 2, z: 2}, 'x');
        var ns2 = neighbors2.map(_ser);
        n.deepEqual(ns2, [
            { z: 2, y: 2, x: 1, content: {} },
            { z: 2, y: 2, x: 2, content: {} },
            { z: 2, y: 2, x: 3, content: {} }
        ], 'neighbors with x dimension');

        var neighbors3 = world.neighbors({x: 0, y: 0, z: 0});
        var ns3 = neighbors3.map(_ser);
        n.deepEqual(ns3, [
            { z: 0, y: 0, x: 0, content: {} },
            { z: 0, y: 0, x: 1, content: {} },
            { z: 0, y: 1, x: 0, content: {} },
            { z: 0, y: 1, x: 1, content: {} },
            { z: 1, y: 0, x: 0, content: {} },
            { z: 1, y: 0, x: 1, content: {} },
            { z: 1, y: 1, x: 0, content: {} },
            { z: 1, y: 1, x: 1, content: {} }
        ], 'neighbors at corner');

        var neighbors4 = world.neighbors({x: 1, y: 1, z: 2});
        var ns4 = neighbors4.map(_ser);
        n.deepEqual(ns4,
            [
                { z: 1, y: 0, x: 0, content: {} },
                { z: 1, y: 0, x: 1, content: {} },
                { z: 1, y: 0, x: 2, content: {} },
                { z: 1, y: 1, x: 0, content: {} },
                { z: 1, y: 1, x: 1, content: {} },
                { z: 1, y: 1, x: 2, content: {} },
                { z: 1, y: 2, x: 0, content: {} },
                { z: 1, y: 2, x: 1, content: {} },
                { z: 1, y: 2, x: 2, content: {} },
                { z: 2, y: 0, x: 0, content: {} },
                { z: 2, y: 0, x: 1, content: {} },
                { z: 2, y: 0, x: 2, content: {} },
                { z: 2, y: 1, x: 0, content: {} },
                { z: 2, y: 1, x: 1, content: {} },
                { z: 2, y: 1, x: 2, content: {} },
                { z: 2, y: 2, x: 0, content: {} },
                { z: 2, y: 2, x: 1, content: {} },
                { z: 2, y: 2, x: 2, content: {} },
                { z: 3, y: 0, x: 0, content: {} },
                { z: 3, y: 0, x: 1, content: {} },
                { z: 3, y: 0, x: 2, content: {} },
                { z: 3, y: 1, x: 0, content: {} },
                { z: 3, y: 1, x: 1, content: {} },
                { z: 3, y: 1, x: 2, content: {} },
                { z: 3, y: 2, x: 0, content: {} },
                { z: 3, y: 2, x: 1, content: {} },
                { z: 3, y: 2, x: 2, content: {} }
            ], 'near a wall');

        n.end();
    });

    t.test('ifRange', function(iir) {
        var world = new NSPACE.World({i: [-1, 1], j: [-1, 1]});

        iir.test('single crit, single value', function(scsv){
            var good = [];
            var bad = [];

            world.ifRange({i: 0}, function(reg) {
                //     console.log('good reg added: %s', util.inspect(reg.loc));
                good.push(reg);
            }, function(reg) {
                //   console.log('bad reg added: %s', util.inspect(reg.loc));
                bad.push(reg);
            });

            _.each(good, function(reg) {
                scsv.ok(reg.loc, 'good contains reg');
                scsv.equal(reg.loc.i, 0, 'good is a good value');
            });

            scsv.equal(good.length, 3);

            _.each(bad, function(reg) {
                scsv.ok(reg.loc, 'bad contains reg');
                scsv.ok(reg.loc.i !== 0, 'bad is a bad value');
            });

            scsv.equal(bad.length, 6);

            scsv.end();
        });

        iir.test('two crit, array value', function(scsv){
            var good = [];
            var bad = [];

            world.ifRange({i: [0,1], j: [0,1]}, function(reg) {
                //     console.log('good reg added: %s', util.inspect(reg.loc));
                good.push(reg);
            }, function(reg) {
                //   console.log('bad reg added: %s', util.inspect(reg.loc));
                bad.push(reg);
            });

        //    console.log('ac good values: ', _.pluck(good, 'loc'));

         //   console.log('ac bad values: ', _.pluck(bad, 'loc'));

            scsv.equal(good.length, 4);
            scsv.equal(bad.length, 5);

            _.each(good, function(reg) {
                scsv.ok(reg.loc, 'good contains reg');
                scsv.ok(reg.loc.i>= 0 && reg.loc.j >= 0, 'good is a good value');
            });


            _.each(bad, function(reg) {
                scsv.ok(reg.loc, 'bad contains reg');
                scsv.ok(reg.loc.i < 0 || reg.loc.j < 0, 'bad is a bad value');
            });


            scsv.end();
        });
        iir.test('two crit, single value', function(scsv){
            var good = [];
            var bad = [];

            world.ifRange({i: 0, j: 0}, function(reg) {
                //     console.log('good reg added: %s', util.inspect(reg.loc));
                good.push(reg);
            }, function(reg) {
                //   console.log('bad reg added: %s', util.inspect(reg.loc));
                bad.push(reg);
            });

        //    console.log('good values: ', _.pluck(good, 'loc'));

      //      console.log('bad values: ', _.pluck(bad, 'loc'));

            scsv.equal(good.length, 1);
            scsv.equal(bad.length, 8);

            _.each(good, function(reg) {
                scsv.ok(reg.loc, 'good contains reg');
                scsv.equal(reg.loc.i, 0, 'good is a good value');
            });


            _.each(bad, function(reg) {
                scsv.ok(reg.loc, 'bad contains reg');
                scsv.ok(reg.loc.i || reg.loc.j, 'bad is a bad value');
            });


            scsv.end();
        });

        iir.end();
    });
    t.end();
});
