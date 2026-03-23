/*:
* @target MZ
* @plugindesc Region tiles rendered above characters (optimized + autotiles + smart caching)
* @author Squall_seawave 
 
* @param Rules
* @text test
* @desc Rules to check
* @type struct<Rule>[]
*
*/

/*~struct~Rule:
 * @param Parameter
 * @type select
 * @default Switch
 * @option Player
 * @value Player
 * @option Switch
 * @value Switch
 * @option Variable
 * @value Variable
 * @option GameMap
 * @value GameMap
 * @option Party
 * @value Party
 * @option SkillLearned
 * @value SkillLearned
 * @option System
 * @value System
 * @option Temp
 * @value Temp
 * 
 * 
 * @param subparameter
 * @type string
 * 
 * @param id
 * @type number
 * @default 1
 * 
 * @param Comparison
 * @type select
 * @option Equal (===)
 * @value ===
 * @option Not Equal (!==)
 * @value !==
 * @option Less Than (<)
 * @value <
 * @option Less Than or Equal (<=)
 * @value <=
 * @option Greater Than (>)
 * @value >
 * @option Greater Than or Equal (>=)
 * @value >=
 * @option Not(!)
 * @value Not
 * @option IsInList
 * @value IsInList
 * @option TextContains
 * @value TextContains
 * @default ===
 * 
 * @param value
 * @type string
 * @default true
*/

(() => {
    const pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    const params = PluginManager.parameters(pluginName);
    const rawRules = JSON.parse(params.Rules || "[]");
    const Rules = rawRules.map(r => {
        try {
            return JSON.parse(r);
        } catch (e) {
            console.warn("Invalid rule:", r);
            return null;
        }
    }).filter(r => r !== null);;
    const REGION_ALPHA = {
        254: { alpha: 1, force: true },
        255: { alpha: 0.65 },
        2: { alpha: 0.65 }
    };

    const regionTileMap = {
        255: 46,
        2: 46,

    };

    const tileMap = {
        "10,12": { setX: 6, setY: 11 }
    };


    function safeAccess(obj, path) {
        if (!obj || typeof path !== "string") return undefined;
        if (!path) return obj;
        path = path.trim();
        // Remove leading dot if present
        if (path.startsWith(".")) {
            path = path.slice(1);
        }

        // Split path: "states.length" → ["states", "length"]
        const parts = path.split(".");

        let current = obj;

        for (let key of parts) {
            if (current == null) return undefined;

            // Prevent prototype access
            if (key === "__proto__" || key === "constructor" || key === "prototype") {
                console.warn("Blocked unsafe key:", key);
                return undefined;
            }

            if (!(key in current)) {
                return undefined;
            }

            const value = current[key];
            if (typeof value === "function" && value.length === 0) {
                current = value.call(current);
            } else {
                current = value;
            }
        }

        return current;
    }

    function getActualValue(rule) {
        const id = Number(rule.id);
        const sub = rule.subparameter || "";


        switch (rule.Parameter) {

            case "SkillLearned": {
                return $gameParty.members().some(actor => {
                    if (!actor) return false;
                    return actor.isLearnedSkill(id);
                });
            }

            case "Switch": return $gameSwitches.value(id);
            case "Variable": return $gameVariables.value(id);
            case "Party": {
                if (id > 0) {
                    const actor = $gameParty.members()[id - 1];
                    if (!actor) return undefined;
                    return sub ? safeAccess(actor, sub) : actor;
                } else {
                    return safeAccess($gameParty, sub);
                }
            }
            case "Actors": {
                const actor = $gameActors.actor(id);
                if (!actor) return undefined;
                return safeAccess(actor, sub)
            }
            case "Player": return safeAccess($gamePlayer, sub)
            case "GameMap": return safeAccess($gameMap, sub);
            case "System": return safeAccess($gameSystem, sub);
            case "Temp": return safeAccess($gameTemp, sub);
            default: return undefined
        }
    }

    function sanitizeValue(value) {
        if (value == null) return value;
        let str = String(value).trim();
        // Booleans
        if (str == "true") return true;
        if (str == "false") return false;
        // Strip quotes
        if (
            (str.startsWith("'") && str.endsWith("'")) ||
            (str.startsWith('"') && str.endsWith('"'))
        ) {
            str = str.slice(1, -1).trim();
        }
        // Numbers (after unquoting)
        if (str !== "" && !Number.isNaN(Number(str))) {
            return Number(str);
        }
        return String(str);
    }
    function evaluateRule(rule) {
        const actual = getActualValue(rule);
        const expected = sanitizeValue(rule.value);
        const op = rule.Comparison;
        switch (op) {
            case "===": return actual === expected;
            case "!==": return actual !== expected;
            case ">": return actual > expected;
            case "<": return actual < expected;
            case ">=": return actual >= expected;
            case "<=": return actual <= expected;
            case "Not": return !actual
            case "TextContains": return actual == null ? false : String(actual).includes(String(expected));
            case "IsInList": {
                if (expected == null) return false;
                const list = String(expected).split(",").map(v => v.trim());
                return list.some(v => String(v) === String(actual));
            }
            default: return false;
        }
    }
    const conditionFn = () => {
        let flag = true
        for (const rule of Rules) {
            if (!evaluateRule(rule)) {
                flag = false
                break
            }
        }

        return flag
    }


    function getTileIdAt(regionId, x, y) {
        const mapping = tileMap[`${x},${y}`];

        if (mapping) {
            const tileId = $gameMap.tileId(mapping.setX, mapping.setY, 0);
            return tileId;
        }

        const tileIndex = regionTileMap[regionId] || 0;
        return tileIndex + 1536;
    }


    // ==============================
    // INIT
    // ==============================
    const _createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _createTilemap.call(this);
        this.createRegionLowerLayer();
        this.createRegionLayer();
    };


    Spriteset_Map.prototype._resetRegionContainer = function (container) {
        if (!container) return;

        container.removeChildren();

        // Clear animation cache
        container._a1 = null;

        // Reset transform
        container.x = 0;
        container.y = 0;
        container.alpha = 1;
        container.visible = true;

        // Important: reset z-related properties
        container.z = 0;
        container.zIndex = 0;

        return container;
    };


    // ==============================
    // TILE FRAME
    // ==============================
    function getTileFrameMZ(tileId, tw, th) {


        let index = 0;
        let localId = 0;

        if (tileId >= 1536) {
            index = 4;
            localId = tileId - 1536;
        } else {
            index = Math.floor(tileId / 256) + 5;
            localId = tileId % 256;
        }

        const col = localId % 8;
        const row = Math.floor(localId / 8);

        return {
            index,
            sx: col * tw,
            sy: row * th
        };


    }

    const _destroy = Spriteset_Map.prototype.destroy;
    Spriteset_Map.prototype.destroy = function (options) {
        if (this._regionUpperSprites) {
            this._regionUpperSprites.removeChildren();
            this._regionUpperSprites.destroy({ children: true });
        }

        if (this._regionLowerSprites) {
            this._regionLowerSprites.destroy();
        }

        _destroy.call(this, options);
    };



    Spriteset_Map.prototype.createRegionLayer = function () {
        this._regionUpperSprites = new PIXI.Container();
        this._regionUpperSprites.sortableChildren = true;
        this._regionNeedsSort = false;
        this._regionUpperSprites.z = 3.1; // above charactersa
        this._tilemap.addChild(this._regionUpperSprites);


        this._regionSpritePool = [];
        this._regionSpriteMap = {};

        this._regionBitmaps = $gameMap.tileset().tilesetNames.map(n =>
            ImageManager.loadTileset(n || "")
        );

        this._lastRegionStartX = -1;
        this._lastRegionStartY = -1;
        this._lastRegionVisibility = null;

        this._regionAnimFrame = 0;


    };


    Spriteset_Map.prototype.createRegionLowerLayer = function () {
        this._regionLowerSprites = new PIXI.Container();
        this._regionLowerSprites.sortableChildren = true;
        this._regionLowerNeedsSort = false;
        this._regionLowerSprites.z = 1.1; // above layer 0, 
        this._tilemap.addChild(this._regionLowerSprites);
        //  LOWER-specific pools & maps
        this._regionLowerPool = [];
        this._regionLowerMap = {};

        // (optional) keep if you use tile bitmaps for lower
        this._regionLowerBitmaps = $gameMap.tileset().tilesetNames.map(n =>
            ImageManager.loadTileset(n || "")
        );

        //  LOWER cache
        this._lastLowerStartX = -1;
        this._lastLowerStartY = -1;
        //  LOWER animation (if you need it later)
        this._lowerAnimFrame = 0;
    };


    Spriteset_Map.prototype.updateRegionLowerSprites = function () {
        if (!this._regionLowerSprites) return;

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        const startX = Math.floor(this._tilemap.origin.x / tw);
        const startY = Math.floor(this._tilemap.origin.y / th);

        // Cache check
        if (startX === this._lastLowerStartX &&
            startY === this._lastLowerStartY) {
            return;
        }

        this._lastLowerStartX = startX;
        this._lastLowerStartY = startY;

        const screenTileW = Math.ceil(Graphics.width / tw) + 2;
        const screenTileH = Math.ceil(Graphics.height / th) + 2;

        const newMap = {};

        for (let y = 0; y < screenTileH; y++) {
            for (let x = 0; x < screenTileW; x++) {

                const mapX = startX + x;
                const mapY = startY + y;

                if (!$gameMap.isValid(mapX, mapY)) continue;

                const region = $gameMap.regionId(mapX, mapY);

                // Only render allowed regions
                if (regionTileMap[region] === undefined) continue;

                const key = `${mapX},${mapY}`;
                newMap[key] = true;

                if (this._regionLowerMap[key]) continue;

                // Get tile BEFORE creating container (important for pooling)
                const tileId = getTileIdAt(region, mapX, mapY);
                if (!tileId) continue;

                let container = this._regionLowerPool.pop();
                if (!container) container = new PIXI.Container();

                container.removeChildren();
                container._a1 = null;

                // Draw tile
                if (Tilemap.isAutotile(tileId)) {
                    this._drawAutotile(container, tileId);
                } else {
                    const frame = getTileFrameMZ(tileId, tw, th);
                    const sprite = new Sprite(this._regionLowerBitmaps[frame.index]);

                    sprite.setFrame(frame.sx, frame.sy, tw, th);
                    sprite.x = 0;
                    sprite.y = 0;

                    container.addChild(sprite);
                }

                container.x = mapX * tw;
                container.y = mapY * th;
                container.region = region;

                // Keep below player
                container.z = 0;



                this._regionLowerSprites.addChild(container);

                this._regionLowerMap[key] = container;
                this._regionLowerNeedsSort = true;
            }
        }

        // Cleanup removed tiles
        for (const key in this._regionLowerMap) {
            if (!newMap[key]) {
                const c = this._regionLowerMap[key];
                this._regionLowerSprites.removeChild(c);
                this._regionLowerPool.push(c);
                delete this._regionLowerMap[key];
            }
        }
    };


    Spriteset_Map.prototype.updateRegionLowerAutotiles = function () {
        this._lowerAnimFrame++;

        const frame = Math.floor(this._lowerAnimFrame / 30);

        for (const key in this._regionLowerMap) {
            const c = this._regionLowerMap[key];

            if (!c._a1) continue;

            const index = frame % c._a1.length;

            c._a1.forEach((f, i) => {
                const visible = (i === index);
                f.forEach(s => s.visible = visible);
            });
        }
    };






    // ==============================
    // SMART RENDERING
    // ==============================
    Spriteset_Map.prototype.updateRegionUpperSprites = function () {
        if (!this._regionUpperSprites) return;


        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        const startX = Math.floor(this._tilemap.origin.x / tw);
        const startY = Math.floor(this._tilemap.origin.y / th);

        // CACHE CHECK
        if (startX === this._lastRegionStartX &&
            startY === this._lastRegionStartY) {
            return;
        }

        this._lastRegionStartX = startX;
        this._lastRegionStartY = startY;

        const screenTileW = Math.ceil(Graphics.width / tw) + 2;
        const screenTileH = Math.ceil(Graphics.height / th) + 2;

        const newMap = {};

        for (let y = 0; y < screenTileH; y++) {
            for (let x = 0; x < screenTileW; x++) {

                const mapX = startX + x;
                const mapY = startY + y;

                if (!$gameMap.isValid(mapX, mapY)) continue;

                const region = $gameMap.regionId(mapX, mapY);
                if (REGION_ALPHA[region] === undefined) continue;

                const key = `${mapX},${mapY}`;
                newMap[key] = true;

                if (this._regionSpriteMap[key]) continue;

                let container = this._regionSpritePool.pop();
                if (!container) container = new PIXI.Container();

                container.removeChildren();
                container._a1 = null;

                for (let z = 0; z < 4; z++) {
                    const tileId = $gameMap.tileId(mapX, mapY, z);
                    if (!tileId) continue;

                    if (Tilemap.isAutotile(tileId)) {
                        this._drawAutotile(container, tileId);
                    } else {
                        const frame = getTileFrameMZ(tileId, tw, th);
                        const sprite = new Sprite(this._regionBitmaps[frame.index]);

                        sprite.setFrame(frame.sx, frame.sy, tw, th);
                        sprite.x = 0;
                        sprite.y = 0;

                        container.addChild(sprite);
                    }
                }

                container.x = mapX * tw;
                container.y = mapY * th;
                container.region = region;

                // PERFECT SORT (feet position)
                container.z = container.y + th;

                this._regionUpperSprites.addChild(container);
                this._regionNeedsSort = true;
                this._regionSpriteMap[key] = container;
            }
        }

        // CLEANUP
        for (const key in this._regionSpriteMap) {
            if (!newMap[key]) {
                const c = this._regionSpriteMap[key];
                this._regionUpperSprites.removeChild(c);
                this._regionSpritePool.push(c);
                delete this._regionSpriteMap[key];
            }
        }


    };

    // ==============================
    // AUTOTILES
    // ==============================
    Spriteset_Map.prototype._drawAutotile = function (container, tileId) {


        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();
        const w1 = tw / 2;
        const h1 = th / 2;

        const kind = Tilemap.getAutotileKind(tileId);
        const shape = Tilemap.getAutotileShape(tileId);

        const tx = kind % 8;
        const ty = Math.floor(kind / 8);

        let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
        let tilesetIndex = 0;
        let bx = 0;
        let by = 0;

        // A1 animated
        if (Tilemap.isTileA1(tileId)) {

            if (!container._a1) container._a1 = [];

            const frameCount = (kind >= 4 && kind % 2 === 1) ? 3 : 4;

            for (let frame = 0; frame < frameCount; frame++) {

                const frameSprites = [];
                let table = Tilemap.FLOOR_AUTOTILE_TABLE;

                const water = [0, 1, 2, 1][frame % 4];

                if (kind === 0) { bx = water * 2; by = 0; }
                else if (kind === 1) { bx = water * 2; by = 3; }
                else if (kind === 2) { bx = 6; by = 0; }
                else if (kind === 3) { bx = 6; by = 3; }
                else {
                    bx = Math.floor(tx / 4) * 8;
                    by = ty * 6 + (Math.floor(tx / 2) % 2) * 3;

                    if (kind % 2 === 0) bx += water * 2;
                    else {
                        bx += 6;
                        table = Tilemap.WATERFALL_AUTOTILE_TABLE;
                        by += frame % 3;
                    }
                }

                const qTable = table[shape];

                for (let i = 0; i < 4; i++) {
                    const sx = (bx * 2 + qTable[i][0]) * w1;
                    const sy = (by * 2 + qTable[i][1]) * h1;

                    const s = new Sprite(this._regionBitmaps[0]);
                    s.setFrame(sx, sy, w1, h1);
                    s.x = (i % 2) * w1;
                    s.y = Math.floor(i / 2) * h1;
                    s.visible = (frame === 0);

                    container.addChild(s);
                    frameSprites.push(s);
                }

                container._a1.push(frameSprites);
            }

            return;
        }

        // A2–A4
        if (Tilemap.isTileA2(tileId)) {
            tilesetIndex = 1;
            bx = tx * 2;
            by = (ty - 2) * 3;
        } else if (Tilemap.isTileA3(tileId)) {
            tilesetIndex = 2;
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            bx = tx * 2;
            by = (ty - 6) * 2;
        } else if (Tilemap.isTileA4(tileId)) {
            tilesetIndex = 3;
            bx = tx * 2;
            by = Math.floor((ty - 10) * 2.5 + (ty % 2 ? 0.5 : 0));
            autotileTable = (ty % 2)
                ? Tilemap.WALL_AUTOTILE_TABLE
                : Tilemap.FLOOR_AUTOTILE_TABLE;
        }

        const table = autotileTable[shape];
        if (!table) return;

        const bitmap = this._regionBitmaps[tilesetIndex];

        for (let i = 0; i < 4; i++) {
            const sx = (bx * 2 + table[i][0]) * w1;
            const sy = (by * 2 + table[i][1]) * h1;

            const s = new Sprite(bitmap);
            s.setFrame(sx, sy, w1, h1);
            s.x = (i % 2) * w1;
            s.y = Math.floor(i / 2) * h1;

            container.addChild(s);
        }


    };

    // ==============================
    // AUTOTILE ANIMATION
    // ==============================
    Spriteset_Map.prototype.updateRegionAutotiles = function () {
        this._regionAnimFrame++;


        const frame = Math.floor(this._regionAnimFrame / 30);

        for (const key in this._regionSpriteMap) {
            const c = this._regionSpriteMap[key];
            if (!c._a1) continue;

            const index = frame % c._a1.length;

            c._a1.forEach((f, i) => {
                const visible = (i === index);
                f.forEach(s => s.visible = visible);
            });
        }


    };



    Spriteset_Map.prototype.updateRegionAlpha = function () {

        $gameSystem._under = $gameSystem._under ?? true;


        const rulesPassed = conditionFn();
        const visible = $gameSystem._under;
        if ($gamePlayer._level > 0)
            this._regionUpperSprites.z = 2.1;
        else
            this._regionUpperSprites.z = 3.1;


        //   LOWER LAYER
        if (this._regionLowerSprites) {
            this._regionLowerSprites.alpha = rulesPassed ? 1 : 0;
        }

        if (rulesPassed === this._lastRulesState  &&
            visible === this._lastRegionVisibility) {
            return;
        }

        this._lastRulesState  = rulesPassed;
        this._lastRegionVisibility = visible;



        //  UPPER LAYERS
        for (const key in this._regionSpriteMap) {
            const c = this._regionSpriteMap[key];

            let alpha
            const config = REGION_ALPHA[c.region];

            if (!config) {
                alpha = 1;
            } else if (config.force) {
                alpha = config.alpha;
            } else if (rulesPassed) {
                alpha = 0.5;
            } else if (visible) {
                alpha = config.alpha;
            } else {
                alpha = 1;
            }

            c.alpha = alpha;

        }

    };



    // ==============================
    // UPDATE LOOP
    // ==============================
    const _updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _updateTilemap.call(this);


        this.updateRegionLowerSprites();
        this.updateRegionLowerAutotiles();


        this.updateRegionUpperSprites();
        this.updateRegionAutotiles();
        this.updateRegionAlpha();

        if (this._regionUpperSprites) {
            this._regionUpperSprites.x = -this._tilemap.origin.x;
            this._regionUpperSprites.y = -this._tilemap.origin.y;
            if (this._regionNeedsSort) {
                this._regionUpperSprites.sortChildren();
                this._regionNeedsSort = false;
            }
        }

        if (this._regionLowerSprites) {
            this._regionLowerSprites.x = -this._tilemap.origin.x;
            this._regionLowerSprites.y = -this._tilemap.origin.y;
            if (this._regionLowerNeedsSort) {
                this._regionLowerSprites.sortChildren();
                this._regionLowerNeedsSort = false;
            }
        }



    };




})();
