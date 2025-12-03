//=============================================================================
// RPG Maker MZ - Formation Scene
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Allows defining multiple named damage formulas as an array.
 * @author Squall_seawave
 * @version 0.1
 * @help
 * Each entry contains:
 * name:   The function name
 * params: Parameter list separated by commas
 * code:   JavaScript code to run
 * @param size
 * @text Size of party
 * @type number
 * @default 4
 * 
 * @param StartParty
 * @text Actor that start in the party
 * @desc List of actor IDs
 * @type number[]
 * @default []
 * 
 */

(() => {

    const params = PluginManager.parameters("SS_FormationScene");
    //Get the size of party from parameter
    const SP = JSON.parse(params["size"] || 4);
    const starting_party = JSON.parse(params["StartParty"] || []).map((id) => { return parseInt(id) === 0 ? null: parseInt(id) });
    let _currentParty = Array(SP).fill(null);
    let _hidden = []
    const wm_size = 200
    const sizey = 200
    /*
    if (Utils.isNwjs()) {
        require('nw.gui').Window.get().showDevTools();
    }
    */
    __SS_SPGame_Partyinitialize = Game_Party.prototype.initialize

    //STARTING PARTY from database or parameters
    Game_Party.prototype.setupStartingMembers = function () {
        let remaining = $dataSystem.partyMembers.filter((member) => { return !starting_party.includes(member) })

        if (starting_party.length == 0) {
            this._actors = $dataSystem.partyMembers
            this._currentParty = $dataSystem.partyMembers.slice(0, SP)
        }
        else {
            this._actors = starting_party.concat(remaining)
            this._currentParty = starting_party
        }
         //this._currentParty = starting_party!=[]? starting_party:$dataSystem.partyMembers.slice(0,SP)
    };


    Game_Party.prototype.allMembers = function() {
    return this._actors.filter(id => id != null).map(id => $gameActors.actor(id));
    };

    Game_Party.prototype.allBattleMembers = function () {
        return this._currentParty.filter(id => id != null).map(id => $gameActors.actor(id));
        //return this.allMembers().slice(0, this.maxBattleMembers());
    };



    Game_Actor.prototype.fixed = function () {
        if (this._fixed === undefined) 
        this._fixed = this.actor().meta.fixed? true:false;
        this._partyindex=this.actor().meta.fixed
        return this._fixed;
    };

    Game_Actor.prototype.setFixed = function (value) {
        this._fixed = value;
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

    function WindowBackground() {
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
        _currentParty = $gameParty._currentParty
        SS_Scene_MenuBase.prototype.create.call(this);
        this.createPartyWindow();
        this.createHelpWindow();
        this.createReserveWindow()
        this.createMenuWindow()

        this._menuWindow.setHandler("cancel", this.ProcessCancelMenu.bind(this));
        this._menuWindow.setHandler("ok", this.ProcessOkMenu.bind(this));

        this._partyWindow.setHandler("cancel", this.ProcessCancelParty.bind(this));
        this._partyWindow.setHandler("ok", this.ProcessOkParty.bind(this));


        this._reserveWindow.deselect();
        this._reserveWindow.deactivate();
        this._partyWindow.deselect();
        this._partyWindow.deactivate();

        this._partyWindow.refresh()
        this._reserveWindow.refresh()


    };


    /*
    Scene_CustomFormation.prototype.update = function () {
        SS_Scene_MenuBase.prototype.update.call(this);    
    };

        */
    Scene_CustomFormation.prototype.ProcessOkMenu = function () {
        index = this._menuWindow.index() || 0
        let command = this._menuWindow.commandName(index);

        if (["Change", "Remove"].includes(command)) {
            this._menuWindow.deactivate();
            this._partyWindow.activate();
            this._partyWindow.select(0);
        }
        if (command == "Revert") {
            this._menuWindow.activate();
            this._partyWindow.deactivate();
            this._partyWindow.deselect;
        }
        if (command == "Finish") {
            this.popScene();
        }


    }

    Scene_CustomFormation.prototype.ProcessOkParty = function () {
        this._menuWindow.activate();
        this._partyWindow.deactivate();
        this._partyWindow.deselect();
    }

    Scene_CustomFormation.prototype.ProcessCancelMenu = function () {
        this.popScene();
    }

    Scene_CustomFormation.prototype.ProcessCancelParty = function () {
        this._menuWindow.activate();
        this._partyWindow.deactivate();
        this._partyWindow.deselect();
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
        // The number of lines here is mostly ignored for large windows
        this._reserveWindow = new Window_ReserveCommand(rect);
        this._reserveWindow.opacity = 255; // Semi-transparent background
        this._reserveWindow.y = (sizey + this.calcWindowHeight(1, true))
        this.addWindow(this._reserveWindow);
        this._reserveWindow.makeCommandList();

        this._reserveWindow.refresh()
        // Optional: Draw some text or frame
        // this._backgroundWindow.drawText("Custom Scene Background", 0, 0, width, "center");
    };



    const _Scene_CustomFormation = Scene_CustomFormation.prototype.start;
    Scene_CustomFormation.prototype.start = function () {
        _Scene_CustomFormation.call(this);
        if (this._partyWindow) {
            this._partyWindow.makeCommandList(); // ensure commands exist
            this._partyWindow.refresh();         // draw items now that data is loaded
        }
    };


  

    Window_PartyCommand.prototype = Object.create(Window_Command.prototype);
    Window_PartyCommand.prototype.constructor = Window_PartyCommand;

    Window_PartyCommand.prototype.initialize = function (rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this._scrollIndex = 0; 
        this.refresh();
    };

     Window_PartyCommand.prototype.maxVisibleItems = function () {
        return 4
    };

    Window_PartyCommand.prototype.maxItems = function () {
        return SP
    };
    Window_PartyCommand.prototype.maxCols = function () {
        return SP
    };
 
     Window_PartyCommand.prototype.maxRows = function () {
        return 1
    };

    // Adjust width of each command box
    Window_PartyCommand.prototype.itemWidth = function () {
        return 144;
    }

    Window_PartyCommand.prototype.itemHeight = function () {
        return 144;
    }
     Window_PartyCommand.prototype.spacing = function (){
        return 10; // Space between items
    }
    Window_PartyCommand.prototype.drawItemBackground = function (index) {
        const rect = this.itemRect(index);
        const name = this.commandName(index)
        const command = this.commandSymbol(index)
        const ext = this.commandExt(index)
        let bitmap = undefined
        let idx = undefined


        if (ext) {
            actor = $gameActors.actor(ext);
            let face = actor.faceName()
            idx = actor.faceIndex()
            bitmap = ImageManager.loadFace(face);

        }
        else {
            bitmap = ImageManager.loadFace("evil");
            idx = Number(1);
        }
        const sx = (idx % 4) * 144;
        const sy = Math.floor(idx / 4) * 144;

        if (!bitmap) return
        this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
        this.contents.blt(
            bitmap,
            sx, sy, 144, 144,
            rect.x + (rect.width - 144) / 2,
            rect.y
        );


    };

    Window_PartyCommand.prototype.makeCommandList = function () {
        this.clearCommandList();
        let empty=Array(SP).fill(null)
        let test = _currentParty.concat(empty)
        test = test.slice(0, SP)

        test.forEach((element, index) => {
            actor = $gameActors.actor(element);
            let name = actor ? actor.name() : "Empty"
            this.addCommand(name, element, true, element);
        });



    }

    Window_PartyCommand.prototype.drawAllItems = function () {
        const topIndex = this.topIndex();
        for (let i = 0; i < this.maxVisibleItems(); i++) {
            const index = topIndex + i;
            if (index < this.maxItems()) {
                this.drawItemBackground(index);
                this.drawItem(index);
            }
        }
    };

    Window_PartyCommand.prototype.drawItem = function (index) {
        const rect = this.itemRect(index);
        const commandName = this.commandName(index);
        const y = rect.y + rect.height - this.lineHeight() / 2;

        this.drawText(commandName, rect.x, y, rect.width, "center");
    };

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


    /*
    Window_PartyCommand.prototype.createArrows = function () {
        // Do nothing → no arrows created
    };

    Window_PartyCommand.prototype.updateArrows = function () {
        // Prevent the engine from toggling arrow visibility
    };
    */
    Window_Command.prototype.commandExt = function (index) {
        return this._list?.[index]?.ext;
    };

    Window_ReserveCommand.prototype = Object.create(Window_Command.prototype);
    Window_ReserveCommand.prototype.constructor = Window_ReserveCommand;



    Window_ReserveCommand.prototype.makeCommandList = function () {
        this.clearCommandList();

        let reserve = $gameParty.allMembers().filter(member => !_currentParty.includes(member._actorId))
        let party = $gameParty.allMembers().filter(member => _currentParty.includes(member._actorId))
        test = party.concat(reserve)
        test.forEach((element, index) => {
            this.addCommand(element?.name(), element._actorId, true, element);
        });



    }


    Window_ReserveCommand.prototype.drawItem = function (index) {
        const rect = this.itemRect(index);
        const commandName = this.commandName(index);
        const command = this.commandSymbol(index)

        const ext = this.commandName(index);
        const y = rect.y

        //let party = $gameParty.allMembers().filter(member => _currentParty.includes(member._actorId))
        if (_currentParty.includes(command))
            this.changeTextColor(ColorManager.textColor(6))
        else
            this.changeTextColor(ColorManager.normalColor())
        //this.drawText(commandName, rect.x, y, rect.width, "left");
        this.drawReserveName(commandName, rect.x, y, rect.width);
    };

    Window_ReserveCommand.prototype.commandExt = function (index) {
        return this._list?.[index]?.ext;
    };


    Window_Base.prototype.drawReserveName = function (actor, x, y, width) {

        const iconY = y + (this.lineHeight() - ImageManager.iconHeight) / 2;
        const delta = ImageManager.standardIconWidth - ImageManager.iconWidth;
        const textMargin = ImageManager.standardIconWidth + 4;
        const itemWidth = Math.max(0, width - textMargin);
        this.drawIcon(3, x + delta / 2, iconY);
        this.drawText(actor, x + textMargin, y, itemWidth);
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



    window.Scene_CustomFormation = Scene_CustomFormation;


})();