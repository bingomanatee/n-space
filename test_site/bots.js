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
