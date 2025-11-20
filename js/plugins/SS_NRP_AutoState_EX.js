//=============================================================================
// RPG Maker MZ - Custom Formulas
//=============================================================================

/*:
 * @target MZ
 * @plugindesc An extention to NRP_AutoState
 * @author Squall_seawave
 * @version 1.0
 * @base NRP_AutoState
 * @help
 * It is plug and play
 * tags are <SS_state_cond>condition here</SS_state_cond>
 */

 


(() => {
 
	 //const params = PluginManager.parameters("SS_NRP_AutoState_EX");
    if (!Game_BattlerBase.prototype.updateAutoStates) {
        console.warn("NRP_AutoState not installed — extension disabled.");
        return;
    } 
     
 
  const _updateAutoStates = Game_BattlerBase.prototype.updateAutoStates;
 

 
 
 Game_BattlerBase.prototype.updateAutoStates = function() {
    _updateAutoStates.apply(this, arguments);
	let autoStateIds = (this._autoStateIds||[])
	for (let stateId of autoStateIds) {
		const  note = $dataStates[stateId]?.note ?? "";
		const regex = /<SS_state_cond>([\s\S]*?)<\/SS_state_cond>/i;
		const match = note.match(regex);
		cond=match ? match[1].trim() : "";
		
	}
	
};

 
	
 
})();