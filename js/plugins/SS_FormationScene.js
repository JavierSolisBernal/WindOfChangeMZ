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

    Scene_CustomFormation.prototype = Object.create(SS_Scene_MenuBase.prototype);
    Scene_CustomFormation.prototype.constructor = Scene_CustomFormation;

    Scene_CustomFormation.prototype.initialize = function () {
        SS_Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_CustomFormation.prototype.create = function () {
        SS_Scene_MenuBase.prototype.create.call(this);
        this.createBackgroundWindow();
        this.createHelpWindow();
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



    Scene_CustomFormation.prototype.createBackgroundWindow = function () {        // Full screen dimensions
        const width = Graphics.boxWidth;
        const height = Graphics.boxHeight;
        const rect = new Rectangle(0, 0, width, height);
        // The number of lines here is mostly ignored for large windows
        this._backgroundWindow = new Window_Base(rect);
        this._backgroundWindow.opacity = 255; // Semi-transparent background
        this.addWindow(this._backgroundWindow);

        // Optional: Draw some text or frame
       // this._backgroundWindow.drawText("Custom Scene Background", 0, 0, width, "center");
    };
    WindowBackground.prototype = Object.create(Window_Base.prototype);
    WindowBackground.prototype._refreshFrame = function() {
    // Empty → border removed only for this window
    };

    window.Scene_CustomFormation = Scene_CustomFormation;


})();