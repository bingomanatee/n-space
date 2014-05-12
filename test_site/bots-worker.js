importScripts('lodash.min.js');
importScripts('fools.js');
importScripts('n-space.js');

var world = new NSPACE.World({
    i: [0, 60],
    j: [0, 60],
    k: [0, 60]
});

var _div = _.template('<div class="member" id="member-<%=member.mid %>"><%= member.mid %></div>')

function makeBot(loc) {
    var bot = new NSPACE.WanderBot('bot', world, loc);

    bot.addScanRule(['i'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('i', bot))); // move on I -- forward preferred
    bot.addScanRule(['j'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('j', bot))); // move on J -- forward preferred
    bot.addScanRule(['k'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('k', bot))); // move on J -- forward preferred

    function moveMember(member) {
        var msg = 'move ' + member.mid + ' ' + JSON.stringify(member.loc);
        postMessage(msg);
    }

    function slideMember(member) {
        var loc = member.slideLoc();
        var ele = document.getElementById('member-' + member.mid);
        ele.style.left = (loc.i * 50) + 'px';
        ele.style.top = (loc.j * 50) + 'px';
    }

    bot.member.on('at', moveMember);

    bot.member.on('leaving', function (member) {
        var loc = _.clone(member.loc);
        setTimeout(function () {
            var member = new NSPACE.Member('bot', world);
            if (member.canStack(loc)) {
         //       console.log('making bot at ', loc);
                makeBot(loc);
            } else {
           //     console.log('cannot add bot into ', loc);
            }
        }, 100);
    });

    bot.member.on('slide progress', function (member, loc) {
       // console.log('slide');
        slideMember(member, loc);
    });

    setInterval(function () {
        bot.move();
    }, 500);

    postMessage('addDom ' + _div(bot));

    return bot;
}

makeBot({i: 0, j: 0, k: 0});