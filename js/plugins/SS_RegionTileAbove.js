/*:
* @target MZ
* @plugindesc Region tiles rendered above characters (optimized + autotiles + smart caching)
* @author Squall_seawave 
*
* @param CustomCondition
* @text Customcondition
* @desc addcondition
* @type string
* @default $gameSwitches.value(1)
*/ 

(() => {
 
    const pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    const params = PluginManager.parameters(pluginName);
    const Customcondition =  (params.CustomCondition || "" )!==""? params.CustomCondition:false
    const REGION_ALPHA = {
        254: 2,
        255: 0.65,
        2: 0.65

    };

    const regionTileMap = {
        255: 46,
        2: 46,

    };

    const tileMap = {
        "10,12": { setX: 11, setY: 12 }
    };

    function evalCondition(condition) {
         try {
            return !!Function("return (" + condition + ")")();
        } catch (e) {
            console.error("Region Plugin: invalid condition ->", condition);
            return false;
        }
    }

   

    function getTileIdAt(regionId, x, y) {
        const mapping = tileMap[`${x},${y}`];

        if (mapping) {
            const tileId = $gameMap.tileId(mapping.setX, mapping.setY, 0);
            if (!Tilemap.isTileA1(tileId)) {
                return tileId;
            }
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



    Spriteset_Map.prototype.createRegionLowerLayer = function () {
        const tileset = $gameMap.tileset();
        if (!tileset) return;

        this._regionLower = new Tilemap();
        this._regionLower.tileWidth = $gameMap.tileWidth();
        this._regionLower.tileHeight = $gameMap.tileHeight();

        // Load the same tilesets as the map so tile IDs match
        const bitmaps = tileset.tilesetNames.map(name => ImageManager.loadTileset(name || ""));
        this._regionLower.setBitmaps(bitmaps);
        this._regionLower.flags = $gameMap.tilesetFlags();
        this._regionLower._mapWidth = $gameMap.width();
        this._regionLower._mapHeight = $gameMap.height();
        this._regionLower._mapData = [];

        // Populate overlay: only layer 0
        for (let y = 0; y < $gameMap.height(); y++) {
            for (let x = 0; x < $gameMap.width(); x++) {
                const region = $gameMap.regionId(x, y);
                let tileId = 0


                if (regionTileMap[region] !== undefined) tileId = getTileIdAt(region, x, y)
                // NOTE:
                //Intentionally push only 1 value per tile instead of 6.
                // This uses Tilemap as a flat tile stream
                // Do NOT convert to 6-layer format or rendering will break.
                //correct format
                //this._regionLower._mapData.push(tileId, 0, 0, 0, 0, 0);
                this._regionLower._mapData.push(tileId);


            }
        }

        this._regionLower.z = 0.5; // above layer 0, below player
        this._tilemap.addChild(this._regionLower);
        // Ensure children are sorted by z
        this._tilemap.children.sort((a, b) => (a.z || 0) - (b.z || 0));
    };



    Spriteset_Map.prototype.createRegionLayer = function () {
        this._regionUpperSprites = new PIXI.Container();
        this._regionUpperSprites.sortableChildren = true;


        this._tilemap.parent.addChild(this._regionUpperSprites);

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

    // ==============================
    // UPDATE LOOP
    // ==============================
    const _updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _updateTilemap.call(this);


        this.updateRegionUpperSprites();
        this.updateRegionAutotiles();
        this.updateRegionAlpha();

        if (this._regionUpperSprites) {
            this._regionUpperSprites.x = -this._tilemap.origin.x;
            this._regionUpperSprites.y = -this._tilemap.origin.y;
            this._regionUpperSprites.sortChildren();
        }

        if (this._regionLower) {
            this._regionLower.origin.x = this._tilemap.origin.x;
            this._regionLower.origin.y = this._tilemap.origin.y;
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

        const pathfind = evalCondition (Customcondition) ;
        const visible = $gameSystem._under;

        //   LOWER LAYER
        if (this._regionLower) {
            this._regionLower.alpha = pathfind ? 1 : 0;
        }

        if (pathfind === this._lastPathfindState &&
            visible === this._lastRegionVisibility) {
            return;
        }

        this._lastPathfindState = pathfind;
        this._lastRegionVisibility = visible;



        //  UPPER LAYERS
        for (const key in this._regionSpriteMap) {
            const c = this._regionSpriteMap[key];

            let alpha
            const val = REGION_ALPHA[c.region];;

            if (typeof val !== "number" || val < 0 || val > 1) {
                alpha = 1
            }
            else if (pathfind) {
                alpha = 0.5;
            } else if (visible) {
                alpha = val ?? 1;
            } else {
                alpha = 1;
            }
            c.alpha = alpha;
        }
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

        if (this._regionLower) {
            this._regionLower.destroy();
        }

        _destroy.call(this, options);
    };


})();
