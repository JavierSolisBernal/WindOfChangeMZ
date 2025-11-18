//=============================================================================
// RPG Maker MZ - Passive Skill System - Version 1.4
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Implements a passive skill system.
 * @author Fomar0153
 *
 * @param Passive Skill Type Id
 * @type integer
 * @desc Enter a number that refers to the skill type id from the database (Types Tab).
 * @default 3
 *
 * @param Add Passive Skill Type in Skill Menu
 * @type boolean
 * @desc Add the passive skill set to everyone in your party when outside of battles.
 * @default true
 *
 * @param Passive Skill Max Points Formula
 * @type string
 * @desc Enter what formula you would like to use to determine max passive skill points.
 * @default this._level
 *
 * @param Passive Points Display Name
 * @type string
 * @desc Enter a label for the number of Passive Points you have.
 * @default PP
 *
 * @param Passive Skill Gauge Colour 1
 * @type integer
 * @desc Enter the colour you would like to use for the passive points gauge.
 * @default 28
 *
 * @param Passive Skill Gauge Colour 2
 * @type integer
 * @desc Enter the colour you would like to use for the passive points gauge.
 * @default 29
 *
 * @param PP Bar X Offset
 * @type integer
 * @desc By default the PP Bar will appear where TP would if it is visible. If you are using TP I recommend using -.
 * @default 0
 *
 * @param PP Bar Y Offset
 * @type integer
 * @desc By default the PP Bar will appear where TP would if it is visible. If you are using TP I recommend using 0.
 * @default 0
 *
 * @param Passive Skill On Icon Index
 * @type integer
 * @desc If you want to use the skill's original icon then set this to -1.
 * @default 160
 *
 * @param Passive Skill Off Icon Index
 * @type integer
 * @desc If you want to use the skill's original icon then set this to -1.
 * @default 16
 *
 * @help Fomar0153_PassiveSkills.js
 *
 * This plugin implements a passive skill system.
 * Passive skills should be of the skill type you set in the options.
 * Passive skills should add a state with the traits you want the passive skill to have.
 * The maximum number of passive skills you can equip is based on a formula you can edit.
 * A passive skill's mp cost is used to determine how many points it takes to equip.
 *
 * Version 1.0 -> 1.1
 * Fixed a bug where all non-PP bars, always displayed the max value.
 * Fixed a bug where the PP bars would show up in battle.
 *
 * Version 1.1 -> 1.2
 * Fixed a bug that could cause a crash if you attempted to activate a passive skill when you don't have any.
 * Fixed a display bug where the PP cost of passive skills could be displayed incorrectly when MP cost rate wasn't 1.
 *
 * Version 1.2 -> 1.3
 * Fixed another bug that prevented any non-passive skill from being used.
 *
 * Version 1.3 -> 1.4
 * Increased compatibility with menu plugins and skill learning plugins.
 */

var Fomar = Fomar || {};
Fomar.PassiveSkills = {};

Fomar.PassiveSkills.parameters = PluginManager.parameters('Fomar0153_PassiveSkills');

Fomar.PassiveSkills.passiveSkillTypeId = parseInt(Fomar.PassiveSkills.parameters["Passive Skill Type Id"]);
Fomar.PassiveSkills.addPassiveSkillSet = (Fomar.PassiveSkills.parameters["Add Passive Skill Type in Skill Menu"] == "true");
Fomar.PassiveSkills.maxPP = Fomar.PassiveSkills.parameters["Passive Skill Max Points Formula"] || "0";
Fomar.PassiveSkills.PP = Fomar.PassiveSkills.parameters["Passive Points Display Name"] || "PP";
Fomar.PassiveSkills.passiveGuageColor1 = parseInt(Fomar.PassiveSkills.parameters["Passive Skill Gauge Colour 1"]);
Fomar.PassiveSkills.passiveGuageColor2 = parseInt(Fomar.PassiveSkills.parameters["Passive Skill Gauge Colour 2"]);
Fomar.PassiveSkills.PPBarOffsetX = parseInt(Fomar.PassiveSkills.parameters["PP Bar X Offset"] || 0);
Fomar.PassiveSkills.PPBarOffsetY = parseInt(Fomar.PassiveSkills.parameters["PP Bar Y Offset"] || 0);
Fomar.PassiveSkills.passiveSkillOnIconIndex = parseInt(Fomar.PassiveSkills.parameters["Passive Skill On Icon Index"] || -1);
Fomar.PassiveSkills.passiveSkillOffIconIndex = parseInt(Fomar.PassiveSkills.parameters["Passive Skill Off Icon Index"] || -1);

(() => {

  Fomar.PassiveSkills.Game_Actor_initMembers = Game_Actor.prototype.initMembers;
  Game_Actor.prototype.initMembers = function() {
    Fomar.PassiveSkills.Game_Actor_initMembers.call(this);
    this._passiveSkills = [];
  };

  Fomar.PassiveSkills.Game_Actor_traitObjects = Game_Actor.prototype.traitObjects;
  Game_Actor.prototype.traitObjects = function() {
    const objects = Fomar.PassiveSkills.Game_Actor_traitObjects.call(this);
    for (var i = 0; i < this._passiveSkills.length; i++) {
      var skill = $dataSkills[this._passiveSkills[i]];
      skill.effects.forEach((trait) => {
        if (trait.code == 21) {
          objects.push($dataStates[trait.dataId]);
        }
      });
    }
    return objects;
  };

  Fomar.PassiveSkills.Game_Actor_skillTypes = Game_Actor.prototype.skillTypes;
  Game_Actor.prototype.skillTypes = function() {
    const skillTypes = Fomar.PassiveSkills.Game_Actor_skillTypes.call(this);
    if (!$gameParty.inBattle()) {
      if (Fomar.PassiveSkills.addPassiveSkillSet) {
        skillTypes.push(Fomar.PassiveSkills.passiveSkillTypeId);
      }
    } else {
      skillTypes.remove(Fomar.PassiveSkills.passiveSkillTypeId);
    }
    return skillTypes;
  };

  Game_Actor.prototype.currentPP = function() {
    return this.maxPP() - this._passiveSkills.reduce((pp, id) => pp + $dataSkills[id].mpCost, 0);
  }

  Game_Actor.prototype.maxPP = function() {
    return eval(Fomar.PassiveSkills.maxPP);
  }

  Fomar.PassiveSkills.Game_Actor_refresh = Game_Actor.prototype.refresh;
  Game_Actor.prototype.refresh = function() {
    var p = [];
    for (var i = 0; i < this._passiveSkills.length; i++) {
      if (this.hasSkill(this._passiveSkills[i])){
        p.push(this._passiveSkills[i]);
      }
    }
    this._passiveSkills = p;
    Fomar.PassiveSkills.Game_Actor_refresh.call(this);
  };

  Fomar.PassiveSkills.Game_BattlerBase_skillMpCost = Game_BattlerBase.prototype.skillMpCost;
  Game_BattlerBase.prototype.skillMpCost = function(skill) {
    if (skill && skill.stypeId == Fomar.PassiveSkills.passiveSkillTypeId) {
      return skill.mpCost;
    } else {
      return Fomar.PassiveSkills.Game_BattlerBase_skillMpCost.call(this, skill);
    }
  };

  Fomar.PassiveSkills.Window_StatusBase_placeBasicGauges = Window_StatusBase.prototype.placeBasicGauges;
  Window_StatusBase.prototype.placeBasicGauges = function(actor, x, y) {
    Fomar.PassiveSkills.Window_StatusBase_placeBasicGauges.call(this, actor, x, y);
    if (!$gameParty.inBattle()) {
      this.placeGauge(actor, "pp", x + Fomar.PassiveSkills.PPBarOffsetX, y + this.gaugeLineHeight() * 2 + Fomar.PassiveSkills.PPBarOffsetY);
    }
  };

  Fomar.PassiveSkills.Sprite_Gauge_currentValue = Sprite_Gauge.prototype.currentValue;
  Sprite_Gauge.prototype.currentValue = function() {
    if (this._battler && this._statusType == "pp") {
      return this._battler.currentPP();
    } else {
      return Fomar.PassiveSkills.Sprite_Gauge_currentValue.call(this);
    }
  };

  Fomar.PassiveSkills.Sprite_Gauge_currentMaxValue = Sprite_Gauge.prototype.currentMaxValue;
  Sprite_Gauge.prototype.currentMaxValue = function() {
    if (this._battler && this._statusType == "pp") {
      return this._battler.maxPP();
    } else {
      return Fomar.PassiveSkills.Sprite_Gauge_currentMaxValue.call(this);
    }
  };

  Fomar.PassiveSkills.Sprite_Gauge_label = Sprite_Gauge.prototype.label;
  Sprite_Gauge.prototype.label = function() {
    if (this._statusType == "pp") {
      return Fomar.PassiveSkills.PP;
    } else {
      return Fomar.PassiveSkills.Sprite_Gauge_label.call(this);
    }
  };

  Fomar.PassiveSkills.Sprite_gaugeColor1 = Sprite_Gauge.prototype.gaugeColor1;
  Sprite_Gauge.prototype.gaugeColor1 = function() {
    if (this._statusType == "pp") {
      return ColorManager.textColor(Fomar.PassiveSkills.passiveGuageColor1);
    } else {
      return Fomar.PassiveSkills.Sprite_gaugeColor1.call(this);
    }
  };

  Fomar.PassiveSkills.Sprite_gaugeColor2 = Sprite_Gauge.prototype.gaugeColor2;
  Sprite_Gauge.prototype.gaugeColor2 = function() {
    if (this._statusType == "pp") {
      return ColorManager.textColor(Fomar.PassiveSkills.passiveGuageColor2);
    } else {
      return Fomar.PassiveSkills.Sprite_gaugeColor2.call(this);
    }
  };

  Fomar.PassiveSkills.Window_SkillList_isEnabled = Window_SkillList.prototype.isEnabled;
  Window_SkillList.prototype.isEnabled = function(item) {
    if (!item) {
      return false;
    }
    if (this._stypeId == Fomar.PassiveSkills.passiveSkillTypeId) {
      if (this._actor._passiveSkills.includes(item.id)) {
        return true;
      } else {
        return this._actor.currentPP() >= item.mpCost;
      }
    } else {
      return Fomar.PassiveSkills.Window_SkillList_isEnabled.call(this, item);
    }
  };

  Fomar.PassiveSkills.Scene_Skill_useItem = Scene_Skill.prototype.useItem;
  Scene_Skill.prototype.useItem = function() {
    if (this.item() && this.item().stypeId == Fomar.PassiveSkills.passiveSkillTypeId) {
      if (this.actor()._passiveSkills.includes(this.item().id)) {
        this.actor()._passiveSkills.remove(this.item().id);
      } else {
        this.actor()._passiveSkills.push(this.item().id);
      }
      this._statusWindow.refresh();
      this._itemWindow.refresh();
      this.actor().refresh();
    } else {
      Fomar.PassiveSkills.Scene_Skill_useItem.call(this);
    }
  };

  Window_SkillList.prototype.drawItemName = function(item, x, y, width) {
    if (item && item.stypeId == Fomar.PassiveSkills.passiveSkillTypeId) {
      if (this._actor._passiveSkills.includes(item.id)) {
        if (Fomar.PassiveSkills.passiveSkillOnIconIndex > 0) {
          const item2 = Object.assign({}, item);
          item2.iconIndex = Fomar.PassiveSkills.passiveSkillOnIconIndex;
          Window_Base.prototype.drawItemName.call(this, item2, x, y, width);
          return;
        }
      } else {
        if (Fomar.PassiveSkills.passiveSkillOffIconIndex > 0) {
          const item2 = Object.assign({}, item);
          item2.iconIndex = Fomar.PassiveSkills.passiveSkillOffIconIndex;
          Window_Base.prototype.drawItemName.call(this, item2, x, y, width);
          return;
        }
      }
    }
    Window_Base.prototype.drawItemName.call(this, item, x, y, width);
  };

})();
