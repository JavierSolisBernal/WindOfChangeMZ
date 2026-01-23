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


    class LaserBeam extends PIXI.Container {
        constructor(eventId, pathPoints, color = "#ff0000ff", width = 6, glowWidth = 20) {
            super();

            this._eventId = eventId;
            this.path = pathPoints;

            const hex = color.replace("#", "");
            this._rgb = parseInt(hex.substring(0, 6), 16);
            this._alpha = parseInt(hex.substring(6, 8), 16) / 255;

            this._width = width;
            this._glowWidth = glowWidth;

            this._glowLayers = [];
            [
                { w: glowWidth, a: 0.08 },
                { w: glowWidth * 0.6, a: 0.16 },
                { w: glowWidth * 0.35, a: 0.28 }
            ].forEach(s => {
                const g = new PIXI.Graphics();
                this.addChild(g);
                this._glowLayers.push({ g, s });
            });

            this._beam = new PIXI.Graphics();
            this.addChild(this._beam);
        }

        update() {
            this.draw();
        }

        draw() {
            const scene = SceneManager._scene;
            if (!(scene instanceof Scene_Map)) return;

            const ev = $gameMap.event(this._eventId);
            if (!ev || this.path.length < 2) return;

            const tilemap = scene._spriteset._tilemap;
            const tw = $gameMap.tileWidth();
            const th = $gameMap.tileHeight();
            const ox = tilemap.origin.x;
            const oy = tilemap.origin.y;

            const baseX = ev.x;
            const baseY = ev.y;

            this._beam.clear();
            this._glowLayers.forEach(o => o.g.clear());

            for (let i = 0; i < this.path.length - 1; i++) {
                const a = this.path[i];
                const b = this.path[i + 1];

                const dx = Math.sign(b.x - a.x);
                const dy = Math.sign(b.y - a.y);

                const p1 = this._tileAnchor(a, dx, dy, tw, th);
                const p2 = this._tileAnchor(b, dx, dy, tw, th);

                const x1 = (baseX + a.x) * tw + p1.x - ox;
                const y1 = (baseY + a.y) * th + p1.y - oy;
                const x2 = (baseX + b.x) * tw + p2.x - ox;
                const y2 = (baseY + b.y) * th + p2.y - oy;

                // Core
                this._beam.lineStyle(this._width, this._rgb, this._alpha);
                this._beam.moveTo(x1, y1);
                this._beam.lineTo(x2, y2);

                // Inner core
                this._beam.lineStyle(this._width * 0.45, 0xffffff, 1);
                this._beam.moveTo(x1, y1);
                this._beam.lineTo(x2, y2);

                // Glow
                this._glowLayers.forEach(o => {
                    o.g.lineStyle(o.s.w, this._rgb, o.s.a * this._alpha);
                    o.g.moveTo(x1, y1);
                    o.g.lineTo(x2, y2);
                });
            }
        }

        _tileAnchor(p, dx, dy, tw, th) {
            // Default = center
            let ax = tw / 2;
            let ay = th / 2;

            if (p.flag === "start") {
                if (dx !== 0 && dy === 0) ax = dx > 0 ? 0 : tw;
                else if (dy !== 0 && dx === 0) ay = dy > 0 ? 0 : th;
                else if (dx !== 0 && dy !== 0) {
                    ax = dx > 0 ? 0 : tw;
                    ay = dy > 0 ? 0 : th;
                }
            }

            if (p.flag === "end") {
                if (dx !== 0 && dy === 0) ax = dx > 0 ? tw : 0;
                else if (dy !== 0 && dx === 0) ay = dy > 0 ? th : 0;
                else if (dx !== 0 && dy !== 0) {
                    ax = dx > 0 ? tw : 0;
                    ay = dy > 0 ? th : 0;
                }
            }

            return { x: ax, y: ay };
        }

        addToMap(layer) {
            const scene = SceneManager._scene;
            const laser = this
            laser.z = 3;
            scene._spriteset._tilemap.addChild(laser);
            scene._spriteset._tilemap.children.sort((a, b) => (a.z || 0) - (b.z || 0));

        }


    }




    Game_Event.prototype.spawnLaser = function (targetX, targetY, color = "#00ffccff", width = 6, glowWidth = 20) {
        // Calculate pixel positions for target if given in tile coords
        const map = $gameMap;
        const tileWidth = map.tileWidth();
        const tileHeight = map.tileHeight();

        const originX = this.x * tileWidth + tileWidth / 2;
        const originY = this.y * tileHeight + tileHeight / 2;

        // If targetX/Y are tile coords, convert to pixels

        const targetPixelX = targetX * tileWidth + tileWidth / 2;
        const targetPixelY = targetY * tileHeight + tileHeight / 2;


        const laserPath = [
            { x: 0, y: 0, flag: "middle" },    // starts at event
            { x: 3, y: 0, flag: "middle" },   // 3 tiles to the right of event
            { x: 5, y: 2, flag: "end" }       // 2 tiles down from previous point
        ];

        const laser = new LaserBeam(1, laserPath, "#00AA00ff");
        // Create the laser beam
        // const laser = new LaserBeam(originX, originY, targetPixelX, targetPixelY, color, width, glowWidth);

        // Add to sort 

        //

        //SceneManager._scene._tilemap.addChild(laser);
        laser.addToMap()

        // Ignite automatically
        //laser.ignite();
        this._laser1 = laser;
        return laser;
    };
    Game_Event.prototype.killLaser = function () {
        this._laser1.retract()
    }



})();
