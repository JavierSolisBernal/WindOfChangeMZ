//=============================================================================
// RPG Maker MZ - Formation Scene
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Allows defining multiple named damage formulas as an array.
 * @author Squall_seawave
 * @version 0.1
 * @help
 * <fixed> if this it is it put an actor fixed in the position
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
    /*
    if (Utils.isNwjs()) {
        require('nw.gui').Window.get().showDevTools();
    }
    */
    __SS_SPGame_Partyinitialize = Game_Party.prototype.initialize

    //STARTING PARTY FROM DATABASE OR PARAMETER
    Game_Party.prototype.setupStartingMembers = function () {
        let remaining = $dataSystem.partyMembers.filter((member) => { return !starting_party.includes(member) })

        if (starting_party.length == 0) {
            this._actors = $dataSystem.partyMembers
            this._currentParty = $dataSystem.partyMembers.slice(0, SP)
        }
        else {
            this._actors = starting_party.filter(member => member != null).concat(remaining)
            this._currentParty = starting_party.slice(0, SP)
        }
        let temp = this._actors.filter(member => !this._currentParty.includes(member))

        temp.forEach((actorId) => {
            let actor = $gameActors.actor(actorId)
            if (actor) actor._fixed = false
            if (actor) actor._required = false
        })

        //this._currentParty = starting_party!=[]? starting_party:$dataSystem.partyMembers.slice(0,SP)
    };


    Game_Party.prototype.allMembers = function () {
        return this._actors.filter(id => id != null).map(id => $gameActors.actor(id));
        //return this._actors.map(id => $gameActors.actor(id));
    };

    Game_Party.prototype.allBattleMembers = function () {
        return this._currentParty.filter(id => id != null).map(id => $gameActors.actor(id));
        //return this.allMembers().slice(0, this.maxBattleMembers());
    };


    const SSMP_Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function (actorId) {
        SSMP_Game_Actor_setup.call(this, actorId);
        // Pull value from database meta
        const meta = this.actor().meta;
        this._required = meta?.required || false
        this._fixed = meta?.fixed || false
    }
    Game_Actor.prototype.setFixed = function (value) {
        this._fixed = value;
    };

    Game_Actor.prototype.setRequired = function (value) {
        this._required = value;
    };


    //==============================
    // Custom Scene: Scene_Formation
    //==============================

    // Step 1: Custom Base Scene
    function SS_Scene_MenuBase() {
        this.initialize(...arguments);
    }

    SS_Scene_MenuBase.prototype = Object.create(Scene_MenuBase.prototype);
    SS_Scene_MenuBase.prototype.constructor = SS_Scene_MenuBase;

    SS_Scene_MenuBase.prototype.logMessage = function (msg) {
        console.log("[SS_Scene_MenuBase] " + msg);
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

        this._menuWindow.setHandler("cancel", this.ProcessCancelMenu.bind(this));
        this._menuWindow.setHandler("ok", this.ProcessOkMenu.bind(this));

        this._partyWindow.setHandler("cancel", this.ProcessCancelParty.bind(this));
        this._partyWindow.setHandler("ok", this.ProcessOkParty.bind(this));



        this._reserveWindow.setHandler("cancel", this.ProcessCancelReserve.bind(this));
        this._reserveWindow.setHandler("ok", this.ProcessOkReserve.bind(this));

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


    }


    Scene_CustomFormation.prototype.ProcessOkReserve = function () {
        let partyindex = this._partyWindow.index()
        let index = this._reserveWindow.index()
        let reserveid = this._reserveWindow.commandSymbol(index)

        if (reserveid == null) {
            _currentParty[partyindex]=null
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


    }

    Scene_CustomFormation.prototype.ProcessCancelReserve = function () {
        this._reserveWindow.deactivate();
        this._reserveWindow.deselect();
        this._partyWindow.activate();
    }

    Scene_CustomFormation.prototype.ProcessCancelMenu = function () {
        this.ProcessEnd();
    }

    Scene_CustomFormation.prototype.ProcessCancelParty = function () {
        this._menuWindow.activate();
        this._partyWindow.deactivate();
        this._partyWindow.deselect();
        this._current_menu = null
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
        $gamePlayer.refresh()
        this.popScene();

    }


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

        // Optional: Draw some text or frame
        // this._backgroundWindow.drawText("Custom Scene Background", 0, 0, width, "center");
    };



    Scene_CustomFormation.prototype.createPartyWindow = function () {        // Full screen dimensions
        const width = Graphics.boxWidth - wm_size;
        const height = sizey;
        const rect = new Rectangle(0, 0, width, height);
        // The number of lines here is mostly ignored for large windows
        this._partyWindow = new Window_PartyCommand(rect);
        this._partyWindow.opacity = 255; // Semi-transparent background
        this._partyWindow.y = this.calcWindowHeight(1, true);
        this._partyWindow.x = wm_size
        this.addWindow(this._partyWindow);
        this._partyWindow.makeCommandList();

        this._partyWindow.refresh()
        // Optional: Draw some text or frame
        // this._backgroundWindow.drawText("Custom Scene Background", 0, 0, width, "center");
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


    Window_Selectable.prototype.updateOptionSprite = function (index, bitmap, filter) {
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


    Window_Selectable.prototype.updateOptionSpriteText = function (index, filter) {
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
                    filter.desaturate();
                }
                const blurFilter = new PIXI.filters.BlurFilter();
                this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
                this.updateOptionSprite(index, bitmap, filter);
                this.updateOptionSpriteText(index, null)
                //this.drawText(commandName, rect.x, y, rect.width, "center");


            }


        }

    };

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

    window.Scene_CustomFormation = Scene_CustomFormation;


})();