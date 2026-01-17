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
    constructor(x1, y1, x2, y2, color = "#ff0000ff", width = 6, glowWidth = 20, rotationSpeed = 0.15) {
        super();

        this._x1 = x1;
        this._y1 = y1;
        this._x2 = x2;
        this._y2 = y2;

        const hex = color.replace("#", "");
        this._rgb = parseInt(hex.substring(0, 6), 16);
        this._alpha = parseInt(hex.substring(6, 8), 16) / 255;

        this._baseWidth = width;
        this._glowWidth = glowWidth;

        this._currentLength = 0;
        this._fullLength = 0;
        this._speed = 24;
        this._state = "off";
        this._frameCount = 0;

        this.rotationSpeed = rotationSpeed; // default rotation speed per frame
        this._rotateClockwise = true;       // default rotation direction

        this.x = x1;
        this.y = y1;

        this._glowLayers = [];
        [
            { w: glowWidth, a: 0.08 },
            { w: glowWidth * 0.65, a: 0.15 },
            { w: glowWidth * 0.4, a: 0.25 }
        ].forEach(s => {
            const g = new PIXI.Graphics();
            this.addChild(g);
            this._glowLayers.push({ g, s });
        });

        this._beam = new PIXI.Graphics();
        this.addChild(this._beam);

        this.alpha = 0;
    }

    ignite() { this._state = "igniting"; this._currentLength = 0; this.alpha = 1; }
    retract() { this._state = "retracting"; }

    // Move end point with optional rotation speed & direction
    moveEndTo(x, y, rotationSpeed = null, clockwise = true) {
        this._x2 = x;
        this._y2 = y;
        if (rotationSpeed !== null) this.rotationSpeed = rotationSpeed;
        this._rotateClockwise = clockwise;
    }

    _draw() {
        if (this._currentLength <= 0) return;

        const g = this._beam;
        g.clear();
        g.lineStyle({ width: this._baseWidth, color: this._rgb, alpha: this._alpha, cap: PIXI.LINE_CAP.ROUND });
        g.moveTo(0, 0); g.lineTo(this._currentLength, 0);
        g.lineStyle({ width: this._baseWidth * 0.45, color: 0xffffff, alpha: 1, cap: PIXI.LINE_CAP.ROUND });
        g.moveTo(0, 0); g.lineTo(this._currentLength, 0);
        this._glowLayers.forEach(o => {
            const gl = o.g;
            gl.clear();
            gl.lineStyle({ width: o.s.w, color: this._rgb, alpha: o.s.a * this._alpha, cap: PIXI.LINE_CAP.ROUND });
            gl.moveTo(0, 0); gl.lineTo(this._currentLength, 0);
        });
    }

    update() {
    this._frameCount++;

    this.x = this._x1;
    this.y = this._y1;

    const dx = this._x2 - this.x;
    const dy = this._y2 - this.y;
    const targetRotation = Math.atan2(dy, dx);

    // --- FIXED ROTATION ---
    let current = this.rotation;
    let diff = ((targetRotation - current + Math.PI) % (2 * Math.PI)) - Math.PI; // [-π, π]

    // Apply rotation direction preference
    if (!this._rotateClockwise && diff > 0) diff -= 2 * Math.PI;
    if (!this._rotateClockwise && diff < 0) diff += 2 * Math.PI;

    // Move rotation by at most rotationSpeed
    if (Math.abs(diff) <= this.rotationSpeed) {
        this.rotation = targetRotation; // close enough
    } else {
        this.rotation += Math.sign(diff) * this.rotationSpeed;
    }

    this._fullLength = Math.hypot(dx, dy);

    switch (this._state) {
        case "igniting":
            this._currentLength += this._speed;
            if (this._currentLength >= this._fullLength) { this._currentLength = this._fullLength; this._state = "on"; }
            break;
        case "retracting":
            this._currentLength -= this._speed * 1.2;
            if (this._currentLength <= 0) { this._currentLength = 0; this.alpha = 0; this._state = "off"; return; }
            break;
        case "off":
            this.alpha = 0; return;
    }

    this.scale.y = 0.9 + Math.sin(this._frameCount / 10) * 0.1;
    this._draw();
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

        // Create the laser beam
        const laser = new LaserBeam(originX, originY, targetPixelX, targetPixelY, color, width, glowWidth);

        // Add to current scene
        SceneManager._scene.addChild(laser);

        // Ignite automatically
        laser.ignite();
        this._laser1 = laser;
        return laser;
    };
    Game_Event.prototype.killLaser = function () {
        this._laser1.retract()
    }

    Game_Event.prototype.move = function (targetX, targetY) {
        if(!this._laser1)return
        const map = $gameMap;
        const tileWidth = map.tileWidth();
        const tileHeight = map.tileHeight();
        const targetPixelX = targetX * tileWidth + tileWidth / 2;
        const targetPixelY = targetY * tileHeight + tileHeight / 2;
        
        this._laser1.moveEndTo(targetPixelX, targetPixelY, 0.05, true)
    }


    class LaserBeambackup extends PIXI.Container {
        constructor(x1, y1, x2, y2, color = 0xff0000, width = 6, glowWidth = 20) {
            super();

            this._x1 = x1;
            this._y1 = y1;
            this._x2 = x2;
            this._y2 = y2;
            this._baseWidth = width;
            this._glowWidth = glowWidth;
            this._color = color;

            this.x = x1;
            this.y = y1;

            this._dx = x2 - x1;
            this._dy = y2 - y1;
            this._length = Math.sqrt(this._dx * this._dx + this._dy * this._dy);
            this._angle = Math.atan2(this._dy, this._dx);

            // --- Glow layers ---
            this._glowLayers = [];
            const glowFactors = [
                { w: glowWidth, a: 0.08 },
                { w: glowWidth * 0.7, a: 0.15 },
                { w: glowWidth * 0.4, a: 0.25 }
            ];
            glowFactors.forEach(f => {
                const g = new PIXI.Graphics();
                g.lineStyle({ width: f.w, color: color, alpha: f.a, cap: PIXI.LINE_CAP.ROUND });
                g.moveTo(0, 0);
                g.lineTo(this._length, 0);
                g.beginFill(color, f.a);
                g.drawCircle(0, 0, f.w / 2);
                g.drawCircle(this._length, 0, f.w / 2);
                g.endFill();
                g.rotation = this._angle;
                this.addChild(g);
                this._glowLayers.push(g);
            });

            // --- Core beam (gradient effect) ---
            this._beam = new PIXI.Graphics();
            this._drawBeam();
            this.addChild(this._beam);

            // --- Tip ball at the end ---
            this._tipBall = new PIXI.Graphics();
            this._tipBall.beginFill(color, 1);
            this._tipBall.drawCircle(0, 0, width * 0.6); // smaller than before
            this._tipBall.endFill();
            this._tipBall.x = this._length;
            this._tipBall.y = 0;
            this.addChild(this._tipBall);

            this.blendMode = PIXI.BLEND_MODES.ADD;
            this._frameCount = 0;
        }

        // Draw core beam with gradient
        _drawBeam() {
            const beam = this._beam;
            beam.clear();
            const coreSteps = 4;
            for (let i = 0; i < coreSteps; i++) {
                const w = this._baseWidth * (1 - i / coreSteps);
                const alpha = 1 - i / (coreSteps * 1.5);
                const color = this._color;
                beam.lineStyle({ width: w, color: color, alpha: alpha, cap: PIXI.LINE_CAP.ROUND });
                beam.moveTo(0, 0);
                beam.lineTo(this._length, 0);
            }
        }

        // Update: breathing glow + tip pulse
        update() {
            this._frameCount++;

            // Breathing beam
            const pulse = 0.85 + Math.sin(this._frameCount / 10) * 0.15;
            this._glowLayers.forEach(g => {
                g.scale.y = pulse;
                g.alpha = 0.2 + 0.05 * Math.sin(this._frameCount / 5);
            });
            this._beam.scale.y = pulse;

            // Tip ball pulsing
            const tipPulse = 1 + 0.25 * Math.sin(this._frameCount / 6);
            this._tipBall.scale.set(tipPulse);

            // Small glowing aura around tip
            if (!this._tipGlow) {
                this._tipGlow = new PIXI.Graphics();
                this.addChildAt(this._tipGlow, 0);
            }
            const g = this._tipGlow;
            g.clear();
            const glowAlpha = 0.2 + 0.1 * Math.sin(this._frameCount / 4);
            g.beginFill(this._color, glowAlpha);
            g.drawCircle(this._length, 0, this._baseWidth * 1.5);
            g.endFill();
        }
    }



    const SS_Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function () {
        SS_Spriteset_Map_update.call(this);
        this._tilemap.children.forEach(c => c.update?.());
    };

    // --- Add laser methods to Game_Event ---
    Game_Event.prototype.fireLaser = function (length = 300, color = "0xff0000", width = 4) {
        this.eraseLaser();

        const startX = this.screenX();
        const startY = this.screenY() - 24;
        const vec = directionsMap["R"];

        const endX = startX + vec.x * length;
        const endY = startY + vec.y * length;

        this._laserSprite = new LaserBeam(
            startX, startY, endX, endY, color, width
        );

        SceneManager._scene._spriteset._tilemap.addChild(this._laserSprite);
    };


    Game_Event.prototype.eraseLaser = function () {
        if (this._laserSprite) {
            this._laserSprite.parent.removeChild(this._laserSprite);
            this._laserSprite.destroy();
            this._laserSprite = null;
        }
    };



    /*

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

    */

})();
