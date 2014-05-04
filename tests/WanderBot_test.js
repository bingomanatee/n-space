var NSPACE = require('./../n-space');
var tap = require('tap');
var util = require('util');

tap.test('wanderBot', function (wb) {

    wb.test('scan', function (wbs) {

        var world = new NSPACE.World({i: [0, 2], j: [0, 2]});

        var bot = new NSPACE.WanderBot('rook', world, {i: 1, j: 1});

        bot.addScanRule(['i'], NSPACE.WanderBotScanRule.forwardBackward('i', bot)); // move on I -- forward preferred
        bot.addScanRule(['j'], NSPACE.WanderBotScanRule.forward('j', bot)); // move on J -- forward preferred

        bot.addScanRule(['i'], NSPACE.WanderBotScanRule.backwardForward('i', bot)); // move on I -- forward preferred
        bot.addScanRule(['j'], NSPACE.WanderBotScanRule.backward('j', bot)); // move on J -- forward preferred

        wbs.test('move from middle', function (mfm) {

            bot.moveTo({i: 1, j: 1});

            var neighborsExcept = bot.member.neighborsExcept();
            var test0 = bot.scanRules[0].scan(neighborsExcept);
            mfm.deepEqual(test0.loc, {i: 2, j: 1}, 'first rule: move i ahead or behind');

            var test1 = bot.scanRules[1].scan(neighborsExcept);
            mfm.deepEqual(test1.loc, {i: 1, j: 2}, 'second rule: move j ahead');

            var test2 = bot.scanRules[2].scan(neighborsExcept);
            mfm.deepEqual(test2.loc, {i: 0, j: 1}, 'third rule: move i behind or ahead');

            var test3 = bot.scanRules[3].scan(neighborsExcept);
            mfm.deepEqual(test3.loc, {i: 1, j: 0}, 'fourth rule: move j behind');

            mfm.end();
        });

        wbs.test('move from 0, 0', function (mfm) {

            bot.moveTo({i: 0, j: 0});
            var neighborsExcept = bot.member.neighborsExcept();

            var test0 = bot.scanRules[0].scan(neighborsExcept);
            mfm.deepEqual(test0.loc, {i: 1, j: 0}, 'first rule: move i ahead or behind');

            var test1 = bot.scanRules[1].scan(neighborsExcept);
            mfm.deepEqual(test1.loc, {i: 0, j: 1}, 'second rule: move j ahead');

            var test2 = bot.scanRules[2].scan(neighborsExcept);
            mfm.deepEqual(test2.loc, {i: 1, j: 0}, 'third rule: move i behind or ahead');

            var test3 = bot.scanRules[3].scan(neighborsExcept);
            mfm.ok(!test3, 'fourth rule: move j behind (no result)');

            mfm.end();
        });

        wbs.test('move from 2, 2', function (mfm) {

            bot.moveTo({i: 2, j: 2});
            var neighborsExcept = bot.member.neighborsExcept();

            var test0 = bot.scanRules[0].scan(neighborsExcept);
            mfm.deepEqual(test0.loc, {i: 1, j: 2}, 'first rule: move i ahead or behind');

            var test1 = bot.scanRules[1].scan(neighborsExcept);
            mfm.ok(!test1, 'second rule: move j ahead (no result)');

            var test2 = bot.scanRules[2].scan(neighborsExcept);
            mfm.deepEqual(test2.loc, {i: 1, j: 2}, 'third rule: move i behind or ahead');

            var test3 = bot.scanRules[3].scan(neighborsExcept);
            mfm.deepEqual(test3.loc, {i: 2, j: 1}, 'fourth rule: move j behind ');

            mfm.end();
        });

        wbs.end();
    });

     wb.test('move', function (wbm) {
     var world = new NSPACE.World({i: [0, 2], j: [0, 2]});

     var bot = new NSPACE.WanderBot('rook', world, {i: 0, j: 0});

     bot.addScanRule(['i'], NSPACE.WanderBotScanRule.forward('i', bot)); // move on I -- forward preferred
     bot.addScanRule(['j'], NSPACE.WanderBotScanRule.forward('j', bot)); // move on J -- forward preferred

     console.log('--- moving---');
     bot.move();
     wbm.deepEqual(bot.loc(), {i: 1, j: 0}, 'move forward');
     bot.move();
     wbm.deepEqual(bot.loc(), {i: 2, j: 0}, 'move forward');
     bot.move();
     wbm.deepEqual(bot.loc(), {i: 2, j: 1}, 'move down');
     bot.move();
     wbm.deepEqual(bot.loc(), {i: 2, j: 2}, 'move down');
     wbm.ok(!bot.move(), 'no legal moves left');
     wbm.deepEqual(bot.loc(), {i: 2, j: 2}, 'did not move');

     wbm.end();
     });

     wb.test('move around obstacles', function (wbm) {
     var world = new NSPACE.World({i: [0, 2], j: [0, 2]});

     var bot = new NSPACE.WanderBot('rook', world, {i: 0, j: 0});
     bot.member.stackLimit = 1;
     bot.addScanRule(['i'],
         NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('i', bot))); // move on I -- forward preferred
     bot.addScanRule(['j'],
         NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('j', bot))); // move on J -- forward preferred

     var block = new NSPACE.Member('rook', world, {i: 2, j: 0});
     block.addToWorld(); // block is now in bots way

     bot.move();
     // console.log('bot: %s', util.inspect(bot.serialize()));
     wbm.deepEqual(bot.member.loc, {i: 1, j: 0}, 'block move forward');
     bot.move();
     // console.log('bot: %s', util.inspect(bot.serialize()));
     wbm.deepEqual(bot.member.loc, {i: 1, j: 1}, 'block move forward');
     bot.move();
     // console.log('bot: %s', util.inspect(bot.serialize()));
     wbm.deepEqual(bot.member.loc, {i: 2, j: 1}, 'block move down');
     bot.move();
     //  console.log('bot: %s', util.inspect(bot.serialize()));
     wbm.deepEqual(bot.member.loc, {i: 2, j: 2}, 'block move down');
     wbm.ok(!bot.move(), 'block no legal moves left');
     wbm.deepEqual(bot.member.loc, {i: 2, j: 2}, 'block did not move');

     wbm.end();
     });

    wb.end();
});