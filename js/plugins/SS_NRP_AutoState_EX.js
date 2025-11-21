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
 * it determines if an autostate is applied
 * tags are <SS_state_cond>condition javascript here</SS_state_cond>
 * it must be resolve into a true false statement, if no valid it defaults to false
 * <SS_StatAbove: Stat1:x, Stat2:x>  
 * <SS_StatBelow: Stat1:x, Stat2:x>  
 * Replace 'StatN' with 'HP', 'MP', 'TP', 'MAXHP', 'MAXMP', 'ATK', 'DEF',  'MAT', 'MDF', 'AGI', 'LUK'. 
 * If the above stat is above/below x, then the  condition is met for the passive state to appear.
 * add a % to make it compare with HP, MP, TP against the MaxHP, MaxMp, MaxTP
 * <SS_SwitchCondOn: 1,2,5>
 * the id of the switches that must be on to active for the passive state to appear
 * <SS_SwitchCondOff: 1,2,5>
 * the id of the switches that must be on to active for the passive state to appear
 * <SS_VarCond id: 1:==:test, 2:>=:20>
 * the comparison to variables format is id:operation:value 
 * valid operations: ==, ===, >, <, >=, <=, !=
 * 
 * 
 */




(() => {

    //const params = PluginManager.parameters("SS_NRP_AutoState_EX");
    if (!Game_BattlerBase.prototype.updateAutoStates) {
        console.warn("NRP_AutoState not installed — extension disabled.");
        return;
    }

    const SS_autostates = {};
    SS_autostates.list = new Set()
    SS_autostates.list_cond = {}
    SS_autostates.loaded = false


    function processNotes() {

        const collections = [
            $dataActors,
            $dataClasses,
            $dataSkills,
            $dataItems,
            $dataWeapons,
            $dataArmors,
            $dataStates
        ];
        const set = new Set();
        let result = new Set();
        for (const collection of collections) {
            if (!collection) continue;   // Skip null entries

            for (const entry of collection) {
                if (entry && entry.meta?.AutoState) {
                    set.add(entry.meta.AutoState)
                }
            }
        }

        for (let row of set) {
            row = makeArray(row)
            row.forEach((v) => {
                Number(v)
                if (!isNaN(v)) result.add(v)
            })
        }

        SS_autostates.list=[...result]
        SS_autostates.list.forEach((id) => {
            SS_autostates.list_cond[id]=SS_autostates.list_cond[id]||{}
            SS_autostates.list_cond[id].switches=SS_autostates.list_cond[id].switches|| new Set()
            SS_autostates.list_cond[id].vars=SS_autostates.list_cond[id].vars|| new Set()

            let switchtest= $dataStates[id].meta.SS_SwitchCondOn || ""
            switchtest=makeArray(switchtest)
            switchtest=switchtest||[]
                     
            switchtest.forEach((v) => {
                Number(v)
                if (!isNaN(v)) SS_autostates.list_cond[id].switchesOn.add(v)
            })
            SS_autostates.list_cond[id].switchesOn=[...SS_autostates.list_cond[id].switchesOn]  

            let vartest= $dataStates[id].meta.SS_VarCond || ""
            vartest=makeArray(vartest)
            vartest=vartest||[]
                     
            vartest.forEach((v) => {
                 SS_autostates.list_cond[id].vars.add(v)
            })
            SS_autostates.list_cond[id].vars=[...SS_autostates.list_cond[id].vars]  



        })
        console.log(SS_autostates.list_cond)
        /*
        const states = makeArray($dataActors.meta.AutoState);
        for (let stateId of statesactors) {
            stateId = Number(stateId)
            if (!isNaN(stateId)) SS_autostates.list.push(stateId)
        }
        console.log(SS_autostates.list)
        // Más objetos según necesites...
        */
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
    DataManager.isDatabaseLoaded = function () {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;

        if (!SS_autostates?.loaded) {
            processNotes();
            SS_autostates.loaded = true;
        }

        return true;
    };



    const _updateAutoStates = Game_BattlerBase.prototype.updateAutoStates;
    Game_BattlerBase.prototype.updateAutoStates = function () {
        _updateAutoStates.apply(this, arguments);
        let autoStateIds = (this._autoStateIds || [])
        for (let stateId of autoStateIds) {
            const note = $dataStates[stateId]?.note ?? "";
            const regex = /<SS_state_cond>([\s\S]*?)<\/SS_state_cond>/i;
            const match = note.match(regex);
            cond = match ? match[1].trim() : "";

        }

    };




})();