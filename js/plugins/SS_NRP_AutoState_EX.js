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
     
  const SS_autostates = {};
  SS_autostates.list=[]
  SS_autostates.loaded=false
  
  
    function processNotas() {
        const states = makeArray($dataActors.meta.AutoState);
        for (let stateId of statesactors) {
			stateId = Number(stateId)
			if (!isNaN(stateId)) SS_autostates.list.push(stateId)
		}
		console.log(SS_autostates.list)
        // Más objetos según necesites...
    }	
  
  function makeArray(values) {
    const results = [];
    if (!values) {
        return undefined;
    }

    // Comma separated loops
    for (let value of values.split(",")) {
        // white space removal
        value = value.trim();
        // When specifying a range such as 1 to 5
        // *~ exists.
        if (value.indexOf("~") >= 0) {
            const range = value.split("~");
            const rangeStart = eval(range[0]);
            const rangeEnd = eval(range[1]);

            // Execute within a specified range
            // If the start is greater than the end, do the opposite
            if (rangeEnd < rangeStart) {
                for (let i = rangeStart; i >= rangeEnd; i--) {
                    results.push(i);
                }
            } else {
                for (let i = rangeStart; i <= rangeEnd; i++) {
                    results.push(i);
                }
            }
            
        // Normal time
        } else {
            results.push(value);
        }
    }
    return results;
}

  
  
   const _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;

        if (!this.SS_autostates.loaded) {
            processNotas();
		this.SS_autostates.loaded = true;
        }

        return true;
    };
	

  
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