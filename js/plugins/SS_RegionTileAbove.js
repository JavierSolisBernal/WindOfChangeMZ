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
            pass_levels: [
                { level: 0, directions: ["L", "R"], visible: true },
                { level: 1, directions: ["U", "D"] }
            ]
        }
    };


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
    const _createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _createTilemap.call(this);
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

    const _destroy = Spriteset_Map.prototype.destroy;
    Spriteset_Map.prototype.destroy = function (options) {

        if (this._regionLowerSprites) {
            this._regionLowerSprites.destroy({ children: true });
        }

        _destroy.call(this, options);
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
        this._regionUpperlayer = this._tilemap;
        this._regionUpperlayer.sortableChildren = true;
        //this._tilemap.addChild(this._regionLowerSprites);
        //  LOWER-specific pools & maps
        this._regionUpperPool = [];
        this._regionUpperMap = {};

        //  LOWER cache
        this._lastUpperStartX = -1;
        this._lastUpperStartY = -1;
        //  LOWER animation (if you need it later)
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
                this._drawAutotile(container, tileId);
            } else {
                const frame = getTileFrameMZ(tileId, tw, th);
                const bitmap = this._regionBitmaps[frame.index];
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
        if (startX === this._lastUpperStartX && startY === this._lastUpperStartY) {
            return;
        }

        this._lastUpperStartX = startX;
        this._lastUpperStartY = startY;

        // Buffer of 2 tiles to prevent pop-in at edges
        const screenTileW = Math.ceil(Graphics.width / tw) + 2;
        const screenTileH = Math.ceil(Graphics.height / th) + 2;

        const newMap = {};

        const rulesPassed = this._cachedRulesResult ?? conditionFn();
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
                offset = mapY * 0.000001;
                container.alpha = alpha;


                container.x = (mapX - displayX) * tw;
                container.y = (mapY - displayY) * th;
                container.mapX = mapX
                container.mapY = mapY

                container.z = 3 + (level * 0.05) + offset;
                container.region = region;
                this._regionUpperlayer.addChild(container);
                this._regionUpperMap[key] = container;
            }
        }

        // 4. Cleanup: Remove tiles that are no longer in the 'newMap'
        for (const key in this._regionUpperMap) {
            if (!newMap[key]) {
                const c = this._regionUpperMap[key];
                this._regionUpperlayer.removeChild(c);
                this._regionUpperPool.push(c);
                delete this._regionUpperMap[key];
            }
        }

        this._regionUpperlayer.sortChildren();
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
                    this._drawAutotile(container, tileId);
                } else {
                    const frame = getTileFrameMZ(tileId, tw, th);
                    const bitmap = this._regionBitmaps[frame.index];
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

                    const bitmap = this._regionBitmaps[0];
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

        const bitmap = this._regionBitmaps[tilesetIndex];
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
        // _characterSprites holds all active Sprite_Character instances
        return this._characterSprites.find(s => s._character === character);
    };

    Spriteset_Map.prototype.updateZregion = function () {

        return
        for (const key in this._regionUpperMap) {
            const c = this._regionUpperMap[key];
            const config = REGION_CONFIG[c.region];
            let zmove

            if (!config) zmove = 3.1
            else {
                const configlevel = config.level ?? 1
                zmove = $gameSystem.Playerlevel < configlevel ? 3.1 : 2.9
            }
            c.z = zmove
        }
        this._regionUpperlayer.sortChildren();
    }


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
    const _updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _updateTilemap.call(this);
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



    const _playerUpdate = Game_Player.prototype.update;
    Game_Player.prototype.update = function (sceneActive) {
        _playerUpdate.call(this, sceneActive);
        this.updateRegionLogic();
    };

    const _followerUpdate = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function () {
        _followerUpdate.call(this);
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
        if (region !== 3) {
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

            // ✅ Zigzag per character
            const delta = this._regionCount[region] % 2 === 1 ? 1 : -1;

            this.setRegionLevel(this.regionLevel() + delta);

            this._lastRegionTile = { x, y };
        }
    };

    //$gameMap.event(5).setRegionLevel(2);

    const _Sprite_Character_updatePosition = Sprite_Character.prototype.updatePosition;
    Sprite_Character.prototype.updatePosition = function () {
        _Sprite_Character_updatePosition.call(this);

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

        const baseZ = this.z; // engine-calculated base

        let offset = y * 0.000001;
        this.z = 3 + ind + offset;
        return
        if (charLevel < regionLevel) {
            // BELOW tile
            this.z = 2 + ind + offset;
        } else {
            // ABOVE tile
            this.z = 3 + ind + offset;
        }
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
        const offset = y * 0.000001;

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


})();
