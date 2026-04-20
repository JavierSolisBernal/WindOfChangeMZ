(() => {

    //HELPERS
    //TRUNCATE
    const clamp = function (n, decimals = 6) {
        const factor = 10 ** decimals;
        return Math.round((n + Number.EPSILON) * factor) / factor;
    }

    //DIAGONALLY PASSABILITY
    const canMoveDiagonal = function (x, y, dx, dy) {
        // horizontal + vertical checks separately
        const horzDir = dx > 0 ? 6 : 4;
        const vertDir = dy > 0 ? 2 : 8;

        const canHorz = $gameMap.isPassable(x, y, horzDir);
        const canVert = $gameMap.isPassable(x, y, vertDir);

        return canHorz && canVert;
    }

    // =====================================================
    // DIRECTION TABLE
    // =====================================================
    const DIR = {
        1: [-1, 1],
        2: [0, 1],
        3: [1, 1],
        4: [-1, 0],
        6: [1, 0],
        7: [-1, -1],
        8: [0, -1],
        9: [1, -1]
    };

    // =====================================================
    // LASER (LOGIC ONLY)
    // =====================================================
    class Laser {
        constructor(dir, turnedOn = false) {
            this.startDirection = dir;
            this.turnedOn = turnedOn;

            this.path = [];
            this.needRefresh = true;
            this.needRedraw = true;
        }

        markDirty() {
            this.needRefresh = true;
            this.needRedraw = true;
        }

        turnOnOff(state) {
            if (this.turnedOn !== state) {
                this.turnedOn = state;
                this.markDirty();
            }
        }

        refreshPath2(event) {
            if (!this.turnedOn) {
                this.path = [];
                this.needRefresh = false;
                this.needRedraw = true;
                return;
            }

            const [dx, dy] = DIR[this.startDirection];

            let x = event.x;
            let y = event.y;

            const path = [];
            let d = this.startDirection
            const maxSteps = Math.max($gameMap.width() * 2, $gameMap.height() * 2);
            path.push({ x, y, origin: true });
            for (let step = 0; step < maxSteps; step++) {
                const prevX = x;
                const prevY = y;

                x += dx;
                y += dy;

                const nextX = x + dx;
                const nextY = y + dy;

                if (!$gameMap.isValid(x, y)) break;

                const eventsAtTile = $gameMap.eventsXyNt(x, y);
                const myLevel = event._regionLevel ?? 0;
                // Check if any event at the same level is blocking
                const sameLevelBlocking = eventsAtTile.some(e => {
                    const level = e._regionLevel ?? 0;
                    return e.isNormalPriority() && level === myLevel;
                }
                );

                if (!$gameMap.isPassable(x, y, d)) {
                    path.push({ x, y, end: true, type: "wall" });
                    break;
                }
                // If no same-level blocking event exists and the map tile itself is passable, allow movement
                if (sameLevelBlocking) {
                    path.push({ x, y, end: true, type: "event" });
                    break;
                }
                path.push({ x, y });
            }
            console.log(path)
            this.path = path;
            this.needRefresh = false;
            this.needRedraw = true;
        }


        refreshPath(event) {
            if (!this.turnedOn) {
                this.path = [];
                this.needRefresh = false;
                this.needRedraw = true;
                return;
            }

            const [dx, dy] = DIR[this.startDirection];

            let x = event.x;
            let y = event.y;

            const path = [];
            const myLevel = event._regionLevel ?? 0;

            const maxSteps = Math.max($gameMap.width(), $gameMap.height()) * 2;
            path.push({ x, y, origin: true });
            for (let step = 0; step < maxSteps; step++) {

                const dir = this.startDirection;
                 // diagonal detection
                const isDiagonal = dx !== 0 && dy !== 0;

                // compute next tile BEFORE committing movement
                const nextX = x + dx;
                const nextY = y + dy;

                // stop if out of bounds
                if (!$gameMap.isValid(nextX, nextY)) break;

                const eventsAtTile = $gameMap.eventsXyNt(nextX, nextY);

                const sameLevelBlocking = eventsAtTile.some(e => {
                    const level = e._regionLevel ?? 0;
                    return e.isNormalPriority() && level === myLevel;
                });



                // WALL CHECK
                let canMove;

                if (isDiagonal) {
                    canMove = canMoveDiagonal(nextX, nextY, dx, dy);
                } else {
                    const straightDir = dir;
                    canMove = $gameMap.isPassable(nextX, nextY, straightDir);
                }

                // wall check (map collision)
                if (!canMove) {
                    path.push({ x: nextX, y: nextY, end: true, type: "wall" });
                    break;
                }

                // event blocking check
                if (sameLevelBlocking) {
                    path.push({ x: nextX, y: nextY, end: true, type: "event" });
                    break;
                }

                // advance position
                x = nextX;
                y = nextY;

                path.push({ x, y, type: "path" });
            }
            console.log(path)
            this.path = path;
            this.needRefresh = false;
            this.needRedraw = true;
        }

    }

    // =====================================================
    // EVENT SETUP
    // =====================================================
    const _Game_Event_init = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function (mapId, eventId) {
        _Game_Event_init.call(this, mapId, eventId);
        this._lasers = {};

        // TEST LASER
        if (this.event().id == 1)
            this._lasers[6] = new Laser(6, true);
    };

    // =====================================================
    // SPRITE LASER (RENDERING)
    // =====================================================
    function Sprite_Laser(laser, event) {
        this.initialize(laser, event);
    }

    Sprite_Laser.prototype = Object.create(Sprite.prototype);
    Sprite_Laser.prototype.constructor = Sprite_Laser;

    Sprite_Laser.prototype.initialize = function (laser, event) {
        Sprite.prototype.initialize.call(this);

        this._laser = laser;
        this._event = event;

        this.bitmap = new Bitmap(Graphics.width, Graphics.height);

        // IMPORTANT VISIBILITY FIXES
        this.visible = true;
        this.opacity = 255;
    };

    // FOLLOW MAP SCROLL (CRITICAL FIX)
    Sprite_Laser.prototype.updatePosition = function () {
        this.x = -$gameMap.displayX() * $gameMap.tileWidth();
        this.y = -$gameMap.displayY() * $gameMap.tileHeight();
    };

    Sprite_Laser.prototype.update = function () {
        Sprite.prototype.update.call(this);

        this.updatePosition();

        const laser = this._laser;
        if (!laser) return;

        if (laser.needRefresh) {
            laser.refreshPath(this._event);
        }

        if (laser.needRedraw) {
            this.redraw();
            laser.needRedraw = false;
        }
    };

    Sprite_Laser.prototype.redraw = function () {
        const laser = this._laser;

        this.bitmap.clear();



        if (!laser.turnedOn) return;

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();


        // DOT DEBUG DRAW
        for (const p of laser.path) {
            const size = 6;

            this.bitmap.fillRect(
                p.x * tw + tw / 2 - size / 2,
                p.y * th + th / 2 - size / 2,
                size,
                size,
                "#ff0000"
            );
        }
    };

    // =====================================================
    // SPRITESET MAP INTEGRATION
    // =====================================================

    const _createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _createTilemap.call(this);
        this.createLaserLayer();
    };

    Spriteset_Map.prototype.createLaserLayer = function () {
        // IMPORTANT: use Sprite container, not raw PIXI.Container
        //this._laserLayer = new Sprite();
        this._laserLayer = this._tilemap
        //this._tilemap.addChild(this._laserLayer);

        this._laserSprites = [];
    };

    const _update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _update.call(this);
        this.updateLasers();
    };


    Spriteset_Map.prototype.findCharacterSprite = function (character) {
        return this._characterSprites.find(s => s._character === character);
    };


    Spriteset_Map.prototype.updateLasers = function () {
        const events = $gameMap.events();
        for (const ev of events) {
            if (!ev._lasers) continue;

            for (const key in ev._lasers) {
                const laser = ev._lasers[key];
                const regionlevel = ev._regionLevel ?? 0
                // ensure path is updated
                if (laser.needRefresh) {
                    laser.refreshPath(ev);
                }

                // create sprite once
                if (!laser._sprite) {
                    const sprite = new Sprite_Laser(laser, ev);

                    laser._sprite = sprite;


                    this._laserLayer.addChild(sprite);

                    const spriteset = SceneManager._scene._spriteset;
                    const charSprite = spriteset.findCharacterSprite(ev);
                    const offset = 0.0005

                    //this._laserLayer.z = clamp(charSprite.z - offset)
                    sprite.z = clamp(charSprite.z - offset)
                    console.log(sprite.z)
                    //this._laserLayer.z=(ev._priorityType * 2) + 1 + regionlevel + offset
                    this._laserSprites.push(sprite);
                }
            }
        }
    };

})();