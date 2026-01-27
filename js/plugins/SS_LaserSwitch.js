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

    const DIRECTIONS = [
        { x: 0, y: -1 }, // 8 up
        { x: 1, y: -1 }, // 9 up-right
        { x: 1, y: 0 },  // 6 right
        { x: 1, y: 1 },  // 3 down-right
        { x: 0, y: 1 },  // 2 down
        { x: -1, y: 1 }, // 1 down-left
        { x: -1, y: 0 }, // 4 left
        { x: -1, y: -1 } // 7 up-left
    ];


    class LaserBeamPath extends PIXI.Container {
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


    class LaserBeamline extends PIXI.Container {
        /**
         * @param {number} eventId - Event ID
         * @param {number} direction - 1-9 direction (numeric keypad)
         * @param {string} color - hex color (RRGGBBAA)
         * @param {number} width - core width
         * @param {number} glowWidth - glow width
         * @param {"start"|"center"|"end"} startFlag - position within the first tile
         */
        constructor(eventId, direction = 8, color = "#ff0000ff", width = 6, glowWidth = 20, startFlag = "center") {
            super();

            this._eventId = eventId;
            this._direction = direction;
            this._startFlag = startFlag;

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
            if (!ev) return;

            // Build path dynamically
            this.path = this._buildRayPath(ev.x, ev.y, this._direction);
            if (this.path.length < 2) return;

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

                const p1 = this._tileAnchor(a, dx, dy, tw, th, i === 0 ? this._startFlag : undefined);
                const p2 = this._tileAnchor(b, dx, dy, tw, th, i === this.path.length - 2 ? "end" : undefined);

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

        _tileAnchor(p, dx, dy, tw, th, flag) {
            // flag = "start" | "end" | "center"
            flag = flag || p.flag || "center";

            let ax = tw / 2;
            let ay = th / 2;

            if (flag === "start") {
                if (dx !== 0 && dy === 0) ax = dx > 0 ? 0 : tw;
                else if (dy !== 0 && dx === 0) ay = dy > 0 ? 0 : th;
                else if (dx !== 0 && dy !== 0) {
                    ax = dx > 0 ? 0 : tw;
                    ay = dy > 0 ? 0 : th;
                }
            } else if (flag === "end") {
                if (dx !== 0 && dy === 0) ax = dx > 0 ? tw : 0;
                else if (dy !== 0 && dx === 0) ay = dy > 0 ? th : 0;
                else if (dx !== 0 && dy !== 0) {
                    ax = dx > 0 ? tw : 0;
                    ay = dy > 0 ? th : 0;
                }
            }
            // center is default, no changes

            return { x: ax, y: ay };
        }

        _dirToVector(dir) {
            switch (dir) {
                case 1: return { x: 1, y: 1 };   // down-right
                case 2: return { x: 0, y: 1 };   // down
                case 3: return { x: -1, y: 1 };   // down-left
                case 4: return { x: -1, y: 0 };   // left
                case 6: return { x: 1, y: 0 };   // right
                case 7: return { x: -1, y: -1 };  // up-left
                case 8: return { x: 0, y: -1 };  // up
                case 9: return { x: 1, y: -1 };  // up-right
                default: return { x: 0, y: -1 };  // default up
            }
        }

        _buildRayPath(startX, startY, dir) {
            const v = this._dirToVector(dir);
            const path = [];

            let x = 0;
            let y = 0;

            path.push({ x: 0, y: 0, flag: "start" });

            while (true) {
                x += v.x;
                y += v.y;

                const mx = startX + x;
                const my = startY + y;

                if (!$gameMap.isValid(mx, my)) {
                    path[path.length - 1].flag = "end";
                    break;
                }

                path.push({ x, y });
            }

            path[path.length - 1].flag = "end";
            return path;
        }

        addToMap(layer) {
            const scene = SceneManager._scene;
            const laser = this;
            laser.z = 3;
            scene._spriteset._tilemap.addChild(laser);
            scene._spriteset._tilemap.children.sort((a, b) => (a.z || 0) - (b.z || 0));
        }
    }
 

    class LaserBeam extends PIXI.Container {
        constructor(eventId, direction = 8, color = "#ff0000ff", width = 6, glowWidth = 20, startFlag = "center") {
            super();

            this._eventId = eventId;
            this._direction = direction;
            this._startFlag = startFlag;

            // Blocking config
            this._blockRegions = [1, 2];
            this._blockEvents = true;
            this._blockPassage = true;

            const hex = color.replace("#", "");
            this._rgb = parseInt(hex.substring(0, 6), 16);
            this._alpha = parseInt(hex.substring(6, 8), 16) / 255;

            this._width = width;
            this._glowWidth = glowWidth;

            // Cache state
            this._dirty = true;
            this._lastX = null;
            this._lastY = null;
            this._lastDir = null;

            // Glow animation
            this._glowTime = Math.random() * Math.PI * 2;
            this._glowSpeed = 0.08;
            this._glowStrength = 0.35;

            // Glow layers
            this._glowLayers = [];
            [
                { w: glowWidth, a: 0.08 },
                { w: glowWidth * 0.6, a: 0.16 },
                { w: glowWidth * 0.35, a: 0.28 }
            ].forEach(s => {
                const g = new PIXI.Graphics();
                g.blendMode = PIXI.BLEND_MODES.ADD;
                g._baseAlpha = s.a;
                this.addChild(g);
                this._glowLayers.push({ g, s });
            });

            // Core beam
            this._beam = new PIXI.Graphics();
            this.addChild(this._beam);
        }

        update() {
            const scene = SceneManager._scene;
            if (!(scene instanceof Scene_Map)) return;

            const tilemap = scene._spriteset._tilemap;

            // Follow map scrolling
            this.x = -tilemap.origin.x;
            this.y = -tilemap.origin.y;

            if (this._needsRedraw()) {
                this._redraw();
            }

            this._animateGlow();
        }

        /* ===============================
         *  Animation
         * =============================== */
        _animateGlow() {
            this._glowTime += this._glowSpeed;
            const pulse = (Math.sin(this._glowTime) + 1) * 0.5;

            this._glowLayers.forEach(o => {
                o.g.alpha = (o.g._baseAlpha + pulse * this._glowStrength) * this._alpha;
            });
        }

        /* ===============================
         *  Redraw logic
         * =============================== */
        _needsRedraw() {
            const ev = $gameMap.event(this._eventId);
            if (!ev) return false;

            if (
                ev.x !== this._lastX ||
                ev.y !== this._lastY ||
                this._direction !== this._lastDir
            ) {
                this._lastX = ev.x;
                this._lastY = ev.y;
                this._lastDir = this._direction;
                return true;
            }
            return this._dirty;
        }

        _redraw() {
            this._dirty = false;

            const ev = $gameMap.event(this._eventId);
            if (!ev) return;

            const path = this._buildRayPath(ev.x, ev.y, this._direction);
            if (path.length < 2) return;

            const tw = $gameMap.tileWidth();
            const th = $gameMap.tileHeight();

            this._beam.clear();
            this._glowLayers.forEach(o => o.g.clear());

            for (let i = 0; i < path.length - 1; i++) {
                const a = path[i];
                const b = path[i + 1];

                const dx = Math.sign(b.x - a.x);
                const dy = Math.sign(b.y - a.y);

                const p1 = this._tileAnchor(a, dx, dy, tw, th, i === 0 ? this._startFlag : undefined);
                const p2 = this._tileAnchor(b, dx, dy, tw, th, i === path.length - 2 ? "end" : undefined);

                const x1 = (ev.x + a.x) * tw + p1.x;
                const y1 = (ev.y + a.y) * th + p1.y;
                const x2 = (ev.x + b.x) * tw + p2.x;
                const y2 = (ev.y + b.y) * th + p2.y;

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
                    o.g.lineStyle(o.s.w, this._rgb, o.s.a);
                    o.g.moveTo(x1, y1);
                    o.g.lineTo(x2, y2);
                });
            }
        }

        /* ===============================
         *  Ray building + mirror logic
         * =============================== */
        _buildRayPath(startX, startY, dir) {
            let curDir = dir;
            let v = this._dirToVector(curDir);

            const path = [{ x: 0, y: 0, flag: "start" }];
            let x = 0;
            let y = 0;

            while (true) {
                x += v.x;
                y += v.y;

                const mx = startX + x;
                const my = startY + y;

                if (!$gameMap.isValid(mx, my)) {
                    path[path.length - 1].flag = "end";
                    break;
                }

                const mirror = this._getMirrorAt(mx, my);
                if (mirror) {
                    path.push({ x, y });

                    // Rotate sprite based on _event_dir
                    if (mirror._character) {
                        mirror._character.rotation = this._dirToAngle(mirror._event_dir);
                    }

                    curDir = this._reflectDir(curDir, mirror);

                    if (!curDir) {
                        path.push({ x, y, flag: "end" });
                        break;
                    }
                    v = this._dirToVector(curDir);
                    continue;
                }

                if (this._isBlockedByRegion(mx, my)) {
                    path.push({ x, y, flag: "end" });
                    break;
                }

                if (this._isBlockedByEvent(mx, my)) {
                    path.push({ x, y, flag: "end" });
                    break;
                }

                if (this._isBlockedByPassage(mx - v.x, my - v.y, v.x, v.y)) {
                    path[path.length - 1].flag = "end";
                    break;
                }

                path.push({ x, y });
            }

            path[path.length - 1].flag = "end";
            return path;
        }

        _isBlockedByRegion(x, y) {
            return this._blockRegions.includes($gameMap.regionId(x, y));
        }

        _isBlockedByEvent(x, y) {
            if (!this._blockEvents) return false;

            const events = $gameMap.eventsXyNt(x, y);
            return events.some(ev =>
                ev.eventId() !== this._eventId &&
                !ev._event_dir // mirrors don’t block
            );
        }

        _isBlockedByPassage(x, y, dx, dy) {
            if (!this._blockPassage) return false;

            const dir =
                dx === 1 && dy === 0 ? 6 :
                    dx === -1 && dy === 0 ? 4 :
                        dx === 0 && dy === 1 ? 2 :
                            dx === 0 && dy === -1 ? 8 : 0;

            return dir && !$gameMap.isPassable(x, y, dir);
        }

        /* ===============================
         *  Mirror helpers
         * =============================== */
        _getMirrorAt(x, y) {
            const events = $gameMap.eventsXyNt(x, y);
            return events.find(ev => ev._event_dir); // any event with _event_dir
        }

        _normalizeDir(dir) {
            if (typeof dir === "number") return dir;
            const map = { U: 8, D: 2, L: 4, R: 6, UL: 7, UR: 9, DL: 1, DR: 3 };
            return map[String(dir).toUpperCase()] || 0;
        }

        _reflectDir(inDir, mirror) {
            const m = this._normalizeDir(mirror._event_dir);
            const mode = mirror._mirror_mode || "all-way";

            /*
            if (mode === "one-way") {
                const allowed = { 4: [6], 6: [4], 8: [2], 2: [8], 7: [3], 3: [7], 1: [9], 9: [1] };
                if (!allowed[m]?.includes(inDir)) {
                    return null; // laser stops here
                }
            }
            */

            // Horizontal
            if (m === 4 || m === 6) return { 8: 2, 2: 8, 7: 1, 9: 3, 1: 7, 3: 9 }[inDir] || inDir;
            // Vertical
            if (m === 8 || m === 2) return { 4: 6, 6: 4, 7: 9, 1: 3, 9: 7, 3: 1 }[inDir] || inDir;
            // Diagonal \
            if (m === 7 || m === 3) return { 8: 4, 6: 2, 4: 8, 2: 6, 9: 1, 1: 9 }[inDir] || inDir;
            // Diagonal /
            if (m === 9 || m === 1) return { 8: 6, 4: 2, 6: 8, 2: 4, 7: 3, 3: 7 }[inDir] || inDir;

            return inDir;
        }


        _dirToVector(dir) {
            return {
                1: { x: 1, y: 1 },
                2: { x: 0, y: 1 },
                3: { x: -1, y: 1 },
                4: { x: -1, y: 0 },
                6: { x: 1, y: 0 },
                7: { x: -1, y: -1 },
                8: { x: 0, y: -1 },
                9: { x: 1, y: -1 }
            }[dir] || { x: 0, y: -1 };
        }

        _dirToAngle(dir) {
            const map = { 1: 5 * Math.PI / 4, 2: Math.PI / 2, 3: 3 * Math.PI / 4, 4: Math.PI, 6: 0, 7: -3 * Math.PI / 4, 8: -Math.PI / 2, 9: -Math.PI / 4 };
            return map[dir] || 0;
        }

        _tileAnchor(p, dx, dy, tw, th, flag) {
            flag = flag || p.flag || "center";
            let ax = tw / 2, ay = th / 2;

            if (flag === "start") { if (dx) ax = dx > 0 ? 0 : tw; if (dy) ay = dy > 0 ? 0 : th; }
            else if (flag === "end") { if (dx) ax = dx > 0 ? tw : 0; if (dy) ay = dy > 0 ? th : 0; }

            return { x: ax, y: ay };
        }

        addToMap() {
            const scene = SceneManager._scene;
            if (!(scene instanceof Scene_Map)) return;

            this.z = 3;
            scene._spriteset._tilemap.addChild(this);
            scene._spriteset._tilemap.children.sort((a, b) => (a.z || 0) - (b.z || 0));
        }

        /* ===============================
         *  Event note tag parser for mirrors
         * =============================== */
        static setupMirrorEvent(ev) {
            if (!ev.event) return;
            const note = ev.event().note;
            console.log(note)
            const match = note.match(/<Mirror:\s*(\w+)\s*,?\s*(one-way|all-way)?\s*>/i);
            if (match) {
                const dir = match[1];
                const mode = match[2] || "all-way";

                ev._event_dir = dir;
                ev._mirror_mode = mode;
            }
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

        const laser = new LaserBeam(1, 8);
        //const laser = new LaserBeam(1, laserPath );
        //const laser = new LaserRaySmooth(1, 8, "#00AA00ff")

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

    Game_Event.prototype.rotateMirrorCW = function () {
        const order = [1, 2, 3, 6, 9, 8, 7, 4]; // clockwise order ignoring 5 (center)
        let dir =this._event_dir
        const map = { U: 8, D: 2, L: 4, R: 6, UL: 7, UR: 9, DL: 1, DR: 3 };
        if (typeof dir === "number")  dir;
        else
        dir=map[dir]   
        const idx = order.indexOf(dir);
        if (idx >= 0) this._event_dir = order[(idx + 1) % order.length];
    };

    Game_Event.prototype.rotateMirrorCCW = function () {
        const order = [1, 4, 7, 8, 9, 6, 3, 2]; // counterclockwise
        let dir =this._event_dir
        const map = { U: 8, D: 2, L: 4, R: 6, UL: 7, UR: 9, DL: 1, DR: 3 };
        if (typeof dir === "number")  dir;
        else
        dir=map[dir]   
        const idx = order.indexOf(dir);
        if (idx >= 0) this._event_dir = order[(idx + 1) % order.length];
    };



    const SS_Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        SS_Scene_Map_start.call(this);

        // Parse all mirrors on the map
        $gameMap.events().forEach(ev => {
            LaserBeam.setupMirrorEvent(ev);
        });

        

    };


})();
