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
    let ENDS = [];
    const COLORS = { orange: "#FFA500", green: "#00AA00" }


    const REGION_CONFIG = {};
    // check if plugin is installed AND enabled
    const hastileabove = PluginManager._scripts.includes(PLUGINTILEABOVE);

    // only load parameters if it exists 
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
                skip: obj.type == "None",
                force: obj.type == "Overlay",
                //force: obj.force === "true" || obj.force === true,
                //skip: obj.skip === "true" || obj.skip === true,
                backgroundTile: obj.backgroundTile !== undefined ? Number(obj.backgroundTile) : undefined,
                below: parseDirectionStruct(obj.below),
                above: parseDirectionStruct(obj.above)
            };
        }
        const filtertunnel = Object.entries(REGION_CONFIG).filter(([id, config]) => config.below?.length > 0 || config.force);
        const filterend = Object.entries(REGION_CONFIG).filter(([id, config]) => config.skip);
        TUNNELS = TUNNELS.concat(filtertunnel.map(([id]) => Number(id)))
        ENDS = ENDS.concat(filterend.map(([id]) => Number(id)))

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


    //HEX to RGB
    const hexToRgb = function (hex) {
        hex = hex.replace("#", "").trim();

        // #RGB
        if (hex.length === 3) {
            hex = hex.split("").map(c => c + c).join("");
        }

        const num = parseInt(hex, 16);

        return {
            r: (num >> 16) & 255,
            g: (num >> 8) & 255,
            b: num & 255
        };
    };

    //RGB to HEX
    const rgbToHex = function (r, g, b) {
        return "#" + [r, g, b]
            .map(x => x.toString(16).padStart(2, "0"))
            .join("")
            .toUpperCase();
    };

    //DIAGONALLY PASSABILITY
    const canMoveDiagonal = function (x, y, dx, dy, event) {
        // horizontal + vertical checks separately
        const horzDir = dx > 0 ? 6 : 4;
        const vertDir = dy > 0 ? 2 : 8;
        const canHorz = event.isLaserPassable(x, y, horzDir);
        const canVert = event.isLaserPassable(x, y, vertDir);
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
            this.laserColor = "#FF0000"
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

            let color = this.laserColor
            path.push({ x, y, origin: true, color });

            for (let step = 0; step < maxSteps; step++) {

                // 1. compute next tile
                const nextX = x + dx;
                const nextY = y + dy;

                if (!$gameMap.isValid(nextX, nextY)) {
                    path.pop()
                    path.push({
                        x: x,
                        y: y,
                        dx,
                        dy,
                        color: color,
                        end: true,
                        type: "edge"
                    });
                    break;
                }

                // 2. MOVE FIRST (enter tile)
                x = nextX;
                y = nextY;

                const isTunnel = $gameMap.isTunnel(x, y, event)
                const regionId = $gameMap.regionId(x, y)
                if (isTunnel)
                    path.push({ x, y, dx, dy, regionId, type: "path", color: color, isTunnel: true });
                else
                    path.push({ x, y, dx, dy, regionId, type: "path", color: color });

                const isEnd = $gameMap.isEnd(x, y, event)
                // BLOCK
                if (isEnd) {
                    path.pop()
                    path.push({ x, y, dx, dy, end: true, type: "wall", color: color });
                    this.path = path;
                    return;
                }


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
                        path.push({ x, y, dx, dy, end: true, type: "mirror_block", color: color });
                        this.path = path;
                        return;
                    }

                    // REFLECT (happens ON tile)
                    dir = resultDir;
                    [dx, dy] = DIR[dir];

                    color = e._color ?? color

                    path.push({ x, y, dx, dy, type: "mirror_reflect", color: color });

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
                    canMove = canMoveDiagonal(x, y, dx, dy, event);
                } else {
                    canMove = event.isLaserPassable(x, y, dir);
                }

                if (!canMove) {
                    path.pop()
                    path.push({ x: nextX, y: nextY, dx, dy, end: true, type: "wall", color: color });
                    break;
                }

                if (sameLevelBlocking) {
                    path.pop()
                    path.push({ x, y, dx, dy, end: true, type: "event", color: color });
                    break;
                }
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

        const meta = this.event().meta;
        const dir = meta.dir ?? 6
        // TEST LASER
        if (this.event().id == 1) {
            this._lasers[dir] = new Laser(dir, true);
            this._lasers[6] = new Laser(6, true);

        }
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


        const isValidHexColor = function (str) {
            if (typeof str !== "string") return false;
            return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(str.trim());
        };

        const normalizeHex = function (hex) {
            hex = hex.trim();

            if (/^#[0-9A-F]{3}$/i.test(hex)) {
                hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
            }

            return hex.toUpperCase();
        };

        if (meta.color) {
            let c = meta.color.trim();

            const isHex = c[0] === "#";

            if (isHex) {
                this._color = isValidHexColor(c) ? normalizeHex(c) : null;
            } else {
                c = c.toLowerCase();
                this._color = COLORS[c] ?? null;
            }
        }

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
        if (!params_ext) {
            if ($gameMap.isTunnel(x, y, null)) return true
            return $gameMap.isPassable(x, y, dir);
        }
        const regionId = $gameMap.regionId(x, y)
        if (regionId == 0) return $gameMap.isPassable(x, y, dir);
        const opp = this.reverseDir(dir);
        const config = REGION_CONFIG[regionId]
        if (this._regionLevel >= (config?.level ?? 0)) return true;

        const dirs = config?.below ?? []
        if (dirs.includes(dir) && dirs.includes(opp)) return true
        return $gameMap.isPassable(x, y, dir);

    };




    Game_Map.prototype.isTunnel = function (x, y, event) {
        const SAFE_TUNNELS = Array.isArray(TUNNELS) ? TUNNELS : [];
        return SAFE_TUNNELS.includes(this.regionId(x, y));

    }


    Game_Map.prototype.isEnd = function (x, y, event) {
        const SAFE_ENDS = Array.isArray(ENDS) ? ENDS : [];
        return SAFE_ENDS.includes(this.regionId(x, y));
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

        let rules = false

        if (params_ext) {
            const Systemrules = $gameSystem.regionRulesPassed()
            if (this._lastrules != Systemrules) {
                this._lastrules = Systemrules
                rules = true
            }
        }

        this._lastDisplayX = dx;
        this._lastDisplayY = dy;

        if (laser.needRefresh) {
            laser.refreshPath(this._event);
        }

        if (laser.needRedraw || moved || rules) {
            this.redraw();
            laser.needRedraw = false;
        }
    };

    //for DEBUGGING
    Sprite_Laser.prototype.redrawDebug = function () {
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

            if ($gameMap.isTunnel(p.x, p.y, this._event)) continue;

            // convert map → screen space
            const sx = (p.x - dx) * tw;
            const sy = (p.y - dy) * th;

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


    Sprite_Laser.prototype.redraw = function () {
        const laser = this._laser;

        this.bitmap.clear();
        if (!laser.turnedOn || !laser.path || laser.path.length < 2) return;

        const ctx = this.bitmap.context;

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        const dx = $gameMap.displayX();
        const dy = $gameMap.displayY();

        const screenW = Graphics.width;
        const screenH = Graphics.height;

        const halfW = tw / 2;
        const halfH = th / 2;

        ctx.save();

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        // -------------------------
        // projection (world → screen)
        // -------------------------
        const project = (p) => ({
            x: (p.x - dx) * tw + halfW,
            y: (p.y - dy) * th + halfH
        });



        const drawPolyline = (width, alpha, colorOverride = null) => {
            ctx.lineWidth = width;
            ctx.globalAlpha = alpha;

            ctx.beginPath();

            let started = false;
            let lastColor = null;
            for (let i = 1; i < laser.path.length; i++) {
                const prev = laser.path[i - 1];
                const curr = laser.path[i];
                const next = laser.path[i + 1];
                const currP = project(curr);
                const prevP = project(prev);

                let offsetx = 0
                let offsety = 0

                if (curr.type === "edge" || next?.isTunnel) {
                    offsetx = halfW * curr.dx
                    offsety = halfH * curr.dy

                }




                if (curr.type === "wall") {
                    offsetx = halfW * (-1) * curr.dx
                    offsety = halfH * (-1) * curr.dy
                }

                if (prev?.isTunnel) {
                    offsetx = halfW * (1) * prev.dx
                    offsety = halfH * (1) * prev.dy
                }

                if (next?.type === "wall" && next.end && curr.isTunnel && 1 == 1) {
                    offsetx = halfW * curr.dx * (1)
                    offsety = halfH * curr.dy * (1)
                }

                if (next?.type === "wall" && next.end && !curr.isTunnel) {
                    offsetx = halfW * curr.dx * (1)
                    offsety = halfH * curr.dy * (1)
                }


                // apply offset
                const cpx = {
                    x: currP.x + offsetx,
                    y: currP.y + offsety
                };

                const ppx = {
                    x: prevP.x + offsetx,
                    y: prevP.y + offsety
                };

                const color = colorOverride || curr.color || "#ff0000";
                const pathRegionLevel = REGION_CONFIG[curr.regionId ?? 0]?.level ?? 0
                const laserRegion = (this._event?._regionLevel ?? 0)
                //Skip tunnels entirely
                if (curr.isTunnel && !$gameSystem.regionRulesPassed() && pathRegionLevel > laserRegion) {
                    if (started) {
                        ctx.stroke();
                        started = false;
                    }
                    continue;
                }

                const colorChanged = lastColor !== null && lastColor !== color;

                if (!started || colorChanged) {
                    if (started) ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(ppx.x, ppx.y);

                    ctx.strokeStyle = color;

                    started = true;
                    lastColor = color;
                }
                //Always draw the segment except on last tile
                if (!(curr.type == "wall" && curr.end))
                    ctx.lineTo(cpx.x, cpx.y);

                //Stop at boundaries
                if (curr.type === "mirror" || curr.type === "end") {
                    ctx.stroke();
                    started = false;
                }
            }
            if (started) ctx.stroke();
        };







        // -------------------------
        // layers (glow  main  core) based on the tile sprite
        // -------------------------

        drawPolyline(10, 0.15);            // glow
        drawPolyline(4, 1.0);             // main beam
        drawPolyline(2, 1.0, "#ffffff");  // core

        ctx.restore();
    };

    const _SS_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _SS_createTilemap.call(this);
        this._laserSprites = [];
    };

    // hook update
    const _SS_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        _SS_update.call(this);
        this.updateLasers();
    };


    Spriteset_Map.prototype.findCharacterSprite = function (character) {
        return this._characterSprites.find(s => s._character === character);
    };

    // main logic
    Spriteset_Map.prototype.updateLasersbackup = function () {
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
                        //sprite.z = 3;
                        const level = ev._regionLevel ?? 0
                        sprite.z = (ev._priorityType * 2) + 1 + level
                    }

                    this._laserSprites.push(sprite);
                }
            }
        }

        // IMPORTANT: enforce z sorting
        this._tilemap.sortChildren();
    };


    Spriteset_Map.prototype.updateLasers = function () {
        const events = $gameMap.events();
        const activeSprites = new Set();

        for (const ev of events) {
            if (!ev._lasers) continue;

            for (const key in ev._lasers) {
                const laser = ev._lasers[key];

                if (!laser) continue;

                // ---------------------------------
                // EVENT WAS ERASED
                // ---------------------------------
                if (ev.isErased()) {
                    if (laser._sprite) {
                        laser._sprite.visible = false;
                    }
                    continue;
                }

                // ---------------------------------
                // UPDATE LOGIC
                // ---------------------------------
                if (laser.needRefresh) {
                    laser.refreshPath(ev);
                }

                // ---------------------------------
                // CREATE SPRITE ONCE
                // ---------------------------------
                if (!laser._sprite) {
                    const sprite = new Sprite_Laser(laser, ev);
                    laser._sprite = sprite;

                    this._tilemap.addChild(sprite);

                    // Force laser to top of tilemap children.
                    this._tilemap.setChildIndex(
                        sprite,
                        this._tilemap.children.length - 1
                    );

                    // ---------------------------------
                    // SYNC Z WITH EVENT
                    // ---------------------------------
                    const charSprite = this.findCharacterSprite(ev);

                    if (charSprite) {
                        sprite.z = charSprite.z;
                    } else {
                        const level = ev._regionLevel ?? 0;
                        sprite.z =
                            (ev._priorityType * 2) +
                            1 +
                            level;
                    }

                    this._laserSprites.push(sprite);
                }

                // Event is active again.
                laser._sprite.visible = true;

                activeSprites.add(laser._sprite);
            }
        }

        // ---------------------------------
        // REMOVE STALE SPRITES
        // ---------------------------------
        for (let i = this._laserSprites.length - 1; i >= 0; i--) {
            const sprite = this._laserSprites[i];

            if (!activeSprites.has(sprite)) {
                if (sprite.parent) {
                    sprite.parent.removeChild(sprite);
                }

                if (sprite.bitmap) {
                    sprite.bitmap.clear();
                }

                const laser = sprite._laser;

                if (laser && laser._sprite === sprite) {
                    laser._sprite = null;
                }

                this._laserSprites.splice(i, 1);
            }
        }

        // ---------------------------------
        // KEEP Z SORTING CORRECT
        // ---------------------------------
        this._tilemap.sortChildren();
    };


})();