//========================================================================================
//=== TSR_SaveEvent === A Plugin by The Northern Frog ====================================
//========================================================================================

var TSR = TSR || {};
TSR.saveEvent = TSR.saveEvent || {};
TSR.saveEvent.version = 1.00;

var Imported = Imported || {};
Imported.TSR_SaveEvent = true;

//========================================================================================

/*:
 * @target MZ
 * @plugindesc v1.0.0 Save the position, direction and move route index of events when
 *                    leaving a map.
 * 
 * @author TSR, The Northern Frog, 2020      
 * @help 
 * =========================================================================================
 * == About this Plugin ====================================================================
 * =========================================================================================
 * Use the following event notetag to make an event retain its position,
 * direction and move route index.
 * 
 * Event Notetag:  
 *                  <save position>
 * 
 * 
 * The following scriptcall can be used to reset events position.
 * 
 * Script call:
 *                  $gameSystem.resetMapEventPos(mapId)
 *                      Reset all events on the map specified by mapId
 * 
 *                  $gameSystem.resetAllEventPos()
 *                      Reset all events in the game
 * 
 * 
 * To temporary disable the save position of a specific event, use this
 * script call before the transfer command:
 * 
 *                 $gameMap._events[eventId]._preventSavePos = true; 
 *                     It will set back to false by itself after 
 *                     the transfer
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
 * 2020/11/25 Completed plugin, v1.0.0
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
 */

(() => {
 const _0x5969=['_moveRoute','setupEvents','resetMapEventPos','parameters','_scale','reserveTransfer','497711JUcHby','_Game_System_initialize','_eventId','100954NvNpzg','list','2262813bXqJaU','mapId','381151fvZZwd','isSaveEventPos','isSaveEvent','reloadMapNoSaveEventPos','resetAllEventPos','setDirection','initialize','104aHxQuS','stop','_events','length','saveEvent','prototype','1cFpdKr','call','_preventSavePos','saveEventPos','split','_moveRouteIndex','_savedPos','events','4027fCabBY','note','1034563bsstSR','requestMapReload','256630gwFLri','_Scene_Map_stop'];const _0xd729=function(_0x57f7be,_0x3e6f85){_0x57f7be=_0x57f7be-0x181;let _0x5969ec=_0x5969[_0x57f7be];return _0x5969ec;};const _0x340ebf=_0xd729;(function(_0x2eef62,_0x19c426){const _0xbec51a=_0xd729;while(!![]){try{const _0x7fd16d=-parseInt(_0xbec51a(0x199))*parseInt(_0xbec51a(0x1a3))+-parseInt(_0xbec51a(0x1a5))+-parseInt(_0xbec51a(0x185))+parseInt(_0xbec51a(0x18c))+parseInt(_0xbec51a(0x188))+-parseInt(_0xbec51a(0x1a1))*parseInt(_0xbec51a(0x193))+parseInt(_0xbec51a(0x18a));if(_0x7fd16d===_0x19c426)break;else _0x2eef62['push'](_0x2eef62['shift']());}catch(_0x22416a){_0x2eef62['push'](_0x2eef62['shift']());}}}(_0x5969,0x83276),TSR['Parameters']=PluginManager[_0x340ebf(0x182)]('TSR_SaveEvent'),DataManager[_0x340ebf(0x18e)]=function(_0x5deb68){const _0x41c4da=_0x340ebf,_0x55d0f9=/<(?:SAVE EVENT POSITION|SAVE POSITION)>/i,_0x4de59b=_0x5deb68[_0x41c4da(0x1a2)][_0x41c4da(0x19d)](/[\r\n]+/);for(let _0x545f44=0x0;_0x545f44<_0x4de59b[_0x41c4da(0x196)];_0x545f44++){const _0x563d65=_0x4de59b[_0x545f44];if(_0x563d65['match'](_0x55d0f9))return!![];}return![];},TSR[_0x340ebf(0x197)][_0x340ebf(0x1a6)]=Scene_Map[_0x340ebf(0x198)][_0x340ebf(0x194)],Scene_Map[_0x340ebf(0x198)][_0x340ebf(0x194)]=function(){const _0x2e0348=_0x340ebf;TSR[_0x2e0348(0x197)][_0x2e0348(0x1a6)][_0x2e0348(0x19a)](this);if(!$gameTemp['_preventSaveEventPos'])for(const _0x4348aa of $gameMap[_0x2e0348(0x195)]){if(_0x4348aa&&_0x4348aa[_0x2e0348(0x18d)]()){const _0x5867f1=$gameMap[_0x2e0348(0x18b)](),_0x57f5b6=_0x4348aa[_0x2e0348(0x187)];!_0x4348aa['_preventSavePos']?$gameSystem[_0x2e0348(0x19c)](_0x5867f1,_0x57f5b6,_0x4348aa['x'],_0x4348aa['y'],_0x4348aa['_direction'],_0x4348aa[_0x2e0348(0x19e)],_0x4348aa[_0x2e0348(0x183)]):_0x4348aa[_0x2e0348(0x19b)]=![];}}else $gameTemp['_preventSaveEventPos']=![];},TSR['saveEvent']['_Game_System_initialize']=Game_System['prototype'][_0x340ebf(0x192)],Game_System[_0x340ebf(0x198)][_0x340ebf(0x192)]=function(){const _0x19d9c6=_0x340ebf;TSR[_0x19d9c6(0x197)][_0x19d9c6(0x186)]['call'](this),this[_0x19d9c6(0x19f)]={};},Game_System[_0x340ebf(0x198)]['saveEventPos']=function(_0x366d9f,_0x29d178,_0x6c58ff,_0x51065b,_0x2c142e,_0x38ad26,_0x22cfbe){const _0x18916f=_0x340ebf;if(!this['_savedPos'][_0x366d9f])this[_0x18916f(0x19f)][_0x366d9f]={};this[_0x18916f(0x19f)][_0x366d9f][_0x29d178]=[_0x6c58ff,_0x51065b,_0x2c142e,_0x38ad26,_0x22cfbe];},Game_System[_0x340ebf(0x198)][_0x340ebf(0x181)]=function(_0x5f260d){const _0x4e617b=_0x340ebf;this[_0x4e617b(0x19f)][_0x5f260d]=![],this[_0x4e617b(0x18f)]();},Game_System['prototype'][_0x340ebf(0x190)]=function(){const _0x25ef57=_0x340ebf;this[_0x25ef57(0x19f)]={},this[_0x25ef57(0x18f)]();},Game_System[_0x340ebf(0x198)][_0x340ebf(0x18f)]=function(){const _0x5a72c7=_0x340ebf,_0x2fa801=$gameMap['mapId'](),_0x29b24b=$gamePlayer['x'],_0x4b21d1=$gamePlayer['y'];$gameTemp['_preventSaveEventPos']=!![],$gamePlayer[_0x5a72c7(0x184)](_0x2fa801,_0x29b24b,_0x4b21d1),$gamePlayer[_0x5a72c7(0x1a4)]();},TSR[_0x340ebf(0x197)]['_Game_Map_setupEvents']=Game_Map[_0x340ebf(0x198)][_0x340ebf(0x1a8)],Game_Map[_0x340ebf(0x198)][_0x340ebf(0x1a8)]=function(){const _0x4fa186=_0x340ebf;TSR[_0x4fa186(0x197)]['_Game_Map_setupEvents']['call'](this),this['checkSavedEventPos']();},Game_Map[_0x340ebf(0x198)]['checkSavedEventPos']=function(){const _0x499c9e=_0x340ebf;for(const _0x317f6f of $gameMap[_0x499c9e(0x195)]){if(_0x317f6f){const _0x2fb06d=this['mapId'](),_0x3ebf90=_0x317f6f[_0x499c9e(0x187)];if($gameSystem[_0x499c9e(0x19f)][_0x2fb06d]&&$gameSystem[_0x499c9e(0x19f)][_0x2fb06d][_0x3ebf90]){const _0x16fe3c=$gameSystem['_savedPos'][_0x2fb06d][_0x3ebf90][0x0],_0x2a1c35=$gameSystem[_0x499c9e(0x19f)][_0x2fb06d][_0x3ebf90][0x1],_0x4b0652=$gameSystem[_0x499c9e(0x19f)][_0x2fb06d][_0x3ebf90][0x3];_0x317f6f['setPosition'](_0x16fe3c,_0x2a1c35),_0x317f6f[_0x499c9e(0x191)]($gameSystem['_savedPos'][_0x2fb06d][_0x3ebf90][0x2]),_0x317f6f['_moveRouteIndex']=_0x4b0652>_0x317f6f[_0x499c9e(0x1a7)][_0x499c9e(0x189)][_0x499c9e(0x196)]?0x0:_0x4b0652,_0x317f6f['_scale']=$gameSystem['_savedPos'][_0x2fb06d][_0x3ebf90][0x4];}}}},Game_Event['prototype'][_0x340ebf(0x18d)]=function(){const _0xda0ef0=_0x340ebf,_0x5786c9=$dataMap[_0xda0ef0(0x1a0)][this[_0xda0ef0(0x187)]];return DataManager[_0xda0ef0(0x18e)](_0x5786c9);});
})();

//==== END ======================================================================
//===============================================================================
