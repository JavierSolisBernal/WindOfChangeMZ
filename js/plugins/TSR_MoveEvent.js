//========================================================================================
//=== TSR_MoveEvent === A Plugin by The Northern Frog ====================================
//========================================================================================

var TSR = TSR || {};
TSR.moveEvent = TSR.moveEvent || {};
TSR.moveEvent.version = 1.45;

var Imported = Imported || {};
Imported.TSR_MoveEvent = true;

//========================================================================================

/*:
 * @target MZ
 * @plugindesc v1.4.5 This plugin allow to push, pull, pick-up and throw events. 
 * 
 * @author TSR, The Northern Frog, 2021      
 * @help 
 * =========================================================================================
 * == About this Plugin ====================================================================
 * =========================================================================================
 * Use the following comment tags to turn the event page into a movable event.
 * 
 * Event Comment Tags:
 * ===================
 * 
 *            <MOVABLE EVENT>
 *                  Event page having this comment tag can be pushed and 
 *                  pulled by the player. 
 * 
 *                  <MOVABLE EVENT: X>
 *                      You can add a switch (X) argument to the comment
 *                      tag. If so, the event will only be movable when
 *                      the game switch X is ON. While the switch is OFF,
 *                      the player will react as if he can push/pull the
 *                      event, but it won't budge unless the switch is
 *                      turned ON.
 * 
 * 
 *            <MOVABLE MYSTERY: X>
 *                  Event page having this comment tag can be pushed and 
 *                  pulled by the player. In addition, these events will  
 *                  play the 'Mystery Sound' (set in parameters), and turn 
 *                  ON the switch specified by X. 
 * 
 *                  This will happen only the first time the event is moved.
 *                  Those events will be considered as regular movable events
 *                  afterwards.
 * 
 * 
 *            <PICKUP EVENT>
 *                  Event page having this comment tags can be picked up and
 *                  thrown by the player. You can use images from tiles sheets
 *                  or character sheets; in both case the event will be fixed
 *                  on the specified image, no matter the direction. The step
 *                  animation can be toggle ON when using a character sheet.
 *
 *              <PICKUP EVENT: X>
 *                  You can add a self switch X argument to the comment tag.
 *                  The event will turn ON the self switch specified by X 
 *                  when it reach the ground after being dropped or thrown. 
 *  
 *
 *            <PICKUP CHARACTER>
 *                  This comment tag have the same effect than the previous
 *                  one. But event having this comment tag must be assigned 
 *                  an image from a character sheet because they will turn
 *                  around according to the player direction when picked up.
 * 
 *                  Example:
 *                      The event is turned down and player comes from down
 *                      side (playing is looking up) and pick up the event.
 *                      The event and player are facing each other, so that
 *                      will remain when player change direction. Hence, if
 *                      player turn left, the event will turn right.
 *                  
 * 
 *            <MOVE EVENT OFFSET: X>
 *                  Use this tag if you need to adjust the distance the
 *                  player has to walk to get closer to the movable event.
 *                  Without the tag, the distance will be defined by the 
 *                  'move event offset' parameter. 
 * 
 *                  This commment tag can also be used on pickup events to
 *                  set the distance between the player and the event it is
 *                  holding.
 * 
 * 
 * Map Note Tag:
 * =============
 * 
 *      By default the thrown events respect the same passability as the player.
 *      You can throw events over some unpassable tiles by using the following
 *      tag in a map notebox.
 * 
 *            <THROW REGION: x, x, x>
 *                  Use this map notetag to mark some region Id as passable
 *                  for throwing event through those regions.
 * 
 * 
 *      Some tiles, like rooftop tiles, aren't accessible by the player, but
 *      are considerated as passable. To prevent throwing event on those tiles.
 *      use the map notetag bellow:
 * 
 *            <PREVENT THROW REGION: x, x, x>
 *                  Use this map notetag to mark some region Id as impassable
 *                  for throwing event through those regions.
 * 
 * 
 *      If you're not using the default tile passability and need to restrict
 *      the movement of movable events on some tiles, use the following map
 *      notetag. 
 * 
 *             <PREVENT MOVE REGION: x, x, x>
 *                  Use this map notetag to mark some region Id as impassable
 *                  for movable event through those regions.
 * 
 * 
 * HOW TO USE:
 * ===========
 * 
 * 
 * 
 *          TO PUSH: Hold the ARROW KEY in the direction toward the movable
 *                   event until it back off one tile.
 * 
 *          TO PULL: Hold the MOVE KEY when standing next to a movable event
 *                   and facing it, and wait until it move one tile.
 * 
 *              *The MOVE KEY is the OK button by default. But it can be
 *               changed to another key in the parameters (see bellow).
 * 
 *             **There's a small delay when pushing or pulling. Keep holding
 *               the key and you'll see the player starting to 'run' against 
 *               the movable event. Then you'll hear the 'Effort Sound' (set
 *               in parameters) and see the 'Effort Balloon' (also set in
 *               parameters). After a few more frames, the event will move
 *               and the player will move along with it.
 * 
 *            ***When pushing and pulling, the player will walk shortly to
 *               get closer to the movable event. The default distance is
 *               set in parameters. There's also an event comment tag to 
 *               assign specific distance to some events. 
 * 
 *           ****The pushing and pulling event will move at the speed set in
 *               the event tab. Player will move at same speed when pushing
 *               or pulling the event.
 * 
 * 
 *         TO PICKUP: Stand in front of a pickable event and hold the MOVE
 *                    KEY to pick it up. Keep holding the key because
 *                    releasing it will drop the event. You can move and
 *                    dash while holding an event. 
 * 
 *          TO THROW: Release the MOVE KEY to drop the event the player is
 *                    holding. The event will be dropped on the tile in front
 *                    of the player. If you drop it while holding an ARROW
 *                    KEY, the event will be thrown one tile away in front
 *                    of the player. And if you drop while holding both the
 *                    DASH BUTTON and an ARROW KEY, the event will be thrown
 *                    2 tiles away in front of the player.
 * 
 * 
 *     MOVE KEY
 *     ========
 *     To change the MOVE KEY, write the new key name in the corresponding
 *     parameter. Since 'escape'(open menu) and 'shift'(dash) can't be used,
 *     that leaves the following key names:
 * 
 *     tab 
 *     control (control, alt)
 *     pageup 
 *     pagedown
 * 
 *     You can also use alphabetic keys if your game is meant for keyboard
 *     control. Just type the key in the parameter, but keep in mind that
 *     using z, x, q or w won't do anything because these are already used
 *     by default.
 * 
 * 
 * 
 * CHARACTER IMAGES
 * ================
 * 
 *      The plugin allow to change the character images while moving events.
 *      To do so, set the sprite sheet name without extension, followed by
 *      the character index, separated by a comma, in the relevant parameter.
 * 
 *      The images that can be changed are as follow:
 * 
 *          -Push image:   will change the character image while the player is
 *                         pushing an event.
 *          -Pull image:   will change the character image while the player is
 *                         pulling an event.
 *          -Pickup image: will change the character image while the player is
 *                         holding an event.
 *          -throw image:  will change the character image while the player is
 *                         throwing an event.
 * 
 *              Example: hero_pushPose, 3
 * 
 *                    *entering the above in the Pushing Character Image
 *                     parameter will change the player image to the index
 *                     3 of the sprite sheet 'hero_pushPose', stored in the
 *                     /img/characters folder of your game. Image will revert
 *                     back to original player image once the pushing process
 *                     is over.
 *
 *      Move Frame Rate
 *      ===============
 *      By default, the character update their motion pattern each 12 frames.
 *      The default plugin update when pushing/pulling is 4, which give the
 *      look of the player 'running' against the movable event before it 
 *      start to move. 
 * 
 *      If you're using a push or pull custom image, that rate of 4 frames
 *      might not be optimal. Hence, the plugin provide a parameter to adjust
 *      that value to your liking.
 * 
 * 
 * SCRIPT CALLS:
 * =============
 * 
 *      In order to manage your movable events interaction on the map, you can 
 *      use a few script calls to check events position on the map.
 * 
 *       
 *      PUSH / PULL events
 *      ==================
 * 
 *      Use the following default call to check an event position at any time:
 * 
 *               $gameMap.event(eventId).pos(x, y) 
 * 
 *      It will return true or false wheter the event is at position x, y on
 *      the map. This can be checked in a parallel process event or in an
 *      autonomous movement script command.
 * 
 * 
 * 
 *      PICK & THROW events
 *      ===================
 *  
 *      These events can be a bit trickier to manage for game mechanics 
 *      purposes. The plugin provide additionnal script calls to check 
 *      these events positions.
 * 
 *               $gamePlayer.isHolding(eventId);
 * 
 *      This call will return true if the map event specified by eventId is 
 *      hold (carried) by the player.
 * 
 * 
 *               $gamePlayer.hasBroughtEvent(eventId, x, y, d)
 * 
 *      This call will return true if the map event specified by eventId is 
 *      hold by the player on tile x, y and turned in direction d.
 * 
 * 
 *               $gamePlayer.hasGaveEvent(eventId, targetEventId)
 * 
 *      This call will return true if the map event specified by eventId is 
 *      hold by the player on the tile in front of the map event specified
 *      by targetEventId The player must be facing the target event.
 * 
 * 
 *              $gamePlayer.hasThrownEvent(eventId, x, y)
 * 
 *      This one will returm true if the player has actually thrown or
 *      drop the map event specified by evenId on that exact tile at 
 *      position x, y.
 *     
 * 
 * 
 * =======================================================================================
 * == Term of Usage ======================================================================
 * =======================================================================================
 * 
 * Use in any independant RPG Maker MZ or MV projects, including commercials.
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
 * =======================================================================================
 * == Version and compatibility ==========================================================
 * =======================================================================================
 * 08/12/2020 completed plugin,                                            v1.0.0
 * 07/03/2021 add parameters and instructions,                             v1.0.1
 * 08/03/2021 add script calls and some code fixes,                        v1.0.2
 * 09/03/2021 made some changes on script calls,                           v1.0.4
 * 10/03/2021 made some changes on throw/drop mechanics,                   v1.0.5
 * 12/03/2021 add move event speed and push/pull smooth transition,        v1.0.7
 * 14/03/2021 fix 'mystery music effect',                                  v1.0.8
 * 16/03/2021 fix some inconsistancies with character images,              v1.0.9
 * 18/03/2021 add more comment tag for pickup event,                       v1.1.0
 * 19/03/2021 add switch option for movable event tag,                     v1.1.1
 * 24/03/2021 add a map notetag to prevent throwing on regionId,           v1.1.2
 * 12/05/2021 add new event comment tag and fix compatibility issue,       v1.1.4
 * 13/05/2021 some changes in the push/pull process,                       v1.1.5
 * 16/05/2021 add the <prevent throw region> map notetag,                  v1.1.6
 * 04/06/2021 add the option to change player image while moving events    v1.2.6
 * 28/07/2021 add the <prevent move region> map notetag,                   v1.2.7
 * 01/09/2021 add the option to change the pull and pickup key             v1.3.7
 * 23/09/2021 small fix for move/pickup key input                          v1.3.8
 * 28/10/2021 small fix and revamp of the key mapping                      v1.4.0
 * 03/05/2022 fix a bug with vehicules speed                               v1.4.1
 * 22/03/2023 fix a bug when running into battle while holding an event    v1.4.2
 * 31/03/2023 fix a bug with followers when pulling                        v1.4.3
 * 18/04/2023 fix a bug when running into battle while throwing an event   v1.4.4
 * 18/09/2024 Add a parameter to set the player normal speed               v1.4.5
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
 * @param Move Key
 * @desc The name of the key for pulling and picking up
 * Default: ok (See plugin instruction)
 * @default ok
 * 
 * @param Move Event Offset
 * @type Number
 * @min 0
 * @desc The move offset when pushing and pulling events.
 * Default: 12
 * @default 12
 * 
 * @param Pickup Event Offset
 * @type Number
 * @min 0
 * @desc The offset when player hold a pickup event.
 * Default: 24
 * @default 24
 * 
 * @param Effort Balloon Id
 * @type Number
 * @min 1
 * @max 15
 * @desc The effort Balloon Icon Id when pushing/pulling.
 * Default: 11
 * @default 11
 * 
 * @param Move Frame Rate
 * @type Number
 * @min 1
 * @desc The frame rate of the character update when pushing/pulling.
 * Default: 4
 * @default 4
 * 
 * @param Player Move Speed
 * @type Number
 * @min 1
 * @max 6
 * @desc The normal move speed for the player.
 * Default: 4
 * @default 4
 * 
 * 
 * @param ---Sounds
 * 
 * @param Effort Sound
 * @parent ---Sounds
 * @desc The effort Sound when pushing/pulling
 * Default: Cry2, 60, 150, 0
 * @default Cry2, 60, 150, 0
 * 
 * @param Push Sound
 * @parent ---Sounds
 * @desc The sound when pushing/pulling an event
 * Default: Push, 100, 100, 0
 * @default Push, 100, 100, 0
 * 
 * @param Mystery Music Effect
 * @parent ---Sounds
 * @desc The music effect when pushing/pulling a 'Mystery' event
 * Default: Mystery, 100, 100, 0
 * @default Mystery, 100, 100, 0
 * 
 * @param Pickup Sound
 * @parent ---Sounds
 * @desc The sound when picking up an event
 * Default: Equip1, 60, 150, 0
 * @default Equip1, 60, 150, 0
 * 
 * @param Throw Sound
 * @parent ---Sounds
 * @desc The sound when throwing an event
 * Default: Jump1, 80, 80, 0
 * @default Jump1, 80, 80, 0
 * 
 * @param Drop Sound
 * @parent ---Sounds
 * @desc The sound when the event is drop (touch the ground)
 * Default: Blow1, 60, 150, 0
 * @default Blow1, 60, 150, 0
 * 
 * 
 * @param ---Motion images
 * 
 * @param Pushing Character Image
 * @parent ---Motion images
 * @desc Enter the sprite sheet name and the index separated by a comma.
 * Default: 
 * @default
 * 
 * @param Pulling Character Image
 * @parent ---Motion images
 * @desc Enter the sprite sheet name and the index separated by a comma.
 * Default: 
 * @default
 * 
 * @param Pickup Character Image
 * @parent ---Motion images
 * @desc Enter the sprite sheet name and the index separated by a comma.
 * Default: 
 * @default
 * 
 * @param Throw Character Image
 * @parent ---Motion images
 * @desc Enter the sprite sheet name and the index separated by a comma.
 * Default: 
 * @default
 * 
 */

(() => {
const _0x3a59ad=_0x375c;(function(_0x33bdad,_0x7a513){const _0x2c65c4=_0x375c,_0x5ce162=_0x33bdad();while(!![]){try{const _0x49b77d=parseInt(_0x2c65c4(0x24c))/0x1+parseInt(_0x2c65c4(0x197))/0x2+-parseInt(_0x2c65c4(0x158))/0x3+-parseInt(_0x2c65c4(0x206))/0x4*(-parseInt(_0x2c65c4(0x247))/0x5)+parseInt(_0x2c65c4(0x1f9))/0x6+-parseInt(_0x2c65c4(0x178))/0x7+-parseInt(_0x2c65c4(0x234))/0x8;if(_0x49b77d===_0x7a513)break;else _0x5ce162['push'](_0x5ce162['shift']());}catch(_0x4a18da){_0x5ce162['push'](_0x5ce162['shift']());}}}(_0x5694,0x9f389),TSR['Parameters']=PluginManager[_0x3a59ad(0x1fb)](_0x3a59ad(0x236)),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d5)]=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x26d)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x258)]=Number(TSR[_0x3a59ad(0x1b1)]['Move\x20Event\x20Offset']),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x181)]=Number(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x195)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1f3)]=Number(TSR[_0x3a59ad(0x1b1)]['Effort\x20Balloon\x20Id']),TSR[_0x3a59ad(0x1f7)]['_moveRate']=Number(TSR['Parameters'][_0x3a59ad(0x1c3)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x275)]=Number(TSR['Parameters'][_0x3a59ad(0x219)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1ff)]=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x228)]),TSR[_0x3a59ad(0x1f7)]['_pushSound']=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x189)]),TSR[_0x3a59ad(0x1f7)]['_mysterySound']=String(TSR[_0x3a59ad(0x1b1)]['Mystery\x20Music\x20Effect']),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x212)]=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x157)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x211)]=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x21f)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x25e)]=String(TSR[_0x3a59ad(0x1b1)]['Drop\x20Sound']),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x245)]=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x1bd)]),TSR[_0x3a59ad(0x1f7)]['_pullImage']=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x210)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1b5)]=String(TSR[_0x3a59ad(0x1b1)][_0x3a59ad(0x174)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x26e)]=String(TSR['Parameters'][_0x3a59ad(0x273)]),TSR[_0x3a59ad(0x1f7)]['makeSoundObj']=function(_0x21f5f7){const _0x1683e4=_0x3a59ad;array=_0x21f5f7[_0x1683e4(0x259)](',');if(array[_0x1683e4(0x1e8)]<0x4)return null;const _0x31dd48=array[0x0],_0x2bf636=parseInt(array[0x1]),_0x20d872=parseInt(array[0x2]),_0x4ed4c9=parseInt(array[0x3]);return{'name':_0x31dd48,'volume':_0x2bf636,'pitch':_0x20d872,'pan':_0x4ed4c9};},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x214)]=function(_0x3278a8){const _0x5e3ca4=_0x3a59ad;array=_0x3278a8[_0x5e3ca4(0x259)](',');if(array[_0x5e3ca4(0x1e8)]<0x2)return null;const _0x3494bc=array[0x0],_0x14a09d=parseInt(array[0x1]);return[_0x3494bc,_0x14a09d];},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x17d)]=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x214)](TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x245)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x27f)]=TSR['moveEvent'][_0x3a59ad(0x214)](TSR[_0x3a59ad(0x1f7)]['_pullImage']),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x169)]=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x214)](TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1b5)]),TSR['moveEvent']['_throwSheet']=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x214)](TSR[_0x3a59ad(0x1f7)]['_throwImage']),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1ff)]=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d7)](TSR[_0x3a59ad(0x1f7)]['_effortSound']),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1b2)]=TSR['moveEvent'][_0x3a59ad(0x1d7)](TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1b2)]),TSR['moveEvent'][_0x3a59ad(0x279)]=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d7)](TSR['moveEvent'][_0x3a59ad(0x279)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x212)]=TSR[_0x3a59ad(0x1f7)]['makeSoundObj'](TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x212)]),TSR['moveEvent'][_0x3a59ad(0x211)]=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d7)](TSR['moveEvent'][_0x3a59ad(0x211)]),TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x25e)]=TSR['moveEvent']['makeSoundObj'](TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x25e)]),TSR[_0x3a59ad(0x1f7)]['_alphaKeyList']={'a':0x41,'b':0x42,'c':0x43,'d':0x44,'e':0x45,'f':0x46,'g':0x47,'h':0x48,'i':0x49,'j':0x4a,'k':0x4b,'l':0x4c,'m':0x4d,'n':0x4e,'o':0x4f,'p':0x50,'r':0x52,'s':0x53,'t':0x54,'u':0x55,'v':0x56,'y':0x59});if(TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d5)]!=='ok'){const newKey=TSR[_0x3a59ad(0x1f7)]['_alphaKeyList'][TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d5)]];Input['keyMapper'][newKey]=TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1d5)];}DataManager[_0x3a59ad(0x20f)]=function(_0x57182e){const _0x2b0f8a=_0x3a59ad;if(!$dataMap)return![];const _0x5820be=/<(?:THROW REGION|THREW REGIONS):[ ]*(\d+(?:\s*,\s*\d+)*)>/i,_0x7a2774=$dataMap['note'][_0x2b0f8a(0x254)]()[_0x2b0f8a(0x259)](/[\r\n]+/);for(const _0x41058a of _0x7a2774){if(_0x41058a['match'](_0x5820be)){const _0x5e3c5a=_0x41058a['slice'](_0x41058a[_0x2b0f8a(0x1f8)](':')+0x1)[_0x2b0f8a(0x259)](',');for(const _0x50af1f in _0x5e3c5a){if(parseInt(_0x5e3c5a[_0x50af1f])===_0x57182e)return!![];}}}return![];},DataManager['isPreventThrowRegion']=function(_0x298ad0){const _0x126192=_0x3a59ad;if(!$dataMap)return![];const _0x5a93a6=/<(?:PREVENT THROW REGION|PREVENT THREW REGIONS):[ ]*(\d+(?:\s*,\s*\d+)*)>/i,_0x1b3a62=$dataMap['note'][_0x126192(0x254)]()[_0x126192(0x259)](/[\r\n]+/);for(const _0x40e2d7 of _0x1b3a62){if(_0x40e2d7['match'](_0x5a93a6)){const _0x55f0e3=_0x40e2d7[_0x126192(0x281)](_0x40e2d7['indexOf'](':')+0x1)[_0x126192(0x259)](',');for(const _0x4fabd9 in _0x55f0e3){if(parseInt(_0x55f0e3[_0x4fabd9])===_0x298ad0)return!![];}}}return![];},DataManager[_0x3a59ad(0x1ab)]=function(_0x1a8d11){const _0x1e75d3=_0x3a59ad;if(!$dataMap)return![];const _0x4cc2ca=/<(?:PREVENT MOVE REGION|PREVENT MOVE REGIONS):[ ]*(\d+(?:\s*,\s*\d+)*)>/i,_0x12b436=$dataMap[_0x1e75d3(0x226)][_0x1e75d3(0x254)]()[_0x1e75d3(0x259)](/[\r\n]+/);for(const _0x332341 of _0x12b436){if(_0x332341[_0x1e75d3(0x205)](_0x4cc2ca)){const _0x69a38=_0x332341[_0x1e75d3(0x281)](_0x332341[_0x1e75d3(0x1f8)](':')+0x1)[_0x1e75d3(0x259)](',');for(const _0x2da1e2 in _0x69a38){if(parseInt(_0x69a38[_0x2da1e2])===_0x1a8d11)return!![];}}}return![];},SoundManager[_0x3a59ad(0x170)]=function(){const _0x211f07=_0x3a59ad,_0x15f52b=TSR['moveEvent'][_0x211f07(0x1ff)];_0x15f52b&&AudioManager[_0x211f07(0x1d6)](_0x15f52b);},SoundManager['playPush']=function(){const _0x296f64=_0x3a59ad,_0x5d2cb4=TSR[_0x296f64(0x1f7)]['_pushSound'];_0x5d2cb4&&AudioManager[_0x296f64(0x1d6)](_0x5d2cb4);},SoundManager['playMystery']=function(){const _0x56d662=_0x3a59ad,_0x443263=TSR[_0x56d662(0x1f7)][_0x56d662(0x279)];_0x443263&&AudioManager[_0x56d662(0x19a)](_0x443263);},SoundManager['playPickup']=function(){const _0x51595e=_0x3a59ad,_0x104221=TSR[_0x51595e(0x1f7)][_0x51595e(0x212)];_0x104221&&AudioManager['playSe'](_0x104221);},SoundManager[_0x3a59ad(0x22d)]=function(){const _0xb75e17=_0x3a59ad,_0x54b9fd=TSR[_0xb75e17(0x1f7)][_0xb75e17(0x211)];_0x54b9fd&&AudioManager[_0xb75e17(0x1d6)](_0x54b9fd);},SoundManager[_0x3a59ad(0x163)]=function(){const _0xa6364f=_0x3a59ad,_0xf7eb15=TSR[_0xa6364f(0x1f7)][_0xa6364f(0x25e)];_0xf7eb15&&AudioManager['playSe'](_0xf7eb15);},TSR['moveEvent'][_0x3a59ad(0x262)]=Scene_Map[_0x3a59ad(0x20a)]['stop'],Scene_Map[_0x3a59ad(0x20a)][_0x3a59ad(0x285)]=function(){const _0x594089=_0x3a59ad;TSR['moveEvent']['_Scene_Map_stop'][_0x594089(0x1d8)](this),$gamePlayer['resetPushing'](),$gamePlayer['resetPulling'](),$gamePlayer[_0x594089(0x1ca)](SceneManager['isNextScene'](Scene_Battle)),$gamePlayer[_0x594089(0x182)](![]),$gamePlayer['setMovingEventPreventMove'](![]);},TSR['moveEvent']['_Game_System_initialize']=Game_System[_0x3a59ad(0x20a)]['initialize'],Game_System['prototype'][_0x3a59ad(0x16f)]=function(){const _0x5cff14=_0x3a59ad;TSR[_0x5cff14(0x1f7)]['_Game_System_initialize']['call'](this),this[_0x5cff14(0x192)]={};},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x156)]=Game_CharacterBase[_0x3a59ad(0x20a)]['updatePattern'],Game_CharacterBase[_0x3a59ad(0x20a)][_0x3a59ad(0x23a)]=function(){const _0x45bfd4=_0x3a59ad;if(this[_0x45bfd4(0x1a5)]()||this[_0x45bfd4(0x252)]()||this['backDist']()||this[_0x45bfd4(0x22c)])this[_0x45bfd4(0x1a0)]=(this['_pattern']+0x1)%this[_0x45bfd4(0x221)]();else!this[_0x45bfd4(0x22c)]&&TSR[_0x45bfd4(0x1f7)][_0x45bfd4(0x156)][_0x45bfd4(0x1d8)](this);},Game_CharacterBase['prototype'][_0x3a59ad(0x267)]=function(_0x292a3b,_0xda66a5){const _0x38891d=_0x3a59ad;this['_x']+=_0x292a3b,this['_y']+=_0xda66a5;const _0x33f9c1=Math[_0x38891d(0x23b)](Math[_0x38891d(0x151)](_0x292a3b*_0x292a3b+_0xda66a5*_0xda66a5));this[_0x38891d(0x145)]=0xa+_0x33f9c1-this[_0x38891d(0x275)],this['_jumpCount']=this[_0x38891d(0x145)]*0x2;},Game_CharacterBase[_0x3a59ad(0x20a)][_0x3a59ad(0x17f)]=function(_0x31fa95){const _0x31f086=_0x3a59ad;this['setMovementSuccess'](this['canPass'](this['_x'],this['_y'],_0x31fa95));if(this[_0x31f086(0x224)]()){this['_x']=$gameMap['roundXWithDirection'](this['_x'],_0x31fa95),this['_y']=$gameMap[_0x31f086(0x25c)](this['_y'],_0x31fa95),this[_0x31f086(0x17c)]=$gameMap[_0x31f086(0x176)](this['_x'],this[_0x31f086(0x215)](_0x31fa95)),this[_0x31f086(0x1b6)]=$gameMap[_0x31f086(0x1c8)](this['_y'],this[_0x31f086(0x215)](_0x31fa95));if(this[_0x31f086(0x25d)])this[_0x31f086(0x23e)]();}},Game_Character[_0x3a59ad(0x20a)]['isHolding']=function(_0x285ec6){const _0x146c6f=_0x3a59ad,_0x1d5950=$gameMap[_0x146c6f(0x20e)](_0x285ec6);return this['_pickupEvent']===_0x1d5950&&this['hasPickup']();},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1ed)]=function(){const _0x4c07ae=_0x3a59ad;return this[_0x4c07ae(0x1d2)];},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1ea)]=function(){return this['_hasPickup'];},Game_Character[_0x3a59ad(0x20a)]['isBreakable']=function(){const _0x2a9346=_0x3a59ad;return this[_0x2a9346(0x1cb)];},Game_Character['prototype']['setPickup']=function(_0x5b39b3){this['_isPickup']=_0x5b39b3;},Game_Character['prototype'][_0x3a59ad(0x193)]=function(){const _0x467234=_0x3a59ad;return this[_0x467234(0x19f)];},Game_Character['prototype'][_0x3a59ad(0x270)]=function(_0x503b38){const _0x237c41=_0x3a59ad;this[_0x237c41(0x19d)]=_0x503b38;},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1e0)]=function(){const _0x128951=_0x3a59ad;return this[_0x128951(0x19d)];},Game_Character[_0x3a59ad(0x20a)]['setThrowDestination']=function(_0x474e0b,_0x3b998d,_0xda790b,_0x597b9b,_0x501935){const _0x13bb7e=_0x3a59ad;if(_0x474e0b===_0xda790b&&_0x3b998d===_0x597b9b){const _0x39696a=0xa-_0x501935,_0x107bd9=_0x501935===0x4||_0x501935===0x6?0x2:0x4,_0x3c67ec=0xa-_0x107bd9,_0x29b7c1=[_0x39696a,_0x107bd9,_0x3c67ec];for(const _0x699b47 of _0x29b7c1){if($gamePlayer[_0x13bb7e(0x15c)](_0xda790b,_0x597b9b,_0x699b47)){_0x474e0b=$gameMap['roundXWithDirection'](_0xda790b,_0x699b47),_0x3b998d=$gameMap[_0x13bb7e(0x25c)](_0x597b9b,_0x699b47);break;}}}this[_0x13bb7e(0x272)]=[_0x474e0b,_0x3b998d];},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x16c)]=function(){const _0x4daa85=_0x3a59ad;return this[_0x4daa85(0x272)];},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x18d)]=function(){return this['_requireThrowShadow'];},Game_Character[_0x3a59ad(0x20a)]['setRequireThrowShadow']=function(_0x3261bc){this['_requireThrowShadow']=_0x3261bc;},Game_Character[_0x3a59ad(0x20a)]['isThrowCliff']=function(){const _0x439b43=_0x3a59ad;if(Imported[_0x439b43(0x22e)])return this['isCliff'](this[_0x439b43(0x17c)],this['_realY']);return![];},Game_Character['prototype']['isMovingEvent']=function(){const _0x74415=_0x3a59ad;return this[_0x74415(0x199)]||this['_isPulling'];},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x14e)]=function(){return![];},Game_Character[_0x3a59ad(0x20a)]['setPushDist']=function(_0xfbb562){this['_pushDist']=_0xfbb562;},Game_Character['prototype'][_0x3a59ad(0x252)]=function(){const _0x2f92ab=_0x3a59ad;return this[_0x2f92ab(0x276)];},Game_Character['prototype']['setPullDist']=function(_0x2f7aee){const _0x35eb22=_0x3a59ad;this[_0x35eb22(0x26b)]=_0x2f7aee;},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1a5)]=function(){return this['_pullDist'];},Game_Character[_0x3a59ad(0x20a)]['setBackDist']=function(_0x36ade4){const _0x57037b=_0x3a59ad;this[_0x57037b(0x280)]=_0x36ade4;},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x274)]=function(){return this['_backDist'];},Game_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x202)]=function(){return this===$gamePlayer;},TSR[_0x3a59ad(0x1f7)]['_Game_Player_initMembers']=Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x271)],Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x271)]=function(){const _0x11167e=_0x3a59ad;TSR[_0x11167e(0x1f7)][_0x11167e(0x25b)][_0x11167e(0x1d8)](this),this[_0x11167e(0x239)]=TSR[_0x11167e(0x1f7)][_0x11167e(0x275)];},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x277)]=Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1bb)],Game_Player[_0x3a59ad(0x20a)]['update']=function(_0x57c07a){const _0x2c1e20=_0x3a59ad;TSR[_0x2c1e20(0x1f7)][_0x2c1e20(0x277)][_0x2c1e20(0x1d8)](this,_0x57c07a),_0x57c07a&&(this['moveEvent'](),this[_0x2c1e20(0x194)](),this[_0x2c1e20(0x208)]());},TSR['moveEvent'][_0x3a59ad(0x1f6)]=Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1dc)],Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1dc)]=function(){const _0x162459=_0x3a59ad;return this[_0x162459(0x14e)]()||this[_0x162459(0x1c4)]||this[_0x162459(0x180)]()?![]:TSR[_0x162459(0x1f7)][_0x162459(0x1f6)][_0x162459(0x1d8)](this);},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x268)]=function(_0x17f6f2){const _0x120e36=_0x3a59ad;this[_0x120e36(0x1b9)]=_0x17f6f2;},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x180)]=function(){const _0x4b6d3e=_0x3a59ad;return this[_0x4b6d3e(0x1b9)];},Game_Player[_0x3a59ad(0x20a)]['moveEvent']=function(){const _0x45b64e=_0x3a59ad,_0x821378=this['_direction'],_0x1c6be9=$gameMap[_0x45b64e(0x1e9)](this['x'],_0x821378),_0x3f784e=$gameMap[_0x45b64e(0x25c)](this['y'],_0x821378),_0x15b170=$gameMap[_0x45b64e(0x1e9)](_0x1c6be9,_0x821378),_0x1f34f5=$gameMap[_0x45b64e(0x25c)](_0x3f784e,_0x821378);this[_0x45b64e(0x1be)](_0x1c6be9,_0x3f784e)&&(this[_0x45b64e(0x14f)](_0x1c6be9,_0x3f784e,_0x821378),this['updatePush'](_0x1c6be9,_0x3f784e,_0x15b170,_0x1f34f5,_0x821378)),this['updatePickup'](this['x'],this['y'],_0x1c6be9,_0x3f784e,_0x821378);},Game_Player['prototype']['updatePushEvent']=function(){const _0x36b9fb=_0x3a59ad;if(this['_pushEvent']&&this[_0x36b9fb(0x252)]()&&this[_0x36b9fb(0x204)]())this[_0x36b9fb(0x1f0)][_0x36b9fb(0x17c)]===this[_0x36b9fb(0x1f0)]['dx']&&this[_0x36b9fb(0x1f0)][_0x36b9fb(0x1b6)]===this['_pushEvent']['dy']&&this['resetPushing']();else this[_0x36b9fb(0x1c4)]&&this['pullDist']()&&this[_0x36b9fb(0x160)]()&&(this[_0x36b9fb(0x1c4)]['_realX']===this[_0x36b9fb(0x1c4)]['dx']&&this[_0x36b9fb(0x1c4)]['_realY']===this[_0x36b9fb(0x1c4)]['dy']&&this[_0x36b9fb(0x1a9)]());if(!this[_0x36b9fb(0x1c4)])this[_0x36b9fb(0x1de)]();},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x242)]=function(_0x2d0f87,_0x2a93f3,_0xd98bde,_0x44bfcf,_0x555800){const _0x2b14ac=_0x3a59ad;if(!this[_0x2b14ac(0x269)]()){if(_0x555800===this[_0x2b14ac(0x217)]()&&this['canMoveEvent']()){if(!this[_0x2b14ac(0x266)]()){this[_0x2b14ac(0x1f0)]=this[_0x2b14ac(0x1cc)](_0x2d0f87,_0x2a93f3),this[_0x2b14ac(0x22f)]=0x0,this[_0x2b14ac(0x200)]=0x0,this[_0x2b14ac(0x199)]=!![],this[_0x2b14ac(0x1c9)]=![];const _0x2dc802=this[_0x2b14ac(0x1f0)][_0x2b14ac(0x237)]||TSR['moveEvent'][_0x2b14ac(0x258)];this['setMoveOffset'](_0x2dc802);const _0x283e09=_0x555800===0x4||_0x555800===0x6?this[_0x2b14ac(0x1e4)]():this[_0x2b14ac(0x1a3)](),_0x6a2e46=_0x555800===0x2||_0x555800===0x6?_0x2dc802:-_0x2dc802;this['setPushDist'](_0x283e09+_0x6a2e46),TSR[_0x2b14ac(0x1f7)][_0x2b14ac(0x17d)]&&(this[_0x2b14ac(0x1c0)](),this[_0x2b14ac(0x264)]=TSR[_0x2b14ac(0x1f7)][_0x2b14ac(0x17d)][0x0],this[_0x2b14ac(0x231)]=TSR[_0x2b14ac(0x1f7)][_0x2b14ac(0x17d)][0x1]);}else{if(this[_0x2b14ac(0x14e)]()){const _0x295591=TSR[_0x2b14ac(0x1f7)][_0x2b14ac(0x283)];this[_0x2b14ac(0x200)]++;if(this[_0x2b14ac(0x200)]%_0x295591===0x0)this['updatePattern']();if(this['_pushEventCount']%0x4===0x0)this[_0x2b14ac(0x243)](_0xd98bde,_0x44bfcf,_0x555800);}else this[_0x2b14ac(0x225)]();}}else this[_0x2b14ac(0x225)]();}},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x243)]=function(_0x538cff,_0x279f33,_0x216074){const _0x420889=_0x3a59ad,_0x472284=this[_0x420889(0x1f0)];if(this[_0x420889(0x15e)]!==this[_0x420889(0x217)]()&&this[_0x420889(0x204)]())this[_0x420889(0x225)]();else{if(this[_0x420889(0x22f)]<0x18){if(this[_0x420889(0x22f)]===0xc)this[_0x420889(0x15d)]();this[_0x420889(0x22f)]++;}else{if(!this[_0x420889(0x204)]()&&_0x472284['movableEventCanPass'](_0x538cff,_0x279f33,_0x216074)&&this[_0x420889(0x22b)]()){this[_0x420889(0x284)](!![]),SoundManager[_0x420889(0x167)](),this[_0x420889(0x1f0)]['dx']=$gameMap[_0x420889(0x1e9)](this[_0x420889(0x1f0)]['x'],_0x216074),this[_0x420889(0x1f0)]['dy']=$gameMap[_0x420889(0x25c)](this[_0x420889(0x1f0)]['y'],_0x216074),this[_0x420889(0x1f0)]['sx']=this[_0x420889(0x1f0)]['x'],this[_0x420889(0x1f0)]['sy']=this['_pushEvent']['y'],this[_0x420889(0x159)](this[_0x420889(0x275)]);const _0x464f39=this['_pushEvent'][_0x420889(0x1a7)]();this[_0x420889(0x23d)](this[_0x420889(0x1c6)]()?_0x464f39-0x1:_0x464f39),_0x472284[_0x420889(0x185)](_0x216074),this[_0x420889(0x198)](_0x472284),this['_pushCount']=0x0,this[_0x420889(0x199)]=![],this['resetPattern']();}else this[_0x420889(0x225)]();}}},Game_Player[_0x3a59ad(0x20a)]['canPush']=function(){const _0x33d841=_0x3a59ad,_0x53d520=this[_0x33d841(0x1f0)][_0x33d841(0x1ae)];return!_0x53d520||$gameSwitches['value'](_0x53d520);},Game_Player[_0x3a59ad(0x20a)]['isPushing']=function(){const _0x1f535e=_0x3a59ad;return this[_0x1f535e(0x199)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1ef)]=function(_0x86bd08){const _0x225497=_0x3a59ad;this[_0x225497(0x258)]=_0x86bd08;},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1a4)]=function(){const _0x28e72c=_0x3a59ad;return this[_0x28e72c(0x258)];},Game_Player[_0x3a59ad(0x20a)]['setNormalSpeed']=function(_0x575e4b){const _0x1914d6=_0x3a59ad;this[_0x1914d6(0x239)]=_0x575e4b;},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x255)]=function(){const _0x5b6677=_0x3a59ad;return this[_0x5b6677(0x239)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x284)]=function(_0x17b4f3){const _0x4cac46=_0x3a59ad;this[_0x4cac46(0x14c)]=_0x17b4f3;},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x204)]=function(){const _0x201a29=_0x3a59ad;return this[_0x201a29(0x14c)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x225)]=function(){const _0x2cd82c=_0x3a59ad;this[_0x2cd82c(0x22f)]=0x0,this[_0x2cd82c(0x199)]=![],this['_pushEvent']=null,this[_0x2cd82c(0x21e)](![]),this[_0x2cd82c(0x182)](!![]),this[_0x2cd82c(0x284)](![]),this['resetSpeed'](),this['resetCacheImage']();},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x14f)]=function(_0x52817f,_0x417e6c,_0x2a528c){const _0x513c47=_0x3a59ad;if(!this[_0x513c47(0x217)]()){if(this[_0x513c47(0x269)]()&&this['canMoveEvent']()){this['gatherFollowers']();if(!this[_0x513c47(0x266)]()){this[_0x513c47(0x1c4)]=this[_0x513c47(0x1cc)](_0x52817f,_0x417e6c),this[_0x513c47(0x207)]=0x0,this['_pullEventCount']=0x0,this[_0x513c47(0x18e)]=!![],this[_0x513c47(0x1c9)]=![];const _0x1f6707=this['_pullEvent']['_moveEventOffset']||TSR[_0x513c47(0x1f7)]['_moveOffset'];this['setMoveOffset'](_0x1f6707);const _0x4edc6=_0x2a528c===0x4||_0x2a528c===0x6?this[_0x513c47(0x1e4)]():this[_0x513c47(0x1a3)](),_0x416075=_0x2a528c===0x2||_0x2a528c===0x6?_0x1f6707:-_0x1f6707;this[_0x513c47(0x22a)](_0x4edc6+_0x416075),this[_0x513c47(0x19c)](),TSR[_0x513c47(0x1f7)][_0x513c47(0x27f)]&&(this[_0x513c47(0x1c0)](),this['_characterName']=TSR[_0x513c47(0x1f7)][_0x513c47(0x27f)][0x0],this[_0x513c47(0x231)]=TSR['moveEvent'][_0x513c47(0x27f)][0x1]);}else{if(this[_0x513c47(0x18b)]()){const _0x5d9a4e=TSR['moveEvent']['_moveRate'];this[_0x513c47(0x1ba)]++;if(this[_0x513c47(0x1ba)]%_0x5d9a4e===0x0)this[_0x513c47(0x23a)]();if(this[_0x513c47(0x1ba)]%0x4===0x0)this[_0x513c47(0x21d)](this['_direction']);}else this[_0x513c47(0x1a9)]();}}else this[_0x513c47(0x1a9)]();}},Game_Player['prototype'][_0x3a59ad(0x21d)]=function(_0x45da45){const _0x56a3d1=_0x3a59ad,_0x9de62f=this['_pullEvent'],_0x3b998a=this[_0x56a3d1(0x215)](_0x45da45);if(this[_0x56a3d1(0x207)]<0x14){if(this[_0x56a3d1(0x207)]===0xa)this[_0x56a3d1(0x15d)]();this[_0x56a3d1(0x207)]++;}else{if(!this[_0x56a3d1(0x160)]()&&this[_0x56a3d1(0x16b)](this['x'],this['y'],_0x3b998a)&&_0x9de62f[_0x56a3d1(0x26f)](this['x'],this['y'],_0x3b998a,!![])&&this[_0x56a3d1(0x1e6)]()){this[_0x56a3d1(0x260)](!![]),SoundManager['playPush'](),this['_pullEvent']['dx']=$gameMap['roundXWithDirection'](this['_pullEvent']['x'],_0x3b998a),this[_0x56a3d1(0x1c4)]['dy']=$gameMap[_0x56a3d1(0x25c)](this[_0x56a3d1(0x1c4)]['y'],_0x3b998a),this['_pullEvent']['sx']=_0x9de62f['x'],this[_0x56a3d1(0x1c4)]['sy']=_0x9de62f['y'],this[_0x56a3d1(0x159)](this[_0x56a3d1(0x275)]),this['setPullSpeed'](this[_0x56a3d1(0x1c4)][_0x56a3d1(0x1a7)]());for(const _0x157fa5 of this[_0x56a3d1(0x233)]()[_0x56a3d1(0x249)]){_0x157fa5[_0x56a3d1(0x21a)](_0x3b998a),_0x157fa5[_0x56a3d1(0x241)](![]),_0x157fa5[_0x56a3d1(0x1c7)](this[_0x56a3d1(0x278)]());}this[_0x56a3d1(0x21a)](_0x3b998a),_0x9de62f[_0x56a3d1(0x185)](_0x3b998a),this[_0x56a3d1(0x198)](_0x9de62f),this['_pullCount']=0x0,this['_isPulling']=![],this['resetPattern']();}else this[_0x56a3d1(0x1a9)]();}},Game_Player[_0x3a59ad(0x20a)]['canPull']=function(){const _0x53dcec=_0x3a59ad,_0x264094=this[_0x53dcec(0x1c4)]['_movableSwitch'];return!_0x264094||$gameSwitches[_0x53dcec(0x1c5)](_0x264094);},Game_Player['prototype'][_0x3a59ad(0x18b)]=function(){const _0x35a3b6=_0x3a59ad;return this[_0x35a3b6(0x18e)];},Game_Player[_0x3a59ad(0x20a)]['setPullMoved']=function(_0x53e61c){this['_pullMoved']=_0x53e61c;},Game_Player['prototype'][_0x3a59ad(0x160)]=function(){const _0x45535f=_0x3a59ad;return this[_0x45535f(0x1e5)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x27d)]=function(_0x4fefa8){const _0x45f0ae=_0x3a59ad;this[_0x45f0ae(0x1ac)]=_0x4fefa8;},Game_Player['prototype'][_0x3a59ad(0x1fd)]=function(){return this['_cacheSpeed'];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x166)]=function(){const _0x16e92c=_0x3a59ad;return this[_0x16e92c(0x1ac)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1a9)]=function(){const _0x3bfd94=_0x3a59ad;this['_pullCount']=0x0,this[_0x3bfd94(0x18e)]=![],this[_0x3bfd94(0x1c4)]=null,this[_0x3bfd94(0x22a)](![]),this[_0x3bfd94(0x182)](!![]),this['setPullMoved'](![]),this[_0x3bfd94(0x1e7)](),this[_0x3bfd94(0x1f2)]();},Game_Player['prototype'][_0x3a59ad(0x269)]=function(){const _0x552784=_0x3a59ad;return Input[_0x552784(0x162)](TSR['moveEvent'][_0x552784(0x1d5)])||Input['isTriggered'](TSR[_0x552784(0x1f7)][_0x552784(0x1d5)])||Input[_0x552784(0x18c)](TSR[_0x552784(0x1f7)]['_moveKey']);},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1bc)]=function(_0x12478a,_0x2b4324,_0x48e42a,_0x789dda,_0x3f283a){const _0xb468c3=_0x3a59ad;if(!$gameMap[_0xb468c3(0x16d)]()&&!this['hasThrew']()){if(this[_0xb468c3(0x256)](_0x12478a,_0x2b4324,_0x48e42a,_0x789dda)&&!this['isMoving']()&&this[_0xb468c3(0x269)]()){if(!this['hasPickup']())this[_0xb468c3(0x1e3)](),this[_0xb468c3(0x1d2)]=this[_0xb468c3(0x23f)](_0x12478a,_0x2b4324,_0x48e42a,_0x789dda),this['_pickupEvent'][_0xb468c3(0x24b)]=this['_pickupEvent']['x'],this[_0xb468c3(0x1d2)]['_lastY']=this['_pickupEvent']['y'],this[_0xb468c3(0x1d2)][_0xb468c3(0x177)](_0x3f283a,this[_0xb468c3(0x1d2)][_0xb468c3(0x278)]()),this[_0xb468c3(0x1d2)][_0xb468c3(0x220)]=0x0,this['_pickupEvent'][_0xb468c3(0x213)]=![],this['_hasPickup']=!![],this[_0xb468c3(0x1d2)]['setThrough'](!![]),this[_0xb468c3(0x21a)](_0x3f283a),$gameSystem[_0xb468c3(0x222)](),SoundManager[_0xb468c3(0x196)](),TSR[_0xb468c3(0x1f7)][_0xb468c3(0x169)]&&(this[_0xb468c3(0x1c0)](),this['_characterName']=TSR[_0xb468c3(0x1f7)][_0xb468c3(0x169)][0x0],this['_characterIndex']=TSR[_0xb468c3(0x1f7)][_0xb468c3(0x169)][0x1]);else this[_0xb468c3(0x1ea)]()?this[_0xb468c3(0x218)]():this['throwPickup']();}else this[_0xb468c3(0x269)]()&&this[_0xb468c3(0x1ea)]()?this[_0xb468c3(0x218)]():this[_0xb468c3(0x19e)]();}},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x218)]=function(){const _0x1232b9=_0x3a59ad,_0x671684=this[_0x1232b9(0x1d2)];_0x671684&&(_0x671684['setPickup'](!![]),_0x671684[_0x1232b9(0x1a2)](!![]));},Game_Player[_0x3a59ad(0x20a)]['updatePickupEvent']=function(){const _0x51748d=_0x3a59ad;if(this[_0x51748d(0x1ea)]()){const _0x3c532b=this[_0x51748d(0x1d2)],_0x3dc7b9=this[_0x51748d(0x278)](),_0x3a38cc=this['_realX'],_0x1d9e35=this[_0x51748d(0x1b6)],_0x3aa76e=this[_0x51748d(0x24d)](),_0x78a457=_0x3aa76e/$gameMap[_0x51748d(0x188)](),_0x4af1ed=_0x3dc7b9===0x4?_0x3a38cc-_0x78a457:_0x3dc7b9===0x6?_0x3a38cc+_0x78a457:_0x3a38cc,_0x551fb4=_0x3dc7b9===0x2?_0x1d9e35+_0x78a457:_0x3dc7b9===0x8?_0x1d9e35-_0x78a457:_0x1d9e35,_0x2d809d=_0x3dc7b9===0x4||_0x3dc7b9===0x6?-0.25:-0.15;if(_0x3c532b['_isPickupChar']){const _0x356749=this[_0x51748d(0x235)](_0x3dc7b9,_0x3c532b[_0x51748d(0x15a)]());_0x3c532b['setDirection'](_0x356749);if(!_0x3c532b['hasStepAnime']())_0x3c532b[_0x51748d(0x1e2)]();}_0x3c532b[_0x51748d(0x14b)](_0x4af1ed,_0x551fb4+_0x2d809d),!_0x3c532b['_characterName']&&!_0x3c532b[_0x51748d(0x1d1)]&&(this[_0x51748d(0x248)]=![],this[_0x51748d(0x1d2)]=null);}else this['hasThrew']()&&this[_0x51748d(0x1a8)]();},Game_Player[_0x3a59ad(0x20a)]['calcDirection']=function(_0x587ad8,_0x4d8eae){if(_0x4d8eae[0x0]===_0x4d8eae[0x1])return _0x587ad8;else{if(_0x4d8eae[0x0]===0xa-_0x4d8eae[0x1])return 0xa-_0x587ad8;else{if(_0x587ad8===_0x4d8eae[0x0])return _0x4d8eae[0x1];else return _0x587ad8===0xa-_0x4d8eae[0x0]?0xa-_0x4d8eae[0x1]:_0x587ad8===0xa-_0x4d8eae[0x1]?_0x4d8eae[0x0]:0xa-_0x4d8eae[0x0];}}},Game_Player[_0x3a59ad(0x20a)]['pickupOffset']=function(){const _0x5d9f40=_0x3a59ad;return this[_0x5d9f40(0x1d2)][_0x5d9f40(0x237)]||TSR[_0x5d9f40(0x1f7)][_0x5d9f40(0x181)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x19e)]=function(){const _0x10e604=_0x3a59ad;if(this[_0x10e604(0x1d2)]){const _0x242d93=this[_0x10e604(0x278)](),_0x4879e2=this['x'],_0x4621fa=this['y'];let _0xaebb00=this[_0x10e604(0x1b0)](_0x4879e2,_0x4621fa,_0x242d93),_0x52ebab=_0x242d93===0x4?_0x4879e2-_0xaebb00:_0x242d93===0x6?_0x4879e2+_0xaebb00:_0x4879e2,_0x2af335=_0x242d93===0x2?_0x4621fa+_0xaebb00:_0x242d93===0x8?_0x4621fa-_0xaebb00:_0x4621fa,_0x4385f6=$gameMap[_0x10e604(0x1e9)](_0x52ebab,0xa-_0x242d93),_0x11d77f=$gameMap[_0x10e604(0x25c)](_0x2af335,0xa-_0x242d93);while(!this[_0x10e604(0x15c)](_0x4385f6,_0x11d77f,_0x242d93)){_0xaebb00--,_0x52ebab=_0x242d93===0x4?_0x4879e2-_0xaebb00:_0x242d93===0x6?_0x4879e2+_0xaebb00:_0x4879e2,_0x2af335=_0x242d93===0x2?_0x4621fa+_0xaebb00:_0x242d93===0x8?_0x4621fa-_0xaebb00:_0x4621fa,_0x4385f6=$gameMap[_0x10e604(0x1e9)](_0x52ebab,0xa-_0x242d93),_0x11d77f=$gameMap['roundYWithDirection'](_0x2af335,0xa-_0x242d93);if(_0xaebb00===0x0)break;}this[_0x10e604(0x1d2)][_0x10e604(0x168)]=_0xaebb00,this[_0x10e604(0x1d2)][_0x10e604(0x227)](_0x52ebab,_0x2af335,_0x4879e2,_0x4621fa,_0x242d93),this[_0x10e604(0x1d2)][_0x10e604(0x20d)](0x2),this['_hasPickup']=![],this[_0x10e604(0x1d2)][_0x10e604(0x1fe)](![]),this[_0x10e604(0x16e)]=!![],this[_0x10e604(0x1d2)][_0x10e604(0x270)](!![]);}},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1b0)]=function(_0x678fb9,_0x2126d1,_0x39f428){const _0x35687f=_0x3a59ad;let _0x1ccb75=0x0;const _0x1d0d39=this[_0x35687f(0x1df)]()&&this[_0x35687f(0x155)]()?0x3:this[_0x35687f(0x217)]()?0x2:0x1;for(;;){const _0x550a3f=_0x39f428===0x4?_0x678fb9-_0x1ccb75:_0x39f428===0x6?_0x678fb9+_0x1ccb75:_0x678fb9,_0x481eaf=_0x39f428===0x2?_0x2126d1+_0x1ccb75:_0x39f428===0x8?_0x2126d1-_0x1ccb75:_0x2126d1,_0x48f728=$gameMap[_0x35687f(0x209)](_0x550a3f,_0x481eaf);if(DataManager[_0x35687f(0x1ec)](_0x48f728))return _0x1ccb75;else{if(_0x1ccb75<_0x1d0d39)_0x1ccb75++;else return _0x1ccb75;}}},Game_Player[_0x3a59ad(0x20a)]['updateThrow']=function(){const _0x5cf86a=_0x3a59ad,_0x5ea0c1=this[_0x5cf86a(0x1d2)],_0x4363d7=_0x5ea0c1['throwDestination']();if(_0x5ea0c1[_0x5cf86a(0x1ce)]()||_0x5ea0c1[_0x5cf86a(0x1b7)])this[_0x5cf86a(0x1e3)](_0x4363d7);else{if((_0x5ea0c1[_0x5cf86a(0x17c)]!==_0x4363d7[0x0]||_0x5ea0c1[_0x5cf86a(0x1b6)]!==_0x4363d7[0x1])&&!this[_0x5cf86a(0x25a)]){const _0x40cbe4=-(_0x5ea0c1['x']-_0x4363d7[0x0]),_0x452c57=-(_0x5ea0c1['y']-_0x4363d7[0x1]);_0x5ea0c1[_0x5cf86a(0x267)](_0x40cbe4,_0x452c57),this[_0x5cf86a(0x25a)]=!![],_0x5ea0c1[_0x5cf86a(0x172)](!![]),SoundManager['playThrow'](),TSR[_0x5cf86a(0x1f7)][_0x5cf86a(0x229)]&&(this['checkCacheImage'](),this[_0x5cf86a(0x264)]=TSR[_0x5cf86a(0x1f7)][_0x5cf86a(0x229)][0x0],this[_0x5cf86a(0x231)]=TSR['moveEvent'][_0x5cf86a(0x229)][0x1],this[_0x5cf86a(0x146)](0x0),this[_0x5cf86a(0x1fc)]=0x0,this['_throwPattern']=!![]);}else{if(this['_threwMidAir']){this[_0x5cf86a(0x1fc)]++;if(this['_throwCount']===0xc||this[_0x5cf86a(0x1fc)]===0x18)this[_0x5cf86a(0x23a)]();if(_0x5ea0c1[_0x5cf86a(0x17c)]===_0x4363d7[0x0]&&_0x5ea0c1[_0x5cf86a(0x1b6)]===_0x4363d7[0x1])this['_threwMidAir']=![];}else SoundManager[_0x5cf86a(0x163)](),this[_0x5cf86a(0x1e3)](_0x4363d7);}}},Game_Player['prototype'][_0x3a59ad(0x14d)]=function(){const _0xea7d36=_0x3a59ad;return this[_0xea7d36(0x16e)];},Game_Player['prototype'][_0x3a59ad(0x1e3)]=function(_0x490a7d){const _0x22756d=_0x3a59ad;this[_0x22756d(0x1f2)]();if(this[_0x22756d(0x1d2)]){this[_0x22756d(0x1d2)]['locate'](_0x490a7d[0x0],_0x490a7d[0x1]),this['_hasThrew']=![],this[_0x22756d(0x25a)]=![],this[_0x22756d(0x1d2)][_0x22756d(0x1a2)](![]),this[_0x22756d(0x1d2)]['_pattern']=this['_pickupEvent'][_0x22756d(0x14a)],this[_0x22756d(0x1d2)][_0x22756d(0x20d)](0x1);if(this[_0x22756d(0x1d2)][_0x22756d(0x154)]()){const _0x398933=$gameMap[_0x22756d(0x1d3)](),_0x5744e4=this[_0x22756d(0x1d2)][_0x22756d(0x1f1)](),_0x596810=this[_0x22756d(0x1d2)]['isBreakable']();$gameSelfSwitches[_0x22756d(0x19b)]([_0x398933,_0x5744e4,_0x596810],!![]);}}$gameSystem[_0x22756d(0x1c1)](),this[_0x22756d(0x1d2)]=null,this['_throwPattern']=![];},Game_Player['prototype']['endMapPickup']=function(_0x378262){const _0x46340a=_0x3a59ad;this[_0x46340a(0x1f2)]();if(this[_0x46340a(0x1d2)]){if(_0x378262){const _0x586b85=this['_pickupEvent'];_0x586b85['setThrowDestination'](_0x586b85['x'],_0x586b85['y'],this['x'],this['y'],this[_0x46340a(0x15e)]);const _0xf57768=_0x586b85[_0x46340a(0x272)][0x0],_0x1eae12=_0x586b85[_0x46340a(0x272)][0x1];this['_pickupEvent'][_0x46340a(0x253)](_0xf57768,_0x1eae12);}else this['_pickupEvent'][_0x46340a(0x253)](this[_0x46340a(0x1d2)][_0x46340a(0x24b)],this['_pickupEvent'][_0x46340a(0x144)]);this[_0x46340a(0x1d2)][_0x46340a(0x1a2)](![]),this['_pickupEvent'][_0x46340a(0x1a0)]=this['_pickupEvent']['_originalPattern'],this['_pickupEvent'][_0x46340a(0x20d)](0x1);}this['_hasThrew']=![],this[_0x46340a(0x25a)]=![],this[_0x46340a(0x248)]=![],this[_0x46340a(0x1d2)]=null,$gameSystem[_0x46340a(0x1c1)]();},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1c0)]=function(){const _0x2bb6a5=_0x3a59ad;!this[_0x2bb6a5(0x147)]&&(this[_0x2bb6a5(0x147)]=this[_0x2bb6a5(0x238)](),this[_0x2bb6a5(0x165)]=this[_0x2bb6a5(0x184)]());},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1f2)]=function(){const _0x1a785c=_0x3a59ad;this[_0x1a785c(0x147)]&&(this[_0x1a785c(0x264)]=this['_cacheCharName'],this[_0x1a785c(0x231)]=this[_0x1a785c(0x165)],this[_0x1a785c(0x147)]=![],this[_0x1a785c(0x165)]=![]);},Game_Player[_0x3a59ad(0x20a)]['isCollidedWithMovableEvent']=function(_0x42dd20,_0x26b94b){const _0x59f31c=_0x3a59ad,_0x118cef=$gameMap[_0x59f31c(0x15b)](_0x42dd20,_0x26b94b);if(this[_0x59f31c(0x155)]())return![];return _0x118cef[_0x59f31c(0x17e)](_0x459946=>_0x459946[_0x59f31c(0x1ad)]());},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x256)]=function(_0x42dbad,_0x47206b,_0x4ff280,_0x8af2c){const _0x43cdd8=_0x3a59ad,_0x409f26=$gameMap['eventsXyNt'](_0x42dbad,_0x47206b),_0x28e0d9=$gameMap['eventsXyNt'](_0x4ff280,_0x8af2c);return _0x409f26['some'](_0x3ef515=>_0x3ef515[_0x43cdd8(0x153)]())||_0x28e0d9['some'](_0x4f2590=>_0x4f2590[_0x43cdd8(0x153)]());},Game_Player['prototype'][_0x3a59ad(0x1cc)]=function(_0x22f413,_0x4fc050){const _0x2ff855=_0x3a59ad,_0x40c718=$gameMap[_0x2ff855(0x15b)](_0x22f413,_0x4fc050);for(const _0xe3b119 of _0x40c718){if(_0xe3b119[_0x2ff855(0x1ad)]())return _0xe3b119;}},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x23f)]=function(_0x18fc87,_0x55bd2c,_0x2b838c,_0x3717d9){const _0x3f9c71=_0x3a59ad,_0x3a1ce9=$gameMap[_0x3f9c71(0x15b)](_0x18fc87,_0x55bd2c),_0x10f8c5=$gameMap[_0x3f9c71(0x15b)](_0x2b838c,_0x3717d9);for(const _0x95fe87 of _0x3a1ce9){if(_0x95fe87['isPickable']())return _0x95fe87;}for(const _0x18b003 of _0x10f8c5){if(_0x18b003[_0x3f9c71(0x153)]())return _0x18b003;}},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x191)]=function(){const _0x19bb2a=_0x3a59ad;return!this[_0x19bb2a(0x1d2)];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x19c)]=function(){const _0x464181=_0x3a59ad;!this[_0x464181(0x1f4)]&&(this['_cacheDirFix']=!![],this['setDirectionFix'](!![])),Imported['TSR_MapJump']&&TSR[_0x464181(0x1fa)][_0x464181(0x1a6)]&&(this[_0x464181(0x1cd)]=!![],TSR[_0x464181(0x1fa)]['_jumpEnable']=![]);},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1de)]=function(){const _0xc257c4=_0x3a59ad;this[_0xc257c4(0x161)]&&(this[_0xc257c4(0x161)]=![],this['setDirectionFix'](![])),this[_0xc257c4(0x1cd)]&&(this[_0xc257c4(0x1cd)]=![],TSR[_0xc257c4(0x1fa)][_0xc257c4(0x1a6)]=!![]);},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x15d)]=function(){const _0x14de19=_0x3a59ad;SoundManager['playEffort'](),$gameTemp[_0x14de19(0x246)]?$gameTemp['requestBalloon'](this,TSR['moveEvent'][_0x14de19(0x1f3)]):this[_0x14de19(0x152)](TSR[_0x14de19(0x1f7)][_0x14de19(0x1f3)]);},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x1e7)]=function(){const _0x29acb0=_0x3a59ad,_0x16e832=this[_0x29acb0(0x263)]()?this['vehicle']()['moveSpeed']():this['normalSpeed']();this[_0x29acb0(0x23d)](_0x16e832);},Game_Player[_0x3a59ad(0x20a)]['checkMystery']=function(_0x3a6c89){const _0x391ff6=_0x3a59ad,_0xee4b23=$dataMap[_0x391ff6(0x150)][_0x3a6c89[_0x391ff6(0x1db)]][_0x391ff6(0x190)],_0x1c1ff9=$gameSystem[_0x391ff6(0x192)][_0xee4b23];_0x1c1ff9&&_0x1c1ff9[0x0]&&(SoundManager['playMystery'](),$gameSwitches['setValue'](_0x1c1ff9[0x1],!![]),_0x1c1ff9[0x0]=![]);},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x15c)]=function(_0x2d0e97,_0x545a1f,_0x292df0){const _0x46beaa=_0x3a59ad,_0x2ec091=$gameMap[_0x46beaa(0x1e9)](_0x2d0e97,_0x292df0),_0x3fc277=$gameMap[_0x46beaa(0x25c)](_0x545a1f,_0x292df0),_0x3f495b=$gameMap[_0x46beaa(0x209)](_0x2ec091,_0x3fc277),_0x5a7f75=DataManager[_0x46beaa(0x20f)](_0x3f495b);if(DataManager['isPreventThrowRegion'](_0x3f495b))return![];return this[_0x46beaa(0x16b)](_0x2d0e97,_0x545a1f,_0x292df0)||_0x5a7f75;},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x27b)]=function(_0x4d1951,_0x472092,_0x3169d0,_0x622612){const _0x3554f8=_0x3a59ad,_0x18780d=$gameMap[_0x3554f8(0x20e)](_0x4d1951),_0x15d703=_0x622612||this[_0x3554f8(0x278)]();if(this['x']===_0x472092&&this['y']===_0x3169d0&&_0x15d703===this['direction']()&&this['isHolding'](_0x18780d[_0x3554f8(0x1db)]))return _0x18780d[_0x3554f8(0x1b7)]=!![],!![];return![];},Game_Player[_0x3a59ad(0x20a)][_0x3a59ad(0x257)]=function(_0x14233e,_0x464525){const _0x3d928b=_0x3a59ad,_0x9c5190=$gameMap[_0x3d928b(0x20e)](_0x14233e),_0x3fce2c=$gameMap[_0x3d928b(0x20e)](_0x464525),_0x1ba8da=_0x3fce2c['x'],_0x5b1a7e=_0x3fce2c['y'],_0x24e3c5=_0x3fce2c[_0x3d928b(0x278)](),_0x50d7ab=_0x24e3c5===0x4?_0x1ba8da-0x1:_0x24e3c5===0x6?_0x1ba8da+0x1:_0x1ba8da,_0x1b4fa4=_0x24e3c5===0x2?_0x5b1a7e+0x1:_0x24e3c5===0x8?_0x5b1a7e-0x1:_0x5b1a7e,_0x513116=this[_0x3d928b(0x278)]();if(_0x9c5190[_0x3d928b(0x164)](_0x50d7ab,_0x1b4fa4)&&_0x513116===0xa-_0x24e3c5&&this[_0x3d928b(0x1d4)](_0x9c5190[_0x3d928b(0x1db)]))return _0x9c5190[_0x3d928b(0x1b7)]=!![],!![];return![];},Game_Player[_0x3a59ad(0x20a)]['hasThrownEvent']=function(_0x35ee1c,_0x3bbe1c,_0x4a8cad){const _0x331878=_0x3a59ad,_0x2ae01d=$gameMap[_0x331878(0x20e)](_0x35ee1c);return _0x2ae01d[_0x331878(0x17c)]===_0x3bbe1c&&_0x2ae01d[_0x331878(0x1b6)]===_0x4a8cad&&!this[_0x331878(0x1d4)](_0x35ee1c);},TSR['moveEvent'][_0x3a59ad(0x1dd)]=Game_Follower['prototype'][_0x3a59ad(0x27c)],Game_Follower[_0x3a59ad(0x20a)][_0x3a59ad(0x27c)]=function(_0x46244c){const _0x18a644=_0x3a59ad;!$gamePlayer[_0x18a644(0x160)]()&&TSR['moveEvent'][_0x18a644(0x1dd)][_0x18a644(0x1d8)](this,_0x46244c);},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x1eb)]=Game_Event[_0x3a59ad(0x20a)][_0x3a59ad(0x26c)],Game_Event[_0x3a59ad(0x20a)]['setupPage']=function(){const _0x7f4bc4=_0x3a59ad;TSR[_0x7f4bc4(0x1f7)][_0x7f4bc4(0x1eb)]['call'](this),this[_0x7f4bc4(0x17a)]();},Game_Event['prototype']['setMovableEvent']=function(){const _0x478917=_0x3a59ad;if(!this[_0x478917(0x179)]())return;const _0x5e8564=/<(?:MOVABLE EVENT|MOVABLE)>/i,_0x3748b1=/<(?:MOVABLE MYSTERY|PUSH MYSTERY):[ ](\d+)>/i,_0x53f2bb=/<(?:PICKABLE EVENT|PICKUP EVENT)>/i,_0x4ee20a=/<(?:MOVE EVENT OFFSET|MOVE OFFSET):[ ](\d+)>/i,_0x315d04=/<(?:PICKABLE CHARACTER|PICKUP CHARACTER)>/i,_0x8f9da0=/<(?:PICKABLE EVENT|PICKUP EVENT):[ ](.)>/i,_0x2224fa=/<(?:MOVABLE EVENT|MOVABLE):[ ](\d+)>/i,_0x571f83=/<(?:MOVABLE CHARACTER|MOVABLE CHAR)>/i,_0x5418ab=this['list'](),_0x6f2cde=_0x5418ab[_0x478917(0x1e8)];this['_isMovable']=![],this[_0x478917(0x21b)]=![],this[_0x478917(0x18f)]=![],this[_0x478917(0x1cb)]=![],this[_0x478917(0x1ae)]=![],this[_0x478917(0x25d)]=![],this[_0x478917(0x237)]=0x0;for(let _0x54a1be=0x0;_0x54a1be<_0x6f2cde;++_0x54a1be){let _0xb77ca3=_0x5418ab[_0x54a1be];if([0x6c,0x198][_0x478917(0x173)](_0xb77ca3[_0x478917(0x1d0)])){if(_0xb77ca3[_0x478917(0x1fb)][0x0]['match'](_0x5e8564))this[_0x478917(0x1da)]=!![];else{if(_0xb77ca3['parameters'][0x0][_0x478917(0x205)](_0x3748b1)){this[_0x478917(0x1da)]=!![];const _0x2d144e=$dataMap['events'][this['_eventId']][_0x478917(0x190)],_0x283e48=parseInt(RegExp['$1']);!$gameSystem['_mysteryEvents'][_0x2d144e]&&($gameSystem[_0x478917(0x192)][_0x2d144e]=[!![],_0x283e48]);}else{if(_0xb77ca3[_0x478917(0x1fb)][0x0][_0x478917(0x205)](_0x53f2bb))this[_0x478917(0x21b)]=!![];else{if(_0xb77ca3[_0x478917(0x1fb)][0x0][_0x478917(0x205)](_0x4ee20a))this[_0x478917(0x237)]=parseInt(RegExp['$1']);else{if(_0xb77ca3[_0x478917(0x1fb)][0x0]['match'](_0x315d04))this[_0x478917(0x21b)]=!![],this[_0x478917(0x18f)]=!![];else{if(_0xb77ca3[_0x478917(0x1fb)][0x0][_0x478917(0x205)](_0x8f9da0)){const _0x536f71=_0xb77ca3[_0x478917(0x1fb)][0x0],_0x28b5da=_0x536f71[_0x478917(0x281)](_0x536f71[_0x478917(0x1f8)](':')+0x1,_0x536f71['indexOf']('>'))[_0x478917(0x203)]();this[_0x478917(0x21b)]=!![],this[_0x478917(0x1cb)]=_0x28b5da[_0x478917(0x223)]();}else{if(_0xb77ca3[_0x478917(0x1fb)][0x0][_0x478917(0x205)](_0x2224fa))this[_0x478917(0x1da)]=!![],this[_0x478917(0x1ae)]=parseInt(RegExp['$1']);else _0xb77ca3[_0x478917(0x1fb)][0x0][_0x478917(0x205)](_0x571f83)&&(this[_0x478917(0x1da)]=!![],this[_0x478917(0x25d)]=!![]);}}}}}}}}},Game_Event[_0x3a59ad(0x20a)]['isMovable']=function(){const _0x3584db=_0x3a59ad;return this[_0x3584db(0x1da)];},Game_Event[_0x3a59ad(0x20a)][_0x3a59ad(0x153)]=function(){const _0x32a39b=_0x3a59ad;return this[_0x32a39b(0x21b)];},Game_Event[_0x3a59ad(0x20a)][_0x3a59ad(0x177)]=function(_0x582ce6,_0x4e7028){const _0x29c1b9=_0x3a59ad;this[_0x29c1b9(0x1af)]=[_0x582ce6,_0x4e7028];},Game_Event[_0x3a59ad(0x20a)]['dirInfo']=function(){const _0x5aec46=_0x3a59ad;return this[_0x5aec46(0x1af)];},Game_Event[_0x3a59ad(0x20a)]['movableEventCanPass']=function(_0x59dd84,_0x3008d7,_0x3b8b8c,_0xd28634){const _0x3a13db=_0x3a59ad;if(DataManager['isPreventMoveRegion']($gameMap[_0x3a13db(0x209)](_0x59dd84,_0x3008d7)))return![];if(!$gameMap[_0x3a13db(0x26a)](_0x59dd84,_0x3008d7,_0x3b8b8c))return![];if(this[_0x3a13db(0x1b8)](_0x59dd84,_0x3008d7)&&!_0xd28634)return![];return!![];},Game_Event[_0x3a59ad(0x20a)][_0x3a59ad(0x209)]=function(){const _0xe726a2=_0x3a59ad;if(this[_0xe726a2(0x193)]())return null;return $gameMap[_0xe726a2(0x209)](this['_x'],this['_y']);},Game_Event[_0x3a59ad(0x20a)]['forceMove']=function(_0x3bb648){const _0x8c8919=_0x3a59ad;this['setThrough'](!![]),this[_0x8c8919(0x17f)](_0x3bb648);if(this['_isMovableChar'])this['_direction']=_0x3bb648;this['setThrough'](![]);},TSR['moveEvent']['_Game_Event_isCollidedWithEvents']=Game_Event[_0x3a59ad(0x20a)][_0x3a59ad(0x16a)],Game_Event['prototype'][_0x3a59ad(0x16a)]=function(_0x3ff56a,_0x59c80c){const _0xeeffd0=_0x3a59ad,_0x367771=$gameMap[_0xeeffd0(0x15b)](_0x3ff56a,_0x59c80c),_0x306683=_0x367771[_0xeeffd0(0x17e)](_0x54b682=>!_0x54b682[_0xeeffd0(0x187)]());return(this[_0xeeffd0(0x1ad)]()||this[_0xeeffd0(0x153)]())&&_0x306683?![]:TSR[_0xeeffd0(0x1f7)][_0xeeffd0(0x261)][_0xeeffd0(0x1d8)](this,_0x3ff56a,_0x59c80c);},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x24f)]=Spriteset_Map[_0x3a59ad(0x20a)]['createLowerLayer'],Spriteset_Map[_0x3a59ad(0x20a)][_0x3a59ad(0x1c2)]=function(){const _0x1821c4=_0x3a59ad;TSR[_0x1821c4(0x1f7)][_0x1821c4(0x24f)][_0x1821c4(0x1d8)](this),this[_0x1821c4(0x171)]();},Spriteset_Map[_0x3a59ad(0x20a)]['createThrowShadowContainer']=function(){const _0x631970=_0x3a59ad;this['_throwShadowContainer']=new Sprite(),this[_0x631970(0x232)][_0x631970(0x149)](0x0,0x0,this[_0x631970(0x1ee)],this[_0x631970(0x201)]),this[_0x631970(0x232)]['z']=0x2,this[_0x631970(0x265)][_0x631970(0x1bf)](this[_0x631970(0x232)]);},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x183)]=Sprite_Character['prototype'][_0x3a59ad(0x271)],Sprite_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x271)]=function(){const _0x3246b3=_0x3a59ad;TSR['moveEvent'][_0x3246b3(0x183)][_0x3246b3(0x1d8)](this),this[_0x3246b3(0x286)]=[],this[_0x3246b3(0x21c)]=0x0;},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x20c)]=Sprite_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1bb)],Sprite_Character['prototype'][_0x3a59ad(0x1bb)]=function(){const _0x456e4a=_0x3a59ad;TSR[_0x456e4a(0x1f7)]['_Sprite_Character_update'][_0x456e4a(0x1d8)](this),this[_0x456e4a(0x282)]();},TSR[_0x3a59ad(0x1f7)][_0x3a59ad(0x20b)]=Sprite_Character['prototype'][_0x3a59ad(0x1a1)],Sprite_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1a1)]=function(){const _0x1b3d18=_0x3a59ad;if(this[_0x1b3d18(0x18a)][_0x1b3d18(0x202)]()){const _0x2a8ff8=this[_0x1b3d18(0x18a)]['direction'](),_0xce409a=_0x2a8ff8===0x4||_0x2a8ff8===0x6?'x':'y',_0x1aad8b=_0xce409a==='x'?'y':'x',_0x5b76a6=_0x1aad8b==='x'?this[_0x1b3d18(0x18a)][_0x1b3d18(0x1e4)]():this[_0x1b3d18(0x18a)]['screenY'](),_0x25f564=_0x2a8ff8===0x2||_0x2a8ff8===0x6;let _0x508f55=![];if(this['_character'][_0x1b3d18(0x252)]())this[_0xce409a]=this['mapCoordinates'](_0x25f564,_0xce409a,this[_0x1b3d18(0x18a)][_0x1b3d18(0x252)]()),this[_0x1aad8b]=_0x5b76a6,this['z']=this[_0x1b3d18(0x18a)][_0x1b3d18(0x17b)]();else{if(this['_character'][_0x1b3d18(0x1a5)]())this[_0x1b3d18(0x18a)][_0x1b3d18(0x160)]()&&(this['_character'][_0x1b3d18(0x23d)](this[_0x1b3d18(0x18a)][_0x1b3d18(0x166)]()),_0x508f55=!![]),this[_0xce409a]=this['mapCoordinates'](_0x25f564,_0xce409a,this[_0x1b3d18(0x18a)]['pullDist'](),![],_0x508f55),this[_0x1aad8b]=_0x5b76a6,this['z']=this[_0x1b3d18(0x18a)][_0x1b3d18(0x17b)]();else this[_0x1b3d18(0x18a)][_0x1b3d18(0x274)]()?(this[_0xce409a]=this[_0x1b3d18(0x230)](!_0x25f564,_0xce409a,this[_0x1b3d18(0x18a)][_0x1b3d18(0x274)](),!![]),this[_0x1aad8b]=_0x5b76a6,this['z']=this['_character'][_0x1b3d18(0x17b)]()):TSR[_0x1b3d18(0x1f7)][_0x1b3d18(0x20b)][_0x1b3d18(0x1d8)](this);}}else TSR[_0x1b3d18(0x1f7)][_0x1b3d18(0x20b)][_0x1b3d18(0x1d8)](this);},Sprite_Character['prototype'][_0x3a59ad(0x230)]=function(_0x311248,_0x80057e,_0x2376d0,_0x2d49ad,_0x7f3b1e){const _0x37db5e=_0x3a59ad;this['_patternCount']++;const _0x4136cf=this[_0x37db5e(0x18a)],_0x13df69=_0x80057e==='x'?_0x4136cf['screenX']():_0x4136cf[_0x37db5e(0x1a3)](),_0x1250b2=_0x2d49ad||_0x7f3b1e?_0x13df69:_0x2376d0,_0x3fa1a6=_0x2d49ad?0x0:_0x4136cf[_0x37db5e(0x1a4)]();if(_0x311248){if(this[_0x80057e]<_0x1250b2)return _0x4136cf[_0x37db5e(0x268)](!![]),this[_0x80057e]+0x1;else{_0x4136cf['setMovingEventPreventMove'](![]);if(_0x2d49ad)_0x4136cf['setBackDist'](![]);return _0x13df69+_0x3fa1a6;}}else{if(this[_0x80057e]>_0x1250b2)return _0x4136cf[_0x37db5e(0x268)](!![]),this[_0x80057e]-0x1;else{_0x4136cf[_0x37db5e(0x268)](![]);if(_0x2d49ad)_0x4136cf[_0x37db5e(0x182)](![]);return _0x13df69-_0x3fa1a6;}}},Sprite_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x1b3)]=function(){const _0x309102=_0x3a59ad;this[_0x309102(0x18a)][_0x309102(0x18d)]()&&(this['_character']['setRequireThrowShadow'](![]),this[_0x309102(0x186)]());},Sprite_Character[_0x3a59ad(0x20a)][_0x3a59ad(0x186)]=function(){const _0x14ad42=_0x3a59ad,_0x2e1db1=this[_0x14ad42(0x250)]();this[_0x14ad42(0x286)][_0x14ad42(0x148)](_0x2e1db1);},Sprite_Character[_0x3a59ad(0x20a)]['createThrowShadow']=function(){const _0x440af3=_0x3a59ad;let _0x4d7530=new Sprite_ThrowShadow();return _0x4d7530['x']=this['x'],_0x4d7530['y']=this['y']-0x10,_0x4d7530['scale']['x']=0.8,_0x4d7530[_0x440af3(0x27a)]['y']=0.8,_0x4d7530['setup'](this,this[_0x440af3(0x18a)]),SceneManager[_0x440af3(0x1cf)]['_spriteset'][_0x440af3(0x232)]['addChild'](_0x4d7530),_0x4d7530;},Sprite_Character['prototype'][_0x3a59ad(0x282)]=function(){const _0x37cece=_0x3a59ad;this['setupThrowShadow'](),this[_0x37cece(0x286)][_0x37cece(0x1e8)]>0x0&&(!this['_throwSpriteSet'][0x0][_0x37cece(0x23c)]()&&(SceneManager[_0x37cece(0x1cf)][_0x37cece(0x1f5)][_0x37cece(0x232)][_0x37cece(0x1d9)](this[_0x37cece(0x286)][0x0]),this['_throwSpriteSet'][_0x37cece(0x25f)]()));};function Sprite_ThrowShadow(){const _0x2b9792=_0x3a59ad;this[_0x2b9792(0x16f)][_0x2b9792(0x15f)](this,arguments);}function _0x375c(_0x20cabb,_0x2186fc){const _0x56943a=_0x5694();return _0x375c=function(_0x375ca8,_0x505810){_0x375ca8=_0x375ca8-0x144;let _0xff50fb=_0x56943a[_0x375ca8];return _0xff50fb;},_0x375c(_0x20cabb,_0x2186fc);}function _0x5694(){const _0x1ff290=['Pickup\x20Sound','919896MLsIbB','setNormalSpeed','dirInfo','eventsXyNt','throwPass','makeEffort','_direction','apply','pullMoved','_cacheDirFix','isPressed','playDrop','pos','_cacheCharIndex','pullSpeed','playPush','_dist','_pickupSheet','isCollidedWithEvents','canPass','throwDestination','isEventRunning','_hasThrew','initialize','playEffort','createThrowShadowContainer','setRequireThrowShadow','contains','Pickup\x20Character\x20Image','_jumpOffset','xWithDirection','setDirInfo','7691320uCcxWp','page','setMovableEvent','screenZ','_realX','_pushSheet','some','moveEventStraight','movingEventPreventMove','_pickupOffset','setBackDist','_Sprite_Character_initMembers','characterIndex','forceMove','startThrowShadow','isNormalPriority','tileWidth','Push\x20Sound','_character','isPulling','isRepeated','requireThrowShadow','_isPulling','_isPickupChar','name','canMoveEvent','_mysteryEvents','isPickup','updatePickupEvent','Pickup\x20Event\x20Offset','playPickup','2421050cMJGJa','checkMystery','_isPushing','playMe','setValue','setPause','_throw','throwPickup','_isPickup','_pattern','updatePosition','setThrough','screenY','moveOffset','pullDist','_jumpEnable','moveSpeed','updateThrow','resetPulling','_duration','isPreventMoveRegion','_pullSpeed','isMovable','_movableSwitch','_dirInfo','evalDist','Parameters','_pushSound','setupThrowShadow','constructor','_pickupImage','_realY','_isBrought','isCollidedWithCharacters','_movingEventPreventMove','_pullEventCount','update','updatePickup','Pushing\x20Character\x20Image','isCollidedWithMovableEvent','addChild','checkCacheImage','enableMenu','createLowerLayer','Move\x20Frame\x20Rate','_pullEvent','value','isDashButtonPressed','setDirection','yWithDirection','_dashing','endMapPickup','_isBreakable','movableEvent','_cacheEnableJump','isThrowCliff','_scene','code','_tileId','_pickupEvent','mapId','isHolding','_moveKey','playSe','makeSoundObj','call','removeChild','_isMovable','_eventId','canMove','_Game_Follower_chaseChar','unsetPause','isDashing','isThrow','bitmap','straighten','endPickup','screenX','_pullMoved','canPull','resetSpeed','length','roundXWithDirection','hasPickup','_Game_Event_setupPage','isPreventThrowRegion','pickupEvent','width','setMoveOffset','_pushEvent','eventId','resetCacheImage','_effortBallonId','_directionFix','_spriteset','_GamePlayer_canMove','moveEvent','indexOf','2178786qYFTjc','mapJump','parameters','_throwCount','cacheSpeed','setPickup','_effortSound','_pushEventCount','height','isPlayer','trim','pushMoved','match','91076fuwfxA','_pullCount','updatePushEvent','regionId','prototype','_Sprite_Character_updatePosition','_Sprite_Character_update','setPriorityType','event','isThrowRegion','Pulling\x20Character\x20Image','_throwSound','_pickupSound','_routeUndone','makeSheetInfo','reverseDir','_moveJump','getInputDirection','executePickup','Player\x20Move\x20Speed','moveStraight','_isPickable','_patternCount','executePull','setPushDist','Throw\x20Sound','_moveRouteIndex','maxPattern','disableMenu','toUpperCase','isMovementSucceeded','resetPushing','note','setThrowDestination','Effort\x20Sound','_throwSheet','setPullDist','canPush','_throwPattern','playThrow','TSR_MapJump','_pushCount','mapCoordinates','_characterIndex','_throwShadowContainer','followers','7960272sagchv','calcDirection','TSR_MoveEvent','_moveEventOffset','characterName','_normalSpeed','updatePattern','round','isPlaying','setMoveSpeed','increaseSteps','pickableEvent','_charSprite','setDirectionFix','updatePush','executePush','setup','_pushImage','_balloonQueue','70gmGWtJ','_hasPickup','_data','loadBitmap','_lastX','1160173LFKfMa','pickupOffset','updateShadowPosition','_Spriteset_Map_createLowerLayer','createThrowShadow','anchor','pushDist','locate','toString','normalSpeed','isCollidedWithPickableEvent','hasGaveEvent','_moveOffset','split','_threwMidAir','_Game_Player_initMembers','roundYWithDirection','_isMovableChar','_dropSound','shift','setPullMoved','_Game_Event_isCollidedWithEvents','_Scene_Map_stop','isInVehicle','_characterName','_tilemap','isMovingEvent','thrownAt','setMovingEventPreventMove','isHoldingOk','isPassable','_pullDist','setupPage','Move\x20Key','_throwImage','movableEventCanPass','setThrow','initMembers','_throwDestination','Throw\x20Character\x20Image','backDist','_moveSpeed','_pushDist','_Game_Player_update','direction','_mysterySound','scale','hasBroughtEvent','chaseCharacter','setPullSpeed','loadSystem','_pullSheet','_backDist','slice','updateThrowShadowSprites','_moveRate','setPushMoved','stop','_throwSpriteSet','_lastY','_jumpPeak','setPattern','_cacheCharName','push','setFrame','_originalPattern','setPosition','_pushMoved','hasThrew','isPushing','updatePull','events','sqrt','requestBalloon','isPickable','isBreakable','isMoving','_Game_CharacterBase_updatePattern'];_0x5694=function(){return _0x1ff290;};return _0x5694();}Sprite_ThrowShadow[_0x3a59ad(0x20a)]=Object['create'](Sprite[_0x3a59ad(0x20a)]),Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x1b4)]=Sprite_ThrowShadow,Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x16f)]=function(){const _0x51a29c=_0x3a59ad;Sprite['prototype']['initialize'][_0x51a29c(0x1d8)](this),this[_0x51a29c(0x271)](),this[_0x51a29c(0x24a)]();},Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x271)]=function(){const _0x38d362=_0x3a59ad;this[_0x38d362(0x251)]['x']=0.5,this[_0x38d362(0x251)]['y']=0.5,this[_0x38d362(0x1aa)]=0x0;},Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x24a)]=function(){const _0x4b6f6c=_0x3a59ad;this[_0x4b6f6c(0x1e1)]=ImageManager[_0x4b6f6c(0x27e)]('Shadow1'),this[_0x4b6f6c(0x149)](0x0,0x0,this[_0x4b6f6c(0x1e1)]['width'],this[_0x4b6f6c(0x1e1)][_0x4b6f6c(0x201)]);},Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x244)]=function(_0x387b79,_0x52f65a){const _0xed0819=_0x3a59ad;this[_0xed0819(0x240)]=_0x387b79,this[_0xed0819(0x216)]=!![],this[_0xed0819(0x15e)]=_0x52f65a['_direction'],this[_0xed0819(0x1aa)]=_0x52f65a['_dist']*0x9,this['_jumpOffset']=0x0;},Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x1bb)]=function(){const _0x43d948=_0x3a59ad;this[_0x43d948(0x1aa)]--,this[_0x43d948(0x24e)]();},Sprite_ThrowShadow[_0x3a59ad(0x20a)][_0x3a59ad(0x24e)]=function(){const _0x3108ec=_0x3a59ad,_0x4952bb=$gamePlayer[_0x3108ec(0x15e)];if(this['_moveJump']){if(_0x4952bb===0x4)this['x']=this[_0x3108ec(0x240)]['x']-0x4;else _0x4952bb===0x6?this['x']=this[_0x3108ec(0x240)]['x']+0x2:(this[_0x3108ec(0x175)]+=-0x1,this['y']=this[_0x3108ec(0x240)]['y']+this[_0x3108ec(0x175)]);}},Sprite_ThrowShadow[_0x3a59ad(0x20a)]['isPlaying']=function(){const _0x4c010d=_0x3a59ad;return this[_0x4c010d(0x1aa)]>0x0;};
})();

//== END ========================================================================
//===============================================================================
