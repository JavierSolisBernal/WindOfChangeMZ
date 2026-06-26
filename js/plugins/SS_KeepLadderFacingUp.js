/*:
 * @target MZ
 * @plugindesc Keeps player facing UP (direction 8) while walking on Ladders.
 * @author Squall_seawave
 *
 * @param Ladder Terrain Tag
 * @type number
 * @default -1
 *
 * @command ForceUpdate
 * @text Set Force Update
 *
 * @arg enabled
 * @type boolean
 * @default true
 * @text Enabled
 */


(() => {

    const pluginName = "SS_KeepLadderFacingUp";
    const params = PluginManager.parameters(pluginName);
    const ladderTag = Number(params["Ladder Terrain Tag"] || -1);

    PluginManager.registerCommand(pluginName, "ForceUpdate", args => {
        $gameSystem._ssLadderForceUpdate = args.enabled === "true";
    });

    const SS_Game_System_initialize = Game_System.prototype.initialize;

    Game_System.prototype.initialize = function () {
        SS_Game_System_initialize.call(this);
        this._ssLadderForceUpdate = false;
    };

    const SS_Game_Player_moveStraight = Game_Player.prototype.moveStraight;

    Game_Player.prototype.moveStraight = function (d) {
        SS_Game_Player_moveStraight.call(this, d);
        if (this.isOnLadder()) {
            this.setDirection(8);
        }
    };


    const SS_Game_Player_update = Game_Player.prototype.update;

    Game_Player.prototype.update = function (sceneActive) {
        SS_Game_Player_update.call(this, sceneActive);

        if ($gameSystem._ssLadderForceUpdate && this.direction() !== 8  && this.isOnLadder() ) {
            this.setDirection(8);
        }
    };

    const SS_Game_Player_isOnLadder = Game_Player.prototype.isOnLadder;

    Game_Player.prototype.isOnLadder = function () {
        return SS_Game_Player_isOnLadder.call(this) ||
            (ladderTag >= 0 &&
                ladderTag === $gameMap.terrainTag(this.x, this.y));
    };

})();

