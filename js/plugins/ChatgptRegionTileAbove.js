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
    const BLINK_INTERVAL = Number(params.BlinkInterval || 40);


    const regionTileMap = {
        255: 46, // region 1 → tile ID 20

    };

    function getTileIdForRegion(regionId) {
        return regionTileMap[regionId] || 0;
    }

    const _Spriteset_Map_createTilemap = Spriteset_Map.prototype.createTilemap;
    Spriteset_Map.prototype.createTilemap = function () {
        _Spriteset_Map_createTilemap.call(this);
        
        this.createRegionLowerLayer();
        this.createRegionUpperLayer();
        
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
        //this._regionLower.visible = $gameSwitches.value(OVERLAY_SWITCH);

        this._tilemap.addChild(this._regionLower);

        // Ensure children are sorted by z
        this._tilemap.children.sort((a, b) => (a.z || 0) - (b.z || 0));
    };



    // --- Create optimized region upper layer ---
    Spriteset_Map.prototype.createRegionLowerLayer2 = function () {
        const tileset = $gameMap.tileset();
        if (!tileset) return;

        this._regionLower = new Tilemap();
        this._regionLower.tileWidth = $gameMap.tileWidth();
        this._regionLower.tileHeight = $gameMap.tileHeight();

        const bitmaps = tileset.tilesetNames.map(name => ImageManager.loadTileset(name || ""));
        this._regionLower.setBitmaps(bitmaps);
        this._regionLower.flags = $gameMap.tilesetFlags();
        this._regionLower._mapWidth = $gameMap.width();
        this._regionLower._mapHeight = $gameMap.height();
        this._regionLower._mapData = [];

        this._regionShapes = new PIXI.Container();

        const px = $gamePlayer.x;
        const py = $gamePlayer.y;

        // --- Visible tile range ---
        const startX = 0
        const startY = 0
        const screenTilesX = $gameMap.width()
        const screenTilesY = $gameMap.height()

        const z = 0
        for (let y = startY; y < startY + screenTilesY; y++) {
            for (let x = startX; x < startX + screenTilesX; x++) {
                let tileId = 0;
                const region = $gameMap.regionId(x, y);
                if (REGION_ID.includes(region)) {

                    if (region in regionTileMap)
                        tileId = 1536 + getTileIdForRegion(region);

                }
                this._regionLower._mapData.push(tileId);
            }

        }

        this._regionLower.z = 1;
        this._tilemap.parent.parent.addChild(this._regionLower);
        this._tilemap.parent.children.sort((a, b) => (a.z || 0) - (b.z || 0));
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
        const startX = 0
        const startY = 0
        const screenTilesX = $gameMap.width()
        const screenTilesY = $gameMap.height()

        for (let z = 0; z < 4; z++) {
            for (let y = startY; y < startY + screenTilesY; y++) {
                for (let x = startX; x < startX + screenTilesX; x++) {
                    let tileId = 0;
                    if (REGION_ID.includes($gameMap.regionId(x, y))) {
                        tileId = $gameMap.tileId(x, y, z);
                        
                        if (DEBUG_OUTLINE && tileId > 0 && z===0) {
                              
                                const shape = new PIXI.Graphics();
                                
                                shape.blinkColors = [0xFFCC66, 0xFFFF99]; // orange ↔ yellow
                                shape.blinkIndex = 0;
                                shape.blinkInterval = BLINK_INTERVAL;
                                shape.blinkCounter = 0;
                                //shape.lineStyle(2, shape.blinkColors[shape.blinkIndex]);
                                shape.lineStyle(2, 0xff0000);
                                shape.beginFill(0xff0000); // red color
                                shape.drawRect(2, 2, this._regionUpper.tileWidth - 4, this._regionUpper.tileHeight - 4);
                                shape.endFill();
                                shape.x = x * this._regionUpper.tileWidth;
                                shape.y = y * this._regionUpper.tileHeight;
                                shape.alpha=0.40
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
            this._regionUpper.alpha=0
            this._regionShapes.alpha=0
            
        }
        if (this._regionLower) {
            this._regionLower.origin.x = this._tilemap.origin.x;
            this._regionLower.origin.y = this._tilemap.origin.y;

        }

        if (DEBUG_OUTLINE && this._regionShapes) {
            this._regionShapes.x = -this._tilemap.origin.x;
            this._regionShapes.y = -this._tilemap.origin.y;
        }
    };




})();


