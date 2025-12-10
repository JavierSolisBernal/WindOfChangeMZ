/*=============================================================================
 AutoSelfSwitch.js
----------------------------------------------------------------------------
 (C)2021 Triacontane
 This software is released under the MIT License.
 http://opensource.org/licenses/mit-license.php
----------------------------------------------------------------------------
 Version
 1.1.0 2024/03/31 ConditionTypeを「以内」以外にも設定できる機能を追加
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
 
 */

(() => {
    'use strict';
    const script = document.currentScript;
    const param = PluginManagerEx.createParameter(script);
    if (!param.list || !Array.isArray(param.list)) {
        return;
    }

    const _Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function () {
        _Game_Event_initialize.apply(this, arguments);
        const dataList = param.list.filter(item => PluginManagerEx.findMetaValue(this.event(), item.noteTag));
        this._autoSelfSwitchIndexList = dataList.map(data => param.list.indexOf(data));
        this._dots = [];
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

        let distance = 0



        // Loop through each step from the event to the player
        // Calculate the number of steps needed (the largest difference between X and Y)
        let steps = Math.max(sx, sy);
        let stepX = sx > 0 ? (this.x < $gamePlayer.x ? 1 : -1) : 0;  // direction of movement in X (right or left)
        let stepY = sy > 0 ? (this.y < $gamePlayer.y ? 1 : -1) : 0;  // direction of movement in Y (up or down)

        // Starting position for checking
        let currentX = this.x; // Event's current X position
        let currentY = this.y; // Event's current Y position

        // Loop through each step to check along the line of sight
        for (let i = 0; i <= steps; i++) {
            // Check the current tile's region ID
            let regionId = $gameMap.regionId(currentX, currentY);

            // If the region ID corresponds to an obstacle, return false (line of sight blocked)
            if ([60].includes(regionId)) {
                return false;
            }

            // Move to the next tile (either in X or Y direction)
            if (sx >= sy) {
                // Move horizontally first (along X)
                currentX += stepX;
            } else {
                // Move vertically first (along Y)
                currentY += stepY;
            }
        }


        if (data.DetectionType == 0) {
            distance = sx + sy;

        }
        if (data.DetectionType == 1) {
            distance = Math.sqrt(sx * sx + sy * sy);
        }

        if (data.DetectionType == 2) {
            distance = 100000000000
            distance = sy == 0 ? sx : distance
            distance = sx == 0 ? sy : distance
        }
        if (data.DetectionType == 3) {
            if ([4, 6].includes(this.direction()) && sy > 0) return false
            if ([8, 2].includes(this.direction()) && sx > 0) return false
            if (this.direction() == 6 && $gamePlayer.x > this.x && sy == 0) distance = sx;
            else if (this.direction() == 4 && $gamePlayer.x < this.x && sy == 0) distance = sx;
            else if (this.direction() == 2 && $gamePlayer.y > this.y && sx == 0) distance = sy;
            else if (this.direction() == 8 && $gamePlayer.y < this.y && sx == 0) distance = sy;
            else return false
        }
        if (data.DetectionType == 4) {
            distance = sx + sy;
            if (this.direction() == 6 && $gamePlayer.x > this.x) distance = sx + sy;
            else if (this.direction() == 4 && $gamePlayer.x < this.x) distance = sx + sy;
            else if (this.direction() == 2 && $gamePlayer.y > this.y) distance = sx + sy;
            else if (this.direction() == 8 && $gamePlayer.y < this.y) distance = sx + sy;
            else return false
        }




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

    const _Sprite_Character_initialize = Sprite_Character.prototype.initialize;
    Sprite_Character.prototype.initialize = function (character) {
        _Sprite_Character_initialize.call(this, character);
        this.event_overlays = []; // Array to store overlay sprites
    };


    Sprite_Character.prototype.addDotOverlay = function (radius = 8, color = 0xff0000, alpha = 255, offsetX = 0, offsetY = 0) {
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


    // Hook into Sprite_Character initialize
    const SS_Sprite_Character_initialize = Sprite_Character.prototype.initialize;
    Sprite_Character.prototype.initialize = function (character) {
        SS_Sprite_Character_initialize.call(this, character);
        this._overlays = [];

        // Auto-add overlay if event has note tag
        if (character._eventId) {

            let note = $gameMap.event(character._eventId).event().note
            let dataList = []
            dataList = param.list.map((item) => { return item?._parameter?.noteTag });

            const contains = dataList.some(item => note.includes(item));
            dataList = param.list.find((item) => { return note.contains(item?._parameter?.noteTag || "") });
            if (!contains) return
            this.removeDotOverlay()
            this.createfieldofVision(character, dataList?._parameter)

        }
    };

    const _Sprite_Character_update = Sprite_Character.prototype.update;
    Sprite_Character.prototype.update = function () {
        _Sprite_Character_update.call(this);

        // Only for events with overlays
        if (this._overlays && this._overlays.length > 0) {
            const event = this._character;
            if (!event._lastDirection) event._lastDirection = event.direction();
            if (!event._lastX) event._lastX = event.x;
            if (!event._lastY) event._lastY = event.y;
            if (event._lastDirection !== event.direction()) {
                this.removeDotOverlay()
                // Update last direction
                let note = $gameMap.event(this._character._eventId).event().note
                let dataList = []
                dataList = param.list.find((item) => { return note.contains(item?._parameter?.noteTag || "") });
                this.createfieldofVision(this._character, dataList?._parameter)
                event._lastDirection = event.direction();
            }
            if (event._lastX !== event.x) {
                this.removeDotOverlay()
                // Update last direction
                let note = $gameMap.event(this._character._eventId).event().note
                let dataList = []
                dataList = param.list.find((item) => { return note.contains(item?._parameter?.noteTag || "") });
                this.createfieldofVision(this._character, dataList?._parameter)
                this._character.isValidAutoSelfSwitchList(dataList?._parameter)
                event._lastX = event.x;
            }
            if (event._lastY !== event.y) {
                this.removeDotOverlay()
                // Update last direction
                let note = $gameMap.event(this._character._eventId).event().note
                let dataList = []
                dataList = param.list.find((item) => { return note.contains(item?._parameter?.noteTag || "") });
                this.createfieldofVision(this._character, dataList?._parameter)
                event._lastY = event.y;
            }


        }
    };

    Sprite_Character.prototype.createfieldofVision = function (event, data) {
        const sx = Math.abs(event.deltaXFrom($gamePlayer.x));
        const sy = Math.abs(event.deltaYFrom($gamePlayer.y));
        const originX = event.x
        const originY = event.y
        if (!data) return

        if (data.DetectionType == 0) {
            this.ManhattanVision(event, data)

        }



    }


    Sprite_Character.prototype.ManhattanVision = function (event, data) {
        const maxDistance = data.playerDistance


        const startX = event.x;
        const startY = event.y;

        const visited = new Set();
        const queue = [];
        const overlays = [];

        const key = (x, y) => `${x},${y}`;

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

        while (queue.length > 0) {
            const node = queue.shift();

            // skip origin if you don't want the dot on top of event
            if (!(node.x === startX && node.y === startY)) {
                // draw a dot
                const dx = node.x - startX;
                const dy = node.y - startY;

                const px = dx * $gameMap.tileWidth() + $gameMap.tileWidth() / 2;
                const py = dy * $gameMap.tileHeight() + $gameMap.tileHeight() / 2;


                this.addDotOverlay(8, 0xff0000, 168, dx, dy);
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
                    if ([60].includes($gameMap.regionId(nx, ny))) continue;

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
        }

        this._rangeOverlays = overlays;
    };


})();
