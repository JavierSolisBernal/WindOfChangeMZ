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
 */

(() => {

    const params = PluginManager.parameters("SS_FormationScene");
    //Get the size of party from parameter
    const SP = JSON.parse(params["size"] || 4);

    if (Utils.isNwjs()) {
        require('nw.gui').Window.get().showDevTools();
    }

    __SS_SPGame_Partyinitialize = Game_Party.prototype.initialize
    Game_Party.prototype.initialize = function () {
        this._currentParty = $dataSystem.partyMembers.slice(0, SP)
        __SS_SPGame_Partyinitialize.call(this)


        Game_Party.prototype.allBattleMembers = function () {
            return this._currentParty.map(id => $gameActors.actor(id));
            //return this.allMembers().slice(0, this.maxBattleMembers());
        };
    }

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

    function Window_FaceCommand() {
        this.initialize(...arguments);
    }

    Scene_CustomFormation.prototype = Object.create(SS_Scene_MenuBase.prototype);
    Scene_CustomFormation.prototype.constructor = Scene_CustomFormation;

    Scene_CustomFormation.prototype.initialize = function () {
        SS_Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_CustomFormation.prototype.create = function () {
        SS_Scene_MenuBase.prototype.create.call(this);
        this.createPartyWindow();
        this.createHelpWindow();
        this._partyWindow.refresh()
    };


    Scene_CustomFormation.prototype.update = function () {
        SS_Scene_MenuBase.prototype.update.call(this);
        if (Input.isTriggered('cancel')) {
            this.popScene(); // Returns to previous scene
        }
    };

    Scene_CustomFormation.prototype.createHelpWindow = function () {
        const x = 0;
        const y = 20;
        const width = Graphics.boxWidth - 0; // leave some padding
        const height = this.calcWindowHeight(1, true);

        const rect = new Rectangle(x, y, width, height);

        this._helpWindow = new Window_Help(rect);
        this._helpWindow.width = width;
        this._helpWindow.height = height;
        this.addWindow(this._helpWindow);
        this._helpWindow.setText("Press Cancel to exit this scene.");
    };



    Scene_CustomFormation.prototype.createPartyWindow = function () {        // Full screen dimensions
        const width = Graphics.boxWidth;
        const height = ImageManager.standardFaceHeight + 24;
        const rect = new Rectangle(0, 0, width, height);
        // The number of lines here is mostly ignored for large windows
        this._partyWindow = new Window_FaceCommand(rect);
        this._partyWindow.opacity = 255; // Semi-transparent background
        this._partyWindow.y = 100
        this.addWindow(this._partyWindow);
        this._partyWindow.makeCommandList();

        this._partyWindow.refresh()
        // Optional: Draw some text or frame
        // this._backgroundWindow.drawText("Custom Scene Background", 0, 0, width, "center");
    };

    const _Scene_CustomFormation = Scene_CustomFormation.prototype.start;
    Scene_CustomFormation.prototype.start = function () {
        _Scene_CustomFormation.call(this);

        if (this._partyWindow) {
            this._partyWindow.makeCommandList(); // ensure commands exist
            this._partyWindow.refresh();         // draw items now that data is loaded
            this._partyWindow.select(0);
        }
    };


    WindowBackground.prototype = Object.create(Window_Base.prototype);
    WindowBackground.prototype._refreshFrame = function () {
        // Empty → border removed only for this window
    };

    Window_FaceCommand.prototype = Object.create(Window_Command.prototype);
    Window_FaceCommand.prototype.constructor = Window_FaceCommand;

    Window_FaceCommand.prototype.initialize = function (rect) {
        Window_Selectable.prototype.initialize.call(this, rect);
        this.y = 90
        this.activate();
        this.refresh();
    };

    Window_FaceCommand.prototype.maxItems = function () {
        return 4
    };
    Window_FaceCommand.prototype.maxCols = function () {
        return 4
    };

    // Adjust width of each command box
    Window_FaceCommand.prototype.itemWidth = function () {
        return 144;
    }

    Window_FaceCommand.prototype.drawItemBackground = function (index) {



        
       
        const rect = this.itemRect(index);
        const name = this.commandName(index)
        const command = this.commandSymbol(index)
        const ext=this.commandExt(index)
        let bitmap=undefined
        let idx=undefined
         

        if (ext) {
            actor = $gameActors.actor(ext); 
            let face=actor.faceName()
            idx=actor.faceIndex()
            bitmap = ImageManager.loadFace(face);
            
        }
        else {
            
            bitmap = ImageManager.loadFace("evil");
            idx = Number(1);

        }

            const sx = (idx % 4) * 144;
            const sy = Math.floor(idx / 4) * 144;

            if(!bitmap) return
            this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);

            this.contents.blt(
                bitmap,
                sx, sy, 144, 144,
                rect.x + (rect.width - 144) / 2,
                rect.y
            );


    };

    Window_FaceCommand.prototype.makeCommandList = function () {
        this.clearCommandList();
 
        let test = $gameParty._currentParty.concat([null, null, null, null])
        test=test.slice(0, SP)
        
        test.forEach((element,index) => {
            //console.log(element)
            this.addCommand("", element, true, element);
        });
        console.log(this._list)


    }

    Window_FaceCommand.prototype.maxRows = function () {
        return 1;
    }


    Window_FaceCommand.prototype.itemHeight = function () {
        return 144; // height of each command
    };

    Window_FaceCommand.prototype.createArrows = function () {
        // Do nothing → no arrows created
    };

    Window_FaceCommand.prototype.updateArrows = function () {
        // Prevent the engine from toggling arrow visibility
    };

    Window_Command.prototype.commandExt = function(index) {
    return this._list?.[index]?.ext;
    };



    window.Scene_CustomFormation = Scene_CustomFormation;


})();