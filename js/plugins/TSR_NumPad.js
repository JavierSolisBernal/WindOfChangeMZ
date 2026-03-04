//==================================================================================
//=== TSR_NumPad === Just another Plugin by The Northern Frog ======================
//==================================================================================

var TSR = TSR || {};
TSR.numPad = TSR.numPad || {};
TSR.numPad.version = 1.01;
TSR.numPad.pluginName = 'TSR_NumPad';

var Imported = Imported || {};
Imported[TSR.numPad.pluginName] = true;

//===================================================================================

/*:
 * @target MZ
 * @plugindesc v1.0.1 Simple Numeric pad for number inputs in game.
 * 
 * @author TSR, The Northern Frog, 2023      
 * @help 
 * ===================================================================================
 * == About this Plugin ==============================================================
 * ===================================================================================
 * This plugin replace the default number input process with
 * a numeric pad. Navigate the pad with keyboard arrows or
 * mouse, or directly type the digits on the keyboard to
 * input numbers in game.
 * 
 * HOW TO USE:
 * 
 *      -Install the plugin in your Plugin Manager
 *      -Use the default event command: 'Number Input Process'
 * 
 * Same as default, set the max digits and the game variable ID
 * that will store the input number. Once you confirm and close
 * the number input pad, the returning value will be stored in
 * that game variable.
 * 
 * 
 * Using plugin commands, you can set 3 different layouts for the
 * numeric panel:
 * 
 * Layout 1
 * ========
 * This is the basic layout:
 * 
 *     1  2  3
 *     4  5  6
 *     7  8  9
 *     C  0  Ok
 * 
 * Buttons: 
 *    Digits [0-9] = input a digit
 *              Ok = confirm the input and close
 *               C = delete last digit, close if no inputs
 * 
 * 
 * Layout 2
 * ========
 * This layout allow to return negative values.
 * 
 *     1  2  3  C
 *     4  5  6  AC
 *     7  8  9  +/-
 *       0   Ok
 * 
 * Additional buttons:
 *              AC = delete all digits, close if no inputs
 *             +/- = toggle On/Off the minus sign, return 
 *                   negative values when On
 *                   
 * 
 * Layout 3
 * ========
 * This layout add the dot (.) button to turn the
 * number into a floating value.
 * 
 *     1  2  3  C
 *     4  5  6  AC
 *     7  8  9  +/-
 *     .  0   Ok
 * 
 * Additional button:
 *              . = input a dot to turn the number into a 
 *                  floating value***
 * 
 * 
 *    *** Floating value ***
 *  
 *  The input number is returned inside a game variable.
 *  By default game variables cannot stored floating numerical
 *  values, so when the input number is a floating value, the
 *  plugin will return the value as a string (text), see bellow.
 * 
 *  ******************************************************
 * 
 * 
 * 
 * Plugin commands
 * ===============
 * 
 *   -Number input layout:
 *          Select between one of the 3 layouts described above
 * 
 * 
 *   -Number input font face:
 *          Select between the main font face or the number font
 *          face for the number input windows.
 * 
 *              *the main font face and the number font face are
 *               the 2 default font faces set in the data base.
 * 
 * 
 *   -Input leading zeros:
 *          If you want the returning combination to includes '0'
 *          in front, like: 0246, you can enable the leading zeros.
 *          Note that in this case the returning value will be a
 *          string (text), see bellow.
 *         
 * 
 *   -Number input auto close:
 *          When enabled, the number input windows will automatically
 *          confirm and close when the last digits is input.
 * 
 *            Ex: 
 *              You have set the maximum digits to 4.
 *              The number input process will close as
 *              soon as a fourth digit is input.
 *           
 * 
 *   -Revert digits layout:
 *          Revert the first and second digits rows.
 * 
 *           revert        no revert
 *          7  8  9         1  2  3
 *          4  5  6         4  5  6
 *          1  2  3         7  8  9
 * 
 * 
 * 
 *   ** String values **
 * **********************************************************
 * When the returning value is a string, you cannot directly
 * compare it to a numerical value, and math operations using
 * a string value might render unexpected results.
 * 
 * A string value can be convert to a numerical value using
 * the parseInt method in js.
 * 
 *    Ex: parseInt('123') = 123
 * 
 * But doing that will remove any leading zeros and round up
 * floating values.
 * 
 * The parseFloat method can be use for returning the floating
 * value of a string.
 * 
 *    Ex: parseFloat('0.56') = 0.56
 * 
 * 
 * For direct comparison, you can simply check if the returing
 * value is equal to the corresponding string (between quotes).
 * 
 *    Ex: If the returning value is '00456' and is stored
 *        in the game variable X.
 * 
 *        You can check if:
 *          $gameVariables.value(X) === '00456'
 * 
 * 
 * Important notes:
 * 
 *     -Float 
 *         If you're using the Layout 3. The returning value
 *         will be a string only if it contains a dot ('.').
 *         Otherwise it will return a numerical value.
 * 
 *     -Leading zeros
 *         If you have enabled the 'Leading zeros' option, the
 *         returning value will always be a string, even if it
 *         doesn't contains any leading zeros.
 * 
 * **********************************************************
 * 
 * 
 * SPECIAL THANKS
 * ==============
 * 
 *    ShadowDragon, for providing the initial idea for the plugin
 * 
 * 
 * ================================================================================
 * == Term of Usage ===============================================================
 * ================================================================================
 * 
 * Use in any independant RPG Maker MZ projects, including commercials.
 *
 * Credit is required for using this Plugin. 
 * For crediting, use 'TSR' along with one of
 * the following terms: 
 *      'The Northern Frog' or 'A frog from the north'
 * 
 * Do not change the Header or the Terms of usage.
 * 
 * You can edit it as you like for you project.
 * 
 *
 * DO NOT REDISTRIBUTE!
 * If you want to share it, share the link to my itch.io account: 
 * https://the-northern-frog.itch.io/
 * 
 *
 * ================================================================================
 * == Version and compatibility ===================================================
 * ================================================================================
 * 03/02/23 completed plugin, v1.0.0
 * 05/02/23 added plugin commands and instructions, v1.0.1
 *        
 *
 * ================================================================================
 * == END =========================================================================                                            
 * ================================================================================
 *
 *                              "Have fun!"
 *                                                  TSR, The Northern Frog
 *
 * =================================================================================
 *
 * @command layout
 * @text Number input layout
 * @desc Change the number input layout.
 * 
 * @arg type
 * @type combo
 * @option 1
 * @option 2
 * @option 3
 * @default 1
 * @text Number input layout type
 * @desc Set the number input layout type.
 * 
 * 
 * @command fontface
 * @text Number input font face
 * @desc Change the font face of number pad.
 * 
 * @arg type
 * @type combo
 * @option number font face
 * @option main font face
 * @default number font face
 * @text Number pad font face
 * @desc Set the font face of the number input pad.
 * 
 * 
 * @command zeros
 * @text Input leading zeros
 * @desc Allow to includes zeros in front of the returning value.
 * 
 * @arg enable
 * @type boolean
 * @on ON
 * @off OFF
 * @text Input leading zeros
 * @desc Allow zeros in front of inputted numbers.
 * Returning value will be a string
 * @default false
 * 
 * 
 * @command auto
 * @text Number input auto close
 * @desc Auto close and confirm when all digits are entered.
 * 
 * @arg enable
 * @type boolean
 * @on ON
 * @off OFF
 * @text Input auto close
 * @desc Enable input auto close.
 * @default false
 * 
 * 
 * @command revert
 * @text Revert digits layout
 * @desc Change the digits layout on the number pad.
 * 
 * @arg enable
 * @type boolean
 * @on ON
 * @off OFF
 * @text Digits layout
 * @desc When true the digits goes from bottom to top.
 * @default true
 * 
 * 
 */


//=== PARAMETERS ==========================================================================

TSR.Parameters = PluginManager.parameters(TSR.numPad.pluginName);


//=== Input key mapper ===

for (let i = 0; i < 9; i++) {
    const ascii = i + 48;
    Input.keyMapper[ascii] = i.toString();
}
Input.keyMapper[45] = '-';
Input.keyMapper[46] = '.';



//=== MANAGER ========================================================================


//== PluginManager ========================================

PluginManager.registerCommand(TSR.numPad.pluginName, 'layout', args => {
    $gameSystem.setNumberInputSettings(Number(args.type), 0);
});

PluginManager.registerCommand(TSR.numPad.pluginName, 'fontface', args => {
    const number = Number(args.type) === 'number font face';
    console.log(number)
    $gameSystem.setNumberInputSettings(number, 4);
});

PluginManager.registerCommand(TSR.numPad.pluginName, 'zeros', args => {
    $gameSystem.setNumberInputSettings(eval(String(args.enable)), 1)
});

PluginManager.registerCommand(TSR.numPad.pluginName, 'auto', args => {
    $gameSystem.setNumberInputSettings(eval(String(args.enable)), 2);
});

PluginManager.registerCommand(TSR.numPad.pluginName, 'revert', args => {
    $gameSystem.setNumberInputSettings(eval(String(args.enable)), 3);
});



//=== GAME ============================================================================


//=== Game_System =================================

TSR.numPad._Game_System_init =
Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
    TSR.numPad._Game_System_init.call(this);
    this._numberInputSettings = [1, 0, 0, 1, 1];
};

Game_System.prototype.setNumberInputSettings = function(set, index) {
    this._numberInputSettings[index] = set;
};

Game_System.prototype.numberInputSettings = function(index) {
    return this._numberInputSettings[index];
};



//=== SCENE =============================================================


//=== Scene_Message ===

Scene_Message.prototype.createNumberInputWindow = function() {
    this.createInputWindow();
    this.createNumPadWindow();
};

Scene_Message.prototype.createInputWindow = function() {
    this._numberInputWindow = new Window_NumInput();
    this.addWindow(this._numberInputWindow);
};

Scene_Message.prototype.createNumPadWindow = function() {
    this._numPadWindow = new Window_NumPad(this._numberInputWindow);
    this._numPadWindow.setHandler('ok',  this.onNumPadOk.bind(this));
    this._numPadWindow.setHandler('cancel', this.onNumPadCancel.bind(this));
    this._numberInputWindow.setPadWindow(this._numPadWindow);
    this.addWindow(this._numPadWindow);
};

Scene_Message.prototype.isOk = function() {
    return this._numPadWindow.button() === 'Ok';
};

Scene_Message.prototype.isClear = function() {
    return this._numPadWindow.button() === 'C';
};

Scene_Message.prototype.isAllClear = function() {
    return this._numPadWindow.button() === 'AC';
};

Scene_Message.prototype.isSetNegative = function() {
    return this._numPadWindow.button() === '+/-';
};

Scene_Message.prototype.canInput = function() {
    return this._numberInputWindow.canInput();
};

Scene_Message.prototype.onNumPadOk = function() {
    if (this.isOk()) {
        this.endNumberInput();
    } else if (this.isClear()) {
        this.onNumPadCancel();
    } else if (this.isAllClear()) {
        this.onAllClear();
    } else if (this.isSetNegative()) {
        this.onSetNegative();
    } else if (this.canInput()) {
        this._numPadWindow.setDigit();
        if ($gameSystem.numberInputSettings(2) &&
            this._numberInputWindow.isInputsFull()
        ) {
            this.endNumberInput();
        }
    } else {
        SoundManager.playBuzzer();
        this._numPadWindow.activate();
    }
};

Scene_Message.prototype.onNumPadCancel = function() {
    if (this._numberInputWindow.isInputsEmpty()) {
        this.endNumberInput();
    } else {
        this._numPadWindow.backSpace();
    }
};

Scene_Message.prototype.endNumberInput = function() {
    $gameVariables.setValue(
        $gameMessage.numInputVariableId(), 
        this._numberInputWindow.returningNumber()
    );
    this._numberInputWindow.deactivate();
    this._messageWindow.terminateMessage();
    this._numPadWindow.updateInputData();
    this._numberInputWindow.close();
    this._numPadWindow.close();
};

Scene_Message.prototype.onAllClear = function() {
    if (this._numberInputWindow.isInputsEmpty()) {
        this.endNumberInput();
    } else {
        this._numPadWindow.allClear();
    }
};

Scene_Message.prototype.onSetNegative = function() {
    const negative = this._numberInputWindow.isNegative();
    this._numberInputWindow.setNegative(!negative);
    this._numPadWindow.activate();
};



//=== WINDOW ======================================================


//=== Window_Selectable ===

Window_Selectable.prototype.resetInputsFontSettings = function() {
    const numFont = $gameSystem.numberInputSettings(4);
    const fontMethod = numFont ? 'numberFontFace' : 'mainFontFace';
    const fontSizeOffset = numFont ? 4 : 0;
    this.contents.fontFace = $gameSystem[fontMethod]();
    this.contents.fontSize = $gameSystem.mainFontSize() - fontSizeOffset;
    this.resetTextColor();
};


//=== Window_NumInput ===

function Window_NumInput() {
    this.initialize.apply(this, arguments);
}

Window_NumInput.prototype = Object.create(Window_Selectable.prototype);
Window_NumInput.prototype.constructor = Window_NumInput;

Window_NumInput.prototype.initialize = function() {
    Window_Selectable.prototype.initialize.call(this, new Rectangle());
    this._inputs = [];
    this._maxDigits = 1;
    this._cursorFixed = true;
    this._canRepeat = false;
    this._padBellow = false;
    this._negative = false;
    this.openness = 0;
};

Window_NumInput.prototype.start = function() {
    this._maxDigits = $gameMessage.numInputMaxDigits();
    const v = $gameVariables.value($gameMessage.numInputVariableId());
    this._inputs = this.initInputs(v, this._maxDigits);
    this.updatePlacement();
    this.createContents();
    this.refresh();
    this.open();
    this.activate();
    this.select(this._maxDigits - 1);
    this._padWindow.start();
};

Window_NumInput.prototype.setMessageWindow = function(messageWindow) {
    this._messageWindow = messageWindow;
};

Window_NumInput.prototype.setPadWindow = function(padWindow) {
    this._padWindow = padWindow;
};

Window_NumInput.prototype.setNegative = function(set) {
    this._negative = set;
    this.refresh();
};

Window_NumInput.prototype.isNegative = function() {
    return this._negative;
};

Window_NumInput.prototype.initInputs = function(value, length) {
    const emptyInputs = [];
    for (let i = 0; i < length; i++) {
        emptyInputs.push(' ');
    }
    if (value) {
        const val = value.toString().split('');
        if (val[0] === '-') val.shift();
        const index = length - val.length;
        return emptyInputs.slice(0, index).concat(val);
    } else {
        return emptyInputs;
    }
};

Window_NumInput.prototype.updatePlacement = function() {
    const messageY = this._messageWindow.y;
    const spacing = this.fittingHeight(4);
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = (Graphics.boxWidth - this.width) / 2;
    if (messageY < this._messageWindow.height) {
        this.y = messageY + this._messageWindow.height + 8;
        this._padBellow = false;
    } else if (messageY >= Graphics.boxHeight / 2) {
        this.y = messageY - this.height - spacing - 8;
        this._padBellow = false;
    } else {
        this.y = messageY - this.height - 8;
        this._padBellow = messageY + this._messageWindow.height + 8;
    }
};

Window_NumInput.prototype.windowWidth = function() {
    return this.maxCols() * this.itemWidth() + this.spacing();
};

Window_NumInput.prototype.windowHeight = function() {
    return this.fittingHeight(1);
};

Window_NumInput.prototype.maxCols = function() {
    return this._maxDigits;
};

Window_NumInput.prototype.maxItems = function() {
    return this._maxDigits;
};

Window_NumInput.prototype.spacing = function() {
    return 64;
};

Window_NumInput.prototype.scrollBaseX = function() {
    return -20;
};

Window_NumInput.prototype.itemWidth = function() {
    return 32;
};

Window_NumInput.prototype.canInput = function() {
    return this._inputs.some(i => i === ' ');
};

Window_NumInput.prototype.drawItem = function(index) {
    const rect = this.itemRect(index);
    const align = 'center';
    const input = this._inputs[index]
    this.resetTextColor();
    this.drawText(input, rect.x, rect.y, rect.width, align);
    if (this.isNegative()) {
        const r = this.itemRect(this.firstNumberIndex());
        const x = r.x - this.itemWidth() / 2;
        this.contents.fontSize += 4;
        this.drawText('-', x - 2, r.y, r.width, align);
        this.resetFontSettings();
    }
};

Window_NumInput.prototype.firstNumberIndex = function() {
    for (let i = 0; i < this._inputs.length; i++) {
        if (this._inputs[i] !== ' ') {
            return i;
        }
    }
};

Window_NumInput.prototype.setDigit = function(digit) {
    this._inputs.shift();
    this._inputs.push(digit);
    this.refresh();
};

Window_NumInput.prototype.clearDigit = function() {
    this._inputs.pop(); 
    this._inputs.unshift(' ');
    this.refresh();
};

Window_NumInput.prototype.clearAllDigit = function() {
    this._inputs = this.initInputs(null, this._maxDigits);
    this._negative = false;
    this.refresh();
};

Window_NumInput.prototype.returningNumber = function() {
    const inputs = this._inputs.filter(i => i !== ' ');
    const float = inputs.includes('.');
    const string = inputs.join('');
    const prefix = this.isNegative() ? '-' : '';
    if ($gameSystem.numberInputSettings(1) || float) {
        return prefix + string;
    } else {
        const value = this.isNegative() ? 
                      parseInt(string) * -1: parseInt(string);
        return value;
    }
};

Window_NumInput.prototype.isInputsEmpty = function() {
    return this._inputs[this._maxDigits - 1] === ' ';
};

Window_NumInput.prototype.isInputsFull = function() {
    return !this._inputs.includes(' ');
};

Window_NumInput.prototype.isInputLast = function() {
    return this._inputs.filter(i => i === ' ').length === 1;
};

Window_NumInput.prototype.resetFontSettings = function() {
    this.resetInputsFontSettings();
};


//=== Window_NumPad ===

function Window_NumPad() {
    this.initialize.apply(this, arguments);
}

Window_NumPad.prototype = Object.create(Window_Selectable.prototype);
Window_NumPad.prototype.constructor = Window_NumPad;

Window_NumPad.prototype.initialize = function(inputWindow) {
    this._inputWindow = inputWindow;
    Window_Selectable.prototype.initialize.call(this, new Rectangle());
    this.openness = 0;
};

Window_NumPad.prototype.start = function() {
    this.updatePlacement();
    this.createContents();
    this.refresh();
    this.open();
    this.activate();
    this.selectButton('Ok');
};

Window_NumPad.prototype.updatePlacement = function() {
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    this.x = (Graphics.boxWidth - this.width) / 2;
    this.y = this._inputWindow._padBellow || this._inputWindow.y + this._inputWindow.height;
};

Window_NumPad.prototype.tableId = function() {
    return $gameSystem.numberInputSettings(0);
};

Window_NumPad.prototype.tableRevert = function() {
    return $gameSystem.numberInputSettings(3);
};

Window_NumPad.prototype.table = function() {
    return this['table' + this.tableId()]();
};

Window_NumPad.prototype.table1 = function() {
    const table = [
        '1', '2', '3',
        '4', '5', '6', 
        '7', '8', '9',
        'C', '0', 'Ok'
    ]
    return this.switchTopBottom(table);
};

Window_NumPad.prototype.table2 = function() {
    const table = [
        '1', '2', '3', 'C', 
        '4', '5', '6', 'AC', 
        '7', '8', '9', '+/-',
        '0', 'Ok'
    ]
    return this.switchTopBottom(table);
};

Window_NumPad.prototype.table3 = function() {
    const table = [
        '1', '2', '3', 'C', 
        '4', '5', '6', 'AC', 
        '7', '8', '9', '+/-',
        '.', '0', 'Ok'
    ]
    return this.switchTopBottom(table);
};

Window_NumPad.prototype.switchTopBottom = function(table) {
    if (this.tableRevert()) {
        const top = table.slice(0, table.indexOf('3') + 1);
        const bottom = table.slice(table.indexOf('7'), table.indexOf('9') + 1);
        table.splice(table.indexOf('7'), 3, top[0], top[1], top[2]);
        table.splice(0, 3, bottom[0], bottom[1], bottom[2]);
    }
    return table
};

Window_NumPad.prototype.nonDigitButtons = function() {
    return ['Ok', 'C', 'AC', '+/-'];
};

Window_NumPad.prototype.windowWidth = function() {
    return this.tableId() > 1 ? this.windowHeight() : this.windowHeight() * 0.75;
};

Window_NumPad.prototype.windowHeight = function() {
    return this.fittingHeight(4);
};

Window_NumPad.prototype.maxCols = function() {
    return this.tableId() > 1 ? 4 : 3;
};

Window_NumPad.prototype.maxItems = function() {
    return this.table().length;
};

Window_NumPad.prototype.button = function() {
    return this.table()[this.index()];
};

Window_NumPad.prototype.selectButton = function(button) {
    this.select(this.table().indexOf(button));
};

Window_NumPad.prototype.itemRect = function(index) {
    const rect = Window_Selectable.prototype.itemRect.call(this, index);
    const lastIndex = this.maxItems() - 1;
    const spacing = this.colSpacing();
    switch (this.tableId()) {
        case 1:
            break;
        case 2:
            if (index === lastIndex || 
                index === lastIndex - 1) {
                rect.width = rect.width * 2 + spacing;
                if (index === lastIndex) {
                    rect.x += rect.width / 2 + spacing / 2;
                }
            } 
            break;
        case 3:
            if (index === this.maxItems() - 1) {
                rect.width = rect.width * 2 + spacing;
            } 
            break;
        default:
            break
    }
    return rect;
};

Window_NumPad.prototype.drawItem = function(index) {
    const rect = this.itemRect(index);
    const align = 'center';
    const n = this.table()[index];
    this.resetTextColor();
    this.drawText(n, rect.x, rect.y, rect.width, align);
};

Window_NumPad.prototype.setDigit = function() {
    const button = this.button();
    const value = parseInt(button);
    const digit = button !== '.' ? value : button;
    if (button === '.' && this._inputWindow.isInputsEmpty()) {
        this._inputWindow.setDigit(0);
    }
    this._inputWindow.setDigit(digit);
    this.activate();
};

Window_NumPad.prototype.backSpace = function() {
    this._inputWindow.clearDigit();
    this.activate();   
};

Window_NumPad.prototype.allClear = function() {
    this._inputWindow.clearAllDigit();
    this.activate();   
};

Window_NumPad.prototype.isNonDigitInput = function() {
    return this.nonDigitButtons().includes(this.button());
};

Window_NumPad.prototype.isMoreThanOneDot = function() {
    return this.button() === '.' && 
           (this._inputWindow._inputs.includes('.') ||
            this._inputWindow.isInputLast());
};


Window_NumPad.prototype.canInput = function() {
    return (this._inputWindow.canInput() || 
           this.isNonDigitInput()) &&
           !this.isMoreThanOneDot();
};

Window_NumPad.prototype.processKeyNumbersTrigger = function() {
    const keyNumbers = this.table().filter(
        t => !this.nonDigitButtons().includes(t)
    );
    for (const key of keyNumbers) {
        if (Input.isTriggered(key)) {
            this.selectAndSetDigit(key);
            return;
        }
    }
};

Window_NumPad.prototype.selectAndSetDigit = function(button) {
    this.selectButton(button);
    if (this.canInput()) {
        this.setDigit();
        this.playOkSound();
        if ($gameSystem.numberInputSettings(2) &&
            this._inputWindow.isInputsFull()
        ) {
            SceneManager._scene.endNumberInput();
        }
    } else {
        this.playBuzzerSound();
    } 
};

Window_NumPad.prototype.processHandling = function() {
    Window_Selectable.prototype.processHandling.call(this);
    if (this.isOpenAndActive()) {
        this.processKeyNumbersTrigger();
    }
};

Window_NumPad.prototype.processOk = function() {
    if (this.isCurrentItemEnabled() && this.canInput()) {
        if (this.button() !== 'C' && this.button() !== 'AC') {
            this.playOkSound();
        } else {
            SoundManager.playCancel();
        }
        this.updateInputData();
        this.deactivate();
        this.callOkHandler();
    } else {
        this.playBuzzerSound();
    }
};

Window_NumPad.prototype.resetFontSettings = function() {
    this.resetInputsFontSettings();
};


Window_NumPad.prototype.updateCursorPos = function() {
    const rect = this.itemRect(this._index);
    this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    this.ensureCursorVisible();
};

Window_NumPad.prototype.cursorDown = function(wrap) {
    const index = this.index();
    const maxItems = this.maxItems();
    const maxCols = this.maxCols();
    if (this.checkIndexForTable(index, true)) {
        this.updateCursorPos();
    } else {
        if (index < maxItems - maxCols || (wrap && maxCols === 1)) {
            this.select((index + maxCols) % maxItems);
        } else {
            this._index -= (this.maxRows() * maxCols) - maxCols;
            if (this._index < 0) {
                this._index = maxItems - 1;
            }
            this.updateCursorPos();
        }
    }
};

Window_NumPad.prototype.cursorUp = function(wrap) {
    const index = Math.max(0, this.index());
    const maxItems = this.maxItems();
    const maxCols = this.maxCols();
    if (this.checkIndexForTable(index, false)) {
        this.updateCursorPos();
    } else if (index >= maxCols || (wrap && maxCols === 1)) {
        this.select((index - maxCols + maxItems) % maxItems);
    } else {
        this._index += (this.maxRows() * maxCols) - maxCols;
        if (this._index >= maxItems) {
            this._index = maxItems - 1;
        }
        this.updateCursorPos();
    }
};

Window_NumPad.prototype.cursorRight = function(wrap) {
    if (this._index % this.maxCols() < (this.maxCols() - 1)) {
        this._index++;
        if (this._index >= this.maxItems()) {
            this._index = this.row() * this.maxCols();
        }
        this.updateCursorPos();
    } else if (wrap) {
        const firstIndex = this.row() * this.maxCols();
        if (this.row() < this.maxPageRows()) {
            this._index -= (this.maxCols() - 1);
        } else {
            this._index -= this._index - firstIndex;
        }
        this.updateCursorPos();
    }
};

Window_NumPad.prototype.cursorLeft = function(wrap) {
    if (this._index % this.maxCols() > 0) {
        this._index--;
        this.updateCursorPos();
    } else if (wrap) {
        this._index += (this.maxCols() - 1);
        if (this._index >= this.maxItems()) {
            this._index = this.maxItems() - 1;
        }
        this.updateCursorPos();
    }
};

Window_NumPad.prototype.checkIndexForTable = function(index, down) {
    if (this.tableId() === 2) {
        const cIndex = down ? [9, 13, 12] : [1, 13, 12];
        const nIndex = down ? [12, 3, 0] : [12, 11, 8];
        if (cIndex.includes(index)) {
            this._index = nIndex[cIndex.indexOf(index)];
            return true;
        }
    } else if (this.tableId() === 3) {
        const cIndex = down ? [14] : [2, 14];
        const nIndex = down ? [3] : [14, 11];
        if (cIndex.includes(index)) {
            this._index = nIndex[cIndex.indexOf(index)];
            return true;
        }
    }
    return false;
};



//==== END ======================================================================
//===============================================================================