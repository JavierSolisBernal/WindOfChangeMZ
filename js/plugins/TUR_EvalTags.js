//=============================================================================
// Eval Notetags
// TUR_EvalTags.js
//=============================================================================

window.Imported = window.Imported || {};
Imported.TUR_EvalTags = true;

window.TUR = window.TUR || {};
TUR.EvalTags = TUR.EvalTags || {};
TUR.EvalTags.version = 2.0;

/*:
 * @plugindesc Insert JavaScript via notetags at a variety of times.
 * @author ATT_Turan
 * @url https://forums.rpgmakerweb.com/index.php?threads/eval-tags-mz.162424/
 * @version 2.0
 * @target MZ
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * The purpose of this plugin is to provide notetags that will execute code at
 * various times when event commands are not available to users.
 *
 * These times include in the flow of a battle, the flow of an action, and the
 * lifespan of a state.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * All notetags provide a "user" variable to refer to the actor/enemy the tag
 * is attached to. Other variables are provided depending on context.
 *
 * All notetags are in the format:
 * <notetag title>
 * code
 * </notetag title>
 *
 * -------------------------------Battle Notetags------------------------------
 *
 * Battle-related notetags occur in the following order:
 *
 * Actor, Enemy, Class, Weapon, Armor, and State notetags
 *
 * <Battle Before Eval>
 * <Battle Start Eval>
 * <Turn Start Eval>
 * <Regenerate Eval>
 * <Turn End Eval>
 * <Escape Failed Eval>
 * <Escape Succeeded Eval>
 * <Defeated Eval>
 * <Victory Eval>
 * <Battle End Eval>
 * <Battle After Eval>
 *
 * ---------------------------------Action Notetags----------------------------
 *
 * The following notetags include a "user" variable for the battler performing
 * the current action, a "target" variable for the target of the action, a 
 * "skill" variable referencing the current action, and a "value" variable 
 * referencing the damage dealt where applicable.
 *
 * They are resolved in the following order:
 *
 * Actor, Enemy, Class, Weapon, Armor, and State notetags
 *
 * <Action Start Eval> - performed by the user; also a Skill notetag
 * <Action Targeted Eval> - performed by the target
 * <Action Hit Eval> - performed by the user on a successful hit
 * <Action Reaction Eval> - performed by the target on a successful hit
 * <Action Apply Eval> - a Skill and Item notetag
 * -- action resolves --
 * <Action Post-Apply Eval> - a Skill and Item notetag
 * <Action Damaged Eval> - performed by the user after successful damage
 * <Action Respond Eval> - performed by the target after successful damage
 * <Action After Eval> - performed by the user whether it hit or not; also a
 * Skill notetag
 * <Action Finish Eval> - performed by the target whether it hit or not
 *
 * ----------------------------------State Notetags----------------------------
 *
 * The following notetags include a "stateId" variable for the ID of the state.
 *
 * State notetags
 *
 * <State Apply Eval> - executed when a state is added to a battler
 * <State End Eval> - executed when a state expires
 * <State Remove Eval> - executed when a state is removed in any way
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 2.0:
 *	- Added a fix for State Remove to trigger when a state is removed by death
 *
 * Version 1.9:
 * - Corrected a few typos that came from cleaning up the global space
 *
 * Version 1.8:
 * - Added Action Apply and Action Post-Apply to Items
 *
 * Version 1.7:
 * - Corrected the skill reference in Action Apply
 *
 * Version 1.6:
 * - Corrected some errors, made code errors feed through to the console
 *
 * Version 1.5:
 * - Corrected logical error with skills dealing 0 damage
 *
 * Version 1.4:
 * - Added "skill" variable to evals taking place during action resolution
 *
 * Version 1.3:
 * - Fixed State Remove Eval to run when state is removed by state resist or death
 *
 * Version 1.2:
 * - Added Action Post-Apply; Action Start and Action After also on Skills now
 * Version 1.1:
 * - Corrected an error when defeated in battle
 *
 * Version 1.0:
 * - Release version
 *
 */
 
 
TUR.EvalTagNotetagsLoaded = false;

TUR.EvalTagisDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() 
{
	if (!TUR.EvalTagisDatabaseLoaded.call(this))
		return false;
	
	if (!TUR.EvalTagNotetagsLoaded)
	{
		this.loadEvalTagNotetags($dataActors);
		this.loadEvalTagNotetags($dataClasses);
		this.loadEvalTagNotetags($dataEnemies);
		this.loadEvalTagNotetags($dataWeapons);
		this.loadEvalTagNotetags($dataArmors);
		this.loadEvalTagNotetags($dataSkills);
		this.loadEvalTagNotetags($dataStates);
		this.loadEvalTagNotetags($dataItems);
		TUR.EvalTagNotetagsLoaded = true;
	}
	return true;
};

DataManager.loadEvalTagNotetags = function (list)
{
	for (let i=1; i<list.length; i++)
	{
		let entry = list[i];
		let notes = entry.note.split(/[\r\n]+/);
		let readMode = "lines", notetag="";
		
		for (let j=0; j<notes.length; j++)
		{
			if (notes[j].match(/<(?:BATTLE BEFORE EVAL)>/i))
			{
				readMode = "code";
				notetag = "battleBeforeEval";
			}
			else if (notes[j].match(/<(?:BATTLE START EVAL)>/i))
			{
				readMode = "code";
				notetag = "battleStartEval";
			}
			else if (notes[j].match(/<(?:TURN START EVAL)>/i))
			{
				readMode = "code";
				notetag = "turnStartEval";
			}
			else if (notes[j].match(/<(?:ACTION START EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionStartEval";
			}
			else if (notes[j].match(/<(?:ACTION TARGETED EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionTargetedEval";
			}
			else if (notes[j].match(/<(?:ACTION HIT EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionHitEval";
			}
			else if (notes[j].match(/<(?:ACTION REACTION EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionReactionEval";
			}
			else if (notes[j].match(/<(?:ACTION APPLY EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionApplyEval";
			}
			else if (notes[j].match(/<(?:ACTION POST-APPLY EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionPostApplyEval";
			}
			else if (notes[j].match(/<(?:ACTION DAMAGED EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionDamagedEval";
			}
			else if (notes[j].match(/<(?:ACTION RESPOND EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionRespondEval";
			}
			else if (notes[j].match(/<(?:ACTION FINISH EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionFinishEval";
			}
			else if (notes[j].match(/<(?:ACTION AFTER EVAL)>/i))
			{
				readMode = "code";
				notetag = "actionAfterEval";
			}
			else if (notes[j].match(/<(?:REGENERATE EVAL)>/i))
			{
				readMode = "code";
				notetag = "regenerateEval";
			}
			else if (notes[j].match(/<(?:TURN END EVAL)>/i))
			{
				readMode = "code";
				notetag = "turnEndEval";
			}
			else if (notes[j].match(/<(?:BATTLE END EVAL)>/i))
			{
				readMode = "code";
				notetag = "battleEndEval";
			}
			else if (notes[j].match(/<(?:VICTORY EVAL)>/i))
			{
				readMode = "code";
				notetag = "victoryEval";
			}
			else if (notes[j].match(/<(?:ESCAPE SUCCEED EVAL)>/i))
			{
				readMode = "code";
				notetag = "escapeSucceedEval";
			}
			else if (notes[j].match(/<(?:ESCAPE FAIL EVAL)>/i))
			{
				readMode = "code";
				notetag = "escapeFailEval";
			}
			else if (notes[j].match(/<(?:DEFEATED EVAL)>/i))
			{
				readMode = "code";
				notetag = "defeatedEval";
			}
			else if (notes[j].match(/<(?:BATTLE AFTER EVAL)>/i))
			{
				readMode = "code";
				notetag = "battleAfterEval";
			}
			else if (notes[j].match(/<(?:STATE APPLY EVAL)>/i))
			{
				readMode = "code";
				notetag = "stateApplyEval";
			}
			else if (notes[j].match(/<(?:STATE REMOVE EVAL)>/i))
			{
				readMode = "code";
				notetag = "stateRemoveEval";
			}
			else if (notes[j].match(/<(?:STATE END EVAL)>/i))
			{
				readMode = "code";
				notetag = "stateEndEval";
			}
			else if (notes[j].substring(0, 2)=="</")
				readMode = "lines";
			else if (readMode == "code")
			{
				entry[notetag] ??= "";
				entry[notetag] += notes[j]+"\n";
			}
		}
	}
};
 
Game_Unit.prototype.checkEvals = function(evalType)
{
	if (!evalType)
		return;
	
	this.aliveMembers().forEach(member => {if (member) member.checkEvals(evalType)});
};

Game_Action.prototype.checkEvals = function(evalType, target, value)
{
	if (!evalType)
		return value;
	
	if (!this.item()[evalType])
		return value;
	
	let user = this.subject(), a = user;
	let b = target;
	let skill = this;
	
	try
	{
		eval(this.item()[evalType]);
	}
	catch (e)
	{
		console.log("Game_Action Eval Tags error from ", evalType, "; ", e.message);
	}
	
	return value;
};

Game_BattlerBase.prototype.checkEvals = function(evalType, target, value, skill)
{
	if (!evalType)
		return value;

	if (this.isActor())
	{
		value = this.checkEquipsEval(evalType, target, value, skill);
		value = this.checkClassEval(evalType, target, value, skill);
		value = this.checkActorEval(evalType, target, value, skill);
	}
	else
		value = this.checkEnemyEval(evalType, target, value, skill);
	
	value = this.checkStateEval(evalType, target, value, skill);
	
	return value;
};
 
Game_Actor.prototype.checkEquipsEval = function(evalType, target, value, skill)
{
	let user = this;
	let b = target;

	if (target)
	{
		if (target == user && SceneManager._scene instanceof Scene_Battle)
			user = BattleManager._subject;
	}
	
	let a = user;
	
	this.equips().forEach(item =>
	{
		if (item && item[evalType])
		{
			try
			{
				eval(item[evalType]);
			}
			catch (e)
			{
				console.log("Equips Eval Tags error from ", evalType, "; ", e.message);
			}
		}
	});
	
	return value;
};

Game_Actor.prototype.checkClassEval = function(evalType, target, value, skill)
{
	let user = this;
	let b = target;

	if (target)
	{
		if (target == user && SceneManager._scene instanceof Scene_Battle)
			user = BattleManager._subject;
	}
	
	let a = user;
	
	if (this.currentClass()[evalType])
	{
		try
		{
			eval(this.currentClass()[evalType]);
		}
		catch (e)
		{
			console.log("Class Eval Tags error from ", evalType, "; ", e.message);
		}
	}
	
	return value;
};

Game_Actor.prototype.checkActorEval = function(evalType, target, value, skill)
{
	let user = this;
	let b = target;

	if (target)
	{
		if (target == user && SceneManager._scene instanceof Scene_Battle)
			user = BattleManager._subject;
	}
	
	let a = user;
	
	if (this.actor()[evalType])
	{
		try
		{
			eval(this.actor()[evalType]);
		}
		catch (e)
		{
			console.log("Actor Eval Tags error from ", evalType, "; ", e.message);
		}
	}
	
	return value;
};

Game_Enemy.prototype.checkEnemyEval = function(evalType, target, value, skill)
{
	let user = this;
	let b = target;

	if (target)
	{
		if (target == user && SceneManager._scene instanceof Scene_Battle)
			user = BattleManager._subject;
	}
	
	let a = user;
	
	if (this.enemy()[evalType])
	{
		try
		{
			eval(this.enemy()[evalType]);
		}
		catch (e)
		{
			console.log("Enemy Eval Tags error from ", evalType, "; ", e.message);
		}
	}
	
	return value;
};

Game_BattlerBase.prototype.checkStateEval = function(evalType, target, value, skill)
{
	let user = this;
	let b = target;

	if (target)
	{
		if (target == user && SceneManager._scene instanceof Scene_Battle)
			user = BattleManager._subject;
	}
	
	let a = user;
	
	this.states().forEach(state =>
	{	
		if (state[evalType])
		{
			try
			{
				eval(state[evalType]);
			}
			catch (e)
			{
				console.log("checkState Eval Tags error from ", evalType, "; ", e.message);
			}
		}
	});
	
	return value;
};

Game_BattlerBase.prototype.oneStateEval = function(evalType, stateId)
{
	let user = this, a = user;
	
	if ($dataStates[stateId][evalType])
	{
		try
		{
			eval($dataStates[stateId][evalType]);
		}
		catch (e)
		{
			console.log("oneState Eval Tags error from ", evalType, "; ", e.message);
		}
	}
};

Game_BattlerBase.prototype.clearStates = function()
{
	if (this._states)
	{
		for (let i = 0; i < this._states.length; i++)
		{
			this.oneStateEval("stateRemoveEval", this._states[i]);
		}
	}
    this._states = [];
    this._stateTurns = {};
};

TUR.EvalTags.battleStart = Scene_Battle.prototype.start;
Scene_Battle.prototype.start = function() 
{
	$gameParty.checkEvals("battleBeforeEval");
	$gameTroop.checkEvals("battleBeforeEval");
	TUR.EvalTags.battleStart.call(this);
	$gameParty.checkEvals("battleStartEval");
	$gameTroop.checkEvals("battleStartEval");
};

TUR.EvalTags.startTurn = BattleManager.startTurn;
BattleManager.startTurn = function() 
{
	TUR.EvalTags.startTurn.call(this);
	$gameParty.checkEvals("turnStartEval");
	$gameTroop.checkEvals("turnStartEval");
};

TUR.EvalTags.regenerateAll = Game_Battler.prototype.regenerateAll;
Game_Battler.prototype.regenerateAll = function()
{
	TUR.EvalTags.regenerateAll.call(this);
	this.checkEvals("regenerateEval");
};

TUR.EvalTags.onTurnEnd = Game_Battler.prototype.onTurnEnd;
Game_Battler.prototype.onTurnEnd = function()
{
	TUR.EvalTags.onTurnEnd.call(this);
	this.checkEvals("turnEndEval");
};

TUR.EvalTags.processVictory = BattleManager.processVictory;
BattleManager.processVictory = function() 
{
	TUR.EvalTags.processVictory.call(this);
	$gameParty.checkEvals("victoryEval");
};

TUR.EvalTags.onEscapeSuccess = BattleManager.onEscapeSuccess;
BattleManager.onEscapeSuccess = function() 
{
	$gameTroop.checkEvals("escapeSucceedEval");
	$gameParty.checkEvals("escapeSucceedEval");
	TUR.EvalTags.onEscapeSuccess.call(this);
};

TUR.EvalTags.onEscapeFailure = BattleManager.onEscapeFailure;
BattleManager.onEscapeFailure = function() 
{
	$gameTroop.checkEvals("escapeFailEval");
	$gameParty.checkEvals("escapeFailEval");
	TUR.EvalTags.onEscapeFailure.call(this);
};

TUR.EvalTags.processDefeat = BattleManager.processDefeat;
BattleManager.processDefeat = function() 
{
	$gameTroop.checkEvals("defeatedEval");
	$gameParty.checkEvals("defeatedEval");
	TUR.EvalTags.processDefeat.call(this);
};

TUR.EvalTags.endBattle = BattleManager.endBattle;
BattleManager.endBattle = function(result) 
{
	$gameParty.checkEvals("battleEndEval");
	TUR.EvalTags.endBattle.call(this, result);
};
 
TUR.EvalTags.updateBattleEnd = BattleManager.updateBattleEnd;
BattleManager.updateBattleEnd = function()
{
	TUR.EvalTags.updateBattleEnd.call(this);
	$gameParty.checkEvals("battleAfterEval");
};

TUR.EvalTags.startAction = BattleManager.startAction;
BattleManager.startAction = function()
{
	TUR.EvalTags.startAction.call(this);
	this._subject.checkEvals("actionStartEval", this._targets[0]);
	this._subject.currentAction().checkEvals("actionStartEval", this._targets[0]);
};

TUR.EvalTags.invokeNormalAction = BattleManager.invokeNormalAction;
BattleManager.invokeNormalAction = function(subject, target)
{
	target.checkEvals("actionTargetedEval", target);
	TUR.EvalTags.invokeNormalAction.call(this, subject, target);
};

Game_Action.prototype.apply = function(target) 
{
    const result = target.result();
    this.subject().clearResult();
    result.clear();
    result.used = this.testApply(target);
    result.missed = result.used && Math.random() >= this.itemHit(target);
    result.evaded = !result.missed && Math.random() < this.itemEva(target);
    result.physical = this.isPhysical();
    result.drain = this.isDrain();
    if (result.isHit()) 
	{
        if (this.item().damage.type > 0) 
		{
            result.critical = Math.random() < this.itemCri(target);
            let value = this.makeDamageValue(target, result.critical);
			value = this.subject().checkEvals("actionHitEval", target, value, this);
			value = target.checkEvals("actionReactionEval", target, value, this);
			value = this.checkEvals("actionApplyEval", target, value);
            this.executeDamage(target, value);
			value = this.checkEvals("actionPostApplyEval", target, value);
			this.subject().checkEvals("actionDamagedEval", target, value, this);
			target.checkEvals("actionRespondEval", target, value, this);
        }
        for (const effect of this.item().effects) 
            this.applyItemEffect(target, effect);
		
        this.applyItemUserEffect(target);
    }
    this.updateLastTarget(target);
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push("pushBaseLine");
    if (Math.random() < this._action.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
	subject.checkEvals("actionAfterEval", target);
	target.checkEvals("actionFinishEval", target);
	this._action.checkEvals("actionAfterEval", target);
    subject.setLastTarget(target);
    this._logWindow.push("popBaseLine");
};

TUR.EvalTags.addState = Game_Battler.prototype.addState;
Game_Battler.prototype.addState = function(stateId)
{
	TUR.EvalTags.addState.call(this, stateId);
	this.oneStateEval("stateApplyEval", stateId);
};

TUR.EvalTags.eraseState = Game_BattlerBase.prototype.eraseState;
Game_BattlerBase.prototype.eraseState = function(stateId)
{
	TUR.EvalTags.eraseState.call(this, stateId);
	this.oneStateEval("stateRemoveEval", stateId);
};

Game_Battler.prototype.removeStatesAuto = function(timing) 
{
    for (const state of this.states()) 
	{
        if (this.isStateExpired(state.id) && state.autoRemovalTiming === timing) 
		{
			this.oneStateEval("stateEndEval", state.id);
            this.removeState(state.id);
        }
    }
};