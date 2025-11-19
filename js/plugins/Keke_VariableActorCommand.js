//=============================================================================
// Keke_VariableActorCommand - 可変アクターコマンド
// バージョン: 1.2.8
//=============================================================================
// Copyright (c) 2020 ケケー
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @target MZ
 * @plugindesc アクターコマンドを自在に組み替える
 * @author ケケー
 * @url https://kekeelabo.com
 * 
 * @help
 * 【ver.1.2.8】
 * アクターコマンドを自在に組み替えることができる
 *
 * ● 特徴 ●
 * ■キャラごとにコマンド自由構成
 * ■コマンド数に応じたAutoStretching
 * ■コマンドの動的変更
 *
 *
 * ● 使い方 ●
 * 設定はデータベースのメモ欄で行う
 *
 * ■コマンドを追加(削除)
 * アクター、職業、装備、スキル、アイテム、ステートのメモ欄に
 *
 * <コマンド: (-)(コマンド)(/)(タイプ/ID), (表示順), (表示名), (IconID),
 *   (ヘルプ)>
 *
 * ★(-)(コマンド)
 * 追加するコマンド。6種類から選ぶ
 * ◎攻撃
 * 　通常攻撃。スキルID 1 のスキル
 * ◎防御
 * 　防御。スキルID 2 のスキル
 * ◎スキル
 * 　スキルコマンド。
 * ◎アイテム
 * 　アイテムコマンド
 * ◎逃げる
 * 　戦闘から逃げる。パーティコマンド版と同じ
 * ◎オート
 * 　自動戦闘。パーティ全員が自動で戦う
 * ※頭に - を付けた場合
 * 　コマンド削除になる
 *
 * ★(/)(スキルタイプ/ID)
 * この部分はスキル/アイテムのときのみ書く。スキルタイプかIDのどちらか
 * ◎スキルタイプ
 * 　スキルのときのみ
 * 　スキルタイプ名を書くと、そのスキルタイプがコマンドとして追加される
 * ◎ID
 * 　スキルIDを書くと、そのスキル個別がコマンドとして追加される
 * 　アイテムIDならそのアイテム個別
 *
 * ★(表示順)
 * コマンドの表示される順番。数値が小さいほど上に表示される
 *
 * ★(表示名)
 * コマンドの実際に表示される名前。省略可能
 * 省略した場合、コマンド本来の名前がそのまま表示される
 *
 * ★(IconID)
 * 表示するIconのID。省略可能
 * 省略すると基本的にはIconを表示しないが、
 * スキル個別のときのみ、そのスキル本来のIconを表示する
 * 
 * ★(ヘルプ)
 * 表示するヘルプメッセージ。省略可能
 * プラグインパラメータ → RegisterHelp　でヘルプを登録し、
 * そのHelp Nameを書く
 *
 * ※コマンド追加がひとつでもある時点で、デフォのコマンドはinvalid化される
 *
 * ●具体例
 * ◎このようなコマンド構成にする場合
 * 　ブラッドスティア(スキルID162)
 * 　魔剣技(スキルタイプ『攻撃特技』, IconID 76)
 * 　破壊魔法(スキルタイプ『攻撃魔法』, IconID 79)
 * 　聖魔法(スキルタイプ『回復魔法』, IconID 72)
 * 　ハイガード(防御コマンド)
 * 　アイテム(アイテムコマンド, IconID 165)
 * 　逃げる(逃げるコマンド, IconID 82)
 * 　オート(自動コマンド, IconID 83)
 *
 * 　<コマンド:スキル/162,10>
 * 　<コマンド:スキル/攻撃特技,20,魔剣技,76>
 * 　<コマンド:スキル/攻撃魔法,30,破壊魔法,79>
 * 　<コマンド:スキル/回復魔法,40,聖魔法,72>
 * 　<コマンド:防御,50,ハイガード>
 * 　<コマンド:アイテム,60, ,165>
 * 　<コマンド:逃げる,70, ,82>
 * 　<コマンド:オート,80, ,83>
 *
 * ◎スキルタイプ『攻撃魔法』『回復魔法』をコマンドから消す場合
 * 　<コマンド:-スキル/攻撃魔法>
 * 　<コマンド:-スキル/回復魔法>
 *
 * ◎スキル『ファイナルスティア』(スキルID164)をコマンドの一番上に追加する場合
 * 　<コマンド:スキル/164,1>
 *
 * 
 * ● 利用規約 ●
 * MITライセンスのもと、自由に使ってくれて大丈夫です
 *
 *
 *
 * Actor commands can be rearranged freely
 *
 * ● Features ●
 * Free configuration of commands for each character
 * ■ Automatic expansion/contraction of windows according
 *   to the number of commands
 * ■ Dynamic change of commands
 *
 *
 * ● How to use ●
 * Set in the memo field of the database
 *
 * ■ Added (deleted) commands
 * Actors, classes, equipment, skills, items, and state memos
 *
 * <command: (-) (command) (/) (type/ID), (display order), (display name)
 *   (icon ID), (help)>
 *
 * ★ (-) (command)
 * Command to add. Choose from 6 types
 * ◎ Attack
 *   Normal attack. Skill with skill ID 1
 * ◎ Defense
 *   Defense. Skill with skill ID 2
 * ◎ Skills
 *   Skill commands.
 * ◎ Item
 *   Item command
 * ◎ Escape
 *   Run away from battle. Same as party command version
 * ◎ Auto
 *   Auto Combat. All parties automatically fight
 * ※ When - is added to the head
 *   Delete command
 *
 * ★ (/) (skill type/ID)
 * Write this part only for skills/items. Either skill type or ID
 * ◎ Skill type
 *   only for skills
 *   Writing a skill type name will add that skill type as a command
 * ◎ ID
 *   If you write a skill ID, that skill will be added as a command
 *   Item ID for each item
 *
 * ★ (display order)
 * The order in which commands are displayed.
 * The smaller the number, the higher it is displayed
 *
 * ★ (display name)
 * The actual visible name of the command. Optional
 * If omitted, the original name of the command is displayed as is.
 *
 * ★ (Icon ID)
 * ID of the icon to display. Optional
 * If omitted, the icon is basically not displayed, but
 * Display the skill's original icon only when the skill is individual
 *
 * ★ (Help)
 * Help message to display. Optional
 * Register help with plug-in parameters → help registration,
 * Write that help name
 *
 * ※ When there is even one command added, the default command is disabled.
 *
 * ● Concrete example
 * ◎ When using such a command structure
 *   Blood Steer (Skill ID 162)
 *   Magical Sword Skill (Skill Type "Attack Skill", Icon ID 76)
 *   Destruction Magic (Skill Type "Attack Magic", Icon ID 79)
 *   Holy Magic (Skill Type "Recovery Magic", Icon ID 72)
 *   High Guard (defense command)
 *   Item (item command, icon ID 165)
 *   Escape (escape command, icon ID 82)
 *   Auto (auto command, icon ID 83)
 *
 *   <command: Skill/162,10>
 *   <command: Skill/Attack Skill, 20, Magic Sword Skill, 76>
 *   <command: Skill/Attack Magic, 30, Destruction Magic, 79>
 *   <command: Skill/Recovery Magic, 40, Holy Magic, 72>
 *   <command: Defense, 50, High Guard>
 *   <command: item,60, ,165>
 *   <command: Escape, 70, ,82>
 *   <command: Auto,80, ,83>
 *
 * ◎When removing the skill type ``attack magic'' and ``recovery magic''
 *   from the command
 *   <command: -Skill/Attack Magic>
 *   <command: -Skill/Recovery Magic>
 *
 * ◎When adding the skill "Final Star" (skill ID 164)
 *   to the top of the command
 *   <command: Skill/164,1>
 *
 *
 * ● Terms of Use ●
 * Feel free to use it under the MIT license.
 * 
 * 
 * 
 * @param Window
 *
 * @param AutoStretching
 * @parent Window
 * @desc Automatically expand and contract the window according to the number of commands
 * @type boolean
 * @default true
 *
 * @param BottomEdge
 * @parent Window
 * @desc It does not extend below this coordinate and extends above it.
 * @default 616
 *
 * @param WindowOpacity
 * @parent Window
 * @desc Window opacity (0 to 255)
 * @default 255
 *
 * @param Icon
 *
 * @param IconView
 * @parent Icon
 * @desc Show Icons
 * @type boolean
 * @default true
 *
 * @param IconSize
 * @parent Icon
 * @desc Icon size (pixels)
 * @default 32
 *
 * @param IconXpos
 * @parent Icon
 * @desc Icon X position (pixels)
 * @default -4
 *
 * @param IconYpos
 * @parent Icon
 * @desc Icon Y position (pixels)
 * @default 0
 *
 * @param IconPlacement
 * @parent Icon
 * @desc Align icons to the left or right of the window
 * @type select
 * @option Left
 * @option Right
 * @default Left
 *
 *
 * @param TouchButton
 *
 * @param CancelButtonAuto
 * @parent TouchButton
 * @desc Automatically move the cancel button above the command
 * @type select
 * @option Top
 * @option TopLeft
 * @option TopRight
 * @option invalid
 * @default Top
 *
 * @param ヘルプ
 * 
 * @param RegisterHelp
 * @parent ヘルプ
 * @desc Register a help message. You can call it by writing the Help Name in the memo field.
 * @type struct<help>[]
 * @default []
 * 
 * @param SkillHelpDisplay
 * @parent ヘルプ
 * @desc Display skill help with actor commands
 * @type boolean
 * @default true
 * 
 * @param others
 *
 * @param PartyCommandDisabled
 * @parent others
 * @desc Hide party commands
 * @type boolean
 * @default false
 * 
 * @param SkillCommand
 * @parent others
 * @desc Also refer to the memo field of skills possessed when configuring commands
 * @type boolean
 * @default false
 * 
 * @param NombreAutoBattle
 * @parent others
 * @desc How to call auto-battle
 * @default Auto
 */
 
 

//==================================================
/*~struct~help:
//==================================================
/*
 * @param Help Name
 * @desc ヘルプの名前。メモ欄からの呼び出しに使う
 * @default 
 * 
 * @param テキスト
 * @desc Help text content
 * @type multiline_string
 * @default 
 * 
 * @param Icon
 * @desc 表示するIcon
 * @type icon
 * @default 
 */
 


(() => {
    //- Plugin name
    const pluginName = document.currentScript.src.match(/^.*\/(.*).js$/)[1];
    
    
    
    //==================================================
    //--  Add Sprite /Basic
    //==================================================
    
    //- Sprite with Discard
    function SpriteKeVrac() {
        this.initialize(...arguments);
    }

    SpriteKeVrac.prototype = Object.create(Sprite.prototype);
    SpriteKeVrac.prototype.constructor = SpriteKeVrac;

    SpriteKeVrac.prototype.destroy = function() {
        if (this.bitmap && !this.bitmap._url) { this.bitmap.destroy(); }
        Sprite.prototype.destroy.apply(this);
    };



    //==================================================
    //--  Parameter reception
    //==================================================
    
    //- Authenticity
    function toBoolean(str) {
        if (!str) { return false; }
        const str2 = str.toString().toLowerCase();
        if (str2 == "true" || str2 == "on") { return true; }
        if (str2 == "false" || str2 == "off") { return false; }
        return Number(str);
    };

    let parameters = PluginManager.parameters(pluginName);
    
    //- Window
    const keke_windowAutoResize = toBoolean(parameters["AutoStretching"]);
    const keke_windowResizeMax = Number(parameters["BottomEdge"]);
    const keke_windowOpacity = Number(parameters["WindowOpacity"]);
    
    //- Icon
    const keke_iconShow = toBoolean(parameters["IconView"]);
    const keke_iconSize = Number(parameters["IconSize"]);
    const keke_iconPosX = Number(parameters["IconXpos"]);
    const keke_iconPosY = Number(parameters["IconYpos"]);
    const keke_iconRel = parameters["IconPlacement"];
    
    //- Touch button
    const keke_cancelAutoRepos = parameters["CancelButtonAuto"];

    //- help
    const keke_helpList = parameters["RegisterHelp"] ? JSON.parse(parameters["RegisterHelp"]).map(d => JSON.parse(d)) : [];
    const keke_showSkillHelp = toBoolean(parameters["SkillHelpDisplay"]);
    
    //- others
    const keke_noPartyCommand = toBoolean(parameters["PartyCommandDisabled"]);
    const keke_commandReferSkill = toBoolean(parameters["SkillCommand"]);
    const keke_autoBattleWord = parameters["NombreAutoBattle"];

    parameters = null;
    
    
    
    //==================================================
    //--  common start
    //==================================================
    
    //- Window Actor Command/Start (Add Process)
    const _Window_ActorCommand_initialize = Window_ActorCommand.prototype.initialize;
    Window_ActorCommand.prototype.initialize = function(rect) {
        _Window_ActorCommand_initialize.apply(this, arguments);
        this._iconSpritesKe = [];
    };
    
    
    
    //==================================================
    //--  Common update
    //==================================================
    
    //- Scene Battle/Update (processing added)
    const _Scene_Battle_update = Scene_Battle.prototype.update;
    Scene_Battle.prototype.update = function() {
        _Scene_Battle_update.apply(this);
        // Auto Battle Update
        updateAutoBattle(this);
    };


    //Window Actor Command/Update (Add Process)
    if (Window_ActorCommand.prototype.update == Window_Selectable.prototype.update) {
        Window_ActorCommand.prototype.update = function() {
            Window_Selectable.prototype.update.call(this);
        };
    }
    const _Window_ActorCommand_update = Window_ActorCommand.prototype.update;
    Window_ActorCommand.prototype.update = function() {
        _Window_ActorCommand_update.apply(this, arguments);

        // Available Updates
        updateCan(this);
    };
    
    
    //==================================================
    //--  overhead processing
    //==================================================
    
    //- Creating a command list (adding processing)
    const _Window_ActorCommand_makeCommandList = Window_ActorCommand.prototype.makeCommandList;
    Window_ActorCommand.prototype.makeCommandList = function() {
        // 独自コマンドリストの作成
        if (!makeCommandListFree(this)) {
            _Window_ActorCommand_makeCommandList.apply(this);
        }
        // Opacity
        this.opacity = keke_windowOpacity;
        //Window resizing
        resizeWindow(this);
        // Cancel button relocation
        setTimeout(reposCancelButton, 0, this);
        // Window Re-Child
        rechildWindow(this);
    };
    
    
    
    //==================================================
    //-- Actor command free configuration
    //==================================================

    // Icon Number
    let iconIndex = 0;
    // Help Text
    let helpText = "";

    //- Creating a free command list
    function makeCommandListFree(windo) {
        if (!windo._actor) { return 0; }
        let addData = [];
        let delData = [];
        const actor = windo._actor;
        // Clear the command list
        windo.clearCommandList();
        // Removing the icon
        delIcon(windo);
        // Get command notes from the memo field
        let cmdNotes = bundleAllMeta_array(actor, ["コマンド", "cmd"], null, true);
        // Supporting multiple occupations
        if (actor._additionalClassIds) {
            actor._additionalClassIds.forEach(classId => {
                if (!classId) { return; }
                const classObje = $dataClasses[classId];
                if (!classObje) { return; }
                cmdNotes = [...cmdNotes, ...metaAll(classObje.note, ["コマンド", "command"]).map(e => e.replace(/\s/g, "")).filter(e => e)];
            });
        }
        // Set in command data
        cmdNotes.forEach(note => {
            const data = note.split(",");
            const type = data[0];
            const order = data[1] || 0;
            const name = data[2] ? data[2].replace(/\s/g, "") : "";
            const iconIndex = data[3] || 0;
            const helpName = data[4] ? data[4].replace(/\s/g, "") : "";
            let del = false;
            // Symbol Acquisition
            let symbol = "";
            if (type.includes("攻撃") || type.includes("attack")) { symbol = "attack"; }
            if (type.includes("防御") || type.includes("guard")) { symbol = "guard"; }
            if (type.includes("スキル") ||type.includes("skill")) { symbol = "skill"; }
            if (type.includes("アイテム") || type.includes("item")) { symbol = "item"; }
            if (type.includes("逃げる") || type.includes("escape")) { symbol = "escape"; }
            if (type.includes("オート") || type.includes("auto")) { symbol = "auto"; }
            // If no symbol exists, return
            if (!symbol) { return }
            // Skill type/individual skill acquisition
            let id = 1;
            if (symbol == "skill") {
                const tps = type.split("/");
                if (tps[1]) {
                    // Numbers are individual skills
                    if (tps[1].match(/\d+/)) {
                        symbol = "skillOne";
                        id = Number(tps[1]);
                    // If it's a word, it's a skill type.
                    } else {
                        id = $dataSystem.skillTypes.indexOf(tps[1]) || 1;
                        if (id < 1 || !existSkillOfSkillType(actor, id)) { return; }
                    }
                }
            }
            // Acquire individual items
            if (symbol == "item") {
                const tps = type.split("/");
                if (tps[1]) {
                    symbol = "itemOne";
                    id = Number(tps[1]);
                }
            }
            // Whether to erase
            del = type.startsWith("-") ? true : false;
            //Elimination Sets
            if (del) {
                delData.push({ symbol:symbol, id:id });
            // Additional set
            } else {
                addData.push({ symbol:symbol, id:id, name:name, order:order, iconIndex:iconIndex, helpName:helpName });
            }
        });
        // Sort additional data according to order
        addData.sort((a, b) => a.order - b.order);
        // Erase the data
        addData = addData.filter(add => {
            const dels = delData.filter(del => del.symbol == add.symbol && del.id == add.id);
            return !dels.length;
        });
        // Removed duplicate commands
        addData = delDeplicatedCommand(addData);
        // Generate command content from additional data
        addData.forEach(data => {
            iconIndex = data.iconIndex;
            // Get help text
            helpText = getHelpText(data);
            // Get command content from symbol
            switch (data.symbol) {
                case "attack":
                    windo.addCommand(data.name || TextManager.attack, "attack", actor.canAttack());
                    break;
                case "guard":
                    windo.addCommand(data.name || TextManager.guard, "guard", actor.canGuard());
                    break;
                case "skill":
                    windo.addCommand(data.name || $dataSystem.skillTypes[data.id], "skill", true, data.id);
                    break;
                case "skillOne":
                    const skill = $dataSkills[data.id];
                    //if (!helpText && skill && keke_showSkillHelp) { helpText = skill.description; }
                    windo.addCommand(data.name || skill.name, "skillOne", actor.canUse(skill), data.id);
                    break;
                case "item":
                    windo.addCommand(data.name || TextManager.item, "item");
                    break;
                case "itemOne":
                    const item = $dataItems[data.id];
                    //if (!helpText && item && keke_showSkillHelp) { helpText = item.description; }
                    windo.addCommand(data.name || item.name, "itemOne", actor.canUse(item), data.id);
                    break;
                case "escape":
                    windo.addCommand(data.name || TextManager.escape, "escape", BattleManager.canEscape());
                    break;
                case "auto":
                    windo.addCommand(data.name || keke_autoBattleWord, "auto");
                    break;
            }
            iconIndex = 0;
            helpText = "";
        });
        return addData.length;
    };

    //- Do you have a skill of that skill type?
    function existSkillOfSkillType(actor, stypeId) {
        const skills = actor.skills().filter(item => item && item.stypeId == stypeId);
        // スキルがひとつもないならコマンドinvalid
        return skills.length;
    };


    // Removed duplicate commands
    function delDeplicatedCommand(array) {
        return array.filter((data, i) => {
            return array.findIndex(d => d.symbol == data.symbol && d.id == data.id) == i;
        });
    };


    //- Get help text
    function getHelpText(data) {
        if (data.helpName || data.name) {
            const text = findHelpText([data.helpName, data.name], data );
            if (text) { return text;}
        }
        if (data.symbol == "attack") {
            const text = findHelpText(["攻撃", "attack"], data);
            if (text) { return text;}
        }
        if (data.symbol == "guard") {
            const text = findHelpText(["防御", "guard"], data);
            if (text) { return text;}
        }
        if (data.symbol == "skill") {
            const text = findHelpText([$dataSystem.skillTypes[data.id], "スキル", "skill"], data);
            if (text) { return text;}
        }
        if (data.symbol == "skillOne") {
            const text = getSkillHelp(data, "skill");
            if (text) { return text;}
        }
        if (data.symbol == "item") {
            const text = findHelpText(["アイテム", "item"], data);
            if (text) { return text;}
        }
        if (data.symbol == "itemOne") {
            const text = getSkillHelp(data, "item");
            if (text) { return text;}
        }
        if (data.symbol == "escape") {
            const text = findHelpText(["逃げる", "escape"], data);
            if (text) { return text;}
        }
        if (data.symbol == "auto") {
            const text = findHelpText(["オート", "auto"], data);
            if (text) { return text;}
        }
        return "";
    };


    //- Searching for Help Text
    function findHelpText(names, data) {
        for (let name of names) {
            for (let d of keke_helpList) {
                if (d["Help Name"] == name) {
                    // Icon also changed
                    if (d["Icon"] && !iconIndex) { iconIndex = d["Icon"]; }
                    return d["テキスト"];
                }
            }
        };
        return "";
    };


    //- Get Skill Help
    function getSkillHelp(data, cmdType) {
        const obje = cmdType == "skill" ? $dataSkills[data.id] : cmdType == "item" ? $dataItems[data.id] : null;
        if (obje) { return obje.description; }
        return "";
    };


    //- Adding a unique command Ext (adding processing)
    const _Window_ActorCommand_addCommand = Window_ActorCommand.prototype.addCommand;
    Window_ActorCommand.prototype.addCommand = function(name, symbol, enabled = true, ext = null) {
        _Window_ActorCommand_addCommand.apply(this, arguments);
        const last = this._list[this._list.length - 1];
        if (iconIndex) { last.iconIndex = iconIndex; }
        if (helpText) { last.helpText = helpText; }
    };


    //- Adding original commands (adding processes)
    const _Scene_Battle_createActorCommandWindow = Scene_Battle.prototype.createActorCommandWindow;
    Scene_Battle.prototype.createActorCommandWindow = function() {
        _Scene_Battle_createActorCommandWindow.apply(this);
        const acWindow = this._actorCommandWindow;
        // Individual Skills
        acWindow.setHandler("skillOne", commandSkillOne.bind(this));
        // Individual Items
        acWindow.setHandler("itemOne", commandItemOne.bind(this));
        // Escape
        acWindow.setHandler("escape", this.commandEscape.bind(this));
        // Autobattle
        acWindow.setHandler("auto", commandAutoBattle.bind(this));
    };
    
    
    //- Commands and Individual Skills
    function commandSkillOne() {
        const action = BattleManager.inputtingAction();
        if (!action || !action._item) { return; };
        const skillId = this._actorCommandWindow.currentExt();
        action.setSkill(skillId);
        this.onSelectAction();
    };
    
    
    //- Commands and individual items
    function commandItemOne() {
        const action = BattleManager.inputtingAction();
        if (!action || !action._item) { return; };
        const itemId = this._actorCommandWindow.currentExt();
        action.setItem(itemId);
        this.onSelectAction();
    };


    //- Available Updates
    function updateCan(windo) {
        if (windo._canUpdateWaitKe) { windo._canUpdateWaitKe--;  return;  }
        let changed = false;
        windo._list.forEach(data => {
            if (!data.symbol.match(/skillOne|itemOne/i) || !windo.actor()) { return; }
            const item = data.symbol.includes("item") ? $dataItems[data.ext] : $dataSkills[data.ext];
            const preEnabled = data.enabled;
            data.enabled = windo.actor().canUse(item);
            if (data.enabled != preEnabled) { changed = true; }
        });
        if (changed) { windo.paint(); }
        windo._canUpdateWaitKe = 30;
    };
    


    //==================================================
    //--  Actor Commands/Help
    //==================================================

    //- Help Update Call
    const _Window_ActorCommand_select = Window_ActorCommand.prototype.select;
    Window_ActorCommand.prototype.select = function(index) {
        updateHelp(this, index);
        return _Window_ActorCommand_select.apply(this, arguments)
    };


    //- Help Updates
    function updateHelp(windo, index) {
        if (!keke_showSkillHelp) { return; }
        const helpWindow = SceneManager._scene._helpWindow;
        if (!helpWindow) { return; }
        helpWindow.clear();
        helpWindow.hide();
        const currentData = index >= 0 ? windo._list[index] : null;
        if (!currentData) { return; }
        const helpText = currentData.helpText;
        if (!helpText) { return; }
        helpWindow.setText(helpText);
        helpWindow.show();
    };


    
    //==================================================
    //--  Icon drawing
    //==================================================

    //- Icon drawing call (processing addition)
    const _Window_ActorCommand_drawItem = Window_ActorCommand.prototype.drawItem;
    Window_ActorCommand.prototype.drawItem = function(index) {
        setTimeout(drawIcon, 0, this, index);
        _Window_ActorCommand_drawItem.apply(this, arguments);
    };
    
    
    //- Icon drawing
    function drawIcon(windo, index) {
        if (!keke_iconShow) { return; }
        const currentData = index >= 0 ? windo._list[index] : null;
        if (!currentData) { return; }
        const symbol = currentData.symbol;
        const id = currentData.ext;
        let iconIndex = currentData.iconIndex;
        const rect = windo.itemLineRect(index);
        const scene = SceneManager._scene;
        const wPad = $gameSystem.windowPadding();
        const attackId = windo._actor.attackSkillId();
        const guardId = windo._actor.guardSkillId();
        const iconW = ImageManager.iconWidth;
        const iconH = ImageManager.iconHeight;
        const isRight = keke_iconRel == "Right";
        // If there is a skill icon, acquire it
        if (symbol == "attack" && !iconIndex) { iconIndex = $dataSkills[attackId] ? $dataSkills[attackId].iconIndex : 0; }
        if (symbol == "guard" && !iconIndex) { iconIndex =  iconIndex = $dataSkills[guardId] ? $dataSkills[guardId].iconIndex : 0;; }
        if (symbol == "skillOne" && !iconIndex) { iconIndex = $dataSkills[id] ? $dataSkills[id].iconIndex : 0; }
        if (symbol == "itemOne" && !iconIndex) { iconIndex = $dataItems[id] ? $dataItems[id].iconIndex : 0; }
        // Icon drawing
        if (iconIndex) {
            // Sprite Formation
            const iconSprite = createIconSprite(iconIndex);
            scene.addChild(iconSprite);
            windo._iconSpritesKe.push(iconSprite);
            // expansion
            const iconTw = keke_iconSize; 
            const scale = iconTw / iconW;
            iconSprite.scale.x = scale;
            iconSprite.scale.y = scale
            //position
            iconSprite.x = windo.x + wPad + rect.x + (isRight ? rect.width + iconTw / 2 - keke_iconPosX :  - iconTw / 2 + keke_iconPosX);
            iconSprite.y = windo.y + wPad + rect.y + iconTw / 2 + (rect.height - iconTw * 0.75) / 2 + keke_iconPosY;
        }
    };
    
    
    //-Removing the icon
    function delIcon(windo) {
        if (!windo._iconSpritesKe.length) { return; }
        const scene = SceneManager._scene;
        windo._iconSpritesKe.forEach(sprite => scene.removeChild(sprite));
        windo._iconSpritesKe = []; 
    };
    
    
    //- Delete the icon when closing the window (added process)
    const _Window_ActorCommand_close = Window_ActorCommand.prototype.close;
    Window_ActorCommand.prototype.close = function() {
        _Window_ActorCommand_close.apply(this);
        // Removing the icon
        delIcon(this);
    };
    
    
    //- When a window is displayed, an icon is also displayed (additional processing)
    const _Window_ActorCommand_show = Window_ActorCommand.prototype.show;
    Window_ActorCommand.prototype.show = function() {
        _Window_ActorCommand_show.apply(this);
        this._iconSpritesKe.forEach(sprite => sprite.visible = true);
    };
    
    
    //-Delete the icon when closing the window (added process)
    const _Window_ActorCommand_hide = Window_ActorCommand.prototype.hide;
    Window_ActorCommand.prototype.hide = function() {
        _Window_ActorCommand_hide.apply(this);
        this._iconSpritesKe.forEach(sprite => sprite.visible = false);
    };
    
    
    
    //================================================== 
    //--  Actor Command Auto Stretch
    //==================================================
    
    //- Actor Command Auto Stretch
    function resizeWindow(windo) {
        // Return if not automatic stretch
        if (!keke_windowAutoResize) { return; }
        // Save base Y position
        if (windo._oriYKe == null) { windo._oriYKe = windo.y; }
        // Get number of commands
        let cmdNum = windo._list.length;
        // Height change
        windo.height = windo.fittingHeight(cmdNum) * 1;
        // Window bottom edge
        const downMax = windo._oriYKe + windo.fittingHeight(cmdNum);
        // Don't let it go off screen
        windo.y = windo._oriYKe;
        if (downMax > keke_windowResizeMax) { windo.y -= downMax - keke_windowResizeMax; }
    };
    
    
    //- Height expansion (additional processing)
    const _Scene_Battle_actorCommandWindowRect = Scene_Battle.prototype.actorCommandWindowRect;
    Scene_Battle.prototype.actorCommandWindowRect = function() {
        let result = _Scene_Battle_actorCommandWindowRect.apply(this);
        // Only during automatic stretching
        if (keke_windowAutoResize) { result.height = Graphics.height; }
        return result;
    };
    
    
    //- Cancel button relocation
    function reposCancelButton(windo) {
        const scene = SceneManager._scene;
        if (keke_cancelAutoRepos == "invalid") { return; }
        if (!scene._cancelButton) { return; }
        const button = scene._cancelButton;
        const pos = keke_cancelAutoRepos;
        if (pos == "Top") {
            button.x = windo.x;
            button.y = windo.y - button.height - 4;
        } else if (pos == "TopLeft") {
            // Placed in the top left
            posLeftUp(windo, button)
        } else if (pos == "TopRight") {
            // Placed at the top right
            posRightUp(windo, button)
        }
    };


    //- Placed in the top left
    function posLeftUp(windo, button) {
        // Do not display on the left side of the screen
        let leftMax = windo.x - button.width;
        if (leftMax < 0) {
            posRightUp(windo, button);
            return;
        }
        button.x = windo.x - button.width;
        button.y = windo.y;
    };


    //- Placed at the top right
    function posRightUp(windo, button) {
        // Do not display on the right edge of the screen
        let rightMax =  windo.x + windo.width + button.width;
        if (rightMax > Graphics.width) {
            posLeftUp(windo, button);
            return;
        }
        button.x = windo.x + windo.width
        button.y = windo.y;
    };


    //- Window Re-Child
    function rechildWindow(windo) {
        if (windo.parent) { windo.parent.addChild(windo); }
        const button = SceneManager._scene._cancelButton;
        if (button && button.parent) { button.parent.addChild(button); }
    };


    //Enemy character will not be determined while the cancel button is pressed (processing added)
    const _Scene_Battle_onEnemyOk = Scene_Battle.prototype.onEnemyOk;
    Scene_Battle.prototype.onEnemyOk = function() {
        const cancelButton = this._cancelButton;
        if (cancelButton && cancelButton._hovered) { return false; }
        _Scene_Battle_onEnemyOk.apply(this);
    };
    
    
    
    //==================================================
    //--  Auto-battle
    //==================================================
    
    //- Auto-battle flag (added processing)
    const _Game_BattlerBase_isAutoBattle = Game_BattlerBase.prototype.isAutoBattle;
    Game_BattlerBase.prototype.isAutoBattle = function() {
        let result = _Game_BattlerBase_isAutoBattle.apply(this);
        if (this._autoBattleKe) { result = true; }
        return result;
    };
    
    
    //- Command/Auto Battle
    function commandAutoBattle() {
        // Individual Flag On
        $gameParty.battleMembers().forEach(actor => {
            actor._autoBattleKe = true;
            actor.makeAutoBattleActions();
        });
        // All flags on
        this._inAutoBattleKe = true;
        // Close window
        this.closeCommandWindows();
        this.selectNextCommand();
    };
    
    
    //- Command/Auto Battle (Individual)
    function commandAutoBattleOne(scene) {
        // 個別フラグオン
        const actor = BattleManager.actor();
        // Individual Flag On
        if (!actor) { return; }
        actor._autoBattleKe = true;
        // All flags on
        scene._inAutoBattleKe = true;
        // Action Creation
        actor.makeAutoBattleActions();
        // Close window
        scene.closeCommandWindows();
        scene.selectNextCommand();
    };
    
    
    //- Disabling Auto-Battle
    function endAutoBattle(scene) {
        // Individual Flag Off
        $gameParty.battleMembers().forEach(actor => {
            actor._autoBattleKe = false;
        });
        // Global flag off
        scene._inAutoBattleKe = false;
    };
    
    
     // Cancel auto-battle (button)
    function endAutoBattleBtn(scene) {
        // Disabling Auto-Battle
        endAutoBattle(scene);
        // sound
        SoundManager.playCancel();
    };
    
    
    //- Auto Battle Update
    function updateAutoBattle(scene) {
        // During automatic battle, press the cancel button or touch the screen.
        if (scene._inAutoBattleKe && (Input.isTriggered("ok") || Input.isTriggered("cancel") || TouchInput.isTriggered())) {
            // Auto battle end
            endAutoBattleBtn(scene);
        }
    };
    
    
    //- Automatically cancel battle at the end of battle (processing added)
    const _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        _Scene_Battle_terminate.apply(this);
        endAutoBattle(this);
    };


    //==================================================
    //--  Party command disabled (additional processing)
    //==================================================
    
    const _Scene_Battle_changeInputWindow = Scene_Battle.prototype.changeInputWindow;
    Scene_Battle.prototype.changeInputWindow = function() {
        // If party command is disabled
        if (keke_noPartyCommand) {
            // When the current actor is empty
            if (BattleManager.isInputting() && !BattleManager.actor()) {
                // Set the next input-enabled actor
                for (const actor of $gameParty.battleMembers()) {
                    if (actor.canInput()) {
                        BattleManager._currentActor = actor;
                        break;
                    }
                }
                // インプット可アクターがいないならコマンド終了
                if (!BattleManager._currentActor) {
                    this.endCommandSelection();
                    return;
                }
            }
        }
        _Scene_Battle_changeInputWindow.apply(this);
    };
    
    
    
    //==================================================
    //--  Meta Arrays /Basic
    //==================================================
     
    // All Metas Combined - Array
    function bundleAllMeta_array(battler, words, action, includeSkill) {
        let data = null
        let array = [];
        // Battler Value
        data = battler._actorId ? battler.actor() : battler.enemy();
        if (data) { metaAll(data.note, words).forEach(e => array.push(e)); }
        if (battler._actorId) {
            // Class Value
            data = battler.currentClass();
            if (data) { metaAll(data.note, words).forEach(e => array.push(e)); }
            // Equipment Value
            battler._equips.forEach(equip => {
                data = equip.object();
                if (data) { metaAll(data.note, words).forEach(e => array.push(e)); }
            });
        }
        // State Value
        battler._states.forEach(stateId => {
            data = $dataStates[stateId];
            if (data) { metaAll(data.note, words).forEach(e => array.push(e)); }
        }, battler);
        // Action Value
        if (action) {
            data = action.item();
            if (data) { metaAll(data.note, words).forEach(e => array.push(e)); }
        }
        // skill
        if (keke_commandReferSkill && includeSkill) {
            const skills = battler.skills();
            skills.forEach(data => {
                metaAll(data.note, words).forEach(e => array.push(e));
            })
        }
        // Remove spaces
        array = array.map(e => e.replace(/\s/g, ""));
        // Empty elements are removed
        array = array.filter(e => e);
        return array;
    };
    
    
   //- All Acquired Meta
    function metaAll(note, words) {
        var result = [];
        words.forEach(word => {
            var regText = '\<' + word + ':([^\>]*)\>';
            var regExp_g = new RegExp(regText, 'gi');
            var regExp = new RegExp(regText, 'i');
            var matches = note.match(regExp_g);
            var match = null;
            if (matches) {
                matches.forEach(function(line) {
                    result.push(line.match(regExp)[1]);
                });
            }
        });
        return result;
    };
    
    
    
    //==================================================
    //--Icon Sprite /Basic
    //==================================================
    
    //- Icon sprite formation
    function createIconSprite(iconIndex, anchorX = 0.5, anchorY = 0.5) {
        const sprite = new SpriteKeVrac();
        sprite.anchor.x = anchorX;
        sprite.anchor.y = anchorY;
        const bitmap = ImageManager.loadSystem("IconSet");
        sprite.bitmap = bitmap;
        const pw = ImageManager.iconWidth;
        const ph = ImageManager.iconHeight;
        const sx = (iconIndex % 16) * pw;
        const sy = Math.floor(iconIndex / 16) * ph;
        sprite.setFrame(sx, sy, pw, ph);
        return sprite;
    };
    
})();