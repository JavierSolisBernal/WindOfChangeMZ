/*:
* @target MZ
* @plugindesc Laser System
* @author Squall_seawave 
 
* @param Tunnels
* @text Tunnels
* @desc Tunnels
* @type number[]
*
*/

(() => {
    const pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    const params = PluginManager.parameters(pluginName);

    const PLUGINTILEABOVE = "SS_RegionTileAbove"
    let TUNNELS = [];



    const REGION_CONFIG = {};
    // check if plugin is installed AND enabled
    const hastileabove = PluginManager._scripts.includes(PLUGINTILEABOVE);

    // only load parameters if it exists TO EXTEND EVEN MORE THE THROWN PLUGIN
    const params_ext = hastileabove
        ? PluginManager.parameters(PLUGINTILEABOVE)
        : null;
    if (params_ext) {
        //GET DIRECTIONS
        const parseDirectionStruct = (raw) => {
            if (!raw) return null;
            let obj;
            try {
                obj = JSON.parse(raw);
            } catch {
                return null;
            }
            const dirs = [];
            if (obj.up === "true") dirs.push(8);
            if (obj.down === "true") dirs.push(2);
            if (obj.left === "true") dirs.push(4);
            if (obj.right === "true") dirs.push(6);
            return dirs.length > 0 ? dirs : null;
        }

        const rawRegions = JSON.parse(params_ext.Regions || "[]");
        for (const r of rawRegions) {
            if (!r) continue;

            let obj;
            try {
                obj = JSON.parse(r);
            } catch (e) {
                console.warn("Invalid region struct:", r);
                continue;
            }

            const id = Number(obj.regionId);
            if (!id) continue;

            REGION_CONFIG[id] = {
                alpha: obj.alpha !== undefined ? Number(obj.alpha) : 1,
                level: obj.level !== undefined ? Number(obj.level) : 0,
                force: obj.force === "true" || obj.force === true,
                skip: obj.skip === "true" || obj.skip === true,
                backgroundTile: obj.backgroundTile !== undefined ? Number(obj.backgroundTile) : undefined,
                below: parseDirectionStruct(obj.below),
                above: parseDirectionStruct(obj.above)
            };
        }

    }
    else {
        const tun = JSON.parse(params.Tunnels).map(e => parseInt(e))

        TUNNELS = TUNNELS.concat(tun)
    }


    //VARIABLES 
    


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


        if ($gameMap.isTunnel(x, y)) return true

        return canHorz && canVert;
    }


    const reflectDirection = function (laserDir, mirrorDir) {
        const i = DIR_CIRCLE.indexOf(laserDir);
        if (i === -1) return null;

        const blocked = [
            DIR_CIRCLE[(i - 1 + 8) % 8],
            DIR_CIRCLE[i],
            DIR_CIRCLE[(i + 1) % 8]
        ];

        if (blocked.includes(mirrorDir)) {
            return null; // blocked
        }

        // SIMPLE RULE: redirect to mirror direction
        return mirrorDir;
    };


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

    const DIR_CIRCLE = [1, 2, 3, 6, 9, 8, 7, 4]; // clockwise

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

            let dir = this.startDirection;
            let [dx, dy] = DIR[dir];

            let x = event.x;
            let y = event.y;

            const path = [];
            const myLevel = event._regionLevel ?? 0;

            const maxSteps = Math.max($gameMap.width(), $gameMap.height()) * 2;

            path.push({ x, y, origin: true });

            for (let step = 0; step < maxSteps; step++) {

                // 1. compute next tile
                const nextX = x + dx;
                const nextY = y + dy;

                if (!$gameMap.isValid(nextX, nextY)) break;

                // 2. MOVE FIRST (enter tile)
                x = nextX;
                y = nextY;

                path.push({ x, y, type: "path" });

                const eventsAtTile = $gameMap.eventsXyNt(x, y);

                const sameLevelBlocking = eventsAtTile.some(e => {
                    const level = e._regionLevel ?? 0;
                    return e.isNormalPriority() && level === myLevel;
                });

                // =========================
                // MIRROR CHECK (NOW CORRECT)
                // =========================
                let reflected = false;

                for (const e of eventsAtTile) {
                    if (e._md == null) continue;

                    const resultDir = reflectDirection(dir, e._md);

                    // BLOCK
                    if (resultDir == null) {
                        path.push({ x, y, end: true, type: "mirror_block" });
                        this.path = path;
                        return;
                    }

                    // REFLECT (happens ON tile)
                    dir = resultDir;
                    [dx, dy] = DIR[dir];

                    path.push({ x, y, type: "mirror_reflect" });

                    reflected = true;
                    break;
                }

                if (reflected) {
                    continue;
                }

                // =========================
                // WALL CHECK
                // =========================
                let canMove;

                const isDiagonal = dx !== 0 && dy !== 0;

                if (isDiagonal) {
                    canMove = canMoveDiagonal(x, y, dx, dy);
                } else {
                    canMove=event.isLaserPassable(x, y, dir);
                   // canMove = $gameMap.isPassable(x, y, dir);
                }

                if (!canMove) {
                    path.pop()
                    path.push({ x: nextX, y: nextY, end: true, type: "wall" });
                    break;
                }

                if (sameLevelBlocking) {
                    path.pop()
                    path.push({ x, y, end: true, type: "event" });
                    break;
                }
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

        const meta = this.event().meta;
        const dir = meta.dir ?? 6
        // TEST LASER
        if (this.event().id == 1)
            this._lasers[dir] = new Laser(dir, true);
    };


    const SS_Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function () {
        SS_Game_Event_setupPage.call(this);

        const meta = this.event().meta;

        const key = [this._mapId, this._eventId, "M"];

        const saved = $gameSelfSwitches.value(key);

        if (saved) {
            this._md = Number(saved);
            return;
        }


        if (!meta?.mirror) return;


        // <mirror:x>
        if (meta.mirror !== "") {
            this._md = Number(meta.mirror);
            if (this._md === 5) this._md = this.direction();
        }
        // <mirror> fallback
        else {
            this._md = this.direction();
        }

        $gameSelfSwitches.setValue(key, this._md);
    };

    Game_Event.prototype.setMirrorDirection = function (dir) {
        const meta = this.event().meta;
        if (!meta.mirror) return
        const key = [this._mapId, this._eventId, "M"];
        this._md = dir;
        $gameSelfSwitches.setValue(key, dir);
    };


    Game_Event.prototype.isLaserPassable = function (x, y, dir) {
        if (!params_ext)  return $gameMap.isPassable(x, y, dir);
        const x2 = $gameMap.roundXWithDirection(x, dir);
        const y2 = $gameMap.roundYWithDirection(y, dir);
        const opp = this.reverseDir(dir);
        const regionId=$gameMap.regionId(x,y)
        const config=REGION_CONFIG[regionId]
        if (this._regionLevel >= (config?.level ?? 0)) return true;
        
        const dirs=config?.below??[]
        if(dirs.includes(dir) && dirs.includes(opp)) return true
        return $gameMap.isPassable(x, y, dir);
    
    };


    Game_Map.prototype.isTunnel = function (x, y) {
        if (!params_ext) {
        const SAFE_TUNNELS = Array.isArray(TUNNELS) ? TUNNELS : [];
        return SAFE_TUNNELS.includes(this.regionId(x, y));
        }
         
        return false    

    }


    function Sprite_Laser(laser, event) {
        this.initialize(laser, event);
    }

    Sprite_Laser.prototype = Object.create(Sprite.prototype);
    Sprite_Laser.prototype.constructor = Sprite_Laser;

    Sprite_Laser.prototype.initialize = function (laser, event) {
        Sprite.prototype.initialize.call(this);

        this._laser = laser;
        this._event = event;

        this._lastDisplayX = null;
        this._lastDisplayY = null;

        this.bitmap = new Bitmap(Graphics.width, Graphics.height);

        this.visible = true;
        this.opacity = 255;
    };

    Sprite_Laser.prototype.updatePosition = function () {
        this.x = 0;
        this.y = 0;
    };

    Sprite_Laser.prototype.update = function () {
        Sprite.prototype.update.call(this);

        this.updatePosition();

        const laser = this._laser;
        if (!laser) return;

        const dx = $gameMap.displayX();
        const dy = $gameMap.displayY();

        const moved =
            this._lastDisplayX !== dx ||
            this._lastDisplayY !== dy;

        this._lastDisplayX = dx;
        this._lastDisplayY = dy;

        if (laser.needRefresh) {
            laser.refreshPath(this._event);
        }

        if (laser.needRedraw || moved) {
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

        const dx = $gameMap.displayX();
        const dy = $gameMap.displayY();

        const screenW = Graphics.width;
        const screenH = Graphics.height;

        for (const p of laser.path) {

            if ($gameMap.isTunnel(p.x, p.y)) continue;

            // convert map → screen space
            const sx = (p.x - dx) * tw + tw / 2;
            const sy = (p.y - dy) * th + th / 2;

            //  skip if outside screen (with small margin)
            if (sx < -tw || sy < -th || sx > screenW + tw || sy > screenH + th) {
                continue;
            }

            let color = "#ff0000";

            if (p.origin) color = "#00ff00";
            else if (p.type === "mirror_reflect") color = "#00ffff";
            else if (p.type === "mirror_block") color = "#ffff00";
            else if (p.type === "wall") color = "#ffffff";
            else if (p.type === "event") color = "#ff8800";

            const size = 6;

            this.bitmap.fillRect(
                sx - size / 2,
                sy - size / 2,
                size,
                size,
                color
            );
        }
    };


    const _SS_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _SS_createTilemap.call(this);

        // we inject directly into tilemap
        this._laserSprites = [];
    };

    // hook update
    const _SS_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _SS_update.call(this);
        this.updateLasers();
    };

    // helper (you already had this, keep it)
    Spriteset_Map.prototype.findCharacterSprite = function (character) {
        return this._characterSprites.find(s => s._character === character);
    };

    // main logic
    Spriteset_Map.prototype.updateLasers = function () {
        const events = $gameMap.events();

        for (const ev of events) {
            if (!ev._lasers) continue;

            for (const key in ev._lasers) {
                const laser = ev._lasers[key];

                // update logic
                if (laser.needRefresh) {
                    laser.refreshPath(ev);
                }

                // create sprite once
                if (!laser._sprite) {
                    const sprite = new Sprite_Laser(laser, ev);
                    laser._sprite = sprite;

                    this._tilemap.addChild(sprite);

                    // force top render
                    this._tilemap.setChildIndex(
                        sprite,
                        this._tilemap.children.length - 1
                    );

                    // sync z with event
                    const charSprite = this.findCharacterSprite(ev);
                    if (charSprite) {
                        sprite.z = charSprite.z + 0.0;
                    } else {
                        sprite.z = 3;
                    }

                    this._laserSprites.push(sprite);
                }
            }
        }

        // IMPORTANT: enforce z sorting
        this._tilemap.sortChildren();
    };


    /* to remake
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
            const isTunnel = $gameMap.isTunnel(p.x, p.y);
            if (isTunnel) continue;
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


    Sprite_Laser.prototype.redraw = function () {
        const laser = this._laser;

        this.bitmap.clear();
        if (!laser.turnedOn) return;

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        const ctx = this.bitmap.context;
        ctx.save();

        // --------------------------------------------------
        // 1. BUILD POINTS (with tunnel BREAKS, not skips)
        // --------------------------------------------------
        const points = [];

        for (const p of laser.path) {

            if ($gameMap.isTunnel(p.x, p.y)) {
                points.push(null);
                continue;
            }

            points.push({
                x: p.x * tw + tw / 2,
                y: p.y * th + th / 2,
                color: p.color,
                type: p.type
            });
        }

        if (points.length < 2) {
            ctx.restore();
            return;
        }

        // --------------------------------------------------
        // 2. FIX WALL ENDPOINT (stop at tile edge)
        // --------------------------------------------------
        const last = points[points.length - 1];

        if (last && last.type === "wall") {
            last.x -= tw/2
            last.y -= th/2
        }

        // --------------------------------------------------
        // 3. DRAW SEGMENT FUNCTION
        // --------------------------------------------------
        const drawPath = (width, alpha, colorOverride = null) => {
            ctx.lineWidth = width;
            ctx.globalAlpha = alpha;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            for (let i = 1; i < points.length; i++) {
                const a = points[i - 1];
                const b = points[i];
                const c = points[i+1]; 

                
                if(c===null && !colorOverride ) {
                    b.x+=tw/4, 
                    b.y+=th/4
                }

                if(a===null && !colorOverride ) {
                    b.x-=tw/4, 
                    b.y-=th/4
                }


                if (!a || !b) continue;
                
                let defaultcolor
                defaultcolor="#ff0000"
                defaultcolor="#ff00ff"
                ctx.strokeStyle = colorOverride || (b.color || defaultcolor);

                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        };

        // --------------------------------------------------
        // 4. LAYERS
        // --------------------------------------------------

        // 🔵 glow
        drawPath(10, 0.15);

        // 🟣 main beam
        drawPath(4, 1.0);

        // ⚪ core
        drawPath(2, 1.0, "#ffffff");

        ctx.restore();
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
                    //this._laserLayer.z=(ev._priorityType * 2) + 1 + regionlevel + offset
                    this._laserSprites.push(sprite);
                }
            }
        }
    };

*/

})();