/*:
 * @target MZ
 * @plugindesc Keeps player facing UP (direction 8) while walking on Ladders.
 * @author Squall_seawave
 *
 * @param Ladder Terrain Tag
 * @type number
 * @default -1
 */


(() => {

    const pluginName = "SS_KeepLadderFacingUp";
    const params = PluginManager.parameters(pluginName);
    const ladderTag = Number(params["Ladder Terrain Tag"] || -1);


    const SS_Game_Player_moveStraight = Game_Player.prototype.moveStraight;

    Game_Player.prototype.moveStraight = function (d) {
        SS_Game_Player_moveStraight.call(this, d);
        if (this.isOnLadder()) {
            this.setDirection(8);
        }
    };

    const SS_Game_Player_setDirection = Game_Player.prototype.setDirection;



    const SS_Game_Player_isOnLadder = Game_Player.prototype.isOnLadder;

    Game_Player.prototype.isOnLadder = function () {
        return SS_Game_Player_isOnLadder.call(this) ||
            (ladderTag >= 0 &&
                ladderTag === $gameMap.terrainTag(this.x, this.y));
    };

})();

