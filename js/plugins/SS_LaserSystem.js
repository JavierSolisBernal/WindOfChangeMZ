(() => {

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

            while (true) {
                x += dx;
                y += dy;

                if (!$gameMap.isValid(x, y)) break;

                path.push({ x, y });
            }

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
        if(this.event().id==1)
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

        console.log(laser)
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
        this._laserLayer = new Sprite();

        this.addChild(this._laserLayer);

        this._laserSprites = [];
    };

    const _update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _update.call(this);
        this.updateLasers();
    };

    Spriteset_Map.prototype.updateLasers = function () {
        const events = $gameMap.events();

        for (const ev of events) {
            if (!ev._lasers) continue;

            for (const key in ev._lasers) {
                const laser = ev._lasers[key];

                // ensure path is updated
                if (laser.needRefresh) {
                    laser.refreshPath(ev);
                }

                // create sprite once
                if (!laser._sprite) {
                    const sprite = new Sprite_Laser(laser, ev);

                    laser._sprite = sprite;
 
                    this._laserLayer.addChild(sprite);
                    this._laserSprites.push(sprite);
                }
            }
        }
    };

})();