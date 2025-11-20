//=============================================================================
// NRP_AutoState.js
//=============================================================================
/*:
 * @target MV MZ
 * @plugindesc v1.02 Automatically adds the state.
 * @orderAfter NRP_StateEX
 * @author Takeshi Sunagawa (https://newrpg.seesaa.net/)
 * @url https://newrpg.seesaa.net/article/500375292.html
 *
 * @help Automatically adds the state.
 * It can be implemented as a trait of a class, equipment, enemy, etc.
 * 
 * It can also be set to always be in state
 * or only added at the start of battle.
 * 
 * -------------------------------------------------------------------
 * [Usage]
 * -------------------------------------------------------------------
 * Specify the following in the notes for
 * actor, class, enemy, skill, equipment, and state.
 * For skills, these are passive skills
 * that function only by being learned.
 * 
 * <AutoState:15>
 * A state with the specified ID is automatically added.
 * 
 * <AutoState:1 + Math.randomInt(10)>
 * Formulas can also be used.
 * The above adds 1 to 10 states at random.
 * Math.randomInt(10) means 0-9.
 * 
 * <AutoState:1,2>
 * Multiple designations are also possible.
 * 
 * <BattleStartState:99>
 * A state with the specified ID is added at the start of battle.
 * Unlike <AutoState>, the effect is interrupted.
 * Numbers and multiple designations can be specified
 * in the same way as <AutoState>.
 * 
 * <BattleStartStateRate:50>
 * You can specify the probability of adding a state.
 * If omitted, the probability is 100%.
 * 
 * -------------------------------------------------------------------
 * [Terms]
 * -------------------------------------------------------------------
 * There are no restrictions.
 * Modification, redistribution freedom, commercial availability,
 * and rights indication are also optional.
 * The author is not responsible,
 * but will deal with defects to the extent possible.
 * 
 * @-----------------------------------------------------
 * @ [Plugin Parameters]
 * @-----------------------------------------------------
 * 
 * @param AutoStateOnlyBattle
 * @type boolean
 * @default false
 * @desc Limit the effect of auto state to during battle.
 * It will no longer be reflected in the status display.
 * 
 * @param ClearStateOnDead
 * @type boolean
 * @default true
 * @desc During dead, the auto state is suspended.
 * State is re-assigned on revival.
 */

/*:ja
 * @target MV MZ
 * @plugindesc v1.02 自動でステートを付加する。
 * @orderAfter NRP_StateEX
 * @author 砂川赳（https://newrpg.seesaa.net/）
 * @url https://newrpg.seesaa.net/article/500375292.html
 *
 * @help 自動的にステートを付加します。
 * 職業や装備、敵キャラなどの特徴として設定できます。
 * 
 * また、常にステートになる設定と、
 * 戦闘開始時のみ付加する設定の二通りが可能です。
 * 
 * -------------------------------------------------------------------
 * ■使用方法
 * -------------------------------------------------------------------
 * アクター、職業、敵キャラ、スキル、装備、ステートのメモ欄に
 * 以下を指定してください。
 * スキルについては、習得しているだけで機能するパッシブスキルとなります。
 * 
 * <AutoState:15>
 * 自動で指定したＩＤのステートが付加されます。
 * 
 * <AutoState:1 + Math.randomInt(10)>
 * 数式も使用できます。
 * 上記はランダムで１～１０のステートを付加します。
 * Math.randomInt(10)は０～９の意味です。
 * 
 * <AutoState:1,2>
 * 複数指定も可能です。
 * 
 * <BattleStartState:99>
 * 戦闘開始時に指定したＩＤのステートが付加されます。
 * <AutoState>とは異なり効果が途切れます。
 * 数式や複数指定も<AutoState>と同様の記述で可能です。
 * 
 * <BattleStartStateRate:50>
 * ステートを付加する確率を指定できます。
 * 省略時は１００％になります。
 * 
 * -------------------------------------------------------------------
 * ■利用規約
 * -------------------------------------------------------------------
 * 特に制約はありません。
 * 改変、再配布自由、商用可、権利表示も任意です。
 * 作者は責任を負いませんが、不具合については可能な範囲で対応します。
 * 
 * @-----------------------------------------------------
 * @ プラグインパラメータ
 * @-----------------------------------------------------
 * 
 * @param AutoStateOnlyBattle
 * @text 自動ステートを戦闘に限定
 * @type boolean
 * @default false
 * @desc 自動ステートの効果を戦闘時に限定します。
 * ステータス表示にも反映されなくなります。
 * 
 * @param ClearStateOnDead
 * @text 戦闘不能時は停止
 * @type boolean
 * @default true
 * @desc 戦闘不能中は自動ステートを停止します。
 * 蘇生時に再びステートが付与されます。
 * 
 */
(function() {
"use strict";

/**
 * ●Converting a structure (double array) to be usable in JS
 */
function parseStruct2(arg) {
    const ret = [];
    if (arg) {
        for (const str of JSON.parse(arg)) {
            ret.push(JSON.parse(str));
        }
    }
    return ret;
}
function toNumber(str, def) {
    if (str == undefined || str == "") {
        return def;
    }
    return isNaN(str) ? def : +(str || def);
}
function toBoolean(str, def) {
    if (str === true || str === "true") {
        return true;
    } else if (str === false || str === "false") {
        return false;
    }
    return def;
}
function setDefault(str, def) {
    if (str == undefined || str == "") {
        return def;
    }
    return str;
}

const PLUGIN_NAME = "NRP_AutoState";
const parameters = PluginManager.parameters(PLUGIN_NAME);
const pAutoStateOnlyBattle = toBoolean(parameters["AutoStateOnlyBattle"], false);
const pClearStateOnDead = toBoolean(parameters["ClearStateOnDead"], true);

/**
 * ●Gets an array based on the arguments.
 */
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

//-----------------------------------------------------------------------------
// Game_BattlerBase
//-----------------------------------------------------------------------------

/**
 * [Unique] Automatic state update
 */
Game_BattlerBase.prototype.updateAutoStates = function() {
    // If the actor and equipment are not loaded, an error will occur and the process will not be performed.
    if (this.equips && !this._equips) {
        return;
    }

    // Disabled when unable to fight.
    if (pClearStateOnDead) {
        if (this.isDead() || this.hp === 0) {
            return;
        }
    }

    // Variable initialization
    if (!this._autoStateIds) {
        this._autoStateIds = [];
    }
    
    // Get Objects with Features
    let traitObjects = this.traitObjects();

    // If the skill is active, it will be linked as a passive skill.
    // *Usually only actors
    if (this.skills) {
        traitObjects = traitObjects.concat(this.skills());
    }

    // Array for state checks
    const autoStateIds = [];

    // for eval
    const a = this;

    // Loop through each object
    for (const object of traitObjects) {
        // If invalid, exit
        if (object == null || !object.meta.AutoState) {
            continue;
        }
        
        // If the target state exists
        const equipStates = makeArray(object.meta.AutoState);
        for (let stateId of equipStates) {
            // Convert to numeric value as it is in string format
            stateId = eval(stateId);
            autoStateIds.push(stateId);

            // Add if state is valid
            // *Do not use addState to avoid circular references.
            if (this.isStateAddable(stateId)) {
                if (!this.isStateAffected(stateId)) {
                    this.addNewState(stateId);
                }
                this.resetStateCounts(stateId);
            }
        }
    }

    // Check previous auto state
    for (const stateId of this._autoStateIds) {
        // If released, remove state
        if (!autoStateIds.includes(stateId)) {
            this.eraseState(stateId);
        }
    }

    this._autoStateIds = autoStateIds;
};

/**
 * ●Clearing the State
 */
const _Game_BattlerBase_clearStates = Game_BattlerBase.prototype.clearStates;
Game_BattlerBase.prototype.clearStates = function() {
    _Game_BattlerBase_clearStates.apply(this, arguments);

    // Disabled outside of combat
    if (pAutoStateOnlyBattle && !$gameParty.inBattle()) {
        return;
    }

    // Automatic State Updates
    this.updateAutoStates();
};

//-----------------------------------------------------------------------------
// Game_Battler
//-----------------------------------------------------------------------------

/**
 * ●Refresh
 */
const _Game_Battler_refresh = Game_Battler.prototype.refresh;
Game_Battler.prototype.refresh = function() {
    _Game_Battler_refresh.apply(this, arguments);

    // Disabled outside of combat
    if (pAutoStateOnlyBattle && !$gameParty.inBattle()) {
        return;
    }

    // Automatic State Updates
    this.updateAutoStates();
};

/**
 * ●Battle begins
 */
const _Game_Battler_onBattleStart = Game_Battler.prototype.onBattleStart;
Game_Battler.prototype.onBattleStart = function(advantageous) {
    //for eval
    const a = this;

    // Object that references the memo field
    let objects = this.traitObjects();
    // Add if skill is enabled (assuming actor)
    if (this.skills) {
        objects = objects.concat(this.skills());
    }

    // Loop through each object
    for (const object of objects) {
        const battleStartState = object.meta.BattleStartState;
        if (!battleStartState) {
            continue;
        }

        // If a probability is specified, calculate the probability
        const rate = object.meta.BattleStartStateRate;
        // Math.randomInt(100) is a random value between 0 and 99
        if (rate && rate <= Math.randomInt(100)) {
            // unexploded
            continue;
        }

        // Array conversion if state is specified
        const battleStartStatesArray = makeArray(battleStartState);
        // Add if state is specified
        for (const stateId of battleStartStatesArray) {
            this.addState(eval(stateId));
        }
    }

    // Disabled outside of combat
    if (pAutoStateOnlyBattle) {
        // Update the automatic state at this time
        this.updateAutoStates();
    }
    
    _Game_Battler_onBattleStart.apply(this, arguments);
};

})();
