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
    //const REGION_ID = Number(params.RegionId || 5);
    const REGION_ID = [254, 255]
    const DEBUG_OUTLINE = true//params.DebugOutline === 'true';
    const BLINK_INTERVAL = Number(params.BlinkInterval || 30);
    const RADIUS_AROUND_PLAYER = Number(params.RadiusAroundPlayer || 6);

    const _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _Spriteset_Map_createTilemap.call(this);
        this.createRegionUpperLayer();
    };






    Spriteset_Map.prototype.createRegionUpperLayer = function () {
        const tileset = $gameMap.tileset();
        if (!tileset) return;

        this._regionUpper = new Tilemap();
        this._regionUpper.tileWidth = $gameMap.tileWidth();
        this._regionUpper.tileHeight = $gameMap.tileHeight();

        // Load tileset bitmaps safely
        const bitmaps = tileset.tilesetNames.map(name => ImageManager.loadTileset(name || ""));
        this._regionUpper.setBitmaps(bitmaps);
        this._regionUpper.flags = $gameMap.tilesetFlags();

        this._regionUpper._mapWidth = $gameMap.width();
        this._regionUpper._mapHeight = $gameMap.height();
        this._regionUpper._mapData = [];

        const width = $gameMap.width();
        const height = $gameMap.height();

        // Container for debug shapes
        this._regionShapes = new PIXI.Container();



        for (let z = 0; z < 4; z++) {
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let tileId = 0;

                    if (REGION_ID.includes($gameMap.regionId(x, y))) {
                        tileId = $gameMap.tileId(x, y, z);

                        if (DEBUG_OUTLINE && tileId > 0) {

                            const shape = new PIXI.Graphics();
                            shape.blinkColors = [0xFF9900, 0xFFFF00]; // bright orange ↔ yellow
                            shape.blinkIndex = 0;
                            shape.blinkInterval = BLINK_INTERVAL;
                            shape.blinkCounter = 0;

                            shape.lineStyle(2, shape.blinkColors[shape.blinkIndex]);
                            shape.drawRect(2, 2, this._regionUpper.tileWidth - 4, this._regionUpper.tileHeight - 4);
                            shape.endFill();

                            shape.x = x * this._regionUpper.tileWidth;
                            shape.y = y * this._regionUpper.tileHeight;

                            this._regionShapes.addChild(shape);

                        }
                    }

                    this._regionUpper._mapData.push(tileId);
                }
            }
        }

        this._regionUpper.z = 20;
        this._tilemap.parent.addChild(this._regionUpper);
        if (DEBUG_OUTLINE) this._tilemap.parent.addChild(this._regionShapes);
    };



    // --- Create optimized region upper layer ---
    Spriteset_Map.prototype.createRegionUpperLayer = function () {
        const tileset = $gameMap.tileset();
        if (!tileset) return;

        this._regionUpper = new Tilemap();
        this._regionUpper.tileWidth = $gameMap.tileWidth();
        this._regionUpper.tileHeight = $gameMap.tileHeight();

        const bitmaps = tileset.tilesetNames.map(name => ImageManager.loadTileset(name || ""));
        this._regionUpper.setBitmaps(bitmaps);
        this._regionUpper.flags = $gameMap.tilesetFlags();
        this._regionUpper._mapWidth = $gameMap.width();
        this._regionUpper._mapHeight = $gameMap.height();
        this._regionUpper._mapData = [];

        this._regionShapes = new PIXI.Container();

        const px = $gamePlayer.x;
        const py = $gamePlayer.y;

        // --- Visible tile range ---
        const startX = Math.max(0, Math.floor(this._tilemap.origin.x / $gameMap.tileWidth()));
        const startY = Math.max(0, Math.floor(this._tilemap.origin.y / $gameMap.tileHeight()));
        const screenTilesX = Math.min($gameMap.width() - startX, Math.ceil(Graphics.width / $gameMap.tileWidth()));
        const screenTilesY = Math.min($gameMap.height() - startY, Math.ceil(Graphics.height / $gameMap.tileHeight()));

        for (let z = 0; z < 4; z++) {
            for (let y = startY; y < startY + screenTilesY; y++) {
                for (let x = startX; x < startX + screenTilesX; x++) {
                    let tileId = 0;
                    if (REGION_ID.includes($gameMap.regionId(x, y))) {
                        tileId = $gameMap.tileId(x, y, z);

                        if (DEBUG_OUTLINE && tileId > 0) {
                            const manhattanDist = Math.abs(x - px) + Math.abs(y - py);
                             
                                const shape = new PIXI.Graphics();
                                
                                shape.blinkColors = [0xFFCC66, 0xFFFF99]; // orange ↔ yellow
                                shape.blinkIndex = 0;
                                shape.blinkInterval = BLINK_INTERVAL;
                                shape.blinkCounter = 0;
                                shape.lineStyle(2, shape.blinkColors[shape.blinkIndex]);
                                shape.drawRect(2, 2, this._regionUpper.tileWidth - 4, this._regionUpper.tileHeight - 4);
                                shape.endFill();
                                shape.x = x * this._regionUpper.tileWidth;
                                shape.y = y * this._regionUpper.tileHeight;
                                this._regionShapes.addChild(shape);
                           
                        }
                    }
                    this._regionUpper._mapData.push(tileId);
                }
            }
        }

        this._regionUpper.z = 20;
        this._tilemap.parent.addChild(this._regionUpper);
        if (DEBUG_OUTLINE) this._tilemap.parent.addChild(this._regionShapes);
    };


    // --- Update region layer ---
    const _Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _Spriteset_Map_updateTilemap.call(this);

        if (this._regionUpper) {
            this._regionUpper.origin.x = this._tilemap.origin.x;
            this._regionUpper.origin.y = this._tilemap.origin.y;
        }

        if (DEBUG_OUTLINE && this._regionShapes) {
            this._regionShapes.x = -this._tilemap.origin.x;
            this._regionShapes.y = -this._tilemap.origin.y;

            for (const shape of this._regionShapes.children) {
                shape.blinkCounter++;
                if (shape.blinkCounter >= shape.blinkInterval) {
                    shape.blinkCounter = 0;
                    shape.blinkIndex = (shape.blinkIndex + 1) % shape.blinkColors.length;
                    shape.tint = shape.blinkColors[shape.blinkIndex]; // use tint instead of redraw
                }
            }
        }
    };

    /*
    const _Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function () {
        _Spriteset_Map_updateTilemap.call(this);

        if (this._regionUpper) {
            this._regionUpper.origin.x = this._tilemap.origin.x;
            this._regionUpper.origin.y = this._tilemap.origin.y;
        }

        if (DEBUG_OUTLINE && this._regionShapes) {
            // Keep outlines aligned with scrolling
            this._regionShapes.x = -this._tilemap.origin.x;
            this._regionShapes.y = -this._tilemap.origin.y;

            // Animate blinking
            for (const shape of this._regionShapes.children) {
                shape.blinkCounter++;
                if (shape.blinkCounter >= shape.blinkInterval) {
                    shape.blinkCounter = 0;
                    shape.blinkIndex = (shape.blinkIndex + 1) % shape.blinkColors.length;

                    // Redraw with new color
                    shape.clear();
                    shape.lineStyle(2, shape.blinkColors[shape.blinkIndex]);
                    shape.drawRect(2, 2, this._regionUpper.tileWidth - 4, this._regionUpper.tileHeight - 4);
                    shape.endFill();
                }
            }
        }
    };
 */


})();