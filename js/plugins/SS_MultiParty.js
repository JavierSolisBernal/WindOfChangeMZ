//=============================================================================
// RPG Maker MZ - Custom Formulas
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Allows defining multiple named damage formulas as an array.
 * @author Squall_seawave
 * @version 1.1
 * @help
 * Each entry contains:
 * name:   The function name
 * params: Parameter list separated by commas
 * code:   JavaScript code to run
 
 */




(() => {

    const params = PluginManager.parameters("SS_Custom_Formulas");
    
    // Parse the array of {name, code}
    //const rawList = JSON.parse(params["formulas"] || "[]");
    window.ss_partygroups = [];
    window.ss_active_party = 0

    function initializeParty() {

        ss_partygroups.push({
            id: 0,
            actors: $gameParty?.allMembers().slice(0, $gameParty.maxBattleMembers()) || [],
            mapId: Number($gameMap?.mapId() || 1),
            x: $gamePlayer?.x,
            y: $gamePlayer?.y,
            discovered: true,
            swap: true
        })
    }


     
    

    const _Scene_MapSSMP_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function () {
        _Scene_MapSSMP_start.call(this);
        // Now $gameMap, $gamePlayer, $gameParty are ready

        initializeParty()
    };

    Game_Party.prototype.setActiveParty = function (ap) {
        let active_party = ss_partygroups?.find(o => o.id === ap)
        if (!active_party) return 0
        ss_active_party = ap
    }
    Game_Party.prototype.getActiveParty = function () {
        return ss_active_party
    };

    Game_Party.prototype.ResetActiveParty = function () {
         let active_party=ss_partygroups?.find(o=>o.id===this.getActiveParty())
         if(active_party) active_party.actors=[]
         $gamePlayer.refresh()
    }


     _ssmultipartyallbattlemembers=Game_Party.prototype.allBattleMembers
    Game_Party.prototype.allBattleMembers = function () {
       let active_party=ss_partygroups?.find(o=>o.id===this.getActiveParty())
       if(active_party) return active_party.actors
       return _ssmultipartyallbattlemembers.call(this)
      
    };


      Game_Party.prototype.entryOrder = function(index) {

        console.log(index)
        /*
        console.log('entra')
        const entryActor = this._actors[index];
        const members = this.formationBattleMember();
        const hiddenNum = this.hiddenBattleMembers().length;
        const isEntry = index >= members.length;
        index += isEntry ? 1 : 0;
        this._actors.splice(members.length + hiddenNum - 1, 0, entryActor);
        this._actors.splice(index, 1);
        if (params.BreakawayBattleMember && isEntry) {
            const actorIndex = this.allBattleMembers().findIndex(actor => actor.isHidden());
            if (actorIndex >= 0) {
                this.withdrawalOrder(actorIndex);
            }
        } 
        */  
    };

})();