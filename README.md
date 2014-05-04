# N-space -- or, "Angry Bots"

This is a library for moving things around an n-dimensional space. n-dimensional spaces can be
one-dimensional (a line), two-dimensional (a plane), three-dimensional(the real world - a cube),
or theoretical multidimensional space.

n-space is a node or client side library for managing things in space and time. It has no
render method or bias. Its measurement system is abstract, and its coordinate system is integral.

It is ideally suited as the basis for Voxel world management.

## Worlds

A World is defined off the global NSPACE variable (or the module export):

``` javascript

var world = new World({i: [0, 10], j: [0, 10]);
var world2 = new World({x: [-5, 5], y: [-5, 5], z: [-15, 15]});

```

the array values are the min/max range for the dimensional extremes, and are inclusive.
for instance the first example `[0, 10]` would allow for x values of 0, 5, or 10.
There are no constraints on dimensions -- thy don't have to be the same size,
or have the same range in any way.

Coordinates inside world space are integral; you can't have members with fractional/decimal
coordinates.

internally Worlds contain a `cells` array that is a nested reflection of the coordinate system.

### Reflection Methods and Properties

You can get a lot of information about the world and its dimensional systems.

Worlds have two reflection properties:

* `dim` (the initial argument you passed in)
* `dimArray` ( a more verbose array -- `[{name: 'i', min: 0, max: 10}, {name: 'j', min: 0, max: 10}]`.
  This is particularly useful for determining the nesting order of the `cells` array.
* `dimNames():[{string}]` gives you the names in the dimArray (a sugar for plucking names).
* `serialize(): [{registry serialzied}]` the current state of the world.

### tests and filters for location

* `locInRange(loc):boolean` can determine whether a coordinate is within the range of the coordinates.
* `goodLoc(loc):boolean` determines whether the location has the reqauired dimensions (and valid coordinate numbers).

Note -- these two tests are mutually exclusive - you can pass `goodLoc(l)` and fail `locInRange(l)`.
calling `locInRange(loc, true)` calls goodLoc internally first.

## Members

A member is anything residing in world space. More than one member can occupy the same
coordinates, but there are sensor methods to allow you to pervent/coordinate stacking with
application logic.

### (Constructor)

The member constructor is `new NSPACE.Member(mType {String/Number}, world {NSPACE.World}, loc {Object}, stackLimit {Number})`;

The member constructor requires only the first two properties at creation.

## Properties

A member has the following properties:

* `mid` {Number} an incrementing positive number reflecting creation order.
* `loc` {Object} (short for location) - a hash of coordinate values like `{i: 4, j: 2}`.
* `mType` {String/Number} the "class" of thing the member is. Members are stored by mType when
  they are added to the world.
* `stackLimit` {Number} the maximum number of this type of members that can be stored in the same
  world coordinate. default: 1

## Methods

* `canStack(loc {Object}): {boolean}` determines whether a given cell is "full" of these type of things.
* `addToWorld(loc {Object}, world {NSPACE.World})` sets the location of the member in the world.
  Both properties are optional and will set the member's loc/world properties. **emits 'at':member**
* `remove()` removes the member from the world. Does not affect location. *emits 'removed':member**
* `move(loc {Object})` shorthand for a call to `remove()` and `addToWorld(loc)`.
* `moveAni(time: {Number (milliseconds)}` moves incrementally to a new location.
  At the end of the animated move, `endMoveAni()` is called, and the member is actually moved,
  emitting **emit:'move end':member**.
  Overlapping moveAni calls will cancel each other out (casing an **'emit:'move stop':member**)
  As it moves, the member emits **'slide progress':member**.
  * `slideLoc(): {Object}` will give you a fractional locaiton object
   reflecting the interpolated position of the member. This value is NOT the same as the loc property
   of the member.
  * `progress: {Number 0..1}` is a fractional value that increases from 0...1 over the timespan of the move
* `endMoveAni(moveToEnd: {boolean}, noEmit: {boolean})` allows you to cancel or force completion of
  a current animated move.

## Registers

The World is a nested array whose leaf members are instances of `Registry` created on world instantiateion.
The registry is a catalog of members of a given location, organized by `mType`. N-space is designed
to warehouse members in the registry but any thing can be aded to the registry
through the `add(item {any}, iType {String/Number}` method of a Register.

Registers can be got from the world through the `world.getRegistry(loc)` method.

### Methods

* `equals(loc {Object}): {boolean}` tests whether the registry is cataloging for a given location.
* `serialize(): {json}` a more human-readable description of the registry. Will serialize its' contents that have a serialize method.
* `has(iType {String/Number}): {boolean}` tests if the register has one or more member of a given type
* `add(item {any}, iType {String/Number})` adds a member to the register
* `remove(item {any}, iType {String/Number})` removes a member from the register

## WanderBots

WanderBots is a template for "Intelligent member management". They can be programmed to move using a
basic set of "scan rules".

A scan rule is a rule that takes in a set of neighbors and reduces them to one (or no) eligable
registers to which the bot can move. The code below shows how you can create rules that both move the
bots forward along axes and respect stacking order.

Bots are built on members that are constructed internally with the given type on construction:

`var bot = new NSPACE.WanderBot('myType', world, loc)`

### Methods

* `loc() {Object}` sugar for bot.member.loc
* `addScanRule(dims [{string}], reductor {function})` creates a rule determining a "Legal move" for the bot.
  The bot will attempt to make a legal move by finding the first ScanRule that provides an "open loc" that the bot
  can go to.
  * The first argument reduces movemnt to a given set of axes; for instance a rule with dims of `['x']` will
    reduce the legal moves to 1 + the bot's current 'x' coordinate and 1 - the bots' current 'x' coordinate.
  * The second argument is used as a map-reduce function to winnow down the legal neighbors to a single neighbor (or none).

Note that the NSPACE.WanderBotScanRule has a few 'built in' reductor factories:

* `NSPACE.WanderBotScanRule.forward(dim)` returns a function that will move the bot forward in the given dimension.
* `NSPACE.WanderBotScanRule.forwardBackward` returns a function that will move the bot forward if possible,
  or backward along a given dimension.
* 'NSPACE.WanderBotScanRule.backward(dim)` returns a function that will move the bot backwaard.
* `NSPACE.WanderBotScanRule.backwardForward` returns a function that will move the bot backward if possible,
  or forward along a given dimension.
* `NSPACE.WanderBotScanRule.checkStack(bot, nextReductor {function})` decorates another rule by first removing all
  candiadates where the bot cannot stack. 

### Bot Example

This example is in the `test_site` included in this module.

These bots also create and move a DIV related to their memberid.

``` javascript

    var bot = new NSPACE.WanderBot('bot', world, loc);

    bot.addScanRule(['i'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('i', bot))); // move on I -- forward preferred
    bot.addScanRule(['j'],
        NSPACE.WanderBotScanRule.checkStack(bot, NSPACE.WanderBotScanRule.forward('j', bot))); // move on J -- forward preferred

    function moveMember(member) {
        var loc = member.loc;
        var ele = document.getElementById('member-' + member.mid);
        ele.style.left = (loc.i * 50) + 'px';
        ele.style.top = (loc.j * 50) + 'px';
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
                makeBot(loc);
            } else {
                console.log('cannot add bot into ', loc);
            }
        }, 100);
    });

    bot.member.on('slide progress', function (member, loc) {
        slideMember(member, loc);
    });

    setInterval(function () {
        bot.moveAni(100);
    }, 1000);

    document.body.insertAdjacentHTML('afterend', _div(bot));

```