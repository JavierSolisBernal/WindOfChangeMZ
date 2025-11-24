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
 * State Notetags:
 * 
 * <SS_state_cond>condition javascript here</SS_state_cond>
 * It must be resolve into a true false statement, if no valid it defaults to false
 * 
 * <SS_StatAbove: Stat1|x, Stat2|x>  
 * <SS_StatBelow: Stat1|x, Stat2|x>  
 * Replace 'StatN' with 'HP', 'MP', 'TP', 'MAXHP', 'MAXMP', 'ATK', 'DEF',  'MAT', 'MDF', 'AGI', 'LUK'. 
 * If the above stat is above/below x, then the  condition is met for the passive state to appear.
 * Add a % to make it compare with HP, MP, TP against the MAXHP, MAXMP, MAXTP in porcentual it is removed in the other stats
 * Add a third parameter |true if want to include the equal
 
 * <SS_SwitchOn: 1,2,5>
 * The id of the switches that must be on to active for the passive state to appear, all swiches must be active to activate the state
 * <SS_SwitchOff: 1,2,5>
 * The id of the switches that must be on to active for the passive state to appear, all swiches must be inactive to activate the state
 * <SS_VarAbove: 1|20|true, 2|10>
 * Check if the variable is above a value
 * Format is Var id|Value|flag where flag tells if the variable is also equal it is an optional parameter if empty the function is not equal
 * all conditions must be true to activate the state
 * <SS_VarBelow: 1|20|true, 2|10>
 * Check if the variable is below a value
 * Format is Var id|Value|flag where flag tells if the variable is also equal it is an optional parameter if empty the function is not equal
 * all the conditions must be true to activate the state
 * 
 * <SS_OnMap: 1,2,5>
 * The id of the map witch the state will be active
 * 
 */




(() => {

    //CHECK IF THE PLUGIN IS INSTALLED
    if (!Game_BattlerBase.prototype.updateAutoStates) {
        console.warn("NRP_AutoState not installed — extension disabled.");
        return;
    }

    const SS_autostates = {};
    SS_autostates.list = new Set()
    SS_autostates.list_cond = {}
    SS_autostates.loaded = false

    //PROCESS THE NOTES OF STATES INITIALIZED
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

        SS_autostates.list = [...result]
        SS_autostates.list.forEach((id) => {

            processStateNote(id)
        })
    }

    //PROCESS THE NOTES IN STATES
    function processStateNote(id) {
        SS_autostates.list_cond[id] = SS_autostates.list_cond[id] || {}
        SS_autostates.list_cond[id].switchesOn = SS_autostates.list_cond[id].switchesOn || new Set()
        SS_autostates.list_cond[id].switchesOff = SS_autostates.list_cond[id].switchesOff || new Set()
        SS_autostates.list_cond[id].varAbove = SS_autostates.list_cond[id].varAbove || new Set()
        SS_autostates.list_cond[id].varBelow = SS_autostates.list_cond[id].varBelow || new Set()
        SS_autostates.list_cond[id].statAbove = SS_autostates.list_cond[id].statAbove || new Set()
        SS_autostates.list_cond[id].statBelow = SS_autostates.list_cond[id].statBelow || new Set()
        SS_autostates.list_cond[id].onMap = SS_autostates.list_cond[id].onMap || new Set()

        let maptest = $dataStates[id].meta.SS_OnMap || ""
        maptest = makeArray(maptest)
        maptest = maptest || []

        maptest.forEach((v) => {
            Number(v)
            if (!isNaN(v)) SS_autostates.list_cond[id].onMap.add(v)
        })
        SS_autostates.list_cond[id].onMap = [...SS_autostates.list_cond[id].onMap]
        let switchtest = $dataStates[id].meta.SS_SwitchOn || ""
        switchtest = makeArray(switchtest)
        switchtest = switchtest || []

        switchtest.forEach((v) => {
            Number(v)
            if (!isNaN(v)) SS_autostates.list_cond[id].switchesOn.add(v)
        })
        SS_autostates.list_cond[id].switchesOn = [...SS_autostates.list_cond[id].switchesOn]


        switchtest = $dataStates[id].meta.SS_SwitchOff || ""
        switchtest = makeArray(switchtest)
        switchtest = switchtest || []

        switchtest.forEach((v) => {
            Number(v)
            if (!isNaN(v)) SS_autostates.list_cond[id].switchesOff.add(v)
        })
        SS_autostates.list_cond[id].switchesOff = [...SS_autostates.list_cond[id].switchesOff]

        let vartest = $dataStates[id].meta.SS_VarAbove || ""
        vartest = makeArray(vartest)
        vartest = vartest || []

        vartest.forEach((v) => {
            SS_autostates.list_cond[id].varAbove.add(v)
        })
        SS_autostates.list_cond[id].varAbove = [...SS_autostates.list_cond[id].varAbove]

        vartest = $dataStates[id].meta.SS_VarBelow || ""
        vartest = makeArray(vartest)
        vartest = vartest || []

        vartest.forEach((v) => {
            SS_autostates.list_cond[id].varBelow.add(v)
        })
        SS_autostates.list_cond[id].varBelow = [...SS_autostates.list_cond[id].varBelow]



        let stattest = $dataStates[id].meta.SS_StatAbove || ""
        stattest = makeArray(stattest)
        stattest = stattest || []

        stattest.forEach((v) => {
            SS_autostates.list_cond[id].statAbove.add(v)
        })
        SS_autostates.list_cond[id].statAbove = [...SS_autostates.list_cond[id].statAbove]

        stattest = $dataStates[id].meta.SS_StatBelow || ""
        stattest = makeArray(stattest)
        stattest = stattest || []

        stattest.forEach((v) => {
            SS_autostates.list_cond[id].statBelow.add(v)
        })
        SS_autostates.list_cond[id].statBelow = [...SS_autostates.list_cond[id].statBelow]


        const note = $dataStates[id]?.note || ""; // the full notebox string
        const match = note.match(/<SS_state_cond>([\s\S]*?)<\/SS_state_cond>/i);
        SS_autostates.list_cond[id].custom = match ? match[1].trim() : "";
        /*
       try{
       result=eval(`${SS_autostates.list_cond[id].custom}`);
           }
       catch(e){
       result=false;
       }
       */
    }
    //MAKE AN ARRAY OF PASSIVE STATES
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

    //PROCESS THE CONDITIONS OF PASSIVE STATES
    function processConditions(obj, actor = null) {
        //GATHER THE STATS OF THE ACTOR
        const stats = {
            HP: actor?.hp || 0,
            MAXHP: actor?.mhp || 0,
            MP: actor?.mp || 0,
            MAXMP: actor?.mmp || 0,
            TP: actor?.tp || 0,
            MAXTP: actor ? 100 : 0,  // default RPG Maker MZ max TP
            ATK: actor?.param(2) || 0,
            DEF: actor?.param(3) || 0,
            MAT: actor?.param(4) || 0,
            MDF: actor?.param(5) || 0,
            AGI: actor?.param(6) || 0,
            LUK: actor?.param(7) || 0
        };




        //IF ALL SWITCHES ARE ON
        if (obj.switchesOn) {
            const allOn = (obj.switchesOn || []).every(id => $gameSwitches.value(Number(id)));
            if (!allOn) return false
        }
        //IF ALL SWITCHES ARE OFF
        if (obj.switchesOff) {
            const allOff = (obj.switchesOff || []).every(id => !$gameSwitches.value(Number(id)));
            if (!allOff) return false
        }

        //IF THE VARIABLE IS ABOVE
        if (obj.varAbove) {
            let allTrue = (obj.varAbove || []).map((test) => {
                let cond = test.split("|");
                return cond[3] === 'true' ? $gameVariables.value(Number(cond[0])) >= cond[1] : $gameVariables.value(Number(cond[0])) > cond[1]
            }
            );
            allTrue = allTrue.every(id => id);
            if (!allTrue) return false
        }

        //IF THE VARIABLE IS BELOW
        if (obj.varBelow) {
            let allTrue = (obj.varBelow || []).map((test) => {
                let cond = test.split("|");
                return cond[3] === 'true' ? $gameVariables.value(Number(cond[0])) <= cond[1] : $gameVariables.value(Number(cond[0])) < cond[1]
            }
            );
            allTrue = allTrue.every(id => id);
            if (!allTrue) return false
        }
        //IF THE STAT IS ABOVE
        if (obj.statAbove) {
            let allTrue = (obj.statAbove || []).map((test) => {
                let cond = test.split("|");
                if (cond.length < 2) return true
                if ((cond[0] == "HP" || cond[0] == "MP" || cond[0] == "TP") && (cond[1] || "").includes("%")) {
                    if (cond[0] == "HP") cond[1] = parseInt(parseFloat(cond[1] || 0) * stats["MAXHP"] / 100)
                    if (cond[0] == "MP") cond[1] = parseInt(parseFloat(cond[1] || 0) * stats["MAXMP"] / 100)
                    if (cond[0] == "TP") cond[1] = parseInt(parseFloat(cond[1] || 0) * stats["MAXTP"] / 100)
                }
                console.log(cond[0] + "valor" + cond[1])
                return cond[3] === 'true' ? stats[cond[0]] >= parseInt(cond[1]) : stats[cond[0]] > parseInt(cond[1])
            });
            allTrue = allTrue.every(id => id);
            if (!allTrue) return false
        }

        //IF THE STAT IS ABOVE
        if (obj.statBelow) {
            let allTrue = (obj.statBelow || []).map((test) => {
                let cond = test.split("|");
                if (cond.length < 2) return true
                if ((cond[0] == "HP" || cond[0] == "MP" || cond[0] == "TP") && (cond[1] || "").includes("%")) {
                    if (cond[0] == "HP") cond[1] = parseInt(parseFloat(cond[1] || 0) * stats["MAXHP"] / 100)
                    if (cond[0] == "MP") cond[1] = parseInt(parseFloat(cond[1] || 0) * stats["MAXMP"] / 100)
                    if (cond[0] == "TP") cond[1] = parseInt(parseFloat(cond[1] || 0) * stats["MAXTP"] / 100)
                }
                return cond[3] === 'true' ? stats[cond[0]] <= parseInt(cond[1]) : stats[cond[0]] < parseInt(cond[1])
            });
            allTrue = allTrue.every(id => id);
            if (!allTrue) return false
        }

        if (obj.custom) {
            let result = true
            try {
                result = eval(`${obj.custom}`);
            }
            catch (e) {
                result = false;
            }

            if (!result) return false
        }

        
        //IF IT IS ON MAP
        if (obj.onMap) {
            let id_map = $gameMap.mapId()
            array_map=[... obj.onMap]
            console.log(array_map)
            
            if(array_map.length>0){
               let allTrue = (obj.onMap || []).map((test) => {
                let id_map = $gameMap.mapId()
                return test == id_map
            }); 
           
             allTrue = allTrue.some(id => id);
             if (!allTrue) return false
            }
            
            
        }
        
     
        return true


    }

    //RELOADING STATES OF ALL ACTORS
    function update_actors() {
        if ($gameParty.inBattle()) {
            // Actors + enemies
            battlers = BattleManager.allBattleMembers();
        } else {
            // All actors only
            battlers = $gameActors._data.filter(a => a);
        }

        for (const b of battlers) {
            b.updateAutoStates()
        }
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




    const _GBB_gainHp = Game_BattlerBase.prototype.gainHp;
    const _GBB_gainMp = Game_BattlerBase.prototype.gainMp;
    const _GBB_gainTp = Game_BattlerBase.prototype.gainTp;

    Game_BattlerBase.prototype.gainHp = function (value) {
        const oldHp = this.hp; // save previous HP
        _GBB_gainHp.call(this, value); // call original method
        const diff = this.hp - oldHp;
        if (diff !== 0) update_actors()
    };


    Game_BattlerBase.prototype.gainMp = function (value) {
        const oldMp = this.mp;
        _GBB_gainMp.call(this, value);
        const diff = this.mp - oldMp;
        if (diff !== 0) update_actors()
    };

    Game_BattlerBase.prototype.gainTp = function (value) {
        const oldTp = this.tp;
        _GBB_gainTp.call(this, value);
        const diff = this.tp - oldTp;
        if (diff !== 0) update_actors()
    };


    const _updateAutoStates = Game_BattlerBase.prototype.updateAutoStates;
    Game_BattlerBase.prototype.updateAutoStates = function () {
        _updateAutoStates.apply(this, arguments);
        //from all the autostates check the conditions and if it is false remove it
        for (const stateId of this._autoStateIds || []) {
            if (!SS_autostates.list_cond[stateId]) processStateNote(stateId)
            let cond = processConditions(SS_autostates.list_cond[stateId], this)
            if (!cond) this.eraseState(stateId);

        }
    };




    const _setSwitchValue = Game_Switches.prototype.setValue;
    Game_Switches.prototype.setValue = function (id, value) {
        _setSwitchValue.call(this, id, value);
        update_actors()
    }

    const _setVarValue = Game_Variables.prototype.setValue;
    Game_Variables.prototype.setValue = function (id, value) {
        _setVarValue.call(this, id, value);
        update_actors()
    }

    const _Game_Party_gainGold = Game_Party.prototype.gainGold;

    Game_Party.prototype.gainGold = function(amount) {
        const oldGold = this._gold;          // store previous gold
        _Game_Party_gainGold.call(this, amount); // call original method
        const diff = this._gold - oldGold;   // calculate change
        if (diff !== 0)  update_actors()
    };

    const _Game_Player_refresh = Game_Player.prototype.refresh;
    Game_Player.prototype.refresh = function () {
        _Game_Player_refresh.call(this);
         update_actors()
    };

    
    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function () {
        _Scene_Map_onMapLoaded.call(this);    
        update_actors()
    };


   

})();