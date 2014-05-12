var botsWorker = new Worker('bots-worker.js');

var addDomRE = /^addDom (.*)/;
var moveRE = /^move ([\d]+) (.*)/;
botsWorker.onmessage = function(msg){
    //console.log(msg);
    var d = msg.data;
    if (addDomRE.test(d)){
        document.body.insertAdjacentHTML('afterend', addDomRE.exec(d)[1]);
    } else if (moveRE.test(d)){
        var match = moveRE.exec(d);
        var mid = parseInt(match[1]);
        var loc = JSON.parse(match[2]);
        moveMember(mid, loc);
    }
};

function moveMember(mid, loc) {
    var ele = document.getElementById('member-' + mid);
    ele.style.left = (loc.i * 25 + loc.k * 3) + 'px';
    ele.style.top = (loc.j * 25 + loc.k * 3) + 'px';
    ele.style.zIndex = loc.k;
    var v = ((loc.k  * 10) % 255);
    ele.style.backgroundColor = 'rgb(' + loc.k + ',' + v + ',' + v + ')';
}

/*

var world = new NSPACE.World({
    i: [0, 60],
    j: [0, 60],
    k: [0, 60]
});

var _div = _.template('<div class="member" id="member-<%=member.mid %>"><%= member.mid %></div>');

function makeBot(loc) {
    var bot = new NSPACE.WanderBot('bot', world, loc);

    bot.addScanRule(['i'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('i', bot))); // move on I -- forward preferred
    bot.addScanRule(['j'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('j', bot))); // move on J -- forward preferred
    bot.addScanRule(['k'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('k', bot))); // move on J -- forward preferred

    function moveMember(member) {
        var loc = member.loc;
        var ele = document.getElementById('member-' + member.mid);
        ele.style.left = (loc.i * 25 + loc.k * 3) + 'px';
        ele.style.top = (loc.j * 25 + loc.k * 3) + 'px';
        ele.style.zIndex = loc.k;
        var v = ((loc.k  * 10) % 255);
        ele.style.backgroundColor = 'rgb(' + loc.k + ',' + v + ',' + v + ')';
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
        console.log('slide');
        slideMember(member, loc);
    });

    setInterval(function () {
        bot.move();
    }, 200);

    document.body.insertAdjacentHTML('afterend', _div(bot));

    return bot;
}

makeBot({i: 0, j: 0, k: 0});*/
