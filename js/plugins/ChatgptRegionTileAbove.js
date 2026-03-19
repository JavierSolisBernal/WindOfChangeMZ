/*:
 * @target MZ
 * @plugindesc Region tiles rendered above characters
 * @author Squall_seawave
 *
 * @param RegionId
 * @type number[]
 * @default [225]
 */


(() => {

    const pluginName = "ChatgptRegionTileAbove";
    const params = PluginManager.parameters(pluginName);
    const REGION_ID = [254, 255, 2]
    const DEBUG_OUTLINE = false//params.DebugOutline === 'true';
    const BLINK_INTERVAL = Number(params.BlinkInterval || 40);
    const REGION_ALPHA = {
        254: 1.0,   // no fade
        255: 0.65,   // fade
        2: 0.65  // fade almost solid
    };

    const regionTileMap = {
        255: 46, // region 1 → tile ID 20
        2: 46,

    };

    function getTileIdForRegion(regionId) {
        return regionTileMap[regionId] || 0;
    }

    const _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _Spriteset_Map_createTilemap.call(this);

        this.createRegionLowerLayer();
        //this.createRegionUpperLayer();
        this.createRegionUpperLayerSprites()

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
                if (region in regionTileMap) tileId = 1536 + getTileIdForRegion(region);
                this._regionLower._mapData.push(tileId);

            }
        }

        this._regionLower.z = 0.5; // above layer 0, below player
        this._tilemap.addChild(this._regionLower);
        // Ensure children are sorted by z
        this._tilemap.children.sort((a, b) => (a.z || 0) - (b.z || 0));
    };





    function getTileFrameMZ(tileId, tw, th) {
        let index = 0;
        let localId = 0;
        let sx = 0;
        let sy = 0;

        if (tileId >= 1536) {
            // A5
            index = 4;
            localId = tileId - 1536;
        } else {
            // B–E
            index = Math.floor(tileId / 256) + 5;
            localId = tileId % 256;
        }

        const cols = 8;
        const col = localId % cols;
        const row = Math.floor(localId / cols);

        sx = col * tw;
        sy = row * th;

        return {
            index: index,
            sx: sx,
            sy: sy
        };
    }


    function drawAutotileToContainer(container, region, bitmaps, tileId, x, y, z, tw, th) {
        const kind = Tilemap.getAutotileKind(tileId);
        const shape = Tilemap.getAutotileShape(tileId);
        const tileKey = `{x:${x},y:${y},tileId:${tileId}}`;
        const tx = kind % 8;
        const ty = Math.floor(kind / 8);

        let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
        let tilesetIndex = 0;
        let bx = 0;
        let by = 0;

        const w1 = tw / 2;
        const h1 = th / 2;

        // — A1 (animated) —
        if (Tilemap.isTileA1(tileId)) {
            if (!container._a1Sprites) container._a1Sprites = {};
            const tileKey = `${x},${y}`;
            if (container._a1Sprites[tileKey]) return; // Already created

            container._a1Sprites[tileKey] = [];

            const isWaterfall = (kind >= 4 && kind % 2 === 1);
            const frameCount = isWaterfall ? 3 : 4; // Waterfall=3, water=4
            const w1 = tw / 2;
            const h1 = th / 2;

            for (let frame = 0; frame < frameCount; frame++) {
                const frameSprites = [];
                let bx = 0;
                let by = 0;
                let table = Tilemap.FLOOR_AUTOTILE_TABLE;

                const tx = kind % 8;
                const ty = Math.floor(kind / 8);
                const waterSurfaceIndex = [0, 1, 2, 1][frame % 4];

                if (kind === 0) { bx = waterSurfaceIndex * 2; by = 0; }
                else if (kind === 1) { bx = waterSurfaceIndex * 2; by = 3; }
                else if (kind === 2) { bx = 6; by = 0; }
                else if (kind === 3) { bx = 6; by = 3; }
                else {
                    bx = Math.floor(tx / 4) * 8;
                    by = ty * 6 + (Math.floor(tx / 2) % 2) * 3;
                    if (kind % 2 === 0) bx += waterSurfaceIndex * 2; // water
                    else { bx += 6; table = Tilemap.WATERFALL_AUTOTILE_TABLE; by += frame % 3; } // waterfall
                }

                const quarterTable = table[shape];
                for (let i = 0; i < 4; i++) {
                    const qsx = quarterTable[i][0];
                    const qsy = quarterTable[i][1];
                    const sx1 = (bx * 2 + qsx) * w1;
                    const sy1 = (by * 2 + qsy) * h1;

                    const sprite = new Sprite(bitmaps[0]);
                    sprite.setFrame(sx1, sy1, w1, h1);
                    sprite.x = x + (i % 2) * w1;
                    sprite.y = y + Math.floor(i / 2) * h1;
                    sprite.visible = (frame === 0); // Show first frame initially

                    sprite._kind = kind;   // Store kind for update
                    sprite._shape = shape; // Store shape for update
                    sprite.z = z
                    sprite.region = region
                    container.addChild(sprite);
                    frameSprites.push(sprite);
                }

                container._a1Sprites[tileKey].push(frameSprites);
            }
            return; // skip A2/A3/A4
        }

        // — A2 (ground) —
        else if (Tilemap.isTileA2(tileId)) {
            tilesetIndex = 1;
            autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;

            bx = tx * 2;
            by = (ty - 2) * 3;
        }
        // — A3 (building walls) —
        else if (Tilemap.isTileA3(tileId)) {
            tilesetIndex = 2;
            autotileTable = Tilemap.WALL_AUTOTILE_TABLE;

            bx = tx * 2;
            by = (ty - 6) * 2;
        }
        // — A4 (walls/ceilings) —
        else if (Tilemap.isTileA4(tileId)) {
            tilesetIndex = 3;

            bx = tx * 2;
            // MZ uses a non‑integer pattern here
            by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));

            // odd shapes use the wall table
            if (ty % 2 === 1) {
                autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
            } else {
                autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
            }
        }

        const table = autotileTable[shape];
        if (!table) return;


        const bitmap = bitmaps[tilesetIndex];

        for (let i = 0; i < 4; i++) {
            const qsx = table[i][0];
            const qsy = table[i][1];

            const sx1 = (bx * 2 + qsx) * w1;
            const sy1 = (by * 2 + qsy) * h1;

            const sprite = new Sprite(bitmap);
            sprite.setFrame(sx1, sy1, w1, h1);

            sprite.x = x + (i % 2) * w1;
            sprite.y = y + Math.floor(i / 2) * h1;
            sprite.z = z
            sprite.region = region
            container.addChild(sprite);
        }
    }





    /* -------------------------- Upper Layer (Sprites) -------------------------- */
    Spriteset_Map.prototype.createRegionUpperLayerSprites = function () {
        const tileset = $gameMap.tileset();
        if (!tileset) return;

        this._regionUpperSprites = new PIXI.Container();
        const bitmaps = tileset.tilesetNames.map(name => ImageManager.loadTileset(name || ""));

        const tw = $gameMap.tileWidth();
        const th = $gameMap.tileHeight();

        this._regionShapes = new PIXI.Container();

        for (let y = 0; y < $gameMap.height(); y++) {
            for (let x = 0; x < $gameMap.width(); x++) {

                const region = $gameMap.regionId(x, y);
                if (!REGION_ID.includes(region)) continue;

                let z = 0

                for (z = 0; z < 4; z++) {
                    const tileId = $gameMap.tileId(x, y, z);

                    if (!tileId) continue;


                    if (Tilemap.isAutotile(tileId)) {
                        drawAutotileToContainer(this._regionUpperSprites, region, bitmaps, tileId, x * tw, y * th, z, tw, th);
                    } else {
                        const frame = getTileFrameMZ(tileId, tw, th);
                        const tilesetIndex = frame.index;
                        const sprite = new Sprite(bitmaps[tilesetIndex]);
                        sprite.setFrame(frame.sx, frame.sy, tw, th);

                        sprite.x = x * tw;
                        sprite.y = y * th;


                        sprite.region = region;
                        this._regionUpperSprites.addChild(sprite);
                    }

                    /* -------- DEBUG OUTLINE -------- */
                    if (DEBUG_OUTLINE) {
                        const shape = new PIXI.Graphics();
                        shape.lineStyle(2, 0xff0000);
                        shape.beginFill(0xff0000, 0.4);
                        shape.drawRect(2, 2, tw - 4, th - 4);
                        shape.endFill();
                        shape.x = x * tw;
                        shape.y = y * th;
                        shape.z = z
                        this._regionShapes.addChild(shape);
                    }
                }
            }
        }

        this._tilemap.parent.addChild(this._regionUpperSprites);

        if (DEBUG_OUTLINE) {
            this._tilemap.parent.addChild(this._regionShapes);
        }
    };

    Spriteset_Map.prototype.updateRegionAlpha = function () {
        const visible = $gameSwitches.value(1);
        this._regionUpperSprites.children.forEach(sprite => {
            const alpha = sprite.region !== undefined
                ? (REGION_ALPHA[sprite.region] ?? 1)
                : 0.5;
            sprite.alpha = visible ? alpha : 1;
        });
    };







    function updateA1Sprites(container, tilemap) {
        if (!container._a1Sprites) return;
        const animationFrame = container._animationFrame || 0;

        for (const tileKey in container._a1Sprites) {
            const frames = container._a1Sprites[tileKey];
            if (!frames || frames.length === 0) continue;

            const firstSprite = frames[0][0];
            const kind = firstSprite._kind ?? 0;
            const frameCount = (kind >= 4 && kind % 2 === 1) ? 3 : 4;

            const frameIndex = Math.floor(animationFrame / 15) % frameCount;

            frames.forEach((frameSprites, idx) => {
                const visible = (idx === frameIndex);
                frameSprites.forEach(s => s.visible = visible);
            });
        }
    }

    // --- Update region layer ---
    const _Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _Spriteset_Map_updateTilemap.call(this);

        /*
       if (this._regionUpper) {
           
           this._regionUpper.origin.x = this._tilemap.origin.x;
           this._regionUpper.origin.y = this._tilemap.origin.y;
           this._regionUpper.alpha=0.5
           this._regionUpper.z=20
           
       }*/

        if (this._regionUpperSprites) {
            this._regionUpperSprites.x = -this._tilemap.origin.x;
            this._regionUpperSprites.y = -this._tilemap.origin.y;

            this.updateRegionAlpha();

            if (this._regionUpperSprites && this._regionUpperSprites._a1Sprites) {
                if (!this._regionUpperSprites._animationFrame) this._regionUpperSprites._animationFrame = 0;
                // Advance every 15 frames (same speed as MZ)
                if (Graphics.frameCount % 2 === 0) {
                    this._regionUpperSprites._animationFrame++;
                }

                updateA1Sprites(this._regionUpperSprites, this._regionUpperSprites);
            }

            //updateA1Sprites(this._regionUpperSprites, this._tilemap);
        }

        if (this._regionLower) {
            this._regionLower.origin.x = this._tilemap.origin.x;
            this._regionLower.origin.y = this._tilemap.origin.y;
            //this._regionLower.alpha=0

        }

        if (DEBUG_OUTLINE && this._regionShapes) {
            this._regionShapes.x = -this._tilemap.origin.x;
            this._regionShapes.y = -this._tilemap.origin.y;
        }
    };




})();


