/*=============================================================================
 LaserSwitch.js
----------------------------------------------------------------------------
 (C)2021 Triacontane
 Fork by Squall Seawave
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.1.0 2024/03/31 条件種別を「以内」以外にも設定できる機能を追加
 1.0.0 2021/06/25 初版
----------------------------------------------------------------------------
 [Blog]   : https://triacontane.blogspot.jp/
 [Twitter]: https://twitter.com/triacontane/
 [GitHub] : https://github.com/triacontane/
=============================================================================*/

/*:
 * @plugindesc オートセルフスイッチプラグイン
 * @target MZ
 * @url https://github.com/triacontane/RPGMakerMV/tree/mz_master/AutoSelfSwitch.js
 * @base PluginCommonBase
 * @orderAfter PluginCommonBase
 * @author トリアコンタン
 *
 * @param RegionBlock
 * @text RegionBlock
 * @desc Add the id of the regions that block the line of the sensor
 * @type number[]
 * @default [1]
 * 
 * 
 * @param list
 * @text Condition List
 * @desc A list of conditions that will cause the self-switch to fluctuate.
 * @default []
 * @type struct<Condition>[]
 *
 * @help AutoSelfSwitch.js
 *
 * マップイベントを監視しセルフスイッチを自動でON/OFFします。
 * パラメータから条件を指定します。
 * 現在指定できる条件は「プレイヤーとの距離」だけです。
 *　
 * このプラグインの利用にはベースプラグイン『PluginCommonBase.js』が必要です。
 * 『PluginCommonBase.js』は、RPGツクールMZのインストールフォルダ配下の
 * 以下のフォルダに格納されています。
 * dlc/BasicResources/plugins/official
 * Translated by squall seawave
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 * Monitors map events and automatically turns the self-switch on/off.
 * Specify conditions using parameters.
 * Currently, the only condition that can be specified is "distance from the player."
 *
 * This plugin requires the base plugin "PluginCommonBase.js."
 * "PluginCommonBase.js" is located in the following folder under the RPG Maker MZ installation folder:
 * dlc/BasicResources/plugins/official
 * Terms of Use:
 * You may modify and redistribute this plugin without permission from the author, and there are no restrictions on its use (commercial, R18, etc.).
 * This plugin is now yours.

 * 
 */

/*~struct~Condition: 
 * @param noteTag
 * @text Notetags
 * @desc Identifier. Specify a memo field with this name for the event. Example: <selfSwitch>
 * @default selfSwitch
 *
 * @param playerDistance
 * @text Distance to the player
 * @desc The condition is met when the distance from the player meets the condition specified by the condition type.
 * @default 0
 * @type number
 *
 * @param conditionType
 * @text Condition Type
 * @desc The type used to determine the distance condition.
 * @default 0
 * @type select
 * @option <=(within)
 * @value 0
 * @option <(less than)
 * @value 1
 * @option >=(End)
 * @value 2
 * @option >(more than)
 * @value 3
 * @option ==(equal)
 * @value 4
 * @option !=(not equal)
 * @value 5
 *
 * @param type
 * @text Self-switch Type
 * @desc It is a self-switch that turns on when the conditions are met.
 * @default A
 * @type select
 * @option A
 * @option B
 * @option C
 * @option D
 *
 * @param turnOff
 * @text turn Off
 * @desc The self-switch will turn off when the conditions are no longer met.
 * @default false
 * @type boolean
 *
 * @param reverse
 * @text Invert
 * @desc Conversely, when the conditions are met, the self-switch will be turned off.
 * @default false
 * @type boolean
 *
 * @param switchId
 * @text EnableSwitch
 * @desc If specified, the self switch will only fluctuate when this switch is ON.
 * @default 0
 * @type switch
 * 
 * @param Dots
 * @text Dots of detection
 * @desc If specified, the region of detection is added
 * @default true
 * @type boolean
 *
 * @param DetectionType
 * @text Type of detection
 * @desc The type used to determine the tipe of detection
 * @default 0
 * @type select
 * @option Manhattan
 * @value 0
 * @option Radial
 * @value 1
 * @option Cross
 * @value 2
 * @option Line of Sight
 * @value 3
 * @option Cone
 * @value 4
 * @param RegionBlock 
 * @text RegionBlock
 * @desc Add the id of the regions that block the line of the sensor
 * @type number[]
 * @default [] 
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);
    const params = PluginManager.parameters("SS_LaserSwitch");
    if (!param.list || !Array.isArray(param.list)) {
        return;
    }


    function eventAt(x, y) {
        const events = $gameMap.eventsXy(x, y);
        if (events.length > 0) return events[0]; // pick first for simplicity
        return null;
    }

    function getLaserRedirect(event, dir) {
        const meta = event.event().meta; // MZ note tags parsed
        if (meta.laserRedirect === "RE45R") return LASER_45R[dir] ?? dir;
        if (meta.laserRedirect === "RE45L") return LASER_45L[dir] ?? dir;
        if (meta.laserRedirect === "STOP") return null;
        // NEW: END = stop and set self switch D
        if (meta.laserRedirect === "END") {
            event.setSelfSwitch("D", true);
            return null; // stop laser
        }
        return dir; // default = continue straight
    }

    const BlockGlobal = param.RegionBlock || [1]

    const DIR_VECTORS = {
        1: [-1, 1],
        2: [0, 1],
        3: [1, 1],
        4: [-1, 0],
        6: [1, 0],
        7: [-1, -1],
        8: [0, -1],
        9: [1, -1],
    };

    const Notetags = ["Laser", "Laser45R", "Laser45L", "Laser45"]


    // Event facing: DOWN = 0, LEFT = 1, RIGHT = 2, UP = 3
    const relativeToAbsolute = {
        0: { "U": "D", "D": "U", "L": "L", "R": "R", "UL": "DL", "UR": "DR", "DL": "UL", "DR": "UR" },
        1: { "U": "L", "D": "R", "L": "D", "R": "U", "UL": "DL", "UR": "UL", "DL": "DR", "DR": "UR" },
        2: { "U": "R", "D": "L", "L": "U", "R": "D", "UL": "UR", "UR": "DR", "DL": "UL", "DR": "DL" },
        3: { "U": "U", "D": "D", "L": "R", "R": "L", "UL": "UR", "UR": "UL", "DL": "DR", "DR": "DL" },
    };


    const directionsMap = {
        "U": { x: 0, y: -1 },
        "D": { x: 0, y: 1 },
        "L": { x: -1, y: 0 },
        "R": { x: 1, y: 0 },
        "UL": { x: -1, y: -1 },
        "UR": { x: 1, y: -1 },
        "DL": { x: -1, y: 1 },
        "DR": { x: 1, y: 1 },
    };

    const LASER_45R = { 8: 9, 6: 3, 2: 1, 4: 7 };
    const LASER_45L = { 8: 7, 6: 9, 2: 3, 4: 1 };


    Game_Event.prototype.getLaserDirectionsFromNote = function () {
        const note = this.event().note;
    
        const match = note.match(/<Laser\s*([\w,]+)>/i);
        let dir=[]
        
        //if (!match) return ["U"];
        if(match) dir=match[1].split(",").map(d => d.trim()).slice(0, 4); // limit to 4 directions
        
        if(!match && note.toUpperCase().indexOf("LASER")>=0 ) dir=["U"]
        console.log(dir)
        //return match[1].split(",").map(d => d.trim()).slice(0, 4); // limit to 4 directions

    }


    Game_Event.prototype.getLaserDir = function () {
        const dir = this.direction();
        console.log(dir)
        let notetag = Notetags.filter(item => PluginManagerEx.findMetaValue(this.event(), item))
        this._laserdir = null


        if (notetag == "Laser") this._laserdir = dir
        else if (notetag == "Laser45R") this._laserdir = LASER_45R[dir] || dir
        else if (notetag == "Laser45") this._laserdir = LASER_45R[dir] || dir
        else if (notetag == "Laser45L") this._laserdir = LASER_45L[dir] || dir



    }

    Game_Event.prototype.fireLaserFromEvent = function () {

        const [dx, dy] = DIR_VECTORS[this._laserdir];
        console.log(DIR_VECTORS[this._laserdir])
        let x = this.x;
        let y = this.y;
        const hits = []
        while (true) {
            x += dx;
            y += dy;

            if (!$gameMap.isValid(x, y)) break;

            hits.push({ x, y });

            /*
            const ev = eventAt(x, y);
            if (ev) {
            const newDir = getLaserRedirect(ev, dir);
            if (newDir == null) break;
            if (newDir == -1) 
            {
            ev.
            break;
            }

            dir = newDir;
            [dx, dy] = DIR_VECTORS[dir];
            }
            */


            // later:
            // if (isBlocked(x, y)) break;
        }

        // DEBUG: visualize via console
        console.log("Laser path:", hits);

    }

    const SS_Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function () {
        SS_Game_Event_initialize.apply(this, arguments);
        this.getLaserDirectionsFromNote()
        //this.getLaserDir()
        //this.fireLaserFromEvent();

    }





    /*
    const _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function () {
        _Game_Event_initialize.apply(this, arguments);
        const dataList = param.list.filter(item => PluginManagerEx.findMetaValue(this.event(), item.noteTag));
        this._autoSelfSwitchIndexList = dataList.map(data => param.list.indexOf(data));
    };

    const _Game_Event_update = Game_Event.prototype.update;
    Game_Event.prototype.update = function () {
        _Game_Event_update.apply(this, arguments);
        this.updateAutoSelfSwitchList();
    };

    Game_Event.prototype.findAutoSelfSwitchList = function () {
        return this._autoSelfSwitchIndexList.map(index => param.list[index]);
    };

    Game_Event.prototype.updateAutoSelfSwitchList = function () {
        this.findAutoSelfSwitchList().forEach(data => {
            if (data.switchId && !$gameSwitches.value(data.switchId)) {
                return;
            }

            if (this.isValidAutoSelfSwitchList(data)) {
                this.controlSelfSwitch(data.type, !data.reverse);
            } else if (data.turnOff) {
                this.controlSelfSwitch(data.type, data.reverse);
            }
        });
    };

    Game_Event.prototype.controlSelfSwitch = function (type, value) {
        const key = [$gameMap.mapId(), this.eventId(), type];
        const prevValue = $gameSelfSwitches.value(key);
        if (prevValue !== value) {
            $gameSelfSwitches.setValue(key, value);
        }
    };

    Game_Event.prototype.isValidAutoSelfSwitchList = function (data) {
        const sx = Math.abs(this.deltaXFrom($gamePlayer.x));
        const sy = Math.abs(this.deltaYFrom($gamePlayer.y));
        const distance = sx + sy;
        switch (data.conditionType) {
            case 1:
                return distance < data.playerDistance;
            case 2:
                return distance >= data.playerDistance;
            case 3:
                return distance > data.playerDistance;
            case 4:
                return distance === data.playerDistance;
            case 5:
                return distance !== data.playerDistance;
            default:
                return distance <= data.playerDistance;
        }
    };




    Game_Event.prototype.updateAutoSelfSwitchList = function () {
        this.findAutoSelfSwitchList().forEach(data => {
            if (data.switchId && !$gameSwitches.value(data.switchId)) {
                return;
            }


            if (data.DetectionType == 0) {
                this.ManhattanVision(data)
            }
            if (data.DetectionType == 1) {
                this.RadialVision(data)
            }
            if (data.DetectionType == 2) {
                this.CrossVision(data)
            }

            if (data.DetectionType == 3) {
                this.LineVision(data)
            }

            if (data.DetectionType == 4) {
                this.ConeVision(data)
            }


            if (this.isValidAutoSelfSwitchList(data)) {
                this.controlSelfSwitch(data.type, !data.reverse);
            } else if (data.turnOff) {
                this.controlSelfSwitch(data.type, data.reverse);
            }
        });
    };



    Game_Event.prototype.isValidAutoSelfSwitchList = function (data) {
        const sx = Math.abs(this.deltaXFrom($gamePlayer.x));
        const sy = Math.abs(this.deltaYFrom($gamePlayer.y));
        const distance = sx + sy;

        if (!data) return
        //if (includesdata.DetectionType == 0) {
        if (Array.isArray(this._valid))
            return this._valid.some(p => p.x === $gamePlayer.x && p.y === $gamePlayer.y)
        //}



    };



    Game_Event.prototype.getLine = function (x0, y0, x1, y1) {
        const tiles = [];
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = x0 < x1 ? 1 : -1;
        let sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            tiles.push({ x, y }); // Add current tile
            if (x === x1 && y === y1) break;
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x += sx; }
            if (e2 < dx) { err += dx; y += sy; }
        }

        return tiles;
    };


    Game_Event.prototype.ManhattanVision = function (data) {
        const maxDistance = data.playerDistance


        const startX = this.x;
        const startY = this.y;

        const visited = new Set();
        const queue = [];
        const overlays = [];
        const pos = []
        const key = (x, y) => `${x},${y}`;
        let RegionBlock = [...BlockGlobal];
        RegionBlock = RegionBlock.concat(data.RegionBlock || [])
        // Start from event tile
        queue.push({ x: startX, y: startY, dist: 0 });
        visited.add(key(startX, startY));

        // BFS directions
        const dirs = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 }
        ];

        const sprite = SceneManager._scene._spriteset?._characterSprites.find(s => s._character === this);
        sprite.removeDotOverlay()

        while (queue.length > 0) {
            const node = queue.shift();

            // skip origin if you don't want the dot on top of event
            if (!(node.x === startX && node.y === startY)) {
                // draw a dot
                const dx = node.x - startX;
                const dy = node.y - startY;

                let dist = Math.abs(dx) + Math.abs(dy)

                switch (data.conditionType) {
                    case 1:
                        if (dist <= data.playerDistance) {
                            pos.push({ x: startX + dx, y: startY + dy });
                            sprite.addDotOverlay(8, 0xff0000, 168, dx, dy, data.Dots);
                        }
                    case 2:
                        if (dist >= data.playerDistance) {
                            pos.push({ x: startX + dx, y: startY + dy });
                            sprite.addDotOverlay(8, 0xff0000, 168, dx, dy, data.Dots);
                        }
                    case 3:
                        if (dist > data.playerDistance) {
                            pos.push({ x: startX + dx, y: startY + dy });
                            sprite.addDotOverlay(8, 0xff0000, 168, dx, dy, data.Dots);
                        }
                    case 4:
                        if (dist === data.playerDistance) {
                            pos.push({ x: startX + dx, y: startY + dy });
                            sprite.addDotOverlay(8, 0xff0000, 168, dx, dy, data.Dots);
                        }
                    case 5:
                        pos.push({ x: startX + dx, y: startY + dy });
                        sprite.addDotOverlay(8, 0xff0000, 168, dx, dy, data.Dots);
                    default:
                        pos.push({ x: startX + dx, y: startY + dy });
                        sprite.addDotOverlay(8, 0xff0000, 168, dx, dy, data.Dots);
                }



            }

            // Expand further if distance allows
            if (node.dist < maxDistance) {
                for (const d of dirs) {
                    const nx = node.x + d.dx;
                    const ny = node.y + d.dy;

                    // valid tile?
                    if (!$gameMap.isValid(nx, ny)) continue;

                    // already checked?
                    const k = key(nx, ny);
                    if (visited.has(k)) continue;

                    // BLOCKED REGION: DO NOT add or continue past it
                    if (RegionBlock.includes($gameMap.regionId(nx, ny))) continue;



                    // mark visited
                    visited.add(k);

                    // enqueue with updated distance
                    queue.push({
                        x: nx,
                        y: ny,
                        dist: node.dist + 1
                    });
                }
            }
            pos.push({ x: startX, y: startY });
            const unique = [
                ...new Map(pos.map(obj => [`${obj.x},${obj.y}`, obj])).values()
            ];
            unique.sort((a, b) => a.y - b.y || a.x - b.x);

            this._valid = unique
        }

        this._rangeOverlays = overlays;
    };



    Game_Event.prototype.RadialVision = function (data) {
        const maxDistance = data.playerDistance
        const startX = this.x;
        const startY = this.y;
        const pos = []
        let x = 0;
        let y = 0;
        let RegionBlock = [...BlockGlobal];
        RegionBlock = RegionBlock.concat(data.RegionBlock || [])

        const sprite = SceneManager._scene._spriteset?._characterSprites.find(s => s._character === this);
        sprite.removeDotOverlay()

        for (x = -Math.floor(maxDistance); x <= maxDistance; x++) {
            for (y = -Math.floor(maxDistance); y <= maxDistance; y++) {
                const distance = Math.sqrt(x * x + y * y); // Euclidean distance
                if (distance > maxDistance) continue;     // Skip tiles outside circle
                const targetX = startX + x;
                const targetY = startY + y;
                const lineTiles = this.getLine(startX, startY, targetX, targetY);

                let blocked = false;
                for (const tile of lineTiles) {
                    const regionId = $gameMap.regionId(tile.x, tile.y);
                    if (RegionBlock.includes(regionId)) {
                        blocked = true;
                        break; // stop this line
                    }
                }
                if (x == 0 && y == 0) continue
                if (!blocked) {

                    pos.push({ x: startX + x, y: startY + y });
                    sprite.addDotOverlay(8, 0xff0000, 168, x, y, data.Dots);
                }
            }
        }

        pos.push({ x: startX, y: startY });
        const unique = [
            ...new Map(pos.map(obj => [`${obj.x},${obj.y}`, obj])).values()
        ];
        unique.sort((a, b) => a.y - b.y || a.x - b.x);

        this._valid = unique

    }

    // Extend Game_Event with cone vision
    Game_Event.prototype.ConeVision = function (data) {
        const startX = this.x;
        const startY = this.y;
        const maxDistance = data.playerDistance || 5;
        const RegionBlock = [...(BlockGlobal || []), ...(data.RegionBlock || [])];
        const dir = this.direction();
        let lastWidth = 0;

        const pos = [];

        // Get the sprite of this event to draw overlays
        const sprite = SceneManager._scene._spriteset?._characterSprites.find(s => s._character === this);
        sprite.removeDotOverlay()
        for (let d = 0; d <= maxDistance; d++) {
            const baseWidth = d * 2 + 1;
            if (baseWidth === lastWidth) continue;
            lastWidth = baseWidth;

            const halfWidth = Math.floor(baseWidth / 2);

            for (let offset = -halfWidth; offset <= halfWidth; offset++) {
                let x = startX;
                let y = startY;

                switch (dir) {
                    case 2: y += d; x += offset; break; // down
                    case 8: y -= d; x += offset; break; // up
                    case 6: x += d; y += offset; break; // right
                    case 4: x -= d; y += offset; break; // left
                }

                // Calculate line from start to target
                const line = this.getLine?.(startX, startY, x, y) || [{ x, y }];

                // Check for blocked tiles
                let blocked = false;
                for (const tile of line) {
                    if (RegionBlock.includes($gameMap.regionId(tile.x, tile.y))) {
                        blocked = true;
                        break;
                    }
                }
                if (blocked) continue;

                pos.push({ x, y });

                // Draw dot on sprite if exists
                if (sprite?.addDotOverlay && lastWidth > 1) {
                    sprite.addDotOverlay(8, 0xff0000, 168, x - startX, y - startY, data.Dots);
                }
            }
        }

        // Always include the event's own tile
        pos.push({ x: startX, y: startY });

        // Remove duplicates and sort
        const unique = [...new Map(pos.map(obj => [`${obj.x},${obj.y}`, obj])).values()];
        unique.sort((a, b) => a.y - b.y || a.x - b.x);

        this._valid = unique; // store valid tiles for AI or detection
    };


    Game_Event.prototype.CrossVision = function (data) {
        const startX = this.x;
        const startY = this.y;
        const maxDistance = data.playerDistance || 5;
        const RegionBlock = [...(BlockGlobal || []), ...(data.RegionBlock || [])];

        const pos = [];

        // Get the sprite for drawing overlays
        const sprite = SceneManager._scene._spriteset?._characterSprites.find(s => s._character === this);
        sprite.removeDotOverlay()
        // Directions: up, down, left, right
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }, // left
            { dx: 1, dy: 0 }   // right
        ];

        for (const dir of directions) {
            for (let d = 1; d <= maxDistance; d++) {
                const x = startX + dir.dx * d;
                const y = startY + dir.dy * d;

                // Check for blocked tiles along the line
                const line = this.getLine?.(startX, startY, x, y) || [{ x, y }];
                let blocked = false;
                for (const tile of line) {
                    if (RegionBlock.includes($gameMap.regionId(tile.x, tile.y))) {
                        blocked = true;
                        break;
                    }
                }
                if (blocked) break; // stop line if blocked

                pos.push({ x, y });

                // Draw dot on sprite if it exists
                if (sprite?.addDotOverlay) {
                    sprite.addDotOverlay(8, 0xff0000, 168, x - startX, y - startY, data.Dots);
                }
            }
        }

        // Include the event's own tile
        pos.push({ x: startX, y: startY });

        // Remove duplicates and sort
        const unique = [...new Map(pos.map(obj => [`${obj.x},${obj.y}`, obj])).values()];
        unique.sort((a, b) => a.y - b.y || a.x - b.x);

        this._valid = unique; // store valid tiles for logic
    };


    Game_Event.prototype.LineVision = function (data) {
        const startX = this.x;
        const startY = this.y;
        const maxDistance = data.playerDistance || 5;
        const RegionBlock = [...(BlockGlobal || []), ...(data.RegionBlock || [])];
        const dir = this.direction(); // 2=down,4=left,6=right,8=up

        const pos = [];

        // Get the sprite for overlay
        const sprite = SceneManager._scene._spriteset?._characterSprites.find(s => s._character === this);
        sprite.removeDotOverlay()
        for (let d = 1; d <= maxDistance; d++) {
            let x = startX;
            let y = startY;

            switch (dir) {
                case 2: y += d; break; // down
                case 8: y -= d; break; // up
                case 6: x += d; break; // right
                case 4: x -= d; break; // left
            }

            // Check for blocked tiles along the line
            const line = this.getLine?.(startX, startY, x, y) || [{ x, y }];
            let blocked = false;
            for (const tile of line) {
                if (RegionBlock.includes($gameMap.regionId(tile.x, tile.y))) {
                    blocked = true;
                    break;
                }
            }
            if (blocked) break; // stop the line if blocked

            pos.push({ x, y });

            // Draw dot overlay on the sprite
            if (sprite?.addDotOverlay) {
                sprite.addDotOverlay(8, 0xff0000, 168, x - startX, y - startY, data.Dots);
            }
        }

        // Include the event's own tile
        pos.push({ x: startX, y: startY });

        // Remove duplicates and sort
        const unique = [...new Map(pos.map(obj => [`${obj.x},${obj.y}`, obj])).values()];
        unique.sort((a, b) => a.y - b.y || a.x - b.x);

        this._valid = unique; // store valid tiles for logic
    };



    // Hook into Sprite_Character initialize
    const SS_Sprite_Character_initialize = Sprite_Character.prototype.initialize;
    Sprite_Character.prototype.initialize = function (character) {
        SS_Sprite_Character_initialize.call(this, character);
        this._overlays = [];

    };


    Sprite_Character.prototype.addDotOverlay = function (radius = 8, color = 0xff0000, alpha = 255, offsetX = 0, offsetY = 0, active = false) {
        if (!active) return
        const dot = new PIXI.Graphics();
        dot.beginFill(color, alpha / 255);
        dot.drawCircle(0, 0, radius);
        dot.endFill();
        dot.x = offsetX * $gameMap.tileWidth();
        dot.y = offsetY * $gameMap.tileHeight();
        dot.y -= $gameMap.tileHeight() / 2
        this.addChild(dot);
        this._overlays.push(dot);
    };

    Sprite_Character.prototype.removeDotOverlay = function () {
        for (let i = this._overlays.length - 1; i >= 0; i--) {
            const overlay = this._overlays[i];
            this.removeChild(overlay);
            this._overlays.splice(i, 1);
        }
    };


    Sprite_Character.prototype.drawLaserLine = function (tiles, color = 0xff0000) {
        // Clear previous graphics
        if (!this._laserGraphics) {
            this._laserGraphics = new PIXI.Graphics();
            this.addChild(this._laserGraphics);
        } else {
            this._laserGraphics.clear();
        }

        // Start drawing
        this._laserGraphics.lineStyle(4, color, 1); // thickness, color, alpha

        if (tiles.length === 0) return;

        // Convert tile coordinates to pixel positions
        const start = tiles[0];
        this._laserGraphics.moveTo((start.x - this._character.x) * $gameMap.tileWidth(),
            (start.y - this._character.y) * $gameMap.tileHeight());

        for (let i = 1; i < tiles.length; i++) {
            const t = tiles[i];
            this._laserGraphics.lineTo((t.x - this._character.x) * $gameMap.tileWidth(),
                (t.y - this._character.y) * $gameMap.tileHeight());
        }
    };
    */


})();
