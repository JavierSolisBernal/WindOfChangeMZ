//===========================================================================
//=== TSR_MapPopups === A Plugin by The Northern Frog =======================
//===========================================================================

var TSR = TSR || {};
TSR.mapPopups = TSR.mapPopups || {};
TSR.mapPopups.version = 1.44;
TSR.mapPopups.pluginName = 'TSR_MapPopups';

var Imported = Imported || {};
Imported[TSR.mapPopups.pluginName] = true;

//===========================================================================

/*:
 * @target MZ
 * @plugindesc v1.44 This Plugin add popups on the map to show text, items,
 *                    gold or damage/recovery.
 * @author TSR, The Northern Frog, 2021      
 * @help 
 * ==========================================================================
 * == About this Plugin =====================================================
 * ==========================================================================
 * Use the following Plugin Commands to display map popups.
 * 
 *     -START TEXT POPUP
 *              Text: The text to be displayed by the popup.
 *                      *You can use the following escape characters
 *                       in text popups: \V[x], \N[x], \P[x] and \G
 * 
 *            Target: The event Id of the target on which the popup will
 *                    show (set it to 0 for targeting the Player).
 *        Text color: The text color code to change the color of the 
 *                    popup text.
 * 
 *     -START ITEM POPUP
 *            Target: The event Id of the target on which the popup will
 *                    show (set it to 0 for targeting the Player).
 *          Category: The item category (Items, Weapons or Armors).
 *           Item Id: The database Id of the item.
 *          Quantity: The quantity displayed with the item.
 *        Text color: The text color code to change the color of the 
 *                    popup text.
 *      Apply effect: When set to true, the plugin will make the change
 *                    in the inventory in addition to showing the popup.
 * 
 *     -START GOLD POPUP
 *            Target: The event Id of the target on which the popup will
 *                    show (set it to 0 for targeting the Player).
 *            Amount: The amount of gold to be displayed by the popup.
 *        Text color: The text color code to change the color of the 
 *                    popup text.
 *              Icon: The icon index of you gold icon, if any.
 *                    (leave it to 0 if none)
 *      Apply effect: When set to true, the plugin will make the change
 *                    in the party gold in addition to showing the popup.
 * 
 *     -START DAMAGE POPUP
 *            Target: The event Id of the target on which the popup will
 *                    show (set it to 0 for targeting the Player).
 *       Damage type: The damage type. This change the text color, and
 *                    will be use as suffix if you use that option.
 *      Damage value: The value that is to be displayed by the popup.
 *                    Use negatives values for recovery popups. This will
 *                    change the text color accordingly.
 *                          *you can use the escape code \V[x] to set
 *                           the damage to a variable value
 * 
 *      Apply effect: When set to true, the plugin will make the change
 *                    to party status in addition to showing the popup.
 *                    (no effect on events)
 *      Affect party: When set to true, the effect will affect the whole
 *                    party, not just the player (Apply effect must be true).
 * 
 * 
 * 
 * POPUPS DURATION
 * ===============
 * The default duration of the map popups is 60 frames. This can be changed
 * for all popups within the parameters. Alternatively, all popups commands
 * have the 'Duration' argument. This argument will overwrite the setting
 * in the parameters so you can set specific duration for eacb popups.
 * 
 *  *The minimal value for popups duration is 60 frames, because anything
 *   bellow that doesn't look good.
 * 
 * 
 * 
 * POPUPS POSITION
 * ===============
 * Map popups will appear just above their targeted characters. This is
 * meant for default 48x48 images. If you're using images of a different
 * size, you may want to change the popups position. This can be done
 * in the general parameters (see next section), or by setting specific
 * offset for each popups through the plugin commands.
 * 
 * In addition to the above, all popups have the followings commands:
 * 
 *       Position X: set the horizontal offset* in pixel, relative to
 *                   the targeted character position.
 *  
 *       Position Y: set the vertical offset* in pixel, relative to
 *                   the targeted character position.
 * 
 * 
 *    *the value entered in the commands are offset values. To make
 *     the popup appear at an absolute position on the screen, use
 *     the keyword 'pos' along with the value.
 * 
 *          Example:
 *            
 *             Position X: 100
 * 
 *                  The above will make the popup appear 100 pixels
 *                  on the right of the targeted character.
 * 
 *             Position X: pos 100
 * 
 *                  Adding 'pos' with the value will make the popup
 *                  appear at 100 pixels from the left of the screen.
 *                  You can add 'pos' before or after the value, and
 *                  white spaces doesn't matter.
 * 
 * 
 *    **The position values entered in the plugin command will overide
 *      the position settings of the general parameters, if any.
 *   
 *         
 * 
 * PLUGIN PARAMETERS
 * =================
 * Set the following parameters to your liking in the Plugin Manager.
 * 
 *     -POPUPS OFFSET X
 *         Add an horizontal offset in pixels to all popups. This
 *         is relative to the targeted event/player position. 
 * 
 *     -POPUPS OFFSET Y
 *         Add a vertical offset in pixels to all popups. This
 *         is relative to the targeted event/player position.
 * 
 *     -SHOW CURRENCY UNIT
 *         Show the default currency unit in gold popups?
 * 
 *     -CURRENCY ABBREVIATION
 *         Enter the currency abbreviation to be used in the gold
 *         popups if your currency unit name in the database is too
 *         long. Leave that parameter blank to use the database cur-
 *         rency unit as is.
 * 
 *     -DAMAGE POPUP PREFIX
 *         Show an operator in front of the value of damage popups
 *         to indicate gain or loss?
 * 
 *     -DAMAGE POPUP SUFFIX
 *         Show the damage type following the value of damage popups?
 * 
 * 
 * 
 * AUTO ITEM POPUPS
 * ================
 * When this parameter is set to true, item popups will show auto-
 * matically when you use the event command 'Change Item' to add
 * or remove items from the party inventory. No matter how you set
 * the parameters, you can always toggle on and off this feature with
 * the following script call:
 * 
 *          $gameSystem.setAutoItemPopups(set)
 * 
 *              *replace 'set' by true or false.
 * 
 *      ITEM COLOR TAGS
 *      ===============
 *      When using the 'Auto Item Popup' feature, the plugin will check
 *      for color meta tag in the Items database noteboxes to assign
 *      text color for the auto popups. The colors set in the tag can
 *      be either one of the default window colors (1 to 31), or an hex
 *      value. If there's no color meta tags, the color will be 0 (white).
 *  
 * 
 * 
 * SHOW ITEM NAME
 * ==============
 * When this parameter is set to true (default) the name of the item
 * will appear after the item icon. If you set it to false, only the
 * icon (and quantity if above 1) will appear.
 * 
 * 
 * 
 * AUTO GOLD POPUPS
 * ================
 * When this parameter is set to true, gold popups will show auto-
 * matically when you use the event command 'Change Gold' to add or
 * remove gold from the party. There's a parameter to set the text
 * color and icon index of the auto gold popups. No matter how you
 * set the parameters, you can always toggle on and off this feature 
 * with the following script call:
 * 
 *          $gameSystem.setAutoGoldPopups(set)
 * 
 *              *replace 'set' by true or false.
 *
 * 
 * 
 * AUTO EXP POPUPS
 * ================
 * When this parameter is set to true, a text popup will show auto-
 * matically when you use the event command 'Change Exp'. There's a 
 * parameter to set the text color of the auto exp popups. If the 
 * gain/loss of exp leads to a level up or down, an additional popup
 * will show the gain/loss in levels. No matter how you set the 
 * parameters, you can always toggle on and off this feature  with 
 * the following script call:
 * 
 *          $gameSystem.setAutoExpPopups(set)
 * 
 *              *replace 'set' by true or false.
 * 
 * 
 * DAMAGE POPUPS MOTION
 * ====================
 * When this parameter is turned ON, the damage popups will move in
 * a similar way than the default damage popups in battle (each digits
 * makes a short drop, than tilt a bit and fade out). You can turn this
 * parameter OFF if you want the damage popups to move like other map 
 * popups of this plugin (digits makes a drop, tilt, than rise up as 
 * they fade out).
 * 
 * 
 * 
 * SCRIPT CALLS
 * ============
 * Alternatively, those script calls can be used:
 * 
 *   **character can be either $gamePlayer or $gameMap._events[eventId]
 *   **to target a specific follower, use: $gamePlayer.followers().follower(index)
 * 
 *     -character.startTextPopup(text, color)
 *             text: Text to be displayed
 *            color: Text color code
 *            delay: The duration of the popup  in frames (see above in POPUPS DURATION)
 *             posX: The X position of the popup (see the POPUPS POSITION section above)  
 *             posY: The Y position of the popup (see the POPUPS POSITION section above)     
 * 
 *     -character.startItemPopup(category, itemId, quantity, color, goldIndex, apEffect)
 *         category: Item category ('ITEMS', 'WEAPONS' or 'ARMORS')
 *           itemId: Item Id in the database
 *         quantity: Quantity of the item
 *            color: Text color code
 *        goldIndex: Gold icon index
 *         apEffect: Apply the change to party inventory
 *            delay: The duration of the popup  in frames (see above in POPUPS DURATION)
 *             posX: The X position of the popup (see the POPUPS POSITION section above)  
 *             posY: The Y position of the popup (see the POPUPS POSITION section above) 
 * 
 *              *For gold popups, use the same call and set itemId to 0, and
 *               set any category.
 * 
 *     -character.startDamageMapPopup(type, value, apEffect, affectAll) 
 *             type: Damage type ('hp', 'mp' or 'tp')
 *            value: Damage value. Use positive values for damages, and
 *                   negatives values for recovery. You can use \V[x]
 *                   to assign a variable value as damage
 *         apEffect: Apply the change to party inventory
 *        affectAll: Apply effect to the whole party (apEffect must be true)
 *            delay: The duration of the popup  in frames (see above in POPUPS DURATION)
 *             posX: The X position of the popup (see the POPUPS POSITION section above)  
 *             posY: The Y position of the popup (see the POPUPS POSITION section above) 
 * 
 * 
 * 
 * =========================================================================
 * == Term of Usage ========================================================
 * =========================================================================
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
 * DO NOT REDISTRIBUTE!
 * If you want to share it, share the link to my itch.io account: 
 * https://the-northern-frog.itch.io/
 * 
 *
 * ==========================================================================
 * == Dev Log ===============================================================
 * ==========================================================================
 * 12/02/21 completed plugin,                                     v1.00
 * 14/02/21 add 'apply effect' and 'affect all' arguments,        v1.01
 * 08/08/21 add escape characters for text popups,                v1.02
 * 15/08/21 add currency abbreviation and accord damage popups
 *          suffixes to the TextManager entries and positions
 *          parameters for popups,                                v1.12
 * 02/09/21 add the popup duration parameter and command argument v1.22
 * 23/09/21 add the auto item popup feature and item meta colors  v1.23
 * 24/09/21 fix problem with item meta colors                     v1.24
 * 26/09/21 add the option to target the calling event itself     v1.25
 * 28/09/21 add the auto popups feature to gold and exp           v1.35
 * 29/09/21 change the damage popups motion                       v1.36
 * 01/10/21 fix damage popups stacking up                         v1.37
 * 14/10/21 fix stacking up of non auto popups                    v1.38
 * 17/10/21 disable the auto popups when changing equipments      v1.39
 * 24/01/22 small fix for VS meta tags                            v1.40
 * 20/03/22 Correction of a small erratum in the instruction      v1.41
 * 20/09/28 Correction of a bug with auto exp popups              v1.42
 * 20/09/28 Additional corrections of auto exp popups             v1.43
 * 23/09/28 add a parameter to show only item icon                v1.44
 * 
 * ==========================================================================
 * == END ===================================================================                                           
 * ==========================================================================
 *
 *                              "Have fun!"
 *                                                  TSR, The Northern Frog
 *
 * ==========================================================================
 *
 * @param ---General---
 *
 * @param Popups Duration
 * @parent ---General---
 * @type number
 * @min 60
 * @desc Enter the duration of all popups in frames.
 * Default: 60
 * @default 60
 * 
 * @param Popups Offset X
 * @parent ---General---
 * @desc Enter the horizontal offset for all popups.
 * @default
 * 
 * @param Popups Offset Y
 * @parent ---General---
 * @desc Enter the vertical offset for all popups.
 * @default
 * 
 * @param Show Currency Unit
 * @parent ---General---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Show currency unit in gold popups?
 * OFF - false  ON - true
 * @default true
 * 
 * @param Currency Abbreviation
 * @parent ---General---
 * @desc Enter the currency abbreviation for the gold popups.
 * Leave it blank to use the database currency unit entry.
 * @default
 * 
 * @param Damage Popups Prefix
 * @parent ---General---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Show an operator (+ or -) before damage/recovery popups?
 * OFF - false  ON - true
 * @default true
 * 
 * @param Damage Popups Suffix
 * @parent ---General---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Show the damage type after the damage values?
 * OFF - false  ON - true
 * @default true
 * 
 * 
 * @param ---Item Popups---
 * 
 * @param Auto Item Popups
 * @parent ---Item Popups---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Enable auto item popups with the Change Items event command?
 * OFF - false  ON - true
 * @default false
 *   
* @param Show Item Name
 * @parent ---Item Popups---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Show item name along with icon?
 * OFF - false  ON - true
 * @default true
 * 
 *
 * @param ---Gold Popups---
 * 
 * @param Auto Gold Popups
 * @parent ---Gold Popups---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Enable auto gold popups with the Change Gold event command?
 * OFF - false  ON - true
 * @default false
 * 
 * @param Auto Gold Color
 * @parent ---Gold Popups---
 * @type number
 * @min 0
 * @desc Enter the text color for gold popups.
 * Default: 0
 * @default 0
 * 
 * @param Auto Gold Icon
 * @parent ---Gold Popups---
 * @type number
 * @min 0
 * @desc Enter the icon index for gold popups (0 for none).
 * Default: 0
 * @default 0
 * 
 * 
 * @param ---Exp Popups---
 * 
 * @param Auto Exp Popups
 * @parent ---Exp Popups---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Enable auto exp popups with the Change Exp event command?
 * OFF - false  ON - true
 * @default false
 * 
 * @param Exp Color
 * @parent ---Exp Popups---
 * @type number
 * @min 0
 * @desc Enter the text color for exp popups.
 * Default: 0
 * @default 0
 * 
 * 
 * @param ---Damage Popups---
 * 
 * @param Damage Motion
 * @parent ---Damage Popups---
 * @type boolean
 * @on ON
 * @off OFF
 * @desc Enable the damage motion for damage opups digits?
 * OFF - false  ON - true
 * @default true
 * 
 * 
 * @command text
 * @text Start text popup
 * @desc Create a map popup with some text.
 * @arg text
 * @default
 * @text Map popup text
 * @desc Set the text of the map popup.
 * 
 * @arg target
 * @type number
 * @min -1
 * @default 0
 * @text Target event Id
 * @desc Set the event Id of the target (0 for player).
 * 
 * @arg color
 * @type number
 * @min 0
 * @default 0
 * @text Text Color
 * @desc Set the text color of the popup.
 *
 * @arg duration
 * @type number
 * @min 0
 * @default
 * @text Popup Duration
 * @desc Set the duration of the popup (overwrite the parameter setting).
 * 
 * @arg posX
 * @default
 * @text Position X
 * @desc Set the horizontal position of the popup.
 * 
 * @arg posY
 * @default
 * @text Position Y
 * @desc Set the vertical position of the popup.
 * 
 * 
 * @command item
 * @text Start item popup
 * @desc Create a map popup that show an item name, icon and quantity.
 *
 * @arg target
 * @type number
 * @min -1
 * @default 0
 * @text Target event Id
 * @desc Set the event Id of the target (0 for player).
 * 
 * @arg category
 * @type combo
 * @option Items
 * @option Weapons
 * @option Armors
 * @default Items
 * @text Item category
 * @desc Set the category of the item popup.
 * 
 * @arg itemId
 * @type number
 * @min 1
 * @default 1
 * @text Item Id
 * @desc Set the database id of the item.
 * 
 * @arg quantity
 * @type number
 * @min -99
 * @max 99
 * @default 1
 * @text Item quantity
 * @desc Set the quantity of the item.
 *
 * @arg color
 * @type number
 * @min 0
 * @default 0
 * @text Text Color
 * @desc Set the text color of the popup.
 * 
 * @arg effect
 * @type boolean
 * @on ON
 * @off OFF
 * @text Apply effect
 * @desc Apply item quantity changes on party inventory?
 * OFF - false  ON - true
 * @default true
 * 
 * @arg duration
 * @type number
 * @min 0
 * @default
 * @text Popup Duration
 * @desc Set the duration of the popup (overwrite the parameter setting).
 * 
 * @arg posX
 * @default
 * @text Position X
 * @desc Set the horizontal position of the popup.
 * 
 * @arg posY
 * @default
 * @text Position Y
 * @desc Set the vertical position of the popup.
 * 
 * 
 * @command gold
 * @text Start gold popup
 * @desc Create a gold popup.
 *
 * @arg target
 * @type number
 * @min -1
 * @default 0
 * @text Target event Id
 * @desc Set the event Id of the target (0 for player).
 * 
 * @arg value
 * @type number
 * @min -999999
 * @default 1
 * @text Gold amount
 * @desc Set the amount of gold to show in the popup.
 * 
 * @arg color
 * @type number
 * @min 0
 * @default 0
 * @text Text Color
 * @desc Set the text color of the popup.
 * 
 * @arg icon
 * @type number
 * @min 0
 * @default 0
 * @text Gold icon
 * @desc Set the icon index for gold icon (0 for none).
 * 
 * @arg effect
 * @type boolean
 * @on ON
 * @off OFF
 * @text Apply effect
 * @desc Apply changes on party gold?
 * OFF - false  ON - true
 * @default true
 * 
 * @arg duration
 * @type number
 * @min 0
 * @default
 * @text Popup Duration
 * @desc Set the duration of the popup (overwrite the parameter setting).
 * 
 * @arg posX
 * @default
 * @text Position X
 * @desc Set the horizontal position of the popup.
 * 
 * @arg posY
 * @default
 * @text Position Y
 * @desc Set the vertical position of the popup.
 * 
 * 
 * @command damage
 * @text Start damage popup
 * @desc Create a map damage popup.
 *
 * @arg target
 * @type number
 * @min -1
 * @default 0
 * @text Target event Id
 * @desc Set the event Id of the target (0 for player).
 * 
* @arg category
 * @type combo
 * @option hp
 * @option mp
 * @option tp
 * @default hp
 * @text Damage type
 * @desc Set the damage type of the popup.
 * 
 * @arg value
 * @default 1
 * @text Damage value
 * @desc Set the amount of damage to show. (negative values for recovery)
 * 
 * @arg effect
 * @type boolean
 * @on ON
 * @off OFF
 * @text Apply effect
 * @desc Apply changes on Player?
 * OFF - false  ON - true
 * @default true
 * 
 * @arg all
 * @type boolean
 * @on ON
 * @off OFF
 * @text Affect all
 * @desc Apply changes on whole party?
 * OFF - false  ON - true
 * @default false
 * 
 * @arg duration
 * @type number
 * @min 0
 * @default
 * @text Popup Duration
 * @desc Set the duration of the popup (overwrite the parameter setting).
 * 
 * @arg posX
 * @default
 * @text Position X
 * @desc Set the horizontal position of the popup.
 * 
 * @arg posY
 * @default
 * @text Position Y
 * @desc Set the vertical position of the popup.
 * 
 * 
 */

(() => {
function _0x2912(_0x246c6c,_0x3182ee){const _0x55077c=_0x5507();return _0x2912=function(_0x291288,_0x1883d){_0x291288=_0x291288-0x1c6;let _0x4aeb71=_0x55077c[_0x291288];return _0x4aeb71;},_0x2912(_0x246c6c,_0x3182ee);}const _0x4a6251=_0x2912;(function(_0x3ffeea,_0x137c04){const _0x293b7b=_0x2912,_0x1b1ee1=_0x3ffeea();while(!![]){try{const _0x2590aa=-parseInt(_0x293b7b(0x1e7))/0x1+-parseInt(_0x293b7b(0x269))/0x2+parseInt(_0x293b7b(0x24d))/0x3+-parseInt(_0x293b7b(0x1e5))/0x4*(parseInt(_0x293b7b(0x22d))/0x5)+-parseInt(_0x293b7b(0x282))/0x6+-parseInt(_0x293b7b(0x20c))/0x7*(parseInt(_0x293b7b(0x1c7))/0x8)+-parseInt(_0x293b7b(0x23c))/0x9*(-parseInt(_0x293b7b(0x275))/0xa);if(_0x2590aa===_0x137c04)break;else _0x1b1ee1['push'](_0x1b1ee1['shift']());}catch(_0xbd5504){_0x1b1ee1['push'](_0x1b1ee1['shift']());}}}(_0x5507,0xd79a4),TSR['Parameters']=PluginManager[_0x4a6251(0x280)](TSR[_0x4a6251(0x208)][_0x4a6251(0x237)]),TSR['mapPopups'][_0x4a6251(0x248)]=Number(TSR[_0x4a6251(0x20d)][_0x4a6251(0x245)])||0x3c,TSR[_0x4a6251(0x208)]['_offsetX']=String(TSR[_0x4a6251(0x20d)][_0x4a6251(0x284)])||null,TSR[_0x4a6251(0x208)]['_offsetY']=String(TSR[_0x4a6251(0x20d)]['Popups\x20Offset\x20Y'])||null,TSR[_0x4a6251(0x208)][_0x4a6251(0x281)]=String(TSR['Parameters'][_0x4a6251(0x26a)])||null,TSR[_0x4a6251(0x208)][_0x4a6251(0x1fa)]=eval(String(TSR[_0x4a6251(0x20d)]['Show\x20Currency\x20Unit'])),TSR[_0x4a6251(0x208)][_0x4a6251(0x281)]=String(TSR[_0x4a6251(0x20d)]['Currency\x20Abbreviation'])||null,TSR[_0x4a6251(0x208)][_0x4a6251(0x1da)]=eval(String(TSR['Parameters']['Damage\x20Popups\x20Prefix'])),TSR['mapPopups']['_suffix']=eval(String(TSR[_0x4a6251(0x20d)]['Damage\x20Popups\x20Suffix'])),TSR[_0x4a6251(0x208)]['_autoItemPopup']=eval(String(TSR[_0x4a6251(0x20d)]['Auto\x20Item\x20Popups'])),TSR[_0x4a6251(0x208)][_0x4a6251(0x286)]=eval(String(TSR[_0x4a6251(0x20d)][_0x4a6251(0x1d0)])),TSR[_0x4a6251(0x208)][_0x4a6251(0x202)]=eval(String(TSR[_0x4a6251(0x20d)][_0x4a6251(0x270)])),TSR['mapPopups'][_0x4a6251(0x220)]=Number(TSR[_0x4a6251(0x20d)][_0x4a6251(0x1e4)])||0x0,TSR[_0x4a6251(0x208)][_0x4a6251(0x1f7)]=Number(TSR[_0x4a6251(0x20d)][_0x4a6251(0x1e6)])||0x0,TSR[_0x4a6251(0x208)][_0x4a6251(0x1e1)]=eval(String(TSR[_0x4a6251(0x20d)][_0x4a6251(0x1ec)])),TSR['mapPopups'][_0x4a6251(0x214)]=Number(TSR[_0x4a6251(0x20d)][_0x4a6251(0x212)])||0x0,TSR[_0x4a6251(0x208)][_0x4a6251(0x228)]=eval(String(TSR[_0x4a6251(0x20d)][_0x4a6251(0x232)])),PluginManager[_0x4a6251(0x254)](TSR['mapPopups'][_0x4a6251(0x237)],_0x4a6251(0x235),_0x2ee9b3=>{const _0x965bc3=_0x4a6251,_0x481223=String(_0x2ee9b3[_0x965bc3(0x235)]),_0x5791e1=Number(_0x2ee9b3[_0x965bc3(0x268)])<0x0?$gameMap[_0x965bc3(0x1d7)][_0x965bc3(0x21c)]:Number(_0x2ee9b3['target']),_0x1721cc=Number(_0x2ee9b3['color']),_0x400eee=Number(_0x2ee9b3[_0x965bc3(0x256)])||TSR[_0x965bc3(0x208)][_0x965bc3(0x248)],_0x25de88=String(_0x2ee9b3['posX']),_0x5a9ec2=String(_0x2ee9b3[_0x965bc3(0x1e8)]);let _0x5b2eb1=_0x5791e1?$gameMap[_0x965bc3(0x1fb)][_0x5791e1]:$gamePlayer;_0x5b2eb1[_0x965bc3(0x25a)](_0x481223,_0x1721cc,_0x400eee,_0x25de88,_0x5a9ec2);}),PluginManager[_0x4a6251(0x254)](TSR[_0x4a6251(0x208)][_0x4a6251(0x237)],'item',_0x51dc2c=>{const _0x2579cc=_0x4a6251,_0x5efadc=Number(_0x51dc2c[_0x2579cc(0x26c)]),_0x3cc7e7=Number(_0x51dc2c[_0x2579cc(0x1de)]),_0x467854=String(_0x51dc2c[_0x2579cc(0x1d9)]),_0x26a637=Number(_0x51dc2c[_0x2579cc(0x260)]),_0x167546=eval(String(_0x51dc2c[_0x2579cc(0x25c)])),_0x23cfc2=Number(_0x51dc2c['target'])<0x0?$gameMap[_0x2579cc(0x1d7)][_0x2579cc(0x21c)]:Number(_0x51dc2c[_0x2579cc(0x268)]),_0x2cd84f=Number(_0x51dc2c[_0x2579cc(0x256)])||TSR[_0x2579cc(0x208)][_0x2579cc(0x248)],_0x582620=String(_0x51dc2c['posX']),_0x4ce889=String(_0x51dc2c['posY']);let _0x3a8b1a=_0x23cfc2?$gameMap[_0x2579cc(0x1fb)][_0x23cfc2]:$gamePlayer;_0x3a8b1a[_0x2579cc(0x27d)](_0x467854,_0x5efadc,_0x3cc7e7,_0x26a637,0x0,_0x167546,_0x2cd84f,_0x582620,_0x4ce889);}),PluginManager[_0x4a6251(0x254)](TSR['mapPopups'][_0x4a6251(0x237)],_0x4a6251(0x1db),_0x163edb=>{const _0x31cd54=_0x4a6251,_0x34abc9=0x0,_0x13cc03=Number(_0x163edb[_0x31cd54(0x225)]),_0x291efc=_0x31cd54(0x23b),_0x27f482=Number(_0x163edb[_0x31cd54(0x260)]),_0x2bda8d=Number(_0x163edb[_0x31cd54(0x22c)]),_0x11fee5=eval(String(_0x163edb[_0x31cd54(0x25c)])),_0xe22b14=Number(_0x163edb['target'])<0x0?$gameMap[_0x31cd54(0x1d7)][_0x31cd54(0x21c)]:Number(_0x163edb[_0x31cd54(0x268)]),_0x4f7411=Number(_0x163edb[_0x31cd54(0x256)])||TSR['mapPopups']['_popupDuration'],_0x6751fd=String(_0x163edb[_0x31cd54(0x1ca)]),_0x8df37b=String(_0x163edb[_0x31cd54(0x1e8)]);let _0x57c482=_0xe22b14?$gameMap[_0x31cd54(0x1fb)][_0xe22b14]:$gamePlayer;_0x57c482[_0x31cd54(0x27d)](_0x291efc,_0x34abc9,_0x13cc03,_0x27f482,_0x2bda8d,_0x11fee5,_0x4f7411,_0x6751fd,_0x8df37b);}),PluginManager['registerCommand'](TSR[_0x4a6251(0x208)][_0x4a6251(0x237)],_0x4a6251(0x24c),_0x12571c=>{const _0x1a9312=_0x4a6251,_0x50c7d0=String(_0x12571c[_0x1a9312(0x1d9)]),_0x3029fa=String(_0x12571c['value']),_0x3660f2=eval(String(_0x12571c['effect'])),_0x3fff37=eval(String(_0x12571c[_0x1a9312(0x27e)])),_0x4e40a1=Number(_0x12571c[_0x1a9312(0x268)])<0x0?$gameMap[_0x1a9312(0x1d7)][_0x1a9312(0x21c)]:Number(_0x12571c[_0x1a9312(0x268)]),_0x4bccf6=Number(_0x12571c[_0x1a9312(0x256)])||TSR[_0x1a9312(0x208)]['_popupDuration'],_0x47314c=String(_0x12571c[_0x1a9312(0x1ca)]),_0x596d89=String(_0x12571c[_0x1a9312(0x1e8)]);let _0x93b7d1=_0x4e40a1?$gameMap['_events'][_0x4e40a1]:$gamePlayer;_0x93b7d1[_0x1a9312(0x1d6)](_0x50c7d0,_0x3029fa,_0x3660f2,_0x3fff37,_0x4bccf6,_0x47314c,_0x596d89);}),TSR[_0x4a6251(0x208)]['ColorManager_damageColor']=ColorManager[_0x4a6251(0x258)],ColorManager[_0x4a6251(0x258)]=function(_0x7d1f32){const _0x3d1f5c=_0x4a6251;if(_0x7d1f32>0x3)switch(_0x7d1f32){case 0x4:return _0x3d1f5c(0x252);case 0x5:return _0x3d1f5c(0x244);default:return _0x3d1f5c(0x238);}else return TSR[_0x3d1f5c(0x208)][_0x3d1f5c(0x230)][_0x3d1f5c(0x27c)](this,_0x7d1f32);},Game_System['prototype'][_0x4a6251(0x277)]=function(_0x26977b){const _0x4fb5fa=_0x4a6251;TSR[_0x4fb5fa(0x208)][_0x4fb5fa(0x24a)]=_0x26977b;},Game_System[_0x4a6251(0x274)]['setAutoGoldPopups']=function(_0x3415a6){const _0x5c64d2=_0x4a6251;TSR['mapPopups'][_0x5c64d2(0x202)]=_0x3415a6;},Game_System[_0x4a6251(0x274)][_0x4a6251(0x271)]=function(_0x462061){const _0x5389b6=_0x4a6251;TSR[_0x5389b6(0x208)]['_autoExpPopup']=_0x462061;},Game_Character['prototype']['requestMapPopups']=function(){return this['_requestMapPopups'];},Game_Character[_0x4a6251(0x274)][_0x4a6251(0x285)]=function(){this['_requestMapPopups']=![];},Game_Character[_0x4a6251(0x274)]['requestSecondPopups']=function(){const _0x3d31fa=_0x4a6251;return this[_0x3d31fa(0x24f)];},Game_Character[_0x4a6251(0x274)][_0x4a6251(0x1e3)]=function(){const _0x3154bc=_0x4a6251;this[_0x3154bc(0x24f)]=![];},Game_Character[_0x4a6251(0x274)][_0x4a6251(0x25a)]=function(_0x44a0a6,_0x170edb,_0x30ea48,_0x28977c,_0x5df919,_0x1ea88d,_0x5652e6){const _0x415e11=_0x4a6251,_0x5cdf3c=ColorManager['textColor'](_0x170edb);this[_0x415e11(0x26f)]=[_0x415e11(0x235),_0x44a0a6,_0x5cdf3c,_0x30ea48,_0x28977c,_0x5df919,_0x5652e6];if(_0x1ea88d){const _0x4a7d5d=_0x1ea88d>0x0?'+':'',_0x1fed2d=_0x4a7d5d+_0x1ea88d+'\x20'+TextManager[_0x415e11(0x236)];this[_0x415e11(0x24f)]=[_0x415e11(0x235),_0x1fed2d,_0x5cdf3c,_0x30ea48,_0x28977c,_0x5df919,_0x5652e6];}},Game_Character['prototype']['startItemPopup']=function(_0x3267d6,_0x29cc67,_0x46d5ad,_0xb6a404,_0x344725,_0x423b5b,_0x100288,_0x4cc619,_0xce0b54,_0x366887){const _0x2932dd=_0x4a6251,_0x4523a9=eval('$data'+_0x3267d6+'['+_0x29cc67+']'),_0x475999=_0x4523a9?'item':_0x2932dd(0x1db),_0x112741=_0x4523a9?_0x4523a9[_0x2932dd(0x217)]:0x0,_0x4c2f24=_0x4523a9?_0x4523a9[_0x2932dd(0x278)]:_0x344725,_0x96fdf5=_0x366887?_0xb6a404:ColorManager[_0x2932dd(0x25b)](_0xb6a404);this[_0x2932dd(0x26f)]=[_0x475999,_0x112741,_0x4c2f24,_0x46d5ad,_0x96fdf5,_0x100288,_0x4cc619,_0xce0b54,_0x366887],_0x423b5b&&!_0x366887&&(_0x475999===_0x2932dd(0x1dc)?$gameParty[_0x2932dd(0x205)](_0x4523a9,_0x46d5ad,!![],!![]):$gameParty[_0x2932dd(0x240)](_0x46d5ad,!![]));},Game_Character[_0x4a6251(0x274)][_0x4a6251(0x1d6)]=function(_0x580fb9,_0x3bd3f3,_0x1072c0,_0x10b1c8,_0x213ca3,_0x334df0,_0x595314){const _0x2abaf6=_0x4a6251,_0x1579e5=Window_Base[_0x2abaf6(0x274)][_0x2abaf6(0x24b)](_0x3bd3f3),_0x5ae108=_0x1579e5<0x0,_0x25a1d4=Math['abs'](_0x1579e5)[_0x2abaf6(0x1ea)]();let _0x1183f6,_0x4218e7='',_0xea3559='';if(_0x580fb9==='hp')_0x1183f6=!_0x5ae108?ColorManager[_0x2abaf6(0x258)](0x0):ColorManager['damageColor'](0x1);else{if(_0x580fb9==='mp')_0x1183f6=!_0x5ae108?ColorManager[_0x2abaf6(0x258)](0x2):ColorManager['damageColor'](0x3);else _0x580fb9==='tp'&&(_0x1183f6=!_0x5ae108?ColorManager['damageColor'](0x4):ColorManager['damageColor'](0x5));}if(TSR['mapPopups'][_0x2abaf6(0x1da)])_0x4218e7=_0x5ae108?'+':'-';if(TSR[_0x2abaf6(0x208)]['_suffix'])_0xea3559=_0x580fb9?TextManager[_0x580fb9]:'';this[_0x2abaf6(0x26f)]=['damage',_0x4218e7+_0x25a1d4+_0xea3559,_0x1183f6,_0x213ca3,_0x334df0,_0x595314];if(_0x1072c0&&!this[_0x2abaf6(0x21c)]){if(!_0x10b1c8){const _0x5df25d=this===$gamePlayer?$gameParty[_0x2abaf6(0x261)]():$gameParty['battleMembers']()[this[_0x2abaf6(0x223)]];switch(_0x580fb9){case'hp':_0x5df25d[_0x2abaf6(0x1d8)](-_0x1579e5);break;case'mp':_0x5df25d[_0x2abaf6(0x226)](-_0x1579e5);break;case'tp':_0x5df25d[_0x2abaf6(0x234)](_0x5df25d['tp']-_0x1579e5);break;default:break;}}else{for(const _0x39b530 of $gameParty[_0x2abaf6(0x1cd)]()){switch(_0x580fb9){case'hp':_0x39b530[_0x2abaf6(0x1d8)](-_0x1579e5);break;case'mp':_0x39b530[_0x2abaf6(0x226)](-_0x1579e5);break;case'tp':_0x39b530['setTp'](_0x39b530['tp']-_0x1579e5);break;default:break;}}const _0x41e5db=$gamePlayer[_0x2abaf6(0x27f)]();if(_0x41e5db['isVisible']())for(const _0x108820 of _0x41e5db[_0x2abaf6(0x23a)]){_0x108820[_0x2abaf6(0x26f)]=[_0x2abaf6(0x24c),_0x4218e7+_0x25a1d4+_0xea3559,_0x1183f6,_0x213ca3,_0x334df0,_0x595314];}}}},TSR[_0x4a6251(0x208)][_0x4a6251(0x23d)]=Game_Actor[_0x4a6251(0x274)]['tradeItemWithParty'],Game_Actor[_0x4a6251(0x274)][_0x4a6251(0x26b)]=function(_0xd736c7,_0x3eb1f0){const _0x310cb0=_0x4a6251;TSR[_0x310cb0(0x208)][_0x310cb0(0x1fd)]=TSR['mapPopups'][_0x310cb0(0x24a)],TSR[_0x310cb0(0x208)][_0x310cb0(0x24a)]=![];const _0x58338d=TSR[_0x310cb0(0x208)]['_Game_Actor_tradeItemWithParty'][_0x310cb0(0x27c)](this,_0xd736c7,_0x3eb1f0);return TSR[_0x310cb0(0x208)][_0x310cb0(0x24a)]=TSR[_0x310cb0(0x208)]['_cacheAutoItem'],_0x58338d;},TSR['mapPopups'][_0x4a6251(0x283)]=Game_Party['prototype']['gainItem'],Game_Party['prototype'][_0x4a6251(0x205)]=function(_0x5230cf,_0x1c057f,_0x49d2c5,_0x2af423){const _0x1a3baa=_0x4a6251;TSR[_0x1a3baa(0x208)][_0x1a3baa(0x283)][_0x1a3baa(0x27c)](this,_0x5230cf,_0x1c057f,_0x49d2c5);const _0x355462=this[_0x1a3baa(0x219)](_0x5230cf);if(_0x355462&&TSR[_0x1a3baa(0x208)][_0x1a3baa(0x24a)]&&!_0x2af423){let _0x177560='0';if(_0x5230cf['meta'][_0x1a3baa(0x260)])_0x177560=_0x5230cf[_0x1a3baa(0x276)][_0x1a3baa(0x260)][_0x1a3baa(0x21b)]();if(_0x5230cf['meta']['Color'])_0x177560=_0x5230cf[_0x1a3baa(0x276)][_0x1a3baa(0x218)][_0x1a3baa(0x21b)]();const _0x7c9783=_0x177560[_0x1a3baa(0x266)]<0x6?ColorManager[_0x1a3baa(0x25b)](parseInt(_0x177560)):_0x177560[_0x1a3baa(0x26d)]('#')?_0x177560:'#'[_0x1a3baa(0x251)](_0x177560),_0xc6e15f=TSR[_0x1a3baa(0x208)][_0x1a3baa(0x248)];$gamePlayer[_0x1a3baa(0x27d)](_0x355462,_0x5230cf['id'],_0x1c057f,_0x7c9783,0x0,![],_0xc6e15f,0x0,0x0,!![]),$gameMap[_0x1a3baa(0x1d7)][_0x1a3baa(0x22a)](0x1);}},Game_Party[_0x4a6251(0x274)][_0x4a6251(0x219)]=function(_0x575a4c){const _0x31a9d7=_0x4a6251;if(!_0x575a4c)return null;else{if(DataManager[_0x31a9d7(0x1f8)](_0x575a4c))return _0x31a9d7(0x23b);else{if(DataManager[_0x31a9d7(0x25f)](_0x575a4c))return _0x31a9d7(0x1d2);else return DataManager[_0x31a9d7(0x246)](_0x575a4c)?_0x31a9d7(0x224):null;}}},TSR[_0x4a6251(0x208)][_0x4a6251(0x1d3)]=Game_Party[_0x4a6251(0x274)]['gainGold'],Game_Party[_0x4a6251(0x274)][_0x4a6251(0x240)]=function(_0x502145,_0x486f82){const _0x1e311f=_0x4a6251;TSR['mapPopups'][_0x1e311f(0x1d3)][_0x1e311f(0x27c)](this,_0x502145);if(TSR[_0x1e311f(0x208)][_0x1e311f(0x202)]&&!_0x486f82){const _0xcbb56f=TSR['mapPopups'][_0x1e311f(0x220)],_0x344065=ColorManager[_0x1e311f(0x25b)](_0xcbb56f),_0x273997=TSR['mapPopups'][_0x1e311f(0x1f7)],_0x2fc850=TSR[_0x1e311f(0x208)][_0x1e311f(0x248)];$gamePlayer[_0x1e311f(0x27d)](_0x1e311f(0x23b),0x0,_0x502145,_0x344065,_0x273997,![],_0x2fc850,0x0,0x0,!![]),$gameMap[_0x1e311f(0x1d7)]['wait'](0x1);}},TSR[_0x4a6251(0x208)]['_GameActor_changeExp']=Game_Actor[_0x4a6251(0x274)]['changeExp'],Game_Actor['prototype']['changeExp']=function(_0x21db34,_0x2193fb){const _0x354fb8=_0x4a6251,_0x347114=this[_0x354fb8(0x20f)],_0x3c79a0=this[_0x354fb8(0x201)](),_0x2e89f5=_0x21db34-_0x3c79a0;TSR[_0x354fb8(0x208)][_0x354fb8(0x265)][_0x354fb8(0x27c)](this,_0x21db34,_0x2193fb);if(TSR[_0x354fb8(0x208)][_0x354fb8(0x1e1)]&&this[_0x354fb8(0x201)]()!==_0x3c79a0){const _0x36f92f=this[_0x354fb8(0x20f)]-_0x347114,_0x16c6cf=_0x2e89f5>0x0?'+':'',_0x22a015=_0x16c6cf+_0x2e89f5+'\x20'+TextManager[_0x354fb8(0x1c8)],_0x485c0d=TSR[_0x354fb8(0x208)][_0x354fb8(0x214)],_0x2ae2f5=TSR[_0x354fb8(0x208)][_0x354fb8(0x248)];$gamePlayer['startTextPopup'](_0x22a015,_0x485c0d,_0x2ae2f5,0x0,0x0,_0x36f92f,!![]),$gameMap['_interpreter'][_0x354fb8(0x22a)](0x1);}},TSR['mapPopups']['_Spriteset_Map_createUpperLayer']=Spriteset_Map[_0x4a6251(0x274)]['createUpperLayer'],Spriteset_Map[_0x4a6251(0x274)]['createUpperLayer']=function(){const _0x3ba4ef=_0x4a6251;TSR[_0x3ba4ef(0x208)][_0x3ba4ef(0x1ff)]['call'](this),this[_0x3ba4ef(0x211)]();},Spriteset_Map[_0x4a6251(0x274)][_0x4a6251(0x211)]=function(){const _0x21d6b9=_0x4a6251,_0xf3981d=this['pictureContainerRect']();this[_0x21d6b9(0x22e)]=new Sprite(),this[_0x21d6b9(0x22e)][_0x21d6b9(0x227)](_0xf3981d['x'],_0xf3981d['y'],_0xf3981d[_0x21d6b9(0x21a)],_0xf3981d[_0x21d6b9(0x20b)]),this[_0x21d6b9(0x233)](this[_0x21d6b9(0x22e)]);},TSR[_0x4a6251(0x208)][_0x4a6251(0x1f0)]=Sprite_Character[_0x4a6251(0x274)][_0x4a6251(0x1f3)],Sprite_Character[_0x4a6251(0x274)][_0x4a6251(0x1f3)]=function(){const _0x471f97=_0x4a6251;TSR['mapPopups'][_0x471f97(0x1f0)][_0x471f97(0x27c)](this),this['_mapPopupsSet']=[],this[_0x471f97(0x222)]=[];},TSR['mapPopups'][_0x4a6251(0x257)]=Sprite_Character[_0x4a6251(0x274)][_0x4a6251(0x1f1)],Sprite_Character[_0x4a6251(0x274)][_0x4a6251(0x1f1)]=function(){const _0x405b0d=_0x4a6251;TSR[_0x405b0d(0x208)][_0x405b0d(0x257)][_0x405b0d(0x27c)](this),this[_0x405b0d(0x1ed)]();},Sprite_Character[_0x4a6251(0x274)]['setupMapPopups']=function(){const _0x477f9b=_0x4a6251,_0x4e2bfa=this[_0x477f9b(0x262)]['requestMapPopups'](),_0x8f86bc=this[_0x477f9b(0x262)][_0x477f9b(0x215)]();_0x8f86bc&&(this[_0x477f9b(0x262)][_0x477f9b(0x1e3)](),this[_0x477f9b(0x1f9)](_0x8f86bc)),_0x4e2bfa&&(this[_0x477f9b(0x262)]['clearMapPopup'](),this[_0x477f9b(0x1f9)](_0x4e2bfa));},Sprite_Character[_0x4a6251(0x274)][_0x4a6251(0x1f9)]=function(_0x1f3ae0){const _0x4e29b6=_0x4a6251,_0x157107=_0x1f3ae0[0x0];let _0x12561c=_0x1f3ae0[0x1],_0x233a0f=ColorManager[_0x4e29b6(0x1e0)](),_0x56f117=0x0,_0x5b25e3=0x0,_0x2752fe=0x0,_0x675192=0x0,_0x1ecd9e=![];if(_0x157107==='text'){_0x233a0f=_0x1f3ae0[0x2],_0x5b25e3=_0x1f3ae0[0x3],_0x2752fe=_0x1f3ae0[0x4],_0x675192=_0x1f3ae0[0x5],_0x1ecd9e=_0x1f3ae0[0x6];const _0x3aaf59=this['createMapIconSprite'](0x0,'',_0x56f117,_0x5b25e3,_0x2752fe,_0x675192);this[_0x4e29b6(0x222)][_0x4e29b6(0x1e2)](_0x3aaf59);if(_0x1ecd9e)_0x3aaf59['y']-=(ImageManager[_0x4e29b6(0x25e)]+0x4)*this[_0x4e29b6(0x222)][_0x4e29b6(0x1dd)](_0x3aaf59);}else{if(_0x157107===_0x4e29b6(0x1dc)){const _0x3c3559=_0x1f3ae0[0x2],_0x16ba23=_0x1f3ae0[0x3]>0x1||_0x1f3ae0[0x3]<0x0?'\x20x'+Math[_0x4e29b6(0x1c9)](_0x1f3ae0[0x3]):'',_0x4cd228=_0x1f3ae0[0x3]<0x0?'-':'';_0x233a0f=_0x1f3ae0[0x4];if(!TSR[_0x4e29b6(0x208)][_0x4e29b6(0x286)])_0x12561c='';_0x12561c=_0x4cd228[_0x4e29b6(0x251)](_0x12561c[_0x4e29b6(0x251)](_0x16ba23)),_0x56f117=ImageManager[_0x4e29b6(0x25e)]/0x2,_0x5b25e3=_0x1f3ae0[0x5],_0x2752fe=_0x1f3ae0[0x6],_0x675192=_0x1f3ae0[0x7],_0x1ecd9e=_0x1f3ae0[0x8];const _0x180f8f=this[_0x4e29b6(0x1d1)](_0x3c3559,_0x12561c,_0x56f117,_0x5b25e3,_0x2752fe,_0x675192);this[_0x4e29b6(0x222)][_0x4e29b6(0x1e2)](_0x180f8f);if(_0x1ecd9e)_0x180f8f['y']-=(ImageManager[_0x4e29b6(0x25e)]+0x4)*this[_0x4e29b6(0x222)][_0x4e29b6(0x1dd)](_0x180f8f);}else{if(_0x157107===_0x4e29b6(0x1db)){_0x12561c=_0x1f3ae0[0x3],_0x233a0f=_0x1f3ae0[0x4];const _0x29e004=TSR[_0x4e29b6(0x208)][_0x4e29b6(0x281)]||TextManager[_0x4e29b6(0x263)];if(TSR[_0x4e29b6(0x208)][_0x4e29b6(0x1fa)])_0x12561c+=_0x4e29b6(0x1cb)+_0x29e004;_0x5b25e3=_0x1f3ae0[0x5],_0x2752fe=_0x1f3ae0[0x6],_0x675192=_0x1f3ae0[0x7],_0x1ecd9e=_0x1f3ae0[0x8];if(_0x1f3ae0[0x2]){_0x56f117=ImageManager[_0x4e29b6(0x25e)]/0x2;const _0x47a3af=_0x1f3ae0[0x2],_0x549a07=this[_0x4e29b6(0x1d1)](_0x47a3af,_0x1f3ae0[0x3][_0x4e29b6(0x1ea)](),_0x56f117,_0x5b25e3,_0x2752fe,_0x675192);this[_0x4e29b6(0x222)][_0x4e29b6(0x1e2)](_0x549a07);if(_0x1ecd9e)_0x549a07['y']-=(ImageManager['iconWidth']+0x4)*this['_mapPopupIconsSet']['indexOf'](_0x549a07);}else{const _0xb3c149=this['createMapIconSprite'](0x0,'',_0x56f117,_0x5b25e3,_0x2752fe,_0x675192);this[_0x4e29b6(0x222)][_0x4e29b6(0x1e2)](_0xb3c149);if(_0x1ecd9e)_0xb3c149['y']-=(ImageManager['iconWidth']+0x4)*this[_0x4e29b6(0x222)]['indexOf'](_0xb3c149);}}else _0x157107===_0x4e29b6(0x24c)&&(_0x12561c=_0x1f3ae0[0x1],_0x233a0f=_0x1f3ae0[0x2],_0x5b25e3=_0x1f3ae0[0x3],_0x2752fe=_0x1f3ae0[0x4],_0x675192=_0x1f3ae0[0x5]);}}_0x12561c=_0x4e29b6(0x272)+_0x233a0f+_0x12561c;const _0x1591a4=this[_0x4e29b6(0x207)](_0x157107,_0x12561c,_0x56f117,_0x5b25e3,_0x2752fe,_0x675192);this['_mapPopupsSet'][_0x4e29b6(0x1e2)](_0x1591a4);if(_0x1ecd9e)_0x1591a4['y']-=(ImageManager[_0x4e29b6(0x25e)]+0x4)*this[_0x4e29b6(0x22e)][_0x4e29b6(0x1dd)](_0x1591a4);},Sprite_Character[_0x4a6251(0x274)]['createMapPopupSprite']=function(_0x90f446,_0x3440c7,_0x150b45,_0x415c70,_0x16bc31,_0x438a94){const _0x28c084=_0x4a6251,_0x1d481e=this[_0x28c084(0x22b)](),_0xa7c7cb=new Sprite_MapPopup();let _0x3d0159=parseInt(TSR[_0x28c084(0x208)][_0x28c084(0x229)])||0x0,_0x2cf593=parseInt(TSR['mapPopups'][_0x28c084(0x1df)])||0x0,_0x4244b3=_0x16bc31&&_0x16bc31[_0x28c084(0x279)]()[_0x28c084(0x26d)](_0x28c084(0x1cc)),_0x112fd6=_0x438a94&&_0x438a94[_0x28c084(0x279)]()[_0x28c084(0x26d)](_0x28c084(0x1cc));if(_0x16bc31)_0x3d0159=parseInt(_0x16bc31[_0x28c084(0x200)](/\s*pos\s*/,''));if(_0x438a94)_0x2cf593=parseInt(_0x438a94['replace'](/\s*pos\s*/,''));return _0xa7c7cb['x']=_0x4244b3?_0x3d0159-_0x1d481e/0x2+_0x150b45:this['x']-_0x1d481e/0x2+_0x150b45+_0x3d0159,_0xa7c7cb['y']=_0x112fd6?_0x2cf593-$gameMap[_0x28c084(0x1f6)]()+$gameSystem['windowPadding']()/0x2:this['y']-$gameMap['tileHeight']()+$gameSystem[_0x28c084(0x249)]()/0x2+_0x2cf593,_0xa7c7cb[_0x28c084(0x27a)]=_0x415c70,_0xa7c7cb[_0x28c084(0x1f2)](_0x90f446,_0x3440c7),SceneManager[_0x28c084(0x203)][_0x28c084(0x1fc)][_0x28c084(0x22e)][_0x28c084(0x233)](_0xa7c7cb),_0xa7c7cb;},Sprite_Character[_0x4a6251(0x274)]['createMapIconSprite']=function(_0xbdc992,_0x53dbbe,_0x350b02,_0x5bd211,_0x4083c9,_0x12ffcd){const _0x49dfd9=_0x4a6251,_0x504521=this['charWidth'](),_0x22ddce=_0x53dbbe[_0x49dfd9(0x266)]*_0x504521,_0xc9edb=new Sprite_MapIcon();let _0x5845ea=parseInt(TSR[_0x49dfd9(0x208)][_0x49dfd9(0x229)])||0x0,_0xd9d3da=parseInt(TSR['mapPopups'][_0x49dfd9(0x1df)])||0x0,_0x3a1351=_0x4083c9&&_0x4083c9['toLowerCase']()['includes'](_0x49dfd9(0x1cc)),_0x4c32ba=_0x12ffcd&&_0x12ffcd[_0x49dfd9(0x279)]()[_0x49dfd9(0x26d)](_0x49dfd9(0x1cc));if(_0x4083c9)_0x5845ea=parseInt(_0x4083c9[_0x49dfd9(0x200)](/\s*pos\s*/,''));if(_0x12ffcd)_0xd9d3da=parseInt(_0x12ffcd['replace'](/\s*pos\s*/,''));return _0xc9edb['x']=_0x3a1351?_0x5845ea-_0x22ddce/0x2-_0x504521-_0x504521/0x2+_0x350b02:this['x']-_0x22ddce/0x2-_0x504521-_0x504521/0x2+_0x350b02+_0x5845ea,_0xc9edb['y']=_0x4c32ba?_0xd9d3da-$gameMap[_0x49dfd9(0x1f6)]():this['y']-$gameMap[_0x49dfd9(0x1f6)]()+_0xd9d3da,_0xc9edb[_0x49dfd9(0x27a)]=_0x5bd211,_0xc9edb[_0x49dfd9(0x1f2)](_0xbdc992),SceneManager[_0x49dfd9(0x203)][_0x49dfd9(0x1fc)][_0x49dfd9(0x22e)][_0x49dfd9(0x233)](_0xc9edb),_0xc9edb;},Sprite_Character['prototype'][_0x4a6251(0x22b)]=function(){const _0x416499=_0x4a6251,_0xd074a4=$gameSystem[_0x416499(0x1e9)]()-0x4;return Math[_0x416499(0x1cf)](_0xd074a4*0.5);},Sprite_Character[_0x4a6251(0x274)][_0x4a6251(0x1ed)]=function(){const _0x222eab=_0x4a6251;this[_0x222eab(0x1fe)](),this[_0x222eab(0x22e)][_0x222eab(0x266)]>0x0&&(!this[_0x222eab(0x22e)][0x0]['isPlaying']()&&(SceneManager[_0x222eab(0x203)]['_spriteset'][_0x222eab(0x22e)]['removeChild'](this['_mapPopupsSet'][0x0]),this['_mapPopupsSet'][_0x222eab(0x255)]())),this[_0x222eab(0x222)][_0x222eab(0x266)]>0x0&&(!this[_0x222eab(0x222)][0x0][_0x222eab(0x250)]()&&(SceneManager[_0x222eab(0x203)][_0x222eab(0x1fc)][_0x222eab(0x22e)][_0x222eab(0x273)](this[_0x222eab(0x222)][0x0]),this[_0x222eab(0x222)][_0x222eab(0x255)]()));});function _0x5507(){const _0x220f31=['all','followers','parameters','_currencyAbb','3277728bODXBy','_Game_Party_gainItem','Popups\x20Offset\x20X','clearMapPopup','_showItemName','constructor','168MrgpiI','expA','abs','posX','\x5csysColor','pos','battleMembers','opacity','floor','Show\x20Item\x20Name','createMapIconSprite','Weapons','_Game_Party_gainGold','popupColor','tileWidth','startDamageMapPopup','_interpreter','gainHp','category','_prefix','gold','item','indexOf','quantity','_offsetY','normalColor','_autoExpPopup','push','clearSecondPopup','Auto\x20Gold\x20Color','12otAUqn','Auto\x20Gold\x20Icon','910198HmnxPV','posY','mainFontSize','toString','updateScroll','Auto\x20Exp\x20Popups','updateMapPopups','center','_lastDisplayX','_Sprite_Character_initMembers','update','setup','initMembers','numberFontFace','fontSize','tileHeight','_autoGoldIcon','isItem','startMapPopup','_currencyUnit','_events','_spriteset','_cacheAutoItem','setupMapPopups','_Spriteset_Map_createUpperLayer','replace','currentExp','_autoGoldPopup','_scene','children','gainItem','initMember','createMapPopupSprite','mapPopups','fontFace','drawText','height','376481oCMCDf','Parameters','initialize','_level','pad','createMapPopupsSet','Exp\x20Color','slice','_expColor','requestSecondPopups','outlineWidth','name','Color','itemDataObj','width','trim','_eventId','createIconSprite','apply','numbPopup','_autoGoldColor','createBitmap','_mapPopupIconsSet','_memberIndex','Armors','value','gainMp','setFrame','_damageMotion','_offsetX','wait','charWidth','icon','252065ykbvnd','_mapPopupsSet','updateChild','ColorManager_damageColor','anchor','Damage\x20Motion','addChild','setTp','text','levelA','pluginName','#808080','create','_data','Items','27bhZZbV','_Game_Actor_tradeItemWithParty','createChildSprite','round','gainGold','mainFontFace','_mapPopupType','_displayX','#4d94ff','Popups\x20Duration','isArmor','_dropDelay','_popupDuration','windowPadding','_autoItemPopup','convertEscapeCharacters','damage','4954446LKHMFH','IconSet','_requestSecondPopups','isPlaying','concat','#ff9900','loadSystem','registerCommand','shift','duration','_Sprite_Character_update','damageColor','systemColor','startTextPopup','textColor','effect','createMapPopup','iconWidth','isWeapon','color','leader','_character','currencyUnit','_lastDisplayY','_GameActor_changeExp','length','bitmap','target','2380994BzOBGA','Currency\x20Abbreviation','tradeItemWithParty','itemId','includes','outlineColor','_requestMapPopups','Auto\x20Gold\x20Popups','setAutoExpPopups','\x5ccolor','removeChild','prototype','10530970ljEYmu','meta','setAutoItemPopups','iconIndex','toLowerCase','_duration','_displayY','call','startItemPopup'];_0x5507=function(){return _0x220f31;};return _0x5507();}function Sprite_MapPopup(){const _0x1eb543=_0x4a6251;this['initialize'][_0x1eb543(0x21e)](this,arguments);}Sprite_MapPopup['prototype']=Object[_0x4a6251(0x239)](Sprite[_0x4a6251(0x274)]),Sprite_MapPopup[_0x4a6251(0x274)]['constructor']=Sprite_MapPopup,Sprite_MapPopup['prototype'][_0x4a6251(0x20e)]=function(){const _0x4bd694=_0x4a6251;Sprite['prototype'][_0x4bd694(0x20e)]['call'](this),this[_0x4bd694(0x206)]();},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x206)]=function(){const _0x8ec596=_0x4a6251;this[_0x8ec596(0x231)]['x']=0.5,this[_0x8ec596(0x231)]['y']=0.5,this[_0x8ec596(0x27a)]=0x0;},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x1f2)]=function(_0x49a0b0,_0x5e8bd0){const _0x325f13=_0x4a6251;this[_0x325f13(0x247)]=this[_0x325f13(0x27a)]/0x3*0x2,this['_mapPopupType']=_0x49a0b0,this[_0x325f13(0x1ef)]=$gameMap['_displayX'],this[_0x325f13(0x264)]=$gameMap['_displayY'],this['createMapPopup'](_0x5e8bd0);},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x1f1)]=function(){const _0x45d608=_0x4a6251;Sprite[_0x45d608(0x274)][_0x45d608(0x1f1)][_0x45d608(0x27c)](this);if(this[_0x45d608(0x27a)]>0x0){this['_duration']--;for(const _0x1a96c6 of this[_0x45d608(0x204)]){this[_0x45d608(0x22f)](_0x1a96c6);}}this['updateScroll']();},Sprite_MapPopup['prototype'][_0x4a6251(0x22f)]=function(_0x2756ab){const _0x5a9481=_0x4a6251;if(this[_0x5a9481(0x27a)]>this[_0x5a9481(0x247)]){_0x2756ab['dy']+=0.5,_0x2756ab['ry']+=_0x2756ab['dy'];if(_0x2756ab['ry']>=0x0){_0x2756ab['ry']=0x0;if(this[_0x5a9481(0x21f)]())_0x2756ab['dy']*=-0.6;}_0x2756ab['y']=Math[_0x5a9481(0x23f)](_0x2756ab['ry']);}else{if(this[_0x5a9481(0x27a)]===this[_0x5a9481(0x247)])_0x2756ab['y']=0x0;else{if(this[_0x5a9481(0x27a)]<this[_0x5a9481(0x247)]-0x2){const _0x503da9=this[_0x5a9481(0x242)]!==_0x5a9481(0x24c)||!TSR[_0x5a9481(0x208)][_0x5a9481(0x228)]?0x1:0x0;_0x2756ab['y']-=_0x503da9,_0x2756ab[_0x5a9481(0x1ce)]-=0x4;}}}},Sprite_MapPopup['prototype'][_0x4a6251(0x1eb)]=function(){const _0xffd169=_0x4a6251;let _0x1f3e7a=0x0,_0x497ff5=0x0;$gameMap[_0xffd169(0x243)]!==this[_0xffd169(0x1ef)]&&(_0x1f3e7a=$gameMap[_0xffd169(0x243)]-this[_0xffd169(0x1ef)]),$gameMap[_0xffd169(0x27b)]!==this[_0xffd169(0x264)]&&(_0x497ff5=$gameMap['_displayY']-this[_0xffd169(0x264)]),this['x']=this['x']-_0x1f3e7a*$gameMap[_0xffd169(0x1d5)](),this['y']=this['y']-_0x497ff5*$gameMap[_0xffd169(0x1f6)](),this[_0xffd169(0x1ef)]=$gameMap[_0xffd169(0x243)],this[_0xffd169(0x264)]=$gameMap[_0xffd169(0x27b)];},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x25d)]=function(_0x47c315){const _0x1e34d4=_0x4a6251,_0x3d8d05=this['fontSize'](),_0x11ec64=Math[_0x1e34d4(0x1cf)](_0x3d8d05*0.65);let _0x26daa0=undefined,_0x598dd4=undefined,_0xbeac44=this[_0x1e34d4(0x1d4)](),_0xdce178=ColorManager[_0x1e34d4(0x259)]();_0x47c315[_0x1e34d4(0x26d)](_0x1e34d4(0x272))&&(_0x26daa0=_0x47c315[_0x1e34d4(0x1dd)](_0x1e34d4(0x272)),_0xbeac44=_0x47c315[_0x1e34d4(0x213)](_0x26daa0+0x6,_0x26daa0+0xd),_0x47c315=_0x47c315['slice'](0x0,_0x26daa0)+_0x47c315['slice'](_0x26daa0+0xd));_0x47c315[_0x1e34d4(0x26d)](_0x1e34d4(0x1cb))&&(_0x598dd4=_0x47c315[_0x1e34d4(0x1dd)]('\x5csysColor'),_0x47c315=_0x47c315[_0x1e34d4(0x213)](0x0,_0x598dd4)+_0x47c315[_0x1e34d4(0x213)](_0x598dd4+0x9));_0x47c315=Window_Base['prototype'][_0x1e34d4(0x24b)](_0x47c315);for(let _0x566076=0x0;_0x566076<_0x47c315[_0x1e34d4(0x266)];_0x566076++){const _0x30bc8f=this[_0x1e34d4(0x23e)](_0x11ec64,_0x3d8d05),_0x2feb0a=this['numbPopup']()?0.6:0.5;if(_0x566076>=_0x26daa0)_0x30bc8f['bitmap']['textColor']=_0xbeac44;if(_0x566076>=_0x598dd4)_0x30bc8f[_0x1e34d4(0x267)][_0x1e34d4(0x25b)]=_0xdce178;_0x30bc8f['bitmap'][_0x1e34d4(0x20a)](_0x47c315[_0x566076],0x0,0x0,_0x11ec64,_0x3d8d05,_0x1e34d4(0x1ee)),_0x30bc8f['x']=(_0x566076-(_0x47c315[_0x1e34d4(0x266)]-0x1)/0x2)*(_0x3d8d05*_0x2feb0a),_0x30bc8f['dy']=this[_0x1e34d4(0x21f)]()?-_0x566076:-_0x566076/0x3;}},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x23e)]=function(_0x42bc02,_0x1d6533){const _0x1e9e23=_0x4a6251,_0x488a5e=new Sprite();return _0x488a5e['bitmap']=this[_0x1e9e23(0x221)](_0x42bc02,_0x1d6533+this[_0x1e9e23(0x210)]()),_0x488a5e[_0x1e9e23(0x231)]['x']=0x0,_0x488a5e['anchor']['y']=0.5,_0x488a5e['y']=this[_0x1e9e23(0x242)]===_0x1e9e23(0x24c)&&TSR[_0x1e9e23(0x208)][_0x1e9e23(0x228)]?-0x18:-0x28,_0x488a5e['ry']=_0x488a5e['y'],this[_0x1e9e23(0x233)](_0x488a5e),_0x488a5e;},Sprite_MapPopup[_0x4a6251(0x274)]['numbPopup']=function(){const _0x4d6ccf=_0x4a6251;return this[_0x4d6ccf(0x242)]===_0x4d6ccf(0x24c)||this[_0x4d6ccf(0x242)]===_0x4d6ccf(0x1db);},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x210)]=function(){const _0x1064ee=_0x4a6251;return $gameSystem[_0x1064ee(0x249)]();},Sprite_MapPopup[_0x4a6251(0x274)]['fontFace']=function(){const _0x49975e=_0x4a6251;return this[_0x49975e(0x21f)]()?$gameSystem[_0x49975e(0x1f4)]():$gameSystem[_0x49975e(0x241)]();},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x1f5)]=function(){const _0x35f7e1=_0x4a6251;return this[_0x35f7e1(0x21f)]()?$gameSystem['mainFontSize']()-0x5:$gameSystem[_0x35f7e1(0x1e9)]()-0x4;},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x1d4)]=function(){const _0xd6d6d9=_0x4a6251;return ColorManager[_0xd6d6d9(0x1e0)]();},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x26e)]=function(){return'rgba(0,\x200,\x200,\x200.7)';},Sprite_MapPopup['prototype'][_0x4a6251(0x216)]=function(){return 0x4;},Sprite_MapPopup[_0x4a6251(0x274)]['createBitmap']=function(_0x15470e,_0x3fe353){const _0x2feb05=_0x4a6251,_0x452b4c=new Bitmap(_0x15470e,_0x3fe353);return _0x452b4c[_0x2feb05(0x209)]=this['fontFace'](),_0x452b4c[_0x2feb05(0x1f5)]=this[_0x2feb05(0x1f5)](),_0x452b4c['textColor']=this[_0x2feb05(0x1d4)](),_0x452b4c[_0x2feb05(0x26e)]=this[_0x2feb05(0x26e)](),_0x452b4c[_0x2feb05(0x216)]=this['outlineWidth'](),_0x452b4c;},Sprite_MapPopup[_0x4a6251(0x274)][_0x4a6251(0x250)]=function(){const _0x750b77=_0x4a6251;return this[_0x750b77(0x27a)]>0x0;};function Sprite_MapIcon(){const _0x48a0a8=_0x4a6251;this[_0x48a0a8(0x20e)][_0x48a0a8(0x21e)](this,arguments);}Sprite_MapIcon[_0x4a6251(0x274)]=Object['create'](Sprite[_0x4a6251(0x274)]),Sprite_MapIcon[_0x4a6251(0x274)][_0x4a6251(0x1c6)]=Sprite_MapIcon,Sprite_MapIcon[_0x4a6251(0x274)][_0x4a6251(0x20e)]=function(){const _0x41fd5f=_0x4a6251;Sprite[_0x41fd5f(0x274)]['initialize'][_0x41fd5f(0x27c)](this),this['initMember']();},Sprite_MapIcon[_0x4a6251(0x274)][_0x4a6251(0x206)]=function(){const _0x2c821a=_0x4a6251;this[_0x2c821a(0x231)]['x']=0.5,this[_0x2c821a(0x231)]['y']=0.5,this[_0x2c821a(0x27a)]=0x0;},Sprite_MapIcon[_0x4a6251(0x274)][_0x4a6251(0x1f2)]=function(_0x110473){const _0x4c3eab=_0x4a6251;this[_0x4c3eab(0x247)]=this['_duration']/0x3*0x2;const _0x42ec4e=ImageManager['iconWidth'],_0x378721=_0x110473%0x10*_0x42ec4e,_0x460448=Math[_0x4c3eab(0x1cf)](_0x110473/0x10)*_0x42ec4e;this['_lastDisplayX']=$gameMap[_0x4c3eab(0x243)],this[_0x4c3eab(0x264)]=$gameMap[_0x4c3eab(0x27b)],this['createIconSprite'](_0x378721,_0x460448,_0x42ec4e,_0x42ec4e);},Sprite_MapIcon[_0x4a6251(0x274)][_0x4a6251(0x21d)]=function(_0x3a1770,_0x1d3bb6,_0x354c2a,_0x5520aa){const _0x56435a=_0x4a6251,_0x5330c2=new Sprite();_0x5330c2['bitmap']=ImageManager[_0x56435a(0x253)](_0x56435a(0x24e)),_0x5330c2[_0x56435a(0x227)](_0x3a1770,_0x1d3bb6,_0x354c2a,_0x5520aa),_0x5330c2[_0x56435a(0x231)]['x']=0.5,_0x5330c2[_0x56435a(0x231)]['y']=0.5,_0x5330c2['y']=-0x28,_0x5330c2['ry']=_0x5330c2['y'],_0x5330c2['dy']=0x0,this['addChild'](_0x5330c2);},Sprite_MapIcon[_0x4a6251(0x274)][_0x4a6251(0x1f1)]=function(){const _0x287fb8=_0x4a6251;if(this['_duration']>0x0){this[_0x287fb8(0x27a)]--;for(const _0x73f073 of this[_0x287fb8(0x204)]){this['updateSprite'](_0x73f073);}}this[_0x287fb8(0x1eb)]();},Sprite_MapIcon['prototype']['updateSprite']=function(_0xa0c269){const _0x5ec16e=_0x4a6251;if(this[_0x5ec16e(0x27a)]>this[_0x5ec16e(0x247)])_0xa0c269['dy']+=0.5,_0xa0c269['ry']+=_0xa0c269['dy'],_0xa0c269['ry']>=0x0&&(_0xa0c269['ry']=0x0),_0xa0c269['y']=Math[_0x5ec16e(0x23f)](_0xa0c269['ry']);else{if(this[_0x5ec16e(0x27a)]===this[_0x5ec16e(0x247)])_0xa0c269['y']=0x0;else this[_0x5ec16e(0x27a)]<this[_0x5ec16e(0x247)]-0x2&&(_0xa0c269['y']-=0x1,_0xa0c269[_0x5ec16e(0x1ce)]-=0x4);}},Sprite_MapIcon[_0x4a6251(0x274)]['updateScroll']=function(){const _0x1dee30=_0x4a6251;let _0x74597b=0x0,_0xe4d947=0x0;$gameMap[_0x1dee30(0x243)]!==this[_0x1dee30(0x1ef)]&&(_0x74597b=$gameMap[_0x1dee30(0x243)]-this[_0x1dee30(0x1ef)]),$gameMap[_0x1dee30(0x27b)]!==this['_lastDisplayY']&&(_0xe4d947=$gameMap['_displayY']-this[_0x1dee30(0x264)]),this['x']=this['x']-_0x74597b*$gameMap[_0x1dee30(0x1d5)](),this['y']=this['y']-_0xe4d947*$gameMap[_0x1dee30(0x1f6)](),this[_0x1dee30(0x1ef)]=$gameMap[_0x1dee30(0x243)],this[_0x1dee30(0x264)]=$gameMap[_0x1dee30(0x27b)];},Sprite_MapIcon['prototype'][_0x4a6251(0x250)]=function(){const _0x2f7530=_0x4a6251;return this[_0x2f7530(0x27a)]>0x0;};
})();

//== END ========================================================================
//===============================================================================