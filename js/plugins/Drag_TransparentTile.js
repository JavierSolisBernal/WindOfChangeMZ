//=============================================================================
// Drag_TransparentTile.js
//=============================================================================

/*:
 * @target MZ
 * @plugindesc (v0.14) A plugin to apply transparency effect on any tile(s).
 * @author Drag
 *
 * @url https://discord.gg/ckYyc8hHGb
 *
 * @help 
 *
 * ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
 * A question, a suggestion, an issue ? Please join me on my dedicated
 * discord server thanks to the dedicated link above.
 *
 * This plugin allow to apply a transparency effect on one or multiple tiles, 
 * specified by x, y and z value, without requiring to edit your tileset with 
 * a software application for image editing (like Photoshop or Gimp)  nor to 
 * use parralax mapping solutions.
 *
 * This plugin also have a built-in compatibility with my Tilemap Mask
 * plugin, allowing you to exclude transparencified tiles locations
 * from the mask.
 *
 *
 * ABOUT THE PLUGIN COMMANDS :
 *
 * -Apply Transparency to Tile
 * This plugin command will set the tile at the specified x, y and z
 * transparent, at the specified opacity value.
 *
 * -Apply Transparency to Several Tiles
 * This plugin command will let you specify a rectangle of tiles where
 * a transparency effect should be applied. The rectangle will be
 * calculated depending on the x, y coordinates of the start point
 * (top left of the rectangle) and the end point (bottom right of the
 * rectangle).
 *
 * -Clear Transparency
 * This plugin command will delete the transparency effect at the tile
 * to the specified x, y, z coordinates, reverting it back to its 
 * original state.
 *
 * -Clear Transparency to Every Tiles
 * This plugin command will delete every transparency effect, reverting
 * back all modified tiles to their original state.
 *
 * ABOUT THE MAP NOTETAGS :
 * You can use the following notetags in your MAP settings :
 *
 * <transparentTile: x>
 * This notetag will try to detect automatically what should be 
 * "transparentified" around your player, depending on the x
 * value.
 * Tiles that will be detected will be those who are set to the "star"
 * passage value in your tileset, so in short term, tiles that will 
 * drawn over your character.
 * Ex : <transparentTile: 1> will set that behaviour to a range of
 * 1 tile around the player.
 *
 * <transparentTile: group>
 * This value for the transparentTile notetag will "transparentify"
 * each tile behind which your player will go, as well as every other 
 * tiles that are connected to the first one and which are drawn over 
 * your character too. In short term, it will apply a transparency
 * on a whole group of tile.
 *
 * <transparentTileOpacity: opacity>
 * This notetag will specify what opacity value to apply on tiles
 * "transparentified" with the <transparentTile> notetag. If this
 * notetag is not present, a default value of 255 will be applied.
 * Ex : <transparentTileOpacity: 127>
 *
 * <transparentTileLayer: z>
 * This notetag will specify on which layer to look for tiles to
 * "transparencify" with the <transparentTile> notetag. If this
 * notetag is not present, every layer will be invastigated.
 * Ex : <transparentTileLayer: 1>
 *
 * <transparentTileFadeOut: seconds>
 * This notetag will specify the fade out transition duration in 
 * seconds when tile(s) is being "transparencified". If this
 * notetag is not present, the transition will be instant.
 * Ex : transparentTileFadeOut: 1>
 *
 * @command applyTransparency
 * @text Apply Transparency to Tile
 * @desc Apply a transparency effect to a specified tile
 *
 * @arg x
 * @type text
 * @text 
 * @desc x coordinate of the tile to target. (Script allowed, ex: $gamePlayer.x)
 *
 * @arg y
 * @type text
 * @text 
 * @desc y coordinate of the tile to target. (Script allowed, ex: $gamePlayer.y)
 *
 * @arg z
 * @text Layer
 * @desc The layer of the tile to target, as in your rpg maker map tool.
 * @type select
 * @option 1
 * @value 1
 * @option 2
 * @value 2
 * @option 3
 * @value 3
 * @option 4
 * @value 4
 *
 * @arg opacity
 * @text Opacity
 * @type number
 * @desc The opacity value to apply. Must be > 0 and < 255.
 *
 * @arg fadeOutDuration
 * @text Fade Out Duration
 * @type number
 * @desc The fade-out duration (in seconds) of the transparency effect.
 *
 * @command applyMultipleTransparency
 * @text Apply Transparency to Several Tiles
 * @desc Apply a transparency effect to a rectangle of tile
 *
 * @arg startPoint
 * @type select
 * @text From : (Top Left)
 *
 * @arg xStartPoint
 * @parent startPoint
 * @type text
 * @text x Start Point
 * @desc x coordinate of the most top left tile of the rectangle to target. (Script allowed, ex: $gamePlayer.x)
 *
 * @arg yStartPoint
 * @parent startPoint
 * @type text
 * @text y Start Point
 * @desc y coordinate of the most top left tile of the rectangle to target. (Script allowed, ex: $gamePlayer.y)
 *
 * @arg endPoint
 * @type select
 * @text To : (Bottom Right)
 *
 * @arg xEndPoint
 * @parent endPoint
 * @type text
 * @text x End Point
 * @desc x coordinate of the most bottom right tile of the rectangle to target. (Script allowed, ex: $gamePlayer.x + 5)
 *
 * @arg yEndPoint
 * @parent endPoint
 * @type text
 * @text y End Point
 * @desc y coordinate of the most bottom right tile of the rectangle to target. (Script allowed, ex: $gamePlayer.y + 5)
 *
 * @arg z
 * @text Layer
 * @desc The layer of the tile to target, as in your rpg maker map tool.
 * @type select
 * @option 1
 * @value 1
 * @option 2
 * @value 2
 * @option 3
 * @value 3
 * @option 4
 * @value 4
 *
 * @arg opacity
 * @text Opacity
 * @type number
 * @desc The opacity value to apply. Must be > 0 and < 255.
 *
 * @arg fadeOutDuration
 * @text Fade Out Duration
 * @type number
 * @desc The fade-out duration (in seconds) of the transparency effect.
 *
 * @arg addExclusionMask
 * @text Add Exclusion Mask
 * @type boolean
 * @desc Require Drag_TilemapMask.js. Add to the exclusion list of the mask.
 * @default false
 *
 * @arg condition
 * @text Condition JS
 * @type text
 * @desc JS code to return a boolean.
 * @default
 *
 * @command clearTransparency
 * @text Clear Transparency to Tile
 * @desc Clear transparency effect to the specified tile
 *
 * @arg x
 * @type text
 * @text 
 * @desc x coordinate of the tile to target. (Script allowed, ex: $gamePlayer.x)
 *
 * @arg y
 * @type text
 * @text 
 * @desc y coordinate of the tile to target. (Script allowed, ex: $gamePlayer.y)
 *
 * @arg z
 * @text Layer
 * @desc The layer of the tile to target, as in your rpg maker map tool.
 * @type select
 * @option 1
 * @value 1
 * @option 2
 * @value 2
 * @option 3
 * @value 3
 * @option 4
 * @value 4
 *
 * @command clearAllTransparency
 * @text Clear Transparency to Every Tiles
 * @desc Clear transparency effect to every tiles
 */
 
var Imported = Imported || {};
Imported.Drag_TransparentTile = true;

var Drag = Drag || {};
Drag.TransparentTile ??= {};
Drag.TransparentTile.alias ??= {};
Drag.TransparentTile.version = 0.14;

(function() {
	
	//------------------------------------------------------------------------------------------------------------
	// global variables
	
	Drag.TransparentTile.pluginName = "Drag_TransparentTile";
	
	Drag.TransparentTile.transparentTileSprites = [];
	Drag.TransparentTile.groupSpot = [];
	Drag.TransparentTile.unmaskedSpots = [];
	
	//------------------------------------------------------------------------------------------------------------
	// plugin command	
	
	PluginManager.registerCommand(Drag.TransparentTile.pluginName, "applyTransparency", args => {
		let formatedArgs = Drag.TransparentTile.formatArgs({...args});
		Drag.TransparentTile.setTransparency(formatedArgs.x, formatedArgs.y, formatedArgs.z, null, formatedArgs.opacity, formatedArgs.fadeOutDuration);
	});
	
	PluginManager.registerCommand(Drag.TransparentTile.pluginName, "applyMultipleTransparency", args => {
		let formatedArgs = Drag.TransparentTile.formatArgs({...args});
		for (let x = formatedArgs.xStartPoint; x <= formatedArgs.xEndPoint; x++) {
			for (let y = formatedArgs.yStartPoint; y <= formatedArgs.yEndPoint; y++) {
				if (formatedArgs.addExclusionMask)
					Drag.TransparentTile.unmaskedSpots.push([formatedArgs.xStartPoint, formatedArgs.xEndPoint, formatedArgs.yStartPoint, formatedArgs.yEndPoint]);
				let condition = true;
				if (formatedArgs.condition) {
					try {
						condition = eval(formatedArgs.condition);
					} catch {
						condition = true;
					}
				}
				if (condition)
					Drag.TransparentTile.setTransparency(x, y, formatedArgs.z, null, formatedArgs.opacity, formatedArgs.fadeOutDuration);
			}
		}
	});
	
	PluginManager.registerCommand(Drag.TransparentTile.pluginName, "clearTransparency", args => {
		let formatedArgs = Drag.TransparentTile.formatArgs({...args});
		Drag.TransparentTile.clearTransparency(formatedArgs.x, formatedArgs.y, formatedArgs.z);
	});
	
	PluginManager.registerCommand(Drag.TransparentTile.pluginName, "clearAllTransparency", args => {
		Drag.TransparentTile.clearAllTransparency();
	});
	
	
	//------------------------------------------------------------------------------------------------------------
	//plugin functions
	Drag.TransparentTile.formatArgs = function(params) {
		if (params.x && params.x !== "")
			try {
				params.x = parseInt(eval(params.x));
			} catch {
				params.x = isNaN(parseInt(params.x)) ? NaN : parseInt(params.x);
			}
		else 
			params.x = undefined;
		
		if (params.y && params.y !== "")
			try {
				params.y = parseInt(eval(params.y));
			} catch {
				params.y = isNaN(parseInt(params.y)) ? NaN : parseInt(params.y);
			}
		else 
			params.y = undefined;
		
		if (params.xStartPoint && params.xStartPoint !== "")
			try {
				params.xStartPoint = parseInt(eval(params.xStartPoint));
			} catch {
				params.xStartPoint = isNaN(parseInt(params.xStartPoint)) ? NaN : parseInt(params.xStartPoint);
			}
		else 
			params.xStartPoint = undefined;
		
		if (params.yStartPoint && params.yStartPoint !== "")
			try {
				params.yStartPoint = parseInt(eval(params.yStartPoint));
			} catch {
				params.yStartPoint = isNaN(parseInt(params.yStartPoint)) ? NaN : parseInt(params.yStartPoint);
			}
		else 
			params.yStartPoint = undefined;
		
		if (params.xEndPoint && params.xEndPoint !== "")
			try {
				params.xEndPoint = parseInt(eval(params.xEndPoint));
			} catch {
				params.xEndPoint = isNaN(parseInt(params.xEndPoint)) ? NaN : parseInt(params.xEndPoint);
			}
		else 
			params.xEndPoint = undefined;
		
		if (params.yEndPoint && params.yEndPoint !== "")
			try {
				params.yEndPoint = parseInt(eval(params.yEndPoint));
			} catch {
				params.yEndPoint = isNaN(parseInt(params.yEndPoint)) ? NaN : parseInt(params.yEndPoint);
			}
		else 
			params.yEndPoint = undefined;
		
		if (params.z)
			params.z = isNaN(parseInt(params.z)) ? -1 : parseInt(params.z) - 1;
		else
			params.z = -1;
		
		if (params.opacity)
			params.opacity = isNaN(parseInt(params.opacity)) ? 255 : parseInt(params.opacity);
		else
			params.opacity = 255;
			
		if (params.fadeOutDuration)
			params.fadeOutDuration = isNaN(parseInt(params.fadeOutDuration)) ? 0 : parseInt(params.fadeOutDuration);
		else
			params.fadeOutDuration = 0;
		
		if (params.outsideShadow)
			params.outsideShadow = params.outsideShadow === "true";
		else
			params.outsideShadow = false;
			
		params.addExclusionMask = params.addExclusionMask === "true" ? true : false;
		
		return params;
	};
	
	Drag.TransparentTile.setTransparency = function(x, y, z, scope = null, opacity = 255, fadeOutDuration = 0) {
		this.createTransparentTileSprite([x, y, z], scope, opacity, fadeOutDuration);
		let tileIndex = this.getTileIndex($dataMap.width, $dataMap.height, x, y, z);
		$dataMap.data[tileIndex] = 0;
		SceneManager._scene._spriteset._tilemap.setData($dataMap.width, $dataMap.height, $dataMap.data);
		SceneManager._scene._spriteset._tilemap.refresh();
	};
	
	Drag.TransparentTile.clearTransparency = function(x, y, z) {
		let sprites = this.getTransparentTileSprite([x, y, z]);
		if (sprites && sprites.length > 0) {
			for (let sprite of sprites) {
				this.unmaskedSpots.splice(this.unmaskedSpots.indexOf(sprite), 1);
				let tileIndex = Drag.TransparentTile.getTileIndex($dataMap.width, $dataMap.height, x, y, z);
				$dataMap.data[tileIndex] = sprite._tileId;
				SceneManager._scene._spriteset._tilemap.setData($dataMap.width, $dataMap.height, $dataMap.data);
				SceneManager._scene._spriteset._tilemap.refresh();
				this.destroyTransparentTileSprite(sprite);
			}
		}
	};
	
	Drag.TransparentTile.clearAllTransparency = function() {
		if (Drag.TransparentTile.transparentTileSprites && Drag.TransparentTile.transparentTileSprites.length > 0) {
			for (let sprite of Drag.TransparentTile.transparentTileSprites) {
				if (sprite._tileId > 0) {
					let tileIndex = Drag.TransparentTile.getTileIndex($dataMap.width, $dataMap.height, sprite._spot[0], sprite._spot[1], sprite._spot[2]);
					$dataMap.data[tileIndex] = sprite._tileId;
					SceneManager._scene._spriteset._tilemap.setData($dataMap.width, $dataMap.height, $dataMap.data);
					SceneManager._scene._spriteset._tilemap.refresh();
				}
			}
			this.unmaskedSpots = [];
			this.destroyAllTransparentTileSprite();
		}
	};
	
	Drag.TransparentTile.handleFixedScope = function(x, y, scope) {
		for (let i = -scope; i <= scope; i++) {
			for (let j = -scope; j <= scope; j++) {
				let adjStarLayers = Drag.TransparentTile.getStarFlag(x + i, y + j);
				for (adjLayer of adjStarLayers) {
					this.setTransparency(x + i, y + j, adjLayer, scope, this.getTransparencyTag(), this.getFadeOutTag());
				}
			}
		}
	};
	
	Drag.TransparentTile.handleGroupScope = function(x, y) {
		if (Drag.TransparentTile.groupSpot.length === 0 || !Drag.TransparentTile.isArrayInArray([x, y], Drag.TransparentTile.groupSpot)) {
			Drag.TransparentTile.groupSpot = Drag.TransparentTile.getgroupSpot(x, y);
			for (spot of Drag.TransparentTile.groupSpot) {
				let starLayers = Drag.TransparentTile.getStarFlag(spot[0], spot[1]);
				if (starLayers.length > 0) {
					for (layer of starLayers) {
						this.setTransparency(spot[0], spot[1], layer, "group", this.getTransparencyTag(), this.getFadeOutTag());
					}
				}
			}
		}
	};
	
	//------------------------------------------------------------------------------------------------------------
	// plugin accessors
	
	Drag.TransparentTile.getgroupSpot = function(x, y, groupSpot = []) {
		let starLayers = Drag.TransparentTile.getStarFlag(x, y);
		if (starLayers.length > 0 && !Drag.TransparentTile.isArrayInArray([x, y], groupSpot)) {
			groupSpot.push([x, y]);
			this.getgroupSpot(x + 1, y, groupSpot);
			this.getgroupSpot(x, y + 1, groupSpot);
			this.getgroupSpot(x - 1, y, groupSpot);
			this.getgroupSpot(x, y - 1, groupSpot);
		}
		return groupSpot;
	};
	
	Drag.TransparentTile.getStarFlag = function(x, y) {
		let flags = $gameMap.tilesetFlags();
		let layer = Drag.TransparentTile.getLayerTag();
		let tiles;
		if (layer === "all") {
			tiles = $gameMap.allTiles(x, y);
		} else {
			tiles = [$gameMap.tileId(x, y, layer)];
		}		
		let layers = [];
		for (let [i, tile] of tiles.entries()) {
			if (tile > 0) {
				let flag = flags[tile];
				if ((flag & 0x10) !== 0) {
					layers.push(3 - i);
				}
			}
		}
		return layers;
	};
	
	Drag.TransparentTile.getTileScope = function() {
		if ($dataMap?.meta?.transparentTile?.trim() === "group")
			return "group";
		if (!isNaN(parseInt($dataMap?.meta?.transparentTile?.trim())))
			return parseInt($dataMap.meta.transparentTile.trim());
		return null;
	};
	
	Drag.TransparentTile.getMapTag = function() {
		if (!isNaN(parseInt($dataMap.meta.transparentTile.trim())))
			return parseInt($dataMap.meta.transparentTile.trim());
		return null;
	};
	
	Drag.TransparentTile.getTransparencyTag = function() {
		if ($dataMap.meta.transparentTileOpacity && !isNaN(parseInt($dataMap.meta.transparentTileOpacity.trim())))
			return parseInt($dataMap.meta.transparentTileOpacity.trim());
		return 255;
	};
	
	Drag.TransparentTile.getLayerTag = function() {
		if ($dataMap.meta.transparentTileLayer && !isNaN(parseInt($dataMap.meta.transparentTileLayer.trim())))
			return parseInt($dataMap.meta.transparentTileLayer.trim()) - 1;
		return "all";
	};
	
	Drag.TransparentTile.getFadeOutTag = function() {
		if ($dataMap.meta.transparentTileFadeOut && !isNaN(parseInt($dataMap.meta.transparentTileFadeOut.trim())))
			return parseFloat($dataMap.meta.transparentTileFadeOut.trim());
		return 0;
	};
	
	Drag.TransparentTile.isArrayInArray = function(a, b) {
		for (let i = 0; i < b.length; i++) {
			if (JSON.stringify(b[i]) == JSON.stringify(a)) {
				return true;
			}
		}
		return false;
	};
	
	Drag.TransparentTile.isArraysEquals = function(a, b) {
		return JSON.stringify(a) == JSON.stringify(b);
	};	
	
	Drag.TransparentTile.setTile = function(spot, tileId) {
		$dataMap.data[Drag.TransparentTile.getTileIndex($dataMap.width, $dataMap.height, spot[0], spot[1], spot[2])] = tileId;
		SceneManager._scene._spriteset._tilemap.setData($dataMap.width, $dataMap.height, $dataMap.data);
		SceneManager._scene._spriteset._tilemap.refresh();
	};
	
	Drag.TransparentTile.getTileIndex = function(width, height, x, y, z) {
		return (z * height + y) * width + x;
	};
	
	Drag.TransparentTile.getTileset = function(tileIndex) {
		if (tileIndex > Tilemap.TILE_ID_A5) 
			return "A";
		if (tileIndex > Tilemap.TILE_ID_E) 
			return "E";
		if (tileIndex > Tilemap.TILE_ID_D) 
			return "D";
		if (tileIndex > Tilemap.TILE_ID_C) 
			return "C";
		return "B";
	};
	
	Drag.TransparentTile.getScreenX = function(x) {
		var tw = $gameMap.tileWidth();
		var adjX = $gameMap.adjustX(x);
		return Math.round(adjX * tw + tw / 2);
	};
	
	Drag.TransparentTile.getScreenY = function(y) {
		var th = $gameMap.tileHeight();
		var adjY = $gameMap.adjustY(y);
		return Math.round(adjY * th + th);
	};
	
	//------------------------------------------------------------------------------------------------------------
	// Spriteset Map
	
	Spriteset_Map.prototype.updateTransparentTiles = function(x = $gamePlayer.x, y = $gamePlayer.y) {
		let scope = Drag.TransparentTile.getTileScope();
		if (scope === "group")
			Drag.TransparentTile.handleGroupScope(x, y);
		if (scope !== null && !isNaN(scope))
			Drag.TransparentTile.handleFixedScope(x, y, scope);
	};
	
	
	Drag.TransparentTile.alias._Spriteset_Map_updateTilemap = Spriteset_Map.prototype.updateTilemap;
    Spriteset_Map.prototype.updateTilemap = function() {
        Drag.TransparentTile.alias._Spriteset_Map_updateTilemap.call(this);
		this.updateTransparentTiles();
		Drag.TransparentTile.checkMissingTransparentSprite();
	};
	
	Spriteset_Map.prototype.createTransparentTileSprite = function(spot, scope, opacity, fadeOutDuration = 0) {
		let sprite = new transparent_Tile_Sprite(spot, scope, opacity, fadeOutDuration);
		this.addChild(sprite);
		Drag.TransparentTile.transparentTileSprites.push(sprite);
	};
	
	
	//------------------------------------------------------------------------------------------------------------
	//spot sprite functions
	
	Drag.TransparentTile.createTransparentTileSprite = function(spot, scope, opacity, fadeOutDuration = 0) {
		SceneManager._scene._spriteset.createTransparentTileSprite(spot, scope, opacity, fadeOutDuration); 
	};
	
	Drag.TransparentTile.destroyAllTransparentTileSprite = function() {
		for (let sprite of this.transparentTileSprites) {
			if (SceneManager._scene._spriteset.children.indexOf(sprite) > -1) {
				SceneManager._scene._spriteset.removeChild(sprite);
				sprite?.destroy();
			}
		}
		this.transparentTileSprites = [];
	};
	
	Drag.TransparentTile.destroyTransparentTileSprite = function(sprites) {
		try {
			if (!sprites) 
				return;
			if (!Array.isArray(sprites))
				sprites = [sprites];
			for (let sprite of sprites) {
				this.transparentTileSprites.splice(this.transparentTileSprites.indexOf(sprite), 1); 
				SceneManager._scene._spriteset.removeChild(sprite);
				sprite.destroy();
			}
		} catch { }
	};
	
	Drag.TransparentTile.destroyGroupTransparentTileSprite = function() {
		for (let sprite of this.transparentTileSprites) {
			if (sprite._scope === "group") {
				Drag.TransparentTile.setTile(sprite._spot, sprite._tileId);
				this.destroyTransparentTileSprite(sprite);
			}
		}
	};
	
	Drag.TransparentTile.getTransparentTileSprite = function(spot) {
		let sprites = [];
		for (let sprite of this.transparentTileSprites.filter(Boolean)) {
			if (JSON.stringify(sprite._spot) == JSON.stringify(spot)) {
				sprites.push(sprite);
			}
		}
		return sprites;
	};	
	
	Drag.TransparentTile.getAdjSpot = function(initSpot, scope = 1) {
		let spot = [];
		for (let x = -scope; x <= scope; x++)
			for (let y = -scope; y <= scope; y++)
				if (x !== 0 || y !== 0) 
					spot.push([initSpot[0] + x, initSpot[1] + y]);
		return spot;
	};
	
	Drag.TransparentTile.checkMissingTransparentSprite = function() {
		let transparentTiles = [...this.transparentTileSprites];
		for (let sprite of transparentTiles) {
			let index = SceneManager?._scene?._spriteset?.children?.indexOf(sprite);
			if (index !== null && index === -1) {
				this.transparentTileSprites.splice(index, 1);
				if (sprite._scope === "group") {
					let groupIndex = this.groupSpot.findIndex((element) => element[0] === sprite._spot[0] && element[1] === sprite._spot[1]);
					this.groupSpot.splice(groupIndex, 1);
				}
			}
		}
	}

	//------------------------------------------------------------------------------------------------------------
	// spot Sprite

	function transparent_Tile_Sprite() {
		this.initialize.apply(this, arguments);
	};
	
	transparent_Tile_Sprite.prototype = Object.create(Sprite.prototype);
	transparent_Tile_Sprite.prototype.constructor = transparent_Tile_Sprite;
	
	transparent_Tile_Sprite.prototype.initialize = function(spot, scope, opacity, fadeOutDuration = 0) {
		Sprite.prototype.initialize.call(this);
		this._id = Drag.TransparentTile.transparentTileSprites.length;
		this._spot = spot;
		this._scope = scope;
		this._tileId = $dataMap.data[Drag.TransparentTile.getTileIndex($dataMap.width, $dataMap.height, spot[0], spot[1], spot[2])];
		this._tileset = Drag.TransparentTile.getTileset(this._tileId);
		this._shape = [1, 1];
		this.x = Drag.TransparentTile.getScreenX(this._spot[0]) - ($gameMap.tileWidth() / 2);
		this.y = Drag.TransparentTile.getScreenY(this._spot[1]) - $gameMap.tileHeight();
		this.opacity = 255;
		this._fadeOutDuration = fadeOutDuration;
		this._modOpacity = fadeOutDuration ? parseFloat(((255 / fadeOutDuration) / 60).toFixed(5)) : 255;
		this._minOpacity = opacity;
		this.loadBitmap();
	};
	
	transparent_Tile_Sprite.prototype.loadBitmap = function() {
		if (SceneManager?._scene?._spriteset?._tilemap) {
			let bitmap = new Bitmap(this._shape[0] * $gameMap.tileWidth(), this._shape[1] * $gameMap.tileHeight());
			for (let i = 0; i < this._shape[0]; i++) {
				for (let j = 0; j < this._shape[1]; j++) {
					let x = $gameMap.tileWidth() * i;
					let y = $gameMap.tileHeight() * j;
					let spot = [this._spot[0] + i, this._spot[1] + j];
					if (this._tileset === "A" && Tilemap.isAutotile(this._tileId))
						this.bitmap = SceneManager._scene._spriteset._tilemap._drawAutotileOnBitmap(bitmap, this._tileId, x, y);
					else 
						this.bitmap = SceneManager._scene._spriteset._tilemap._drawNormalTileOnBitmap(bitmap, this._tileId, x, y);
				}
			}
		}
	};	
	
	transparent_Tile_Sprite.prototype.update = function() {
		Sprite.prototype.update.call(this);
		if (this._tileId < 0) 
			return;
		if (!this.shouldExist()) {
			if (this._scope === "group") {
				Drag.TransparentTile.destroyGroupTransparentTileSprite();
			} else {
				Drag.TransparentTile.setTile(this._spot, this._tileId);
				Drag.TransparentTile.destroyTransparentTileSprite(this);
			}
		} else {
			this.updatePosition();
			this.updateOpacity();
		}
	};
	
	transparent_Tile_Sprite.prototype.shouldExist = function() {
		if (!this._scope)
			return true;
		if (!isNaN(this._scope)) {
			let spriteSpot = [this._spot[0], this._spot[1]];
			let playerSpot = [$gamePlayer.x, $gamePlayer.y];
			let adjPlayerSpot = Drag.TransparentTile.getAdjSpot(playerSpot, this._scope);
			return Drag.TransparentTile.isArrayInArray(spriteSpot, adjPlayerSpot) || Drag.TransparentTile.isArraysEquals(spriteSpot, playerSpot);
			
		}
		if (this._scope === "group") {
			let playerSpot = [$gamePlayer.x, $gamePlayer.y];
			return Drag.TransparentTile.isArrayInArray(playerSpot, Drag.TransparentTile.groupSpot);			
		}
	};
	
	transparent_Tile_Sprite.prototype.updatePosition = function() {
		this.x = Drag.TransparentTile.getScreenX(this._spot[0]) - ($gameMap.tileWidth() / 2);
		this.y = Drag.TransparentTile.getScreenY(this._spot[1]) - $gameMap.tileHeight();
	};
	
	transparent_Tile_Sprite.prototype.updateOpacity = function() {
		if (this.opacity === this._minOpacity)
			return;
		this.opacity -= this._modOpacity;
		if (this.opacity <= this._minOpacity)
			this.opacity = this._minOpacity;
	};
	
	//------------------------------------------------------------------------------------------------------------
	// Tilemap
	
	Tilemap.prototype._drawAutotileOnBitmap = function(bitmap, tileId, dx, dy) {
		const kind = Tilemap.getAutotileKind(tileId);
		const shape = Tilemap.getAutotileShape(tileId);
		const tx = kind % 8;
		const ty = Math.floor(kind / 8);
		let setNumber = 0;
		let bx = 0;
		let by = 0;
		let autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
		let isTable = false;

		if (Tilemap.isTileA1(tileId)) {
			const waterSurfaceIndex = [0, 1, 2, 1][this.animationFrame % 4];
			setNumber = 0;
			if (kind === 0) {
				bx = waterSurfaceIndex * 2;
				by = 0;
			} else if (kind === 1) {
				bx = waterSurfaceIndex * 2;
				by = 3;
			} else if (kind === 2) {
				bx = 6;
				by = 0;
			} else if (kind === 3) {
				bx = 6;
				by = 3;
			} else {
				bx = Math.floor(tx / 4) * 8;
				by = ty * 6 + (Math.floor(tx / 2) % 2) * 3;
				if (kind % 2 === 0) {
					bx += waterSurfaceIndex * 2;
				} else {
					bx += 6;
					autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
					by += this.animationFrame % 3;
				}
			}
		} else if (Tilemap.isTileA2(tileId)) {
			setNumber = 1;
			bx = tx * 2;
			by = (ty - 2) * 3;
			isTable = this._isTableTile(tileId);
		} else if (Tilemap.isTileA3(tileId)) {
			setNumber = 2;
			bx = tx * 2;
			by = (ty - 6) * 2;
			autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
		} else if (Tilemap.isTileA4(tileId)) {
			setNumber = 3;
			bx = tx * 2;
			by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
			if (ty % 2 === 1) {
				autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
			}
		}
		
		let tilesetBitmap = this._bitmaps[setNumber];
		const table = autotileTable[shape];
		if (table) {
			const w1 = this.tileWidth / 2;
			const h1 = this.tileHeight / 2;
			for (let i = 0; i < 4; i++) {
				const qsx = table[i][0];
				const qsy = table[i][1];
				const sx1 = (bx * 2 + qsx) * w1;
				const sy1 = (by * 2 + qsy) * h1;
				const dx1 = dx + (i % 2) * w1;
				const dy1 = dy + Math.floor(i / 2) * h1;
				if (isTable && (qsy === 1 || qsy === 5)) {
					const qsx2 = qsy === 1 ? (4 - qsx) % 4 : qsx;
					const qsy2 = 3;
					const sx2 = (bx * 2 + qsx2) * w1;
					const sy2 = (by * 2 + qsy2) * h1;
					bitmap.blt(tilesetBitmap, sx2, sy2, w1, h1, dx1, dy1, w1, h1);
					bitmap.blt(tilesetBitmap, sx1, sy1, w1, h1 / 2, dx1, dy1 + h1/2, w1, h1 / 2);
				} else {
					bitmap.blt(tilesetBitmap, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
				}
			}
			return bitmap;
		}
	};
	
	Tilemap.prototype._drawNormalTileOnBitmap = function(bitmap, tileId, dx, dy) {
		let setNumber = 0;

		if (Tilemap.isTileA5(tileId))
			setNumber = 4;
		else
			setNumber = 5 + Math.floor(tileId / 256);

		const w = this.tileWidth;
		const h = this.tileHeight;
		const sx = ((Math.floor(tileId / 128) % 2) * 8 + (tileId % 8)) * w;
		const sy = (Math.floor((tileId % 256) / 8) % 16) * h;
		let tilesetBitmap = this._bitmaps[setNumber];
		bitmap.blt(tilesetBitmap, sx, sy, w, h, dx, dy, w, h);
		return bitmap;
	};
})();