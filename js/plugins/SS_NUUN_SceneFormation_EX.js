//=============================================================================
// RPG Maker MZ - SS_NUUN_SceneFormation_EX
//=============================================================================

/*:
 * @target MZ
 * @plugindesc An extention to correct the Formation Scene from nuun
 * @author Squall_seawave
 * @version 1.1
 * @base NUUN_SceneFormation
 * @help
 * it is plug an play
 * change the colors to accept the fixed battler
 * fixer battler cannot be moved
 * 
 * @command RemoveBattleActor
 * @text Remove Actor
 * @desc Removes an actor from battle party.
 *
 * @arg actorId
 * @type actor
 * @text Actor
 * @desc Select the actor you want to remove from battle. 
 */
(() => {

    const params = PluginManager.parameters("NUUN_SceneFormation");
    // Parse the array of {name, code}
    //const rawList = JSON.parse(params["formulas"] || "[]");

    //CHECK IF THE PLUGIN IS INSTALLED 

    if (!Game_Actor.prototype.setBattleFixed) {
        console.warn("NUUN_SceneFormation not installed — extension disabled.");
        return;
    }


    PluginManager.registerCommand("SS_NUUN_SceneFormation_EX", "RemoveBattleActor", args => {
        const actorId = Number(args.actorId);
        if (!actorId) return; // Skip if none selected
        if (!$gameParty.battleMembers().some(actor => actor.actorId() === actorId)) return
        let pos = $gameParty._formationBattleMembers - 1
        let $_partynew = $gameParty._actors.filter(member => member != actorId)
        $_partynew.splice(pos, 0, actorId)
        $gameParty._actors = $_partynew
        $gameParty._formationBattleMembers = pos
        $gamePlayer.refresh()
    });


 
    
    


    __drawBackGroundActor = Window_StatusBase.prototype.drawBackGroundActor
    Window_StatusBase.prototype.drawBackGroundActor = function (index) {
        __drawBackGroundActor.call(this, index);
        const actor = this.actor(index);
        if (index !== this._pendingIndex) {
            const rect = this.itemRect(index);
            this.contentsBack.paintOpacity = 128;
            if (actor && actor?.isBattleFixed()) {
                const battleFixedColor = NuunManager.getColorCode(params.BattleFixedActorColor || 0);
                this.contentsBack.fillRect(rect.x + 1, rect.y + 1, rect.width - 2, rect.height - 2, battleFixedColor);
            }
            this.contentsBack.paintOpacity = 255;

        }
    };
    __FormationBattleMemberdrawItem = Window_FormationBattleMember.prototype.drawItem
    Window_FormationBattleMember.prototype.drawItem = function (index) {
        __FormationBattleMemberdrawItem.call(this, index)
        const actor = this.actor(index);
        const rect = this.itemRect(index)
        if (actor && actor?.isBattleFixed()) {
            this.drawSmallIcon(314, rect.x + 32, rect.width - 10, 14); // medium icon
            //this.drawText(index, rect.x, rect.y + 4, rect.width/2, "center");
        }

    }
    __FormationMemberdrawItem = Window_FormationMember.prototype.drawItem
    Window_FormationMember.prototype.drawItem = function (index) {
        __FormationMemberdrawItem.call(this, index)
        const actor = this.actor(index);
        const rect = this.itemRect(index)
        if (actor && actor?.isBattleFixed()) {
            this.drawSmallIcon(314, rect.x + 32, rect.width - 10, 14); // medium icon
            //this.drawText(index, rect.x, rect.y + 4, rect.width/2, "center");
        }
    };



    Window_Base.prototype.drawSmallIcon = function (iconIndex, x, y, size = 16) {
        var bitmap = ImageManager.loadSystem('IconSet');
        var pw = ImageManager.iconWidth;
        var ph = ImageManager.iconHeight;
        var sx = iconIndex % 16 * pw;
        var sy = Math.floor(iconIndex / 16) * ph;
        this.contents.blt(bitmap, sx, sy, pw, ph, x, y, size, size);
    };


 
 


})();