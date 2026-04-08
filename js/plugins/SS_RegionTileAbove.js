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
 * @option Actors
 * @value Actors
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
    let rawRules = [];
    try {
        rawRules = JSON.parse(params.Rules || "[]");
    } catch (e) {
        console.warn("Invalid Rules param");
    }
    const Rules = rawRules.map(r => {
        try {
            return JSON.parse(r);
        } catch (e) {
            console.warn("Invalid rule:", r);
            return null;
        }
    }).filter(r => r !== null);
    const REGION_CONFIG = {
        254: { alpha: 1, force: true },
        255: { alpha: 0.65 },
        4: { alpha: 0, backgroundTile: 0 },
        2: {
            alpha: 0.65,
            level: 1,
            backgroundTile: 46,
            below: [4, 6], //horizontal
            above: [2, 8]  //vertical  

        }
    };
    const DEBUG = false;
    const REGION_LEVEL_GATE = {
        3: { level: 1, dir_lock: [4, 6], prev_regions: [2] },

    }

    const tileMap = {
        "10,12": { setX: 6, setY: 11 }
    };


    function getRegionLevel(regionId) {
        const config = REGION_CONFIG[regionId];
        return config?.level ?? 1;
    }

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

                const list = String(expected).split(",").map(v => sanitizeValue(v.trim()));

                return list.some(v => v === actual);
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

        const tileIndex = REGION_CONFIG[regionId]?.backgroundTile || 0
        return tileIndex + 1536;
    }


    // ==============================
    // INIT
    // ==============================
    const SS_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        SS_createTilemap.call(this);
        this._regionBitmaps = $gameMap.tileset().tilesetNames.map(n =>
            ImageManager.loadTileset(n || "")
        );
        this.createRegionLowerLayer();

        this.createRegionUpperLayer();

        // this.createRegionLayer();
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

    const SS_destroy = Spriteset_Map.prototype.destroy;
    Spriteset_Map.prototype.destroy = function (options) {

        if (this._regionLowerSprites) {
            this._regionLowerSprites.destroy({ children: true });
        }

        SS_destroy.call(this, options);
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


        //  LOWER cache
        this._lastLowerStartX = -1;
        this._lastLowerStartY = -1;
        //  LOWER animation (if you need it later)
        this._lowerAnimFrame = 0;
    };




    Spriteset_Map.prototype.createRegionUpperLayer = function () {
        //this._regionUpperlayer = this._tilemap;
        this._regionUpperlayer = new PIXI.Container();
        this._regionUpperlayer.sortableChildren = true;
        // Add it ABOVE tilemap but BELOW characters (we’ll adjust z next)
        this._tilemap.addChild(this._regionUpperlayer);
        this._regionUpperlayer.z = 3.1;
        this._regionUpperNeedsSort = false;
        //  UPPER-specific pools & maps
        this._regionUpperPool = [];
        this._regionUpperMap = {};

        //  UPPER cache
        this._lastUpperStartX = -1;
        this._lastUpperStartY = -1;
        //  UPPER animation (if you need it later)
        this._upperAnimFrame = 0;
    };


    Spriteset_Map.prototype._buildRegionContainer = function (mapX, mapY) {
        let container = this._regionUpperPool.pop();
        if (!container) container = new PIXI.Container();

        container.removeChildren();
        container._a1 = null;

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        for (let z = 0; z < 4; z++) {
            const tileId = $gameMap.tileId(mapX, mapY, z);
            if (!tileId) continue;

            if (Tilemap.isAutotile(tileId)) {
                this.SS__drawAutotile(container, tileId);
            } else {
                const frame = getTileFrameMZ(tileId, tw, th);
                const bitmap = this._regionBitmaps?.[frame.index];
                if (!bitmap) continue;

                const sprite = new Sprite(bitmap);
                sprite.setFrame(frame.sx, frame.sy, tw, th);
                sprite.x = 0;
                sprite.y = 0;

                container.addChild(sprite);
            }
        }


        return container;
    };


    Spriteset_Map.prototype.updateRegionUpperLayerSprites = function () {
        if (!this._regionUpperlayer) return;

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        // 1. Use displayX/Y for EVERYTHING to ensure sync
        const displayX = $gameMap.displayX();
        const displayY = $gameMap.displayY();

        // Calculate the integer start tile
        const startX = Math.floor(displayX);
        const startY = Math.floor(displayY);


        //Always update existing sprite positions first to prevent "lagging" behind the map
        for (const key in this._regionUpperMap) {
            const c = this._regionUpperMap[key];



            c.x = (c.mapX - displayX) * tw;
            c.y = (c.mapY - displayY) * th;
        }


        // 3. Cache check: If the integer tile hasn't changed, we don't need to create/remove sprites
        if (
            startX === this._lastUpperStartX &&
            startY === this._lastUpperStartY &&
            Object.keys(this._regionUpperMap).length > 0
        ) {
            return;
        }

        this._lastUpperStartX = startX;
        this._lastUpperStartY = startY;

        // Buffer of 2 tiles to prevent pop-in at edges
        const screenTileW = Math.ceil(Graphics.width / tw) + 2;
        const screenTileH = Math.ceil(Graphics.height / th) + 2;

        const newMap = {};

        const rulesPassed = this._cachedRulesResult !== undefined
            ? this._cachedRulesResult
            : conditionFn();
        const visible = $gameSystem._under ?? true;
        for (let y = -1; y < screenTileH; y++) { // Start at -1 to handle smooth scrolling
            for (let x = -1; x < screenTileW; x++) {
                const mapX = startX + x;
                const mapY = startY + y;

                if (!$gameMap.isValid(mapX, mapY)) continue;

                const region = $gameMap.regionId(mapX, mapY);

                if (REGION_CONFIG[region] === undefined) continue;

                const key = `${mapX},${mapY}`;
                newMap[key] = true;

                if (this._regionUpperMap[key]) continue;

                let container = this._buildRegionContainer(mapX, mapY)
                container.name = "TileUpper";



                let alpha = 1;
                const config = REGION_CONFIG[region];
                const level = getRegionLevel(region);
                if (config) {
                    if (config.force) alpha = config.alpha;
                    else if (rulesPassed) alpha = 0.5;
                    else if (visible) alpha = config.alpha;
                }
                const offset = mapY * 0.000001;
                container.alpha = alpha;


                container.x = (mapX - displayX) * tw;
                container.y = (mapY - displayY) * th;
                container.mapX = mapX
                container.mapY = mapY

                container.z = 3 + (level * 0.05) + offset;
                container.region = region;
                this._regionUpperlayer.addChild(container);
                this._regionUpperMap[key] = container;
                this._regionUpperNeedsSort = true;
            }
        }

        // 4. Cleanup: Remove tiles that are no longer in the 'newMap'
        for (const key in this._regionUpperMap) {
            if (!newMap[key]) {
                const c = this._regionUpperMap[key];
                this._regionUpperlayer.removeChild(c);
                this._regionUpperPool.push(c);
                this._regionUpperNeedsSort = true;
                delete this._regionUpperMap[key];
            }
        }

        if (this._regionUpperNeedsSort) {
            this._regionUpperlayer.sortChildren();
            this._regionUpperNeedsSort = false;
        }
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
                if (REGION_CONFIG[region]?.backgroundTile === undefined) continue;

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
                    this.SS__drawAutotile(container, tileId);
                } else {
                    const frame = getTileFrameMZ(tileId, tw, th);
                    const bitmap = this._regionBitmaps?.[frame.index];
                    if (!bitmap) continue;
                    const sprite = new Sprite(bitmap);

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
    // AUTOTILES
    // ==============================
    Spriteset_Map.prototype.SS__drawAutotile = function (container, tileId) {


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

                    const bitmap = this._regionBitmaps?.[0];
                    if (!bitmap) continue;

                    const s = new Sprite(bitmap);
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

        const bitmap = this._regionBitmaps?.[tilesetIndex];
        if (!bitmap) return;
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
        this._upperAnimFrame++;
        const frame = Math.floor(this._upperAnimFrame / 30);
        for (const key in this._regionUpperMap) {
            const c = this._regionUpperMap[key];
            if (!c._a1) continue;
            const index = frame % c._a1.length;
            c._a1.forEach((f, i) => {
                const visible = (i === index);
                f.forEach(s => s.visible = visible);
            });
        }


    };

    Spriteset_Map.prototype.getSpriteForCharacter = function (character) {
        return this._characterSprites.find(s => s._character === character);
    };




    Spriteset_Map.prototype.updateRegionAlpha = function () {

        if (this._cachedRulesResult === undefined || (Graphics.frameCount % 10 === 0)) {
            this._cachedRulesResult = conditionFn();
        }
        const rulesPassed = this._cachedRulesResult;

        const visible = $gameSystem._under ?? true;

        //   LOWER LAYER
        if (this._regionLowerSprites) {
            this._regionLowerSprites.visible = !!rulesPassed;
        }



        if (rulesPassed === this._lastRulesState &&
            visible === this._lastRegionVisibility) {
            return;
        }

        this._lastRulesState = rulesPassed;
        this._lastRegionVisibility = visible;


        const startX = Math.floor($gameMap.displayX());
        const startY = Math.floor($gameMap.displayY());
        const screenTileW = Math.ceil(Graphics.width / $gameMap.tileWidth()) + 2;
        const screenTileH = Math.ceil(Graphics.height / $gameMap.tileHeight()) + 2;


        const regionAlpha = {};
        for (const regionId in REGION_CONFIG) {
            const config = REGION_CONFIG[regionId];
            if (!config) regionAlpha[regionId] = 1;
            else if (config.force) regionAlpha[regionId] = config.alpha;
            else if (rulesPassed) regionAlpha[regionId] = 0.5;
            else if (visible) regionAlpha[regionId] = config.alpha;
            else regionAlpha[regionId] = 1;
        }
        // Apply precomputed alpha
        for (const key in this._regionUpperMap) {
            const c = this._regionUpperMap[key];
            if (c.mapX < startX - 1 || c.mapX > startX + screenTileW ||
                c.mapY < startY - 1 || c.mapY > startY + screenTileH) continue;
            const alpha = regionAlpha[c.region] ?? 1;
            if (c.alpha !== alpha) c.alpha = alpha;
        }
    };

    Spriteset_Map.prototype.updateRegionLevel = function () {
        for (const key in this._regionUpperMap) {
            const c = this._regionUpperMap[key];
            const level = getRegionLevel(c.region);
            const offset = c.mapY * 0.000001;
            c.z = 3 + (level * 0.1) + offset;
        }
    }

    // ==============================
    // UPDATE LOOP
    // ==============================
    const SS_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        SS_updateTilemap.call(this);
        this.updateRegionLowerSprites();
        this.updateRegionLowerAutotiles();
        this.updateRegionUpperLayerSprites()
        this.updateRegionAutotiles()
        this.updateRegionAlpha()

        if (this._regionLowerSprites) {
            this._regionLowerSprites.x = -this._tilemap.origin.x;
            this._regionLowerSprites.y = -this._tilemap.origin.y;
            if (this._regionLowerNeedsSort) {
                this._regionLowerSprites.sortChildren();
                this._regionLowerNeedsSort = false;
            }
        }
    };



    const SS_playerUpdate = Game_Player.prototype.update;
    Game_Player.prototype.update = function (sceneActive) {
        SS_playerUpdate.call(this, sceneActive);
        this.updateRegionLogic();
    };

    const SS_followerUpdate = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function () {
        SS_followerUpdate.call(this);
        this.updateRegionLogic();
    };


    const SS_eventUpdate = Game_Event.prototype.update;
    Game_Event.prototype.update = function () {
        SS_eventUpdate.call(this);
        this.updateRegionLogic();
    };

    Game_CharacterBase.prototype.regionLevel = function () {
        return this._regionLevel || 0;
    };

    Game_CharacterBase.prototype.setRegionLevel = function (value) {
        this._regionLevel = value;
    };


    Game_CharacterBase.prototype.updateRegionLogic = function () {
        const x = this.x;
        const y = this.y;
        const region = this.regionId();

        this._regionCount = this._regionCount || {};

        // Only trigger when character moves
        if (x !== this._lastX || y !== this._lastY) {
            this._lastX = x;
            this._lastY = y;
            this._handleRegionZigZag(region, x, y);
        }
    };





    Game_CharacterBase.prototype._handleRegionZigZag = function (region, x, y) {

        const keys = Object.keys(REGION_LEVEL_GATE).map(k => parseInt(k, 10));
        if (!keys.includes(region)) {
            this._lastRegionTile = null;
            return;
        }

        // First tile
        if (!this._lastRegionTile) {
            this._lastRegionTile = { x, y };
            return;
        }

        // Must be different tile
        if (this._lastRegionTile.x !== x || this._lastRegionTile.y !== y) {
            this._regionCount[region] = this._regionCount[region] || 0;
            this._regionCount[region]++;

            // change per region
            const delta = this._regionCount[region] % 2 === 1 ? 1 : -1;

            this.setRegionLevel(this.regionLevel() + delta);

            this._lastRegionTile = { x, y };
        }
    };

    //$gameMap.event(5).setRegionLevel(2);

    const SS_Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function () {
        SS_Sprite_Character_updatePosition.call(this);

        this.updateRegionZ();
    };




    Sprite_Character.prototype.updateRegionZ = function () {
        const character = this._character;
        if (!character) return;

        const x = character.x;
        const y = character.y;

        const regionId = $gameMap.regionId(x, y);
        const regionLevel = getRegionLevel(regionId);
        const charLevel = character.regionLevel();
        const ind = charLevel * .1
        let offset = y * 0.000001;


        if (character instanceof Game_Event) {
            offset = y * 0.000002;
        }

        // Target Z
        let targetZ;


        if (charLevel < regionLevel) {
            targetZ = 2.9 + offset; // below
        } else {
            targetZ = 3.2 + offset; // above
        }


        // Initialize smooth value
        if (this._zSmooth === undefined) {
            this._zSmooth = targetZ;
        }

        // Smooth interpolation (tweak 0.25 for speed)
        this._zSmooth += (targetZ - this._zSmooth) * 0.25;

        this.z = this._zSmooth;
    };



    // Helper function to safely set region IDs
    Game_Map.prototype.setRegionId = function (x, y, regionId = 0) {

        const width = $dataMap.width;
        const height = $dataMap.height;
        const key = (5 * height + y) * width + x;
        $dataMap.data[key] = regionId
    };


    Game_Map.prototype.checkRegionMap = function () {

        const width = this.width();
        const height = this.height();
        const temp_array = [];
        const keys = Object.keys(REGION_LEVEL_GATE).map(k => parseInt(k, 10));
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const region = this.regionId(x, y);
                if (!keys.includes(region)) continue
                const locations = [
                    [x, y - 1], // top
                    [x, y + 1], // down
                    [x - 1, y], // left
                    [x + 1, y]  // right
                ];

                locations.forEach(element => {
                    const x = element[0]
                    const y = element[1]
                    if (this.regionId(x, y) == 0)
                        temp_array.push({ x: x, y: y, region: region })
                });

            }
        }
        temp_array.forEach(e => {
            this.setRegionId(e.x, e.y, e.region)
        });

    }
    // Ensure code runs after map data is fully initialized
    const ss_onMapLoaded = Scene_Map.prototype.onMapLoaded
    Scene_Map.prototype.onMapLoaded = function () {
        $gameMap.checkRegionMap()
        ss_onMapLoaded.call(this)
    };



    function isUnderRegion(character) {
        const x = character.x;
        const y = character.y;

        const regionId = $gameMap.regionId(x, y);
        const regionLevel = getRegionLevel(regionId);
        const charLevel = character.regionLevel();

        return charLevel < regionLevel;
    }

    // Ladder
    const SS_isOnLadder = Game_CharacterBase.prototype.isOnLadder;
    Game_CharacterBase.prototype.isOnLadder = function () {
        if (isUnderRegion(this)) return false;
        return SS_isOnLadder.call(this);
    };

    // Damage Floor
    const SS_isOnDamageFloor = Game_CharacterBase.prototype.isOnDamageFloor;
    Game_CharacterBase.prototype.isOnDamageFloor = function () {
        if (isUnderRegion(this)) return false;
        return SS_isOnDamageFloor.call(this);
    };

    // Bush
    const SS_isOnBush = Game_CharacterBase.prototype.isOnBush;
    Game_CharacterBase.prototype.isOnBush = function () {
        if (isUnderRegion(this)) return false;
        return SS_isOnBush.call(this);
    };

    function getRelativePosition(character, x, y) {
        const regionId = $gameMap.regionId(x, y);
        const regionLevel = getRegionLevel(regionId); // your function
        const charLevel = character.regionLevel();    // your function

        if (charLevel > regionLevel) return "above";
        if (charLevel < regionLevel) return "below";
        return "same";
    }


    Game_Player.prototype.getSameLevelEvents = function (events) {
        return events.filter(event => {
            if (!event) return false;

            const playerLevel = this.regionLevel();
            const eventLevel = event.regionLevel();

            return playerLevel === eventLevel;
        });
    };

    const SS_startMapEvent = Game_Player.prototype.startMapEvent;
    Game_Player.prototype.startMapEvent = function (x, y, triggers, normal) {
        if ($gameMap.isEventRunning()) return;
        const playerLevel = this.regionLevel();
        // Save the original eventsXy
        const originalEventsXy = $gameMap.eventsXy;
        // Override eventsXy temporarily to filter by level
        $gameMap.eventsXy = function (x, y) {
            return originalEventsXy.call(this, x, y).filter(event =>
                event.regionLevel() === playerLevel
            );
        };

        // Call the original function — now it only sees events on the same level
        SS_startMapEvent.call(this, x, y, triggers, normal);

        // Restore the original function
        $gameMap.eventsXy = originalEventsXy;
    };


    // Extend Game_Event to read meta for region level
    const SS_Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function (mapId, eventId) {
        SS_Game_Event_initialize.call(this, mapId, eventId);

        // Default level if not specified
        this._regionLevel = 0;


        this._invisible = this.event().meta.invisible ?? false


        // Check the note for <level:n>
        const levelMeta = this.event().note.match(/<level:(\d+)>/i);
        if (levelMeta) {
            this._regionLevel = Number(levelMeta[1]);
        }

    };


    const SS_Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function () {
        SS_Sprite_Character_update.call(this);
        this.updateRegionAlpha();
    };

    Sprite_Character.prototype.updateRegionAlpha = function () {
        if (!this._character || !(this._character instanceof Game_Event)) return;

        const event = this._character;


        if (this._cachedRulesResult === undefined || (Graphics.frameCount % 10 === 0)) {
            this._cachedRulesResult = conditionFn();
        }

        // Rule: if event level != player level, make alpha 0.75
        if (event._invisible) {
            this.alpha = this._cachedRulesResult ? 0.75 : 0
        }
    };




    // Backup original method
    const SS_canPass = Game_CharacterBase.prototype.canPass;

    Game_CharacterBase.prototype.canPass = function (x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);


        if (!$gameMap.isValid(x2, y2)) {
            return false;
        }

        // First, check the original collision rules (walls, terrain, default events)
        let canPassOriginal = SS_canPass.call(this, x, y, d);
        if (canPassOriginal) return true; // Tile is already passable

        const myLevel = this.regionLevel();

        // Get all events at the target tile
        const eventsAtTile = $gameMap.eventsXyNt(x2, y2);

        // Check if any event at the same level is blocking
        const sameLevelBlocking = eventsAtTile.some(event =>
            event.isNormalPriority() && (event.regionLevel() === myLevel)
        );

        // If no same-level blocking event exists and the map tile itself is passable, allow movement
        if (!sameLevelBlocking && this.isMapPassable(x, y, d)) return true;

        // Otherwise, blocked
        return canPassOriginal;
    };

    const SS_isMapPassable = Game_CharacterBase.prototype.isMapPassable

    Game_CharacterBase.prototype.isMapPassable = function (x, y, d) {
        const x2 = $gameMap.roundXWithDirection(x, d);
        const y2 = $gameMap.roundYWithDirection(y, d);
        const d2 = this.reverseDir(d);

        const regionId = $gameMap.regionId(x, y);
        const nextRegionId = $gameMap.regionId(x2, y2);

        //let move inside the same region freely
        if (regionId > 0 && regionId == nextRegionId) return $gameMap.isValid(x2, y2);
        //Always allow entering a configured region



        if (!REGION_CONFIG[regionId] && REGION_CONFIG[nextRegionId]) {
            const rel = getRelativePosition(this, x, y); // above/below/same
            const rules = REGION_CONFIG[nextRegionId]?.[rel];
            if (REGION_CONFIG?.[nextRegionId]?.force) return SS_isMapPassable.call(this, x, y, d);
            if (rules && !rules.includes(d2)) return false;
            return true;
        }

        //Leaving a configured region: check region rules
        if (REGION_CONFIG[regionId] && regionId !== nextRegionId) {
            const rel = getRelativePosition(this, x2, y2); // above/below/same
            const rules = REGION_CONFIG[regionId]?.[rel];

            if (rules) {
                //Check if the move direction is allowed
                if (!rules.includes(d)) return false;
                //Check if the next tile is actually passable (not a wall or obstacle)  
                return SS_isMapPassable.call(this, x2, y2, d);
            }
        }
        //Default: use normal passability
        return SS_isMapPassable.call(this, x, y, d);
    };


    class RegionOverlay extends Sprite {
        constructor() {
            super();
            this.tileSize = $gameMap.tileWidth();
            const mapWidth = $gameMap.width() * this.tileSize;
            const mapHeight = $gameMap.height() * this.tileSize;
            this.bitmap = new Bitmap(mapWidth, mapHeight);
            this.refresh();
        }

        refresh() {
            this.bitmap.clear();
            const map = $gameMap;
            const width = map.width();
            const height = map.height();

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const regionId = map.regionId(x, y);
                    if (regionId > 0) {
                        const color = `rgba(${regionId * 20 % 256}, 100, 200, 0.5)`;
                        this.bitmap.fillRect(
                            x * this.tileSize,
                            y * this.tileSize,
                            this.tileSize,
                            this.tileSize,
                            color
                        );
                        this.bitmap.drawText(
                            regionId,
                            x * this.tileSize,
                            y * this.tileSize,
                            this.tileSize,
                            this.tileSize,
                            "center"
                        );
                    }
                }
            }
        }

        update() {
            super.update();
            // Keep overlay aligned with the map camera
            this.x = -$gameMap.displayX() * this.tileSize;
            this.y = -$gameMap.displayY() * this.tileSize;
        }
    }

    // Add overlay to the scene
    const SS_Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function () {
        SS_Scene_Map_createAllWindows.call(this);
        if (!DEBUG) return
        this._regionOverlay = new RegionOverlay();
        this.addChild(this._regionOverlay);
    };

    /*
    SS_pickUpEvent=Game_CharacterBase.prototype.pickUpEvent
    // Add or replace method on Game_CharacterBase
    Game_CharacterBase.prototype.pickUpEvent = function (eventId) {

        const regionId = $gameMap.regionId($gamePlayer._x, $gamePlayer._y);
        
        if(!REGION_CONFIG[regionId]) return SS_pickUpEvent.call(this,eventId)
    
        const event = $gameMap.event(eventId);
        if (!event) return;

        // Move event one tile in player direction
        const dir = $gamePlayer.direction();
        switch (dir) {
            case 2: event.moveStraight(2); break;
            case 4: event.moveStraight(4); break;
            case 6: event.moveStraight(6); break;
            case 8: event.moveStraight(8); break;
        }
    };
    */


    const SS_getThrowPosition = Game_CharacterBase.prototype.getThrowPosition

    Game_CharacterBase.prototype.getThrowPosition = function (x, y) {
        
        return SS_getThrowPosition.call(this, x, y)
    }



})();
