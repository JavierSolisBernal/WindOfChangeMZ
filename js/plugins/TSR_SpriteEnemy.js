//========================================================================================
//=== TSR_SpriteEnemy === A Plugin by The Northern Frog ==================================
//========================================================================================

var TSR = TSR || {};
TSR.spriteEnemy = TSR.spriteEnemy || {};
TSR.spriteEnemy.version = 1.06;
TSR.spriteEnemy.pluginName = 'TSR_SpriteEnemy';

var Imported = Imported || {};
Imported[TSR.spriteEnemy.pluginName] = true;

//========================================================================================

/*:
 * @target MZ
 * @plugindesc v1.0.6 This plugin provide animated motions for side-view or front-view 
 *                    enemies.
 * @author TSR, The Northern Frog, 2021      
 * @help 
 * =========================================================================================
 * == About this Plugin ====================================================================
 * =========================================================================================
 * The plugin provide 4 battle motions for enemies: 
 * 
 *        Idle motion: When the enemy battler is in 'wait' mode.
 * 
 *      Attack motion: When the enemy battler make a regular attack.
 * 
 *       Skill motion: When the enemy battler execute a skill
 * 
 *      Damage motion: When the enemy battler receive damages.
 * 
 * 
 * In addition, the plugin revamp some of the battle effects for enemy
 * battlers behaviors:
 * 
 *     Attack and skill: the enemy battler will step forward, tilt a bit
 *                       while executing the action, and step back. This
 *                       replace the default 'whiten' effect.
 * 
 *               Damage: the enemy battler will step back, tilt a bit
 *                       with a red flashing effect, and move back to
 *                       its position. This replace the default 'blink'
 *                       effect.
 * 
 *                Evade: the enemy battler will step back as it evades an
 *                       attack, then move back to its position.
 * 
 *               States: the plugin provide the option of using the state
 *                       overlays animation over enemy battlers when they
 *                       are affected by a state. You can choose to show
 *                       either the default state icons or the animated
 *                       overlays, or both. Overlays requires to be set
 *                       with enemies notetags (see bellow).
 * 
 *          Restriction: the animated enemy battlers will freeze whenever
 *                       they are affected by a state that have the 'cannot
 *                       move' restriction.
 * 
 *             *step forward and backward directions depends on wether
 *              side or front view is in use.
 * 
 * 
 * HOW TO USE:
 * 
 *    The motions frames must be arranged in a sprite sheet with 4 rows.
 *    Each row represent one of the 4 battle motions, 'Idle', 'Attack',
 *    'Skill' and 'Damage', in that order.
 * 
 *    The motions animations can have any number of frames, down to a
 *    minimum of 3. Each motion on a sprite sheet must have the same 
 *    number of frames. 
 * 
 *    The 'Idle' motion is a back and forth loop (or start to end,
 *    see bellow). The other motions stops once the last frame is
 *    reached.
 *    
 * 
 *    Use the following Enemy Notetag to assign a sprite sheet to an
 *    enemy in the database.
 * 
 *      ENEMY NOTETAG:
 *                      <ENEMY IMAGE: filename, frames, loop>
 * 
 *              filename: the file name of the sprite sheet without
 *                        extension. The sprite sheet must be stored
 *                        in /img/sv_enemies (if using side-view) or
 *                        /img/enemies (if using front-view).
 * 
 *                frames: the number of frame per motions of the 
 *                        sprite sheet.
 * 
 *                loop: this is an optional parameter to change the
 *                      loop type of the enemy to a 'start to end'
 *                      loop rather then the default 'back and forth'.
 *                      **(only for the idle animation)
 * 
 *      
 *                   EXAMPLE:  <ENEMY IMAGE: GobelinSheet, 3>
 * 
 * 
 *                   The enemy battler having this notetag will be
 *                   assigned with the sprite sheet 'GobelinSheet'
 *                   which have 4 rows of 3 frames motions.
 * 
 * 
 *                   EXAMPLE:  <ENEMY IMAGE: GobelinSheet, 3, TRUE>
 * 
 * 
 *                   Same as previous, but adding a third argument
 *                   set to 'true' will make the goblin loop its
 *                   idle motion in a 'start to end' loop type instead
 *                   of the default 'back and forth';
 *         
 *          Use this notetag to assign a specific animation to the 
 *          normal attack of an enemy.
 * 
 *                          <ATTACK ANIMATION: Id>
 * 
 *                    Id: the id of the animation that will play when 
 *                        the enemy execute a normal attack.
 * 
 * 
 * 
 *      NOTES:
 *  
 *         *The sprite sheets are splitted by the plugin into 4 rows and
 *          a number of columns defined by the notetag 'frames' argument.
 *          This mean you can use sprite sheets of any size. The enemy
 *          images will appear at their actual size on the battlefield.
 * 
 *         *Enemies without the notetag will be treated as the default
 *          static enemies.
 * 
 *         *You can use a mix of animated enemies and static enemies.
 * 
 *         *Static enemies will still behave according to the battle
 *          effects provided by the plugin.
 * 
 *         *It is suggested to assign a static enemy image to enemies
 *          in the database even if they have a sprite sheet notetag.
 *          You can use the same image for all animated enemies, it
 *          will serve as a placeholder for building the troops.
 * 
 *         *Be sure your sprite sheets are stored in the correct folder
 *          wether you're using side-view or front-view battles. 
 * 
 * 
 * ENEMIES STATE OVERLAYS
 * 
 *      Plugin parameters:
 * 
 *           -Enable State Icons: 
 *                  Display or not the default state icons above enemy
 *                  battlers head.
 * 
 *           -Enable State Overlays:
 *                  Display or not the animated state overlays over enemy
 *                  battlers.
 * 
 *      Animated state overlays are binded to the state affected battler,
 *      and appears at the center of the battler sprite, similar to the
 *      Actor battlers animated state overlays.
 * 
 *      While actor battlers are all the same size, enemy battlers can
 *      have various size and forms. This means that the state overlays
 *      might not appears correctly over the enemy battlers without proper
 *      settings.
 * 
 *      Example: the 'Sleep' animated state overlay should be displayed
 *               above the battler's head, while the 'Blind' overlay should
 *               cover the battler's eyes. The 'Paralysis' state, on the
 *               other hand, should encompass the whole battler's sprite.
 * 
 * 
 *      To achieve specific settings for each enemies, another Enemy Notetag
 *      is provided:
 * 
 *          ENEMY NOTETAG:
 *                        <STATE OVERLAY DATA>
 *                            overlay INDEX: x, y, scale
 *                            overlay INDEX: x, y, scale
 *                            overlay INDEX: x, y, scale
 *                        </STATE OVERLAY DATA>
 * 
 *              INDEX: the overlay index, starting at 1 for 'Poison'.
 *                  x: the horizontal offset of the overlay.
 *                  y: the vertical offset of the overlay.
 *              scale: the scaling of the overlay.
 * 
 * 
 *           EXAMPLE:     <STATE OVERLAY DATA>
 *                            overlay 2: 0, -48, 1
 *                            overlay 7: 12, -36, 0.8
 *                            overlay 8: -24, 0, 1.5
 *                        </STATE OVERLAY DATA>
 * 
 *           An enemy battler having the above notetag will have specific
 *           state animated overlay settings for the 'Blind' (overlay 2), 
 *           the 'Sleep' (overlay 7) and the 'Paralysis' (overlay 8) states.
 *           Note that the 'Blind' overlay is slightly downscaled so it just
 *           cover the enemy eyes; while the 'Paralysis' overlay is enlarged
 *           so it cover the whole enemy sprite.
 * 
 *                 
 * 
 * =======================================================================================
 * == Term of Usage ======================================================================
 * =======================================================================================
 * 
 * Use in any independant RPG Maker MZ and MV projects, including commercials.
 *
 * Credit is required for using this Plugin. 
 * For crediting, use 'TSR' along with one of
 * the following terms: 
 *      'The Northern Frog' or 'A frog from the north'
 * 
 * Do not change the Header or the Terms of usage.
 * 
 * Do not change the main Object name.
 *
 * Editing of the script is allowed for your personal use for your project. 
 * If you wish to upgrade the plugin and share it with the RPG Maker 
 * community, contact me on discord to ask permission. I'll be glad 
 * to provide some guidance with the script too, if needed.
 *
 * DO NOT REDISTRIBUTE!
 * If you want to share it, share the link to my itch.io account: 
 * https://the-northern-frog.itch.io/
 * 
 *
 * =======================================================================================
 * == Version and compatibility ==========================================================
 * =======================================================================================
 * 18/11/2020 intitial works, v0.00
 * 01/05/2021 completed plugin and add instructions + parameters, v1.01
 * 04/07/2021 small edits for MV, v1.02
 * 15/08/2021 small fix for the state icons, v1.03
 * 19/08/2023 fix a bug with the boss collapse effect, add option for loop v1.05
 * 20/08/2023 fix of previous version v1.06
 *
 * =======================================================================================
 * == END ================================================================================                                             
 * =======================================================================================
 *
 *                              "Have fun!"
 *                                                  TSR, The Northern Frog
 *
 * =======================================================================================
 *
 * @param Enable State Icons
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Enable the default enemies state icons?
 * OFF - false  ON - true
 * @default true
 * 
 * @param Enable State Overlays
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Enable the state animated overlays on the enemy battlers?
 * OFF - false  ON - true
 * @default false
 * 
 * 
 */


//== PARAMETERS ==========================================================================

TSR.Parameters = PluginManager.parameters(TSR.spriteEnemy.pluginName);

TSR.spriteEnemy._enableStateIcon = eval(
    String(TSR.Parameters['Enable State Icons'])
);

TSR.spriteEnemy._enableStateOverlay = eval(
    String(TSR.Parameters['Enable State Overlays'])
);



//=== MANAGER ===============================================================================

TSR.spriteEnemy.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if (!TSR.spriteEnemy.DataManager_isDatabaseLoaded.call(this)) return false;
  if (!TSR.spriteEnemy._loaded) {
    this.readSpriteEnemyTag($dataEnemies);
    TSR.spriteEnemy._loaded = true;
  }
  return true;
};

//=== Notetags ============================================

DataManager.readSpriteEnemyTag = function(group) {
    for (let n = 1; n < group.length; n++) {
      const obj = group[n];
      const notedata = obj.note.toString().split(/[\r\n]+/);
      obj._spriteSheet = null;
      obj._stateOverlayData = false;
      obj._attackAnimation = false;
      obj._loopType = false;
      let readData = false;
      for (const note of notedata) {
        if (note.match(/<(?:ENEMY IMAGE|ENEMY SHEET):[ ](\w+),[ ](\d+)[ ]*((?:\s*,\s*\w+)*)>/i)) {
            obj._spriteSheet = RegExp.$1;
            obj._sheetFrames = Math.max(parseInt(RegExp.$2), 3);
            const lt = note.slice(note.lastIndexOf(':') + 1, note.indexOf('>')).split(',')[2];
            const int = parseInt(lt);
            if (int) {
                obj._loopType = int;
            } else if (lt && lt.trim().toLowerCase() === 'true') {
                obj._loopType = true;
            }
        } if (note.match(/<ATTACK ANIMATION:[ ](\d+)>/i)) {
            obj._attackAnimation = parseInt(RegExp.$1);
        } else if (note.match(/<(?:STATE OVERLAY POSITION|STATE OVERLAY DATA)>/i)) {
            obj._stateOverlayData = {};
            readData = true;
        } else if (note.match(/<\/(?:STATE OVERLAY POSITION|STATE OVERLAY DATA)>/i)) {
            readData = false;
        } else if (readData) {
            if (note.match(/(?:OVERLAY INDEX|OVERLAY)[ ]*(\d+):[ ]*(\D+(?:\s*,\s*\D+)*)/i)) {
                const index = parseInt(RegExp.$1);
                const ar = note.slice(note.lastIndexOf(':') + 1).split(',');
                for (const state of $dataStates) {
                    if (state && state.overlay === index) obj._stateOverlayData[index] = ar;
                }
            } 
        }
      }
    }
  };


//=== BattleManager ====================================

if (!Imported.TSR_BattleCore) {
    BattleManager.encounterType = function() {
        return 'front';
    };
};


//=== Window_BattleLog =================================

Window_BattleLog.prototype.showEnemyAttackAnimation = function(subject, targets) {
    const animId = $dataEnemies[subject._enemyId]._attackAnimation || 1;
    this.showNormalAnimation(targets, animId, targets[0].isActor());
    SoundManager.playEnemyAttack();
};



//== GAME ================================================================================


//=== Game_BattlerBase ====================================

Game_BattlerBase.prototype.setStateOverlayData = function(data) {
    this._stateOverlayData = data;
};

Game_BattlerBase.prototype.stateOverlayData = function(index) {
    if (!this._stateOverlayData) return false;
    return this._stateOverlayData[index];
};


//=== Game_Enemy ====================================

Game_Enemy.prototype.performActionStart = function(action) {
    Game_Battler.prototype.performActionStart.call(this, action);
    if (this.isEscaping(action)) {
        this.setTurn(!this.isTurned());
    } else {
        this.requestEffect("stepForward");
    }
};
    
Game_Enemy.prototype.performAction = function(action) {
    Game_Battler.prototype.performAction.call(this, action);
    if (action.isAttack() || action.item()._needAttackMotion) {
        this.requestMotion("attack");
        this.requestEffect("attack");
    } else if (this.isEscaping(action)) {
        this.requestMotion("wait");
        this.requestEffect("skill");
    } else if (action.isSkill()) {
        this.requestMotion("skill");
        this.requestEffect("skill");
    }
};

Game_Enemy.prototype.performActionEnd = function() {
    Game_Battler.prototype.performActionEnd.call(this);
    if (this.canMove()) this.requestEffect("stepBack");
};

Game_Enemy.prototype.performDamage = function() {
    Game_Battler.prototype.performDamage.call(this);
    SoundManager.playEnemyDamage();
    this.requestMotion("damage");
    this.requestEffect("damage");
};

Game_Enemy.prototype.performEvasion = function() {
    Game_Battler.prototype.performEvasion.call(this);
    this.requestEffect("evade");
};

Game_Enemy.prototype.setTurn = function(set) {
    this._needsTurn = set;
};

Game_Enemy.prototype.needsTurn = function() {
    return this._needsTurn;
};

Game_Enemy.prototype.setTurned = function(set) {
    this._isTurned = set;
};

Game_Enemy.prototype.isTurned = function() {
    return this._isTurned;
};

Game_Enemy.prototype.isEscaping = function(action) {
    if (Imported.TSR_SkillEffects) {
        return action.isEscape();
    } else {
        return false;
    };
};

Game_Enemy.prototype.frameRate = function() {
    if (!Imported.TSR_StateEffects) {
        return false
    } else {
        return Game_Battler.prototype.frameRate.call(this);
    }
};

Game_Enemy.prototype.stateIcons = function() {
    return this.states()
           .map(function(state) {
                if (state._showStateIcon ||
                    TSR.spriteEnemy._enableStateIcon) {
                    return state.iconIndex;
                }
            })
           .filter(iconIndex => iconIndex > 0);
};

Game_Enemy.prototype.isFacingTarget = function() {
    if (!Imported.TSR_BattleCore) return true;
    const member = BattleManager._targets[0];
    if (!!member) {
        if (member.isEnemy()) return true;
        if ((member._homeX > this.screenX() &&
            !this.isTurned()) || 
            (member._homeX < this.screenX() &&
            this.isTurned())) {
            return true;
        } else {
            return false;
        }
    } 
    return true;
};



//== SPRITE ==============================================================================

//=== Sprite_Enemy ====================================

Sprite_Enemy.MOTIONS = {
    wait:   {index: 0, frame: 0, loop: true },
    attack: {index: 1, frame: 0, loop: false },
    skill:  {index: 2, frame: 0, loop: false },
    damage: {index: 3, frame: 0, loop: false }
};

Sprite_Enemy.FLANK_POSITIONS = {
    0: [150, 280, false],
    1: [900, 280, true],
    2: [200, 480, false],
    3: [850, 480, true],
    4: [150, 680, false],
    5: [900, 680, true]
};

Sprite_Enemy.prototype.initMembers = function() {
    Sprite_Battler.prototype.initMembers.call(this);
    this._enemy = null;
    this._appeared = false;
    this._battlerName = "";
    this._battlerHue = 0;
    this._effectType = null;
    this._effectDuration = 0;
    this._shake = 0;
    this._motions = null;
    this._motion = null;
    this._motionLenght = 4;
    this._animationCount = 0;
    this.createStateSprite();
};

Sprite_Enemy.prototype.setBattler = function(battler) {
    Sprite_Battler.prototype.setBattler.call(this, battler);
    this._enemy = battler;
    const enemyData = $dataEnemies[this._enemy._enemyId];
    if (enemyData._spriteSheet) {
        this._enemy._motions = JsonEx.makeDeepCopy(Sprite_Enemy.MOTIONS);
        this._enemy._animated = true;
        this._enemy._sheetFrames = enemyData._sheetFrames;
        this._enemy._loopType = enemyData._loopType;
    }
    if (enemyData._stateOverlayData) {
        this._enemy.setStateOverlayData(enemyData._stateOverlayData);
    }
    this.setHomePosition(
        BattleManager.encounterType(), battler, $gameTroop.members().indexOf(this._enemy)
    );
    if (this._stateSprite) this._stateSprite.setup(battler);
    if (this._stateIconSprite) this._stateIconSprite.setup(battler);
};

Sprite_Enemy.prototype.createStateSprite = function() {
    if (TSR.spriteEnemy._enableStateOverlay) {
        this._stateSprite = new Sprite_StateOverlay();
        this.addChild(this._stateSprite);
    }
    this._stateIconSprite = new Sprite_StateIcon();
    this.addChild(this._stateIconSprite);
};

Sprite_Enemy.prototype.update = function() {
    Sprite_Battler.prototype.update.call(this);
    if (this._enemy) {
        this.updateEffect();
        if (this._stateIconSprite) {
            this.updateStateIconSprite();
        }        
    }
};

Sprite_Enemy.prototype.updateStateIconSprite = function() {
    const height = (this._enemy._animated)? 
                    this.bitmap.height / this._motionLenght : this.bitmap.height;
    this._stateIconSprite.y = -Math.round((height + 40) * 0.9);
    if (this._stateIconSprite.y < 20 - this.y) {
        this._stateIconSprite.y = 20 - this.y;
    }
};

Sprite_Enemy.prototype.setHomePosition = function(type, enemy, index) {
    const flanked = BattleManager._flanked;
    const outflank = BattleManager._outflank;
    if (type === 'player side' && flanked) {
        this.disposeFlank(enemy, index);
    } else if (type === 'enemy side' && outflank) {
        enemy._screenX += 250
    } 
    this.setHome(enemy.screenX(), enemy.screenY());
};

Sprite_Enemy.prototype.disposeFlank = function(enemy, index) {
    const poslist = Sprite_Enemy.FLANK_POSITIONS;
    if ($gameTroop.members().length === 2) index += 2;
    enemy._screenX = poslist[index][0];
    enemy._screenY = poslist[index][1];
    enemy.setTurn(poslist[index][2])
};

Sprite_Enemy.prototype.updateBitmap = function() {
    Sprite_Battler.prototype.updateBitmap.call(this);
    const enemy = this._enemy;
    const name = $dataEnemies[enemy._enemyId]._spriteSheet || enemy.battlerName(); 
    const hue = this._enemy.battlerHue();
    if (this._battlerName !== name || this._battlerHue !== hue) {
        this._battlerName = name;
        this._battlerHue = hue;
        this.loadBitmap(name, hue);
        this.initVisibility();
    }
};

Sprite_Enemy.prototype.loadBitmap = function(name, hue) {
    if ($dataSystem.advanced) { //MZ
        this.setHue(hue);
    }
    if ($gameSystem.isSideView()) {
        this.bitmap = ImageManager.loadSvEnemy(name, hue);
    } else {
        this.bitmap = ImageManager.loadEnemy(name, hue);
    }
};

Sprite_Enemy.prototype.updateFrame = function() {
    Sprite_Battler.prototype.updateFrame.call(this);
    this._animationCount++
    if (this._enemy._animated) {
        const type = this._enemy._motionType || 'wait';
        const motion = this._enemy._motions[type];
        if (this._motion !== motion) {
            this._motion = motion;
            motion.frame = 0;
        }
        const rate = this._enemy.frameRate() || 12;
        motion.maxFrame = this._enemy._sheetFrames;
        const index = motion.index;
        const frame = motion.frame;
        const cw = this.bitmap.width / motion.maxFrame;
        const ch = this.bitmap.height / this._motionLenght;
        const cx = cw * frame;
        const cy = ch * index;
        if (this._effectType === "bossCollapse") {
            this.setFrame(cx, cy, cw, this._effectDuration);
        } else {
            this.setFrame(cx, cy, cw, ch);
            if (this._enemy.canMove()) this.setMotionFrame(motion, rate);
        }
    } else {
        if (this._effectType === "bossCollapse") {
            this.setFrame(0, 0, this.bitmap.width, this._effectDuration);
        } else {
            this.setFrame(0, 0, this.bitmap.width, this.bitmap.height);
        }
    }
    if (this._enemy.needsTurn() && this._effectType !== "bossCollapse") {
        this.turn();
        this._enemy.setTurn(false);
    }
};

Sprite_Enemy.prototype.startBossCollapse = function() {
    this._effectDuration = this._enemy._animated ? 
            this.bitmap.height / this._motionLenght : this.bitmap.height;
    this._appeared = false;
};

Sprite_Enemy.prototype.setMotionFrame = function(motion, rate) {
    let frame = motion.frame;
    const maxIndex = motion.maxFrame - 1;
    if (frame === maxIndex && !motion.loop) return frame;
    if (this._animationCount % rate === 0) {
        if (this._enemy._loopType) {
            frame = this.fromEndToStart(frame, maxIndex);
        } else {
            frame = this.backAndForth(frame, maxIndex);
        }
    }
    motion.frame = frame;  
};

Sprite_Enemy.prototype.fromEndToStart = function(frame, maxIndex) {
    if (frame < maxIndex) {  
        frame++;
    } else {
        frame = 0;
    }     
    return frame;
};

Sprite_Enemy.prototype.backAndForth = function(frame, maxIndex) {
    if (!this._goesLeft) {
        if (frame < maxIndex) {  
            frame++;
        } else {
            frame--;
            this._goesLeft = true;
        }       
    } else {
        if (frame > 0) {  
            frame--;
        } else {
            frame++;
            this._goesLeft = false;
        }  
    }
    return frame;
};

Sprite_Enemy.prototype.startEffect = function(effectType) {
    this._effectType = effectType;
    switch (this._effectType) {
        case "appear":
            this.startAppear();
            break;
        case "disappear":
            this.startDisappear();
            break;
        case "whiten":
            this.startWhiten();
            break;
        case "stepForward":
            this.startStepForward();
            break;
        case "stepBack":
            this.startStepBack();
            break;
        case "blink":
            this.startBlink();
            break;
        case "attack":
            this.startAttack();
            break;
        case "skill":
            this.startSkill();
            break;
        case "damage":
            this.startDamage();
            break;
        case "evade":
            this.startEvade();
            break;
        case "collapse":
            this.startCollapse();
            break;
        case "bossCollapse":
            this.startBossCollapse();
            break;
        case "instantCollapse":
            this.startInstantCollapse();
            break;
    }
    this.revertToNormal();
};

Sprite_Enemy.prototype.startStepForward = function() {
    if (this.needsTurn()) this.turn();
    this._moveDir = (this._enemy.isTurned())? -24 : 24;
    this._effectDuration = 12;
};

Sprite_Enemy.prototype.needsTurn = function() {
    const members = $gameParty.battleMembers();
    const left = members.filter(member => $gameActors.actor(member._actorId)._homeX < this.x);
    const right = members.filter(member => $gameActors.actor(member._actorId)._homeX > this.x);
    const middle = left && right;
    if (left && !middle && !this._enemy.isTurned()) {
        return true;
    } else if (!left && !middle && this._enemy.isTurned()) {
        return true;
    } else if (middle) {
        return !this._enemy.isFacingTarget();
    }
    return false;
};

Sprite_Enemy.prototype.startStepBack = function() {
    this._moveDir = (this._enemy.isTurned())? -24 : 24;
    this._effectDuration = 12;
};

Sprite_Enemy.prototype.startAttack = function() {
    this._effectDuration = 36;
};

Sprite_Enemy.prototype.startSkill = function() {
    this._effectDuration = 60;
};

Sprite_Enemy.prototype.startDamage = function() {
    this._effectDuration = 36;
};

Sprite_Enemy.prototype.startEvade = function() {
    this._effectDuration = 24;
};

Sprite_Enemy.prototype.turn = function() {
    this.scale.x *= -1;
    this._isTurned = this.scale.x < 0;
    this._enemy.setTurned(this._isTurned);
};

Sprite_Enemy.prototype.updateEffect = function() {
    this.setupEffect();
    if (this._effectDuration > 0) {
        this._effectDuration--;
        switch (this._effectType) {
            case "whiten":
                this.updateWhiten();
                break;
            case "stepForward":
                this.updateStepForward();
                break;
            case "stepBack":
                this.updateStepBack();
                break;
            case "blink":
                this.updateBlink();
                break;
            case "attack":
                this.updateAttack();
                break;
            case "skill":
                this.updateSkill();
                break;
            case "damage":
                this.updateDamage();
                break;
            case "evade":
                this.updateEvade();
                break;
            case "appear":
                this.updateAppear();
                break;
            case "disappear":
                this.updateDisappear();
                break;
            case "collapse":
                this.updateCollapse();
                break;
            case "bossCollapse":
                this.updateBossCollapse();
                break;
            case "instantCollapse":
                this.updateInstantCollapse();
                break;
        }
        if (this._effectDuration === 0) {
            this._effectType = null;
            this._enemy._motionType = 'wait';
            this.resetFrames(this._enemy);
            this.setBlendColor([0, 0, 0, 0]);
            this.setHome(this._enemy.screenX(), this._enemy.screenY());
        }
    }
};

Sprite_Enemy.prototype.resetFrames = function(enemy) {
    if (!this._animated) return
    enemy._motions['wait'].frame = 0;
    enemy._motions['attack'].frame = 0;
    enemy._motions['skill'].frame = 0;
    enemy._motions['damage'].frame = 0;
};

Sprite_Enemy.prototype.updateStepForward = function() {
    if ($gameSystem.isSideView()) {
        this.startMove(this._moveDir, 0, 12);
    } else {
        this.startMove(0, 24, 12);
    }
};

Sprite_Enemy.prototype.updateStepBack = function() {
    if ($gameSystem.isSideView()) {
        this.startMove(this._moveDir * -1, 0, 12);
    } else {
        this.startMove(0, -24, 12);
    }
};

Sprite_Enemy.prototype.updateAttack = function() {
    this.updateTilt();
};

Sprite_Enemy.prototype.updateSkill = function() {
    this.updateTilt();
};

Sprite_Enemy.prototype.updateDamage = function() {
    const alpha = 64 - (8 - this._effectDuration) * 4;
    this.setBlendColor([160, 0, 0, alpha]);
    this.updateTilt();
    if ($gameSystem.isSideView()) {
        this.x -= (this._enemy.isTurned())? -24 : 24;
    } else {
        this.y -= 24;
    }
};

Sprite_Enemy.prototype.updateTilt = function() {
    if (!this._up && this._animationCount % 4 === 0) {
        this.y += 4;
        this._up = true
    } else if (this._animationCount % 4 === 0) {
        this.y -= 4;
        this._up = false
    }
};

Sprite_Enemy.prototype.damageOffsetX = function() {
    return Sprite_Battler.prototype.damageOffsetX.call(this);
};

Sprite_Enemy.prototype.damageOffsetY = function() {
    return Sprite_Battler.prototype.damageOffsetY.call(this) - 8;
};

Sprite_Enemy.prototype.updateEvade = function() {
    this.x -= (this._enemy.isTurned())? -24 : 24;
};

Sprite_Enemy.prototype.effectOffsetX = function() {
    return 0;
};

Sprite_Enemy.prototype.effectOffsetY = function() {
    return -8;
};


//=== Sprite_StateOverlay ===============================

TSR.spriteEnemy._Sprite_StatOverlay_updateFrame = Sprite_StateOverlay.prototype.updateFrame;
Sprite_StateOverlay.prototype.updateFrame = function() {
    TSR.spriteEnemy._Sprite_StatOverlay_updateFrame.call(this);
    if (!this._battler) return;
    const index = this._overlayIndex;
    const battlerOverlay = this._battler.stateOverlayData(index);
    if (battlerOverlay) {
            this.x = parseInt(battlerOverlay[0]);
            this.y = parseInt(battlerOverlay[1]);
            this.scale.x = parseFloat(battlerOverlay[2]);
            this.scale.y = parseFloat(battlerOverlay[2]);
    } 
};


//=== Sprite_StateIcon =================================

Sprite_StateIcon.prototype.updateFrame = function() {
    const mz = $dataSystem.advanced;
    const pw = (mz)? ImageManager.iconWidth : Sprite_StateIcon._iconWidth;
    const ph = (mz)? ImageManager.iconHeight : Sprite_StateIcon._iconHeight;
    const sx = (this._iconIndex % 16) * pw;
    const sy = Math.floor(this._iconIndex / 16) * ph;
    if (this._iconIndex) {
        this.setFrame(sx, sy, pw, ph);
    } else {
        this.setFrame(0, 0, 0, 0);
    }
};



//=== END ============================================================================================
//====================================================================================================