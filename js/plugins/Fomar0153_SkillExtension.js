//=============================================================================
// RPG Maker MZ - Skill Extension
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Extends Skills providing more options.
 * @author Fomar0153
 *
 * @param Cooldown Text Colour
 * @type integer
 * @desc Enter a number that refers to the colour on the windoskin that you would like.
 * @default 15
 *
 * @param Cooldown Abbreviation
 * @type string
 * @desc This will be displayed when a skill is on cooldown.
 * @default CD
 *
 * @help Fomar0153_SkillExtension.js
 * This plugin implements a series of notetags allowing you to customise skills.
 *
 * Notetags:
 * <usable-rep: condition>
 * This replaces the usable requirements with your condition, MP requirements etc
 * will not need to be met in order for the skill to be usable.
 * <usable-add: condition>
 * This adds your condition to the usable requirements, MP requirements etc
 * will still need to be met in order for the skill to be usable.
 * <payment: code>
 * This code will be executed when MP, TP would be deducted etc.
 *
 * <hpcost: n>
 * Allows you to assign a HP cost to the skill.
 *
 * <preskill: code>
 * This code runs just before the skill is used.
 *
 * <damage: code>
 * This code runs during the damage calculation, value is a variable that holds
 * the damage value.
 *
 * <postskill: code>
 * This code runs just after the skill is used.
 *
 * <cooldown: n>
 * This makes the skill have a cooldown between uses.
 *
 * <limited: n>
 * The skill is only usable n times between the recover all event being called.
 * <limitedbattle>
 * Will make the skill only have limited uses per battle as opposed to the
 * recover all event.
 *
 */

var Fomar = Fomar || {};
Fomar.SkillExtension = {};

Fomar.SkillExtension.parameters = PluginManager.parameters('Fomar0153_SkillExtension');

Fomar.SkillExtension.cooldownTextColor = parseInt(Fomar.SkillExtension.parameters["Cooldown Text Colour"]);
Fomar.SkillExtension.cooldownText = Fomar.SkillExtension.parameters["Cooldown Abbreviation"];

(() => {

  Fomar.SkillExtension.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
  DataManager.isDatabaseLoaded = function() {
    if (Fomar.SkillExtension.DataManager_isDatabaseLoaded.call(this)) {
      this.loadSkillExtension();
      return true;
    } else {
      return false;
    }
  };

  DataManager.loadSkillExtension = function() {
    for (var i = 1; i < $dataSkills.length; i++) {
      if ($dataSkills[i].meta["hpcost"]) {
        $dataSkills[i].hpCost = parseInt($dataSkills[i].meta["hpcost"]);
      } else {
        $dataSkills[i].hpCost = 0;
      }
      if ($dataSkills[i].meta["cooldown"]) {
        $dataSkills[i].cooldown = parseInt($dataSkills[i].meta["cooldown"]);
      } else {
        $dataSkills[i].cooldown = 0;
      }
      if ($dataSkills[i].meta["limited"]) {
        $dataSkills[i].limited = parseInt($dataSkills[i].meta["limited"]);
        if ($dataSkills[i].meta["limitedbattle"]) {
          $dataSkills[i].limitedType = 1;
        } else {
          $dataSkills[i].limitedType = 0;
        }
      } else {
        $dataSkills[i].limited = 0;
      }
    }
  };

  Fomar.SkillExtension.Game_BattlerBase_meetsSkillConditions = Game_BattlerBase.prototype.meetsSkillConditions;
  Game_BattlerBase.prototype.meetsSkillConditions = function(skill) {
    if (skill.meta["usable-rep"]) {
      return eval(skill.meta["usable-rep"]);
    } else {
      this._cooldowns[skill.id] = this._cooldowns[skill.id] || 0;
      this._limitedSkills[skill.id] = this._limitedSkills[skill.id] || 0;
      return Fomar.SkillExtension.Game_BattlerBase_meetsSkillConditions.call(this, skill) && ((skill.meta["usable-add"] == null || eval(skill.meta["usable-add"])) &&
        ((skill.cooldown == 0 || this._cooldowns[skill.id] == 0) && (skill.limited == 0 || this._limitedSkills[skill.id] < skill.limited)));
    }
  };

  Fomar.SkillExtension.Game_BattlerBase_canPaySkillCost = Game_BattlerBase.prototype.canPaySkillCost;
  Game_BattlerBase.prototype.canPaySkillCost = function(skill) {
    if (this._hp <= skill.hpCost) {
      return false;
    }
    return Fomar.SkillExtension.Game_BattlerBase_canPaySkillCost.call(this, skill);
  };

  Game_BattlerBase.prototype.skillHpCost = function(skill) {
    return skill.hpCost;
  };

  Fomar.SkillExtension.Game_BattlerBase_paySkillCost = Game_BattlerBase.prototype.paySkillCost;
  Game_BattlerBase.prototype.paySkillCost = function(skill) {
    this._hp -= this.skillHpCost(skill);
    if (skill.meta["payment"]) {
      eval(skill.meta["payment"]);
    }
    if (skill.cooldown > 0 && $gameParty.inBattle()) {
      this._cooldowns[skill.id] = skill.cooldown + 1;
    }
    if (skill.limited > 0) {
      this._limitedSkills[skill.id] += 1;
    }
    Fomar.SkillExtension.Game_BattlerBase_paySkillCost.call(this, skill);
  };

  Fomar.SkillExtension.Game_BattlerBase_recoverAll = Game_BattlerBase.prototype.recoverAll;
  Game_BattlerBase.prototype.recoverAll = function() {
    Fomar.SkillExtension.Game_BattlerBase_recoverAll.call(this);
    this._cooldowns = {};
    this._limitedSkills = {};
  };

  Fomar.SkillExtension.Game_Battler_initMembers = Game_Battler.prototype.initMembers;
  Game_Battler.prototype.initMembers = function() {
    Fomar.SkillExtension.Game_Battler_initMembers.call(this);
    this._cooldowns = {};
    this._limitedSkills = {};
  };

  Fomar.SkillExtension.Game_Battler_onTurnEnd = Game_Battler.prototype.onTurnEnd;
  Game_Battler.prototype.onTurnEnd = function() {
    Fomar.SkillExtension.Game_Battler_onTurnEnd.call(this);
    for (var id in this._cooldowns) {
      this._cooldowns[id] -= 1;
      if (this._cooldowns[id] < 0) {
        this._cooldowns[id] = 0;
      }
    }
  };

  Fomar.SkillExtension.Game_Battler_onBattleEnd = Game_Battler.prototype.onBattleEnd;
  Game_Battler.prototype.onBattleEnd = function() {
    Fomar.SkillExtension.Game_Battler_onBattleEnd.call(this);
    for (var id in this._cooldowns) {
      this._cooldowns[id] = 0;
    }
    for (var id in this._limitedSkills) {
      if ($dataSkills[id].limitedType == 1) {
        this._limitedSkills[id] = 0;
      }
    }
  };

  Fomar.SkillExtension.Game_Action_makeDamageValue = Game_Action.prototype.makeDamageValue;
  Game_Action.prototype.makeDamageValue = function(target, critical) {
    const item = this.item();
    var value = Fomar.SkillExtension.Game_Action_makeDamageValue.call(this, target, critical);
    if (DataManager.isSkill(item) && item.meta["damage"]) {
      eval(item.meta["damage"]);
      value = Math.round(value);
    }
    return value;
  };

  ColorManager.skillHpCost = function() {
    return this.textColor(21);
  };

  ColorManager.skillCooldown = function() {
    return this.textColor(Fomar.SkillExtension.cooldownTextColor);
  };

  Fomar.SkillExtension.Window_SkillList_drawItem = Window_SkillList.prototype.drawItem;
  Window_SkillList.prototype.drawItem = function(index) {
    const skill = this.itemAt(index);
    if (skill) {
      if (skill.limited > 0) {
        const skillName = skill.name;
        this._actor._limitedSkills[skill.id] = this._actor._limitedSkills[skill.id] || 0;
        skill.name = skill.name + " " + (skill.limited - this._actor._limitedSkills[skill.id]) + "/" + skill.limited;
        Fomar.SkillExtension.Window_SkillList_drawItem.call(this, index);
        skill.name = skillName;
      } else {
        Fomar.SkillExtension.Window_SkillList_drawItem.call(this, index);
      }
    }
  };

  Fomar.SkillExtension.Window_SkillList_drawSkillCost = Window_SkillList.prototype.drawSkillCost;
  Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {
    if (this._actor._cooldowns[skill.id] && this._actor._cooldowns[skill.id] > 0) {
      this.changeTextColor(ColorManager.skillCooldown());
      this.drawText(this._actor._cooldowns[skill.id] + Fomar.SkillExtension.cooldownText, x, y, width, "right");
    } else if (this._actor.skillHpCost(skill) > 0) {
      this.changeTextColor(ColorManager.skillHpCost());
      this.drawText(this._actor.skillHpCost(skill), x, y, width, "right");
    } else {
      Fomar.SkillExtension.Window_SkillList_drawSkillCost.call(this, skill, x, y, width);
    }
  };

  Fomar.SkillExtension.BattleManager_startAction = BattleManager.startAction;
  BattleManager.startAction = function() {
    if (DataManager.isSkill(this._subject.currentAction().item()) && this._subject.currentAction().item().meta["preskill"]) {
      eval(this._subject.currentAction().item().meta["preskill"]);
    }
    Fomar.SkillExtension.BattleManager_startAction.call(this);
    if (DataManager.isSkill(this._subject.currentAction().item()) && this._subject.currentAction().item().meta["postskill"]) {
      eval(this._subject.currentAction().item().meta["postskill"]);
    }
  };

  Fomar.SkillExtension.Scene_ItemBase_useItem = Scene_ItemBase.prototype.useItem;
  Scene_ItemBase.prototype.useItem = function() {
    if (DataManager.isSkill(this.item()) && this.item().meta["preskill"]) {
      eval(this.item().meta["preskill"]);
    }
    Fomar.SkillExtension.Scene_ItemBase_useItem.call(this);
    if (DataManager.isSkill(this.item()) && this.item().meta["postskill"]) {
      eval(this.item().meta["postskill"]);
    }
  };

})();
