/*:
* @target MZ
* @plugindesc System of lasers
* @author Squall_seawave 
 
 
*/

(() => {
    const pluginName = document.currentScript.src.match(/([^\/]+)\.js$/)[1];
    const params = PluginManager.parameters(pluginName);

    const DEBUG = { tiles: false, character: true };
    //HELPERS

    const DIR = {
        1: [-1, 1],
        2: [0, 1],
        3: [1, 1],
        4: [-1, 0],
        6: [1, 0],
        7: [-1, -1],
        8: [0, -1],
        9: [1, -1]
    };

    //LASER CONSTRUCTION
    class Laser {
        constructor(d, turnedOn = false) {
            this.startDirection = d;
            this.path = [];
            this.needRefresh = true;
            this.turnedOn = turnedOn

        }

        turnOnOff(state) {
            if (this.turnedOn !== state) {
                this.turnedOn = state;
                this.markDirty();
            }
        }

        refreshPath(event) {

            if (!this.turnedOn) {
                this.path = [];
                this.needRefresh = false;
                return;
            }

            const dir = this.startDirection;
            const [dx, dy] = DIR[dir];

            let x = event.x;
            let y = event.y;

            const path = [];

            while (true) {
                x += dx;
                y += dy;

                // stop at map boundary ONLY (your current requirement)
                if (!$gameMap.isValid(x, y)) break;

                path.push({ x, y });
            }

            this.path = path;
            this.needRefresh = false;
        }

        markDirty() {
            this.needRefresh = true;
        }
    }

    const SS_Game_Event_initialize = Game_Event.prototype.initialize;
    Game_Event.prototype.initialize = function (mapId, eventId) {
        SS_Game_Event_initialize.call(this, mapId, eventId);
        this._lasers = {};
        for (let i = 1; i <= 9; i++) {
            if (i === 5) continue;
            this._lasers[i] = new Laser(i);
        }

    };


})();
