//=============================================================================
// RPG Maker MZ - Formation Scene
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Allows defining multiple named damage formulas as an array.
 * @author Squall_seawave
 * @version 0.1
 * @help
 * State Notetags:
 * <fixed> This put an actor fixed in current positionposition
 * Plugins commands:
 * SetFixedActor this fix an actor in a position in the party 
 * ReleaseFixedActor Release the fixed position
 * ChangeRequiredtoActor change if an actor is required or not, the position is not fixed.
 * 
 * @param size
 * @text Size of party
 * @type select
 * @option 3 Members
 * @value 3
 * @option 4 Members (Default)
 * @value 4
 * @option 5 Members
 * @value 5
 * @option 6 Members
 * @value 6
 * @default 4
 * 
 * @param StartParty
 * @text Actor id that start in the party
 * @desc Add the id of the actor to put in the starting party, 0 to put an empty space, 
 * the party will resize to the max party if the numbers are too high
 * @type number[]
 * @default []
 * 
 * @param iconlock
 * @text Id of the icon for required actors
 * @desc Add the id of the index of the icon  
 * @type number
 * @default 0
 * 
 * @param iconreserve
 * @text Id of the icon for reserved actors
 * @desc Add the id of the index of the icon  
 * @type number
 * @default 0
 * 
 * @param iconparty
 * @text Id of the icon for actors in party
 * @desc Add the id of the index of the icon  
 * @type number
 * @default 0
 * 
 * @param iconremove
 * @text Id of the icon for Remove option
 * @desc Add the id of the index of the icon  
 * @type number
 * @default 0
 * 
 * @command ChangeRequiredtoActor
 * @text Change required
 * @desc Change the status of the required actor
 *
 * @arg actorId
 * @type actor
 * @text Actor
 * @desc Select the actor you want to make required

 * @arg required
 * @type boolean
 * @on Yes
 * @off No
 * @text Required
 * @desc Change the flag to required
 * 
 * 
 * @command SetFixedActor
 * @text Set Fixed Position
 * @desc Set a position fixed for an actor
 * @arg actorId
 * @type actor
 * @text Actor
 * @desc Select the actor you want to fix
 * 
 * @arg position
 * @type number
 * @text Position
 * @default 1
 * @min 1
 * @max 6
 * @desc 
 * Select position of party
 * starting from 1...size of party
 * if it is bigger 
 * than size of party then the actor becomes unfixed
 *
 * @command ReleaseFixedActor
 * @text Release Fixed Position
 * @desc Make an actor not fixed
 * @arg actorId
 * @type actor
 * @text Actor
 * @desc Select the actor you want to fix
 */

(() => {

    const params = PluginManager.parameters("SS_FormationScene");
    //Get the size of party from parameter
    const SP = JSON.parse(params["size"] || 4);
    const starting_party = JSON.parse(params["StartParty"] || []).map((id) => { return parseInt(id) === 0 ? null : parseInt(id) });
    let _currentParty = Array(SP).fill(null);
    let _hidden = []
    const wm_size = 200
    const sizey = 200
    const iconIndex = JSON.parse(params["iconlock"] || 4);
    const iconreserve = JSON.parse(params["iconreserve"] || 4);
    const iconparty = JSON.parse(params["iconparty"] || 4);
    const iconremove = JSON.parse(params["iconremove"] || 4);

    if (Utils.isNwjs() && Utils.isOptionValid("test")) {
        const win = nw.Window.get();
        win.showDevTools();
    }
    PluginManager.registerCommand("SS_FormationScene", "ChangeRequiredtoActor", args => {
        const required = args.required == "true"; // convert to boolean
        const actorId = Number(args.actorId);
        const actor = $gameActors.actor(actorId)
        if (actor) actor.setRequired(required)
    });


    PluginManager.registerCommand("SS_FormationScene", "SetFixedActor", args => {
        const actorId = Number(args.actorId);
        const position = Number(args.position) - 1;

        const actor = $gameActors.actor(actorId)

        if (!actor) return
        if (position > SP || position < 0) { actor.setFixed(false) }
        else {

            const pos = $gameParty._currentParty.indexOf(actorId);

            if (pos >= 0) $gameParty._currentParty[pos] = null
            $gameParty._currentParty[position] = actorId
            $gamePlayer.refresh()
            _currentParty = [...$gameParty._currentParty]
            actor.setFixed(true)

        }


    });



    PluginManager.registerCommand("SS_FormationScene", "ReleaseFixedActor", args => {
        const actorId = Number(args.actorId);
        const actor = $gameActors.actor(actorId)
        if (actor) actor.setFixed(false)
    });


    __SS_SPGame_Partyinitialize = Game_Party.prototype.initialize

    Game_Party.prototype.setupStartingMembers = function () {
        let remaining = $dataSystem.partyMembers.filter((member) => { return !starting_party.includes(member) })

        //STARTING PARTY FROM PARAMETER OR DATABASE 
        if (starting_party.length == 0) {
            this._actors = $dataSystem.partyMembers
            this._currentParty = $dataSystem.partyMembers.slice(0, SP)
        }
        else {
            this._actors = starting_party.filter(member => member != null).concat(remaining)
            this._currentParty = starting_party.slice(0, SP)
        }
        let temp = this._actors.filter(member => !this._currentParty.includes(member))

        // IF THE ACTOR IS NOT IN PARTY REMOVE THE FIXED AND REQUIRED ATTRIBUTE
        temp.forEach((actorId) => {
            let actor = $gameActors.actor(actorId)
            if (actor) actor._fixed = false
            if (actor) actor._required = false
        })

    };

    //ALIAS OF PARTY METHODS
    ss_party_allMembers = Game_Party.prototype.allMembers
    Game_Party.prototype.allMembers = function () {
        ss_party_allMembers.call(this)
        return this._actors.filter(id => id != null).map(id => $gameActors.actor(id));
        //return this._actors.map(id => $gameActors.actor(id));
    };
    ss_party_allBattleMembers = Game_Party.prototype.allBattleMembers
    Game_Party.prototype.allBattleMembers = function () {
        ss_party_allBattleMembers.call(this)
        return this._currentParty.filter(id => id != null).map(id => $gameActors.actor(id));
        //return this.allMembers().slice(0, this.maxBattleMembers());
    };

    ss_party_maxBattleMembers = Game_Party.prototype.maxBattleMembers
    Game_Party.prototype.maxBattleMembers = function () {
        ss_party_maxBattleMembers.call(this)
        return SP

    };

    SS_Sprite_Actor_setActorHome = Sprite_Actor.prototype.setActorHome
    Sprite_Actor.prototype.setActorHome = function (index) {
        SS_Sprite_Actor_setActorHome.call(this, index)
        let size = SP > 4 ? -6 : 0
        let extra = (48 + size) * (SP - 4)
        this.setHome(600 + index * 32, 280 - extra + index * (48));
    };

    const _Game_Actor_actionStepForward = Game_Actor.prototype.actionStepForward;
    Game_Actor.prototype.actionStepForward = function () {
        const stepDistance = 50; // how far forward the actor moves (adjust)
        this._homeX += stepDistance;
        _Game_Actor_actionStepForward.call(this);
        this._homeX -= stepDistance; // reset to original home after step
    };





    //GET THE TAGS FROM ACTOR MEMO
    ss_party_Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function (actorId) {
        ss_party_Game_Actor_setup.call(this, actorId);
        // Pull value from database meta
        const meta = this.actor().meta;
        this._required = meta?.required || false
        this._fixed = meta?.fixed || false
    }

    //METHODS TO ADD PROPIETY TO ACTOR
    Game_Actor.prototype.setFixed = function (value) {
        this._fixed = value;
    };

    Game_Actor.prototype.setRequired = function (value) {
        this._required = value;
    };

    //SCENE BASE FOR REPLACEMENT OF SCENE
    function SS_Scene_MenuBase() {
        this.initialize(...arguments);
    }




    SS_Scene_MenuBase.prototype = Object.create(Scene_MenuBase.prototype);
    SS_Scene_MenuBase.prototype.constructor = SS_Scene_MenuBase;

    SS_Scene_MenuBase.prototype.logMessage = function (msg) {
        console.log("[SS_Scene_MenuBase] " + msg);
    };

    Scene_Menu.prototype.commandFormation = function () {
        SceneManager.push(Scene_CustomFormation);
    };


    const ss_Scene_Menu_start = Scene_Menu.prototype.start;
    Scene_Menu.prototype.start = function () {
        ss_Scene_Menu_start.call(this);
        if (Scene_Menu.prototype.needsMenuRefresh) {
            console.log('est')
            this._statusWindow.refresh();
            Scene_Menu.prototype.needsMenuRefresh = false;
        }
    };


    function Scene_CustomFormation() {
        this.initialize(...arguments);
    }

    function Window_PartyCommand() {
        this.initialize(...arguments);
    }

    function Window_ReserveCommand() {
        this.initialize(...arguments);
    }
    function Window_MenuCommand() {
        this.initialize(...arguments);
    }
    function Window_PartyStatus() {
        this.initialize(...arguments);
    }
    Scene_CustomFormation.prototype = Object.create(SS_Scene_MenuBase.prototype);
    Scene_CustomFormation.prototype.constructor = Scene_CustomFormation;

    Scene_CustomFormation.prototype.initialize = function () {
        SS_Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_CustomFormation.prototype.create = function () {
        _currentParty = [...$gameParty._currentParty]
        SS_Scene_MenuBase.prototype.create.call(this);
        this._current_menu = null
        this._selectedmember = null
        this.createPartyWindow();
        this.createHelpWindow();
        this.createReserveWindow()
        this.createMenuWindow()
        this.createStatusWindow()
        this._menuWindow.setHandler("cancel", this.ProcessCancelMenu.bind(this));
        this._menuWindow.setHandler("ok", this.ProcessOkMenu.bind(this));

        this._partyWindow.setHandler("cancel", this.ProcessCancelParty.bind(this));
        this._partyWindow.setHandler("ok", this.ProcessOkParty.bind(this));
        this._partyWindow.setHandler("cursorMove", this.onSelectionChange.bind(this));

        this._reserveWindow.setHandler("cancel", this.ProcessCancelReserve.bind(this));
        this._reserveWindow.setHandler("ok", this.ProcessOkReserve.bind(this));
        this._reserveWindow.setHandler("cursorMove", this.onSelectionChange.bind(this));

        this._reserveWindow.deselect();
        this._reserveWindow.deactivate();
        this._partyWindow.deselect();
        this._partyWindow.deactivate();

        this._partyWindow.refresh()
        this._reserveWindow.refresh()


    };



    Scene_CustomFormation.prototype.ProcessOkMenu = function () {
        index = this._menuWindow.index() || 0

        let command = this._menuWindow.commandName(index);
        this._current_menu = command

        if (["Change", "Remove"].includes(command)) {
            this._menuWindow.deactivate();
            this._partyWindow.activate();
            this._partyWindow.select(0);
            this.onSelectionChange()
        }
        if (command == "Revert") {
            _currentParty = [...$gameParty._currentParty]
            this._partyWindow.makeCommandList()
            this._reserveWindow.makeCommandList()
            this._partyWindow.refresh()
            this._reserveWindow.refresh()
            this._menuWindow.activate();
            this._partyWindow.deactivate();
            this._partyWindow.deselect;
        }
        if (command == "Finish") {
            this.ProcessEnd();
        }


    }

    Scene_CustomFormation.prototype.ProcessOkParty = function () {
        index = this._partyWindow.index()

        if (this._current_menu == "Remove") {
            _currentParty[index] = null
            this._partyWindow.makeCommandList()
            this._reserveWindow.makeCommandList()
            this._partyWindow.refresh()
            this._reserveWindow.refresh()
            this._partyWindow.activate();
        }


        if (this._current_menu == "Change") {
            this._selectedmember = _currentParty[index]
            this._reserveWindow.select(0);
            this._partyWindow.makeCommandList()
            this._reserveWindow.makeCommandList()
            this._partyWindow.refresh()
            this._reserveWindow.refresh()
            this._reserveWindow.activate();
            this._partyWindow.deactivate();
        }
        this.onSelectionChange()

    }


    Scene_CustomFormation.prototype.ProcessOkReserve = function () {
        let partyindex = this._partyWindow.index()
        let index = this._reserveWindow.index()
        let reserveid = this._reserveWindow.commandSymbol(index)

        if (reserveid == null) {
            _currentParty[partyindex] = null
        }
        else if (!_currentParty.includes(reserveid)) { _currentParty[partyindex] = reserveid }
        else {
            let temp_index = _currentParty.indexOf(reserveid)
            _currentParty[temp_index] = _currentParty[partyindex]
            _currentParty[partyindex] = reserveid

        }

        this._partyWindow.makeCommandList()
        this._reserveWindow.makeCommandList()
        this._partyWindow.refresh()
        this._reserveWindow.refresh()
        this._reserveWindow.activate();
        this._partyWindow.deactivate();
        this.onSelectionChange()


    }

    Scene_CustomFormation.prototype.ProcessCancelReserve = function () {
        this._reserveWindow.deactivate();
        this._reserveWindow.deselect();
        this._partyWindow.activate();
        this.onSelectionChange()
    }

    Scene_CustomFormation.prototype.ProcessCancelMenu = function () {
        this.ProcessEnd();
    }

    Scene_CustomFormation.prototype.ProcessCancelParty = function () {
        this._menuWindow.activate();
        this._partyWindow.deactivate();
        this._partyWindow.deselect();
        this._current_menu = null
        this.onSelectionChange()

    }



    Scene_CustomFormation.prototype.ProcessEnd = function () {
        test = _currentParty.filter(member => member != null)
        if (test.length === 0) {
            this._menuWindow.activate();
            SoundManager.playBuzzer();
            return
        }

        let reserve = $gameParty.allMembers().filter(member => !_currentParty.includes(member._actorId))

        reserve = reserve.filter(member => member._required)
        if (reserve.length > 0) {
            this._menuWindow.activate();
            SoundManager.playBuzzer();
            return
        }


        $gameParty._currentParty = [..._currentParty]

        reserve = $gameParty._actors.filter(member => !_currentParty.includes(member))
        let party = _currentParty.filter(member => member != null)
        $gameParty._actors = party.concat(reserve)
        $gamePlayer.refresh()
        this.popScene();

    }

    Scene_CustomFormation.prototype.onSelectionChange = function () {
        let index = -1
        let actor = -1
        if (this._reserveWindow.active) {
            index = this._reserveWindow.index();
            actor = this._reserveWindow.commandSymbol(index)
        }
        if (this._partyWindow.active) {
            index = this._partyWindow.index();
            actor = this._partyWindow.commandSymbol(index)
        }

        this._statusWindow.setItem(actor);
        this._statusWindow.refresh()

    }



    Scene_CustomFormation.prototype.terminate = function () {
        // Custom behavior
        Scene_Menu.prototype.needsMenuRefresh = true;
        // Cleanup the base scene stuff
        Scene_Base.prototype.terminate.call(this);
    };
    Scene_CustomFormation.prototype.createHelpWindow = function () {
        const x = 0;
        const y = 0;
        const width = Graphics.boxWidth - 0; // leave some padding
        const height = this.calcWindowHeight(1, true);

        const rect = new Rectangle(x, y, width, height);

        this._helpWindow = new Window_Help(rect);
        this._helpWindow.width = width;
        this._helpWindow.height = height;
        this.addWindow(this._helpWindow);
        this._helpWindow.setText("Party System");
    };


    Scene_CustomFormation.prototype.createMenuWindow = function () {        // Full screen dimensions 
        const width = wm_size;
        const height = sizey;
        const rect = new Rectangle(0, 0, width, height);
        // The number of lines here is mostly ignored for large windows
        this._menuWindow = new Window_MenuCommand(rect);
        this._menuWindow.opacity = 255; // Semi-transparent background
        this._menuWindow.y = this.calcWindowHeight(1, true);
        this.addWindow(this._menuWindow);
        this._menuWindow.makeCommandList();
        this._menuWindow.refresh()

    };



    Scene_CustomFormation.prototype.createPartyWindow = function () {        // Full screen dimensions
        const width = Graphics.boxWidth - wm_size;
        const height = sizey;
        const rect = new Rectangle(0, 0, width, height);
        this._partyWindow = new Window_PartyCommand(rect);
        this._partyWindow.opacity = 255; // Semi-transparent background
        this._partyWindow.y = this.calcWindowHeight(1, true);
        this._partyWindow.x = wm_size
        this.addWindow(this._partyWindow);
        this._partyWindow.makeCommandList();

        this._partyWindow.refresh()

    };




    Scene_CustomFormation.prototype.createReserveWindow = function () {        // Full screen dimensions
        const width = wm_size;
        const height = Graphics.boxHeight - (sizey + this.calcWindowHeight(1, true));
        const rect = new Rectangle(0, 0, width, height);
        this._reserveWindow = new Window_ReserveCommand(rect);
        this._reserveWindow.opacity = 255;
        this._reserveWindow.y = (sizey + this.calcWindowHeight(1, true))
        this.addWindow(this._reserveWindow);
        this._reserveWindow.makeCommandList();

        this._reserveWindow.refresh()

    };



    Scene_CustomFormation.prototype.createStatusWindow = function () {        // Full screen dimensions
        const width = Graphics.boxWidth - wm_size;
        const height = Graphics.boxHeight - (sizey + this.calcWindowHeight(1, true));
        const rect = new Rectangle(0, 0, width, height);
        // The number of lines here is mostly ignored for large windows
        this._statusWindow = new Window_PartyStatus(rect);
        this._statusWindow.opacity = 255; // Semi-transparent background
        this._statusWindow.y = (sizey + this.calcWindowHeight(1, true))
        this._statusWindow.x = wm_size
        this.addWindow(this._statusWindow);
        this._statusWindow.refresh()

    };

    const _Scene_CustomFormation = Scene_CustomFormation.prototype.start;
    Scene_CustomFormation.prototype.start = function () {
        _Scene_CustomFormation.call(this);
        if (this._partyWindow) {
            this._partyWindow.makeCommandList();
            this._partyWindow.refresh();
        }
    };



    Window_PartyCommand.prototype = Object.create(Window_Command.prototype);
    Window_PartyCommand.prototype.constructor = Window_PartyCommand;

    Window_PartyCommand.prototype.initialize = function (rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._optionSprites = {};
        this._optionSprites_text = {};
        this.refresh();
    };

    Window_PartyCommand.prototype.itemHeight = function () {
        if (SP == 3) return 172
        return Math.floor(576 / SP);
    };

    Window_PartyCommand.prototype.itemWidth = function () {
        return this.itemHeight()
    };

    Window_PartyCommand.prototype.maxCols = function () {
        return SP;
    };

    Window_PartyCommand.prototype.maxItems = function () {
        return SP;
    };

    Window_PartyCommand.prototype.colSpacing = function () {
        return 8;
    };


    Window_PartyCommand.prototype.updateOptionSprite = function (index, bitmap, filter) {
        const rect = this.itemRect(index);
        let idx = actor.faceIndex()
        const sx = (idx % 4) * 144;
        const sy = Math.floor(idx / 4) * 144;
        // Remove old sprite if exists
        if (this._optionSprites[index]) {
            this.removeChild(this._optionSprites[index]);
            this._optionSprites[index].bitmap.destroy();
            delete this._optionSprites[index];
        }
        const padding = this.padding; // usually 18



        // Create new sprite
        const sprite = new Sprite(new Bitmap(rect.width, rect.height));
        sprite.x = rect.x + padding;
        sprite.y = rect.y + padding;

        // Draw the bitmap (e.g., a face or background)
        if (bitmap) {
            sprite.bitmap.blt(
                bitmap,
                sx, sy, 144, 144, // source region size stays 144×144
                0, 0, rect.width, rect.height //rectangle region
            );


        }

        // Apply PIXI filter if provided
        if (filter) {
            sprite.filters = [filter];
        }

        //this.addChild(sprite);
        this.addChild(sprite);
        this._optionSprites[index] = sprite;
    };


    Window_PartyCommand.prototype.updateOptionSpriteText = function (index, filter) {
        const rect = this.itemRect(index);
        let commandName = this.commandName(index);
        const ext = this.commandExt(index)
        // Remove old sprite if exists
        if (this._optionSprites_text[index]) {
            this.removeChild(this._optionSprites_text[index]);
            this._optionSprites_text[index].bitmap.destroy();
            delete this._optionSprites_text[index];
        }
        const padding = this.padding; // usually 18

        // Create new sprite
        const sprite = new Sprite(new Bitmap(rect.width, rect.height));
        sprite.x = rect.x + padding;
        sprite.y = rect.y + padding;

        sprite.bitmap.fontFace = this.contents.fontFace;
        sprite.bitmap.fontSize = this.contents.fontSize;
        sprite.bitmap.textColor = this.contents.textColor; // optional
        sprite.bitmap.outlineColor = this.contents.outlineColor;
        sprite.bitmap.outlineWidth = this.contents.outlineWidth;
        sprite.bitmap.drawText(commandName, 0, rect.height / 2 - padding, rect.width, rect.height, "center");

        const iconset = ImageManager.loadSystem("IconSet");
        // Each icon is 32×32 in MZ
        const iconWidth = 32;
        const iconHeight = 32;

        const sx = (iconIndex % 16) * iconWidth;
        const sy = Math.floor(iconIndex / 16) * iconHeight;

        let actor = $gameActors.actor(ext);

        if (actor?._required) {
            sprite.bitmap.blt(
                iconset,
                sx, sy, iconWidth, iconHeight,
                rect.width - iconWidth, 0
            );
        }



        // Apply PIXI filter if provided
        if (filter) {
            sprite.filters = [filter];
        }

        //this.addChild(sprite);
        this.addChild(sprite);
        this._optionSprites_text[index] = sprite;
    };


    Window_PartyCommand.prototype.makeCommandList = function () {
        this.clearCommandList();
        let empty = Array(SP).fill(null)
        let test = _currentParty.concat(empty)
        test = test.slice(0, SP)

        test.forEach((element, index) => {
            actor = $gameActors.actor(element);
            let name = actor ? actor.name() : "Empty"

            this.addCommand(name, element, !(actor?._fixed || false), element);
        });
    }


    Window_PartyCommand.prototype.itemRect = function (index) {

        const rect = Window_Selectable.prototype.itemRect.call(this, index);

        // Compute total height of content
        const rows = Math.ceil(this.maxItems() / this.maxCols());
        const totalHeight = rows * this.itemHeight();

        // Find vertical offset to center everything
        const offsetY = (this.innerHeight - totalHeight) / 2;

        // Apply offset
        rect.y += offsetY;

        return rect;
    };



    Window_PartyCommand.prototype.drawItem = function (index) {
        const rect = this.itemRect(index);
        let commandName = this.commandName(index);
        let y = rect.y + rect.height - this.lineHeight() / 2;

        const command = this.commandSymbol(index)
        const ext = this.commandExt(index)
        let bitmap = undefined
        let idx = undefined


        this.changeTextColor(ColorManager.normalColor())
        if (commandName == "Empty") {
            y = y / 2
            this.changeTextColor(ColorManager.textColor(4))
            commandName = "- " + commandName + " -"
            this.drawText(commandName, rect.x, y, rect.width, "center");
            if (this._optionSprites_text[index]) {
                this.removeChild(this._optionSprites_text[index]);
                this._optionSprites_text[index].bitmap.destroy();
                delete this._optionSprites_text[index];
            }
            if (this._optionSprites[index]) {
                this.removeChild(this._optionSprites[index]);
                this._optionSprites[index].bitmap.destroy();
                delete this._optionSprites[index];
            }

        } else {
            actor = $gameActors.actor(ext);
            let face = actor.faceName()
            idx = actor.faceIndex()
            bitmap = ImageManager.loadFace(face);

            const sx = (idx % 4) * 144;
            const sy = Math.floor(idx / 4) * 144;





            if (bitmap) {
                const filter = new PIXI.filters.ColorMatrixFilter();
                if (actor._fixed) {
                    //filter.desaturate();
                    filter.greyscale(0.2);
                }
                const blurFilter = new PIXI.filters.BlurFilter();
                this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
                this.updateOptionSprite(index, bitmap, filter);
                this.updateOptionSpriteText(index, null)
                //this.drawText(commandName, rect.x, y, rect.width, "center");


            }


        }

    };

    Window_PartyCommand.prototype.cursorRight = function (wrap) {
        Window_Command.prototype.cursorRight.call(this, wrap);
        this.callHandler("cursorMove");
    }
    Window_PartyCommand.prototype.cursorLeft = function (wrap) {
        Window_Command.prototype.cursorLeft.call(this, wrap);
        this.callHandler("cursorMove");
    }

    Window_Command.prototype.commandExt = function (index) {
        return this._list?.[index]?.ext;
    };

    Window_ReserveCommand.prototype = Object.create(Window_Command.prototype);
    Window_ReserveCommand.prototype.constructor = Window_ReserveCommand;



    Window_ReserveCommand.prototype.makeCommandList = function () {
        this.clearCommandList();

        let reserve = $gameParty._actors.filter(member => !_currentParty.includes(member))
        let party = _currentParty.filter(member => member != null)
        let test = party.concat(reserve)

        this.addCommand("Remove", null, true, null);
        test.forEach((element, index) => {
            element = $gameActors.actor(element);
            this.addCommand(element?.name(), element?._actorId, !(element?._fixed || false), element);
        });



    }


    Window_ReserveCommand.prototype.drawItem = function (index) {
        const rect = this.itemRect(index);
        const commandName = this.commandName(index);
        const command = this.commandSymbol(index)


        const y = rect.y

        //let party = $gameParty.allMembers().filter(member => _currentParty.includes(member._actorId))
        if (command == null)
            this.changeTextColor(ColorManager.textColor(2))
        else if (_currentParty.includes(command))
            this.changeTextColor(ColorManager.textColor(6))
        else
            this.changeTextColor(ColorManager.normalColor())
        //this.drawText(commandName, rect.x, y, rect.width, "left");
        this.drawReserveName(index, rect.x, y, rect.width);
    };

    Window_ReserveCommand.prototype.commandExt = function (index) {
        return this._list?.[index]?.ext;
    };


    Window_ReserveCommand.prototype.cursorDown = function (wrap) {
        Window_Command.prototype.cursorDown.call(this, wrap);
        this.callHandler("cursorMove");
    }
    Window_ReserveCommand.prototype.cursorUp = function (wrap) {
        Window_Command.prototype.cursorUp.call(this, wrap);
        this.callHandler("cursorMove");
    }

    Window_Base.prototype.drawReserveName = function (index, x, y, width) {
        const name = this.commandName(index);
        const command = this.commandSymbol(index)
        const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
        const delta = ImageManager.standardIconWidth - ImageManager.iconWidth;
        const textMargin = ImageManager.standardIconWidth + 4;
        const itemWidth = Math.max(0, width - textMargin)
        let icon = !_currentParty.filter(member => member != null).includes(command) ? iconparty : iconreserve
        if (name == "Remove") icon = iconremove
        this.drawIcon(icon, x + delta / 2, iconY);
        this.drawText(name, x + textMargin, y, itemWidth);
        actor = $gameActors.actor(command)

        if (actor?._required)
            this.drawIcon(iconIndex, width - textMargin, iconY);

    };


    Window_MenuCommand.prototype = Object.create(Window_Command.prototype);
    Window_MenuCommand.prototype.constructor = Window_MenuCommand;
    Window_MenuCommand.prototype.makeCommandList = function () {
        this.clearCommandList();
        this.addCommand("Change", "change", true);
        this.addCommand("Remove", "remove", true);
        this.addCommand("Revert", "revert", true);
        this.addCommand("Finish", "finish", true);
    }

    Window_MenuCommand.prototype.processCancel = function () {
        if (this.isCancelEnabled()) {
            this.updateInputData();
            this.callCancelHandler();
        }
    };



    Window_PartyStatus.prototype = Object.create(Window_StatusBase.prototype);
    Window_PartyStatus.prototype.constructor = Window_PartyStatus;
    Window_PartyStatus.prototype.initialize = function (rect) {

        Window_StatusBase.prototype.initialize.call(this, rect)
        this._itemIndex = -1;
    }

    Window_PartyStatus.prototype.setItem = function (index) {
        if (this._itemIndex !== index) {
            this._itemIndex = index;
            this.refresh();
        }
    }

    Window_PartyStatus.prototype.refresh = function () {
        this.contents.clear();
        this.hideAdditionalSprites();
        const actor = $gameActors.actor(this._itemIndex);
        const rect = this.innerRect;
        const x = rect.x;
        const y = rect.y;
        const width = rect.width;
        const bottom = y + rect.height;

        if (this._itemIndex == -1) return

        if (actor) {
            // 1. Actor Face (same size as menu)
            this.drawActorFace(actor, x + 2, y + 2, 144, 144);

            // 2. Actor Name
            this.drawActorName(actor, x + 160, y);

            // 3. Actor Level
            this.drawActorLevel(actor, x + 160, y + 36);

            // 4. HP / MP / TP Gauges (same layout as menu)
            this.placeBasicGauges(actor, x + 160, y + 72);

            // 5. Class and icons (like menu)
            this.drawActorClass(actor, x + 160, y + 150);
            const index=32*3
            this.drawActorIcons(actor, x + 160, bottom - 32-index, width);
            this.drawEquipmentBlock(actor, x + 300, y);
        }
        else {
            this.changeTextColor(ColorManager.textColor(4))
            this.drawText("--EMPTY--", rect.x, rect.height / 2, rect.width, "center");
            this.changeTextColor(ColorManager.normalColor())
            this.hideAdditionalSprites();
        }
    }


    Window_PartyStatus.prototype.placeBasicGauges = function (actor, x, y) {
        this.placeGauge(actor, "hp", x, y);
        this.placeGauge(actor, "mp", x, y + this.gaugeLineHeight());
        if ($dataSystem.optDisplayTp) {
            this.placeGauge(actor, "tp", x, y + this.gaugeLineHeight() * 2);
        }
    };

    Window_PartyStatus.prototype.drawEquipmentBlock = function (actor, x, y) {
        const equips = actor.equips();
        const slots = actor.equipSlots();

        const lineHeight = this.lineHeight();

        this.changeTextColor(ColorManager.systemColor());
        this.drawText("Equipment", x, y, 200);
        this.resetTextColor();

        let dy = y + lineHeight + 4;

        for (let i = 0; i < slots.length; i++) {
            const slotName = $dataSystem.equipTypes[slots[i]];
            const item = equips[i];

            // Slot name (like in Equip scene)
            this.changeTextColor(ColorManager.systemColor());
            this.drawText(slotName + ":", x, dy, 100);

            // Item name (gray if empty)
            this.resetTextColor();
            const name = item ? item.name : "-";
            this.drawText(name, x + 110, dy, 280);

            dy += lineHeight;
        }
    }



    window.Scene_CustomFormation = Scene_CustomFormation;


})();