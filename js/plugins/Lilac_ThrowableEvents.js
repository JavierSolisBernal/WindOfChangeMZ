/*:============================================================================

  @target MZ

  @author Chaucer

  @plugindesc | Lilac Throwable Events : Version - 1.1.0 | This plugin allows you to pick up and throw events!.

  @url http://rosedale-studios.com

  @help

============================================================================
  Introduction :
============================================================================

  ()()
  (^.^)
  c(")(")

  This plugin allows you to setup events to be picked up and thrown either
  by note tag, or by comment! This plugin is relatively easy to use and
  setup, see below for further instructions on requirements and how to
  use this plugin.

============================================================================
  Requirements :
============================================================================

  ---------------------------------------
  None.
  ---------------------------------------

============================================================================
  Instructions :
============================================================================

   This plugin is plug & play, there are some optional parameters which can
   be tweaked from the plugin manager, as well as some simple plugin commands
   which can be used during gameplay.

   To create a throwable event, add a comment on said event, this comment
   must include the text from the line below.

   throwable

   once the event has this comment in it's page, the event will be able to
   be picked up, and thrown by the player. The throwable event will ONLY
   be able to be picked up and thrown when it is on a page that includes
   the above comment on it!

   Youn can run specific code both when the item is picked up, and again when
   the object is thrown, to do this, add one the comments below, any event
   commands placed BELOW this comment will be executed when thrown, or picked
   up, depending on the comment used.

   throw

   pickup

   You can also add requirements in order for the player to pick up certain
   events, such as, requiring a specific item, equipment, a variable, a
   switch, state, or stat! Below are some templates.

   throwable : require variable ID BOOLEAN
   throwable : require switch ID ONOFF
   throwable : require item ID AMOUNT
   throwable : require weapon ID
   throwable : require armor ID
   throwable : require state ID
   throwable : require stat PARAM VALUE

   Replace ID with the id of the variable/switch/item/weapon/armor/state.

   Replace BOOLEAN with either true or false( true = on, false = off ).

   Replace VALUE with the value you want the variable/stat to be greater than.

   Replace AMOUNT with the amount of the item that should be in inventory.

   Replace PARAM with, level, hp, mp, atk, def, mat, mdf, agi, or luk.


   You can also stack mutliple requirements by using the & symbol. Below is
   an example, you can stack as many requirements of any kind, in any order.

   throwable : require state ID & require stat level

============================================================================
  Plugin Commands [MV] :
============================================================================

   command : set_throw_distance X
  ---------------------------------------
   description : change the throw distance to X( replace "X" with a number
   value of 1 or higher ).

   command : force_pickup EVENT_ID
  ---------------------------------------
   description : force the player to pick up the event with the id of
   EVENT_ID( replace "EVENT_ID" with the ID of the event you want the
   player to pick up ) this can be useful for cutscenes, I guess.

   command : force_throw
  ---------------------------------------
   description : force the player to throw any event he is currently holding.

============================================================================
  Terms Of Use :
============================================================================

  This Plugin may be used commercially, or non commercially. This plugin may
  be extended upon, and or shared freely as long as credit is given to it's
  author(s). This plugin may NOT be sold, or plagiarized.

============================================================================
  Version History :
============================================================================

  ● Version : 1.0.0
  ● Date : 11/13/2020
    ★ Release.


● Version : 1.1.0
● Date : 02/03/2021
  ★ Add - Can talk to events when carrying objects!
  ★ Add - "Pickup Variable" in plugin parameters, to stores picked up event ID!
  ✩ Fix - removed unecessary console.log statement.


============================================================================
  Contact Me :
============================================================================

  If you have questions, about this plugin, or commissioning me, or have
  a bug to report, please feel free to contact me by any of the below
  methods.

  website : https://www.rosedale-studios.com
  rmw : https://forums.rpgmakerweb.com/index.php?members/chaucer.44456
  youtube : https://www.youtube.com/channel/UCYA4VU5izmbQvnjMINssshQ/videos
  email : chaucer(at)rosedale-studios(dot)com
  discord : chaucer#7538
  skypeId : chaucer1991

============================================================================
  Support My Work :
============================================================================

  If you like the content I create, and want to contribute to help me
  making more plugins on a regular basis, please consider becoming a patron,
  supporting me on ko-fi, or donating via the links listed below!


  patreon : https://www.patreon.com/chaucer91
  paypal.me : https://paypal.me/chaucer91
  ko-fi : https://ko-fi.com/chaucer91

============================================================================
  Special Thanks :
============================================================================

  Patrons :

  ★ Benjamin Humphrey
  ★ Whitney & Tyrell White

============================================================================

  @command set_throw_distance
  @text Set Throw Distance
  @desc Set the distance the player is able to throw objects.

  @arg distance
  @text Distance
  @desc How far the player will be able to throw events.
  @default 1
  @type number
  @min 1

  @command force_pickup
  @text Force Pickup
  @desc Force the player to pickup the event with the id specified.


  @arg eventId
  @text Event Id
  @desc The id of the event the player will be forced to pick up.
  @default 1
  @type number
  @min 1

  @command force_throw
  @text Force Throw
  @desc force the player to throw any currently held event.

  @param throwDistance
  @text Throw Distance
  @desc The distance objects can be thrown by default( can be adjusted in game ).
  @default 1
  @type number
  @min 1
  @max 100

  @param pickupSe
  @text Pick Up Sound Effect
  @desc Sound effect that will play when you pick up an event.
  @default
  @type struct<SoundEffect>

  @param throwSe
  @text Throw Sound Effect
  @desc Sound effect that will play when you throw an event.
  @default
  @type struct<SoundEffect>

  @param restrictedRegions
  @text Restricted Regions
  @desc List any regions that should not allow throwing past.
  @default []
  @type number[]
  @min 1
  @max 255

  @param pickedVariable
  @text Pickup Variable
  @desc The variable you specify here will store the id of any event the player is carrying( 0 if no event ).
  @default 0
  @type variable

*/

 /*~struct~SoundEffect:

  @param name
  @text Sound Effect Name
  @desc The name of the sound effect to play.
  @default
  @type file
  @dir audio/se/
  @required 1

  @param volume
  @text Sound Effect Volume
  @desc volume of the sound effect.
  @default 90
  @type number
  @min 0
  @max 100

  @param pitch
  @text Sound Effect Pitch
  @desc The pitch of the sound effect.
  @default 100
  @type number
  @min 50
  @max 150

  @param pan
  @text Sound Effect Pan
  @desc The pan of the sound effect.
  @default 0
  @type number
  @min -100
  @max 100

*/

//=============================================================================
var Imported = Imported || {};
Imported['Lilac Throwable Events'] = true;
//=============================================================================
var Chaucer = Chaucer || {};
Chaucer.pickThrow = {};
//=============================================================================

( function ( $ ) { // CONFIG:

  $ = $ || {};
//============================================================================
  //Create plugin information.
//============================================================================

  $._identifier =  /(Lilac Throwable Events) : Version - (\d+\.\d+\.\d+)/;
  $._nameError = 'Lilac Throwable Events was unable to load! Please revert any changes back to normal!';

  for ( var i = 0, l = $plugins.length; i < l; i++ ) {

    if ( !$plugins[i].description.match( $._identifier ) ) continue;

    $._author = 'Chaucer';
    $._name = RegExp.$1;
    $._version = RegExp.$2;
    $._pluginName = $plugins[i].name;
    $._params = Parse( $plugins[i].parameters );
    $._commands = {};
    $._alias = {};

  };

  if ( !$._name ) throw new Error( $._nameError );

//============================================================================


//=============================================================================
// Custom :
//=============================================================================

//--------------------------------------------------------------------------
  function Parse( data )
  { // parse data.
//--------------------------------------------------------------------------
    try { data = JSON.parse( data ); }
    catch ( error ) { data = data; }
    finally {

      if ( typeof data === 'object' ) {
        let keys = Object.keys( data );

        for (var i = 0, l = keys.length; i < l; i++ ) {
          data[keys[i]] = Parse( data[keys[i]] );
        }

      }

    }

    return data;

  };

//-----------------------------------------------------------------------------
  $.alias = function ( className, method, fn, isStatic )
  { // use this method to quickly alias a method of a particular class.
//-----------------------------------------------------------------------------

    let key = `${className.name}${( isStatic ? '' : '.prototype.' ) + method}`;

    if ( $._alias[key] ) throw new Error( `${key} already aliased!` );

    eval( `
      $._alias[key] = ${key};
      ${key} = ${fn.toString().replace( `alias`, `$._alias["${key}"].call` )};
    ` );

  };

//-----------------------------------------------------------------------------
  $.expand = function ( className, method, fn, isStatic )
  { // use this method to quickly alias a method of a particular class.
//-----------------------------------------------------------------------------

    if ( !isStatic )
      className.prototype[method] = fn;

    else
      className[method] = fn;

  };

//-----------------------------------------------------------------------------
  $.compareVersion = function ( current, target )
  { // compare the current version with the target version.
//-----------------------------------------------------------------------------

    const v1 = current.split( '.' );
    const v2 = target.split( '.' );
    for ( let i = 0, l = v1.length; i < l; i++ ) {
      if ( v1[i] < v2[i] ) return -1; // version is lower!
      if ( v1[i] > v2[i] ) return 1; // version is higher!
    }
    return 0; // same version!

  };

//-----------------------------------------------------------------------------
  $.registerPluginCommand = function ( command, fn )
  { // compare the current version with the target version.
//-----------------------------------------------------------------------------

    if ( Utils.RPGMAKER_NAME === 'MV' )
      $._registerMVPluginCommand( command.toLowerCase(), fn );

    else if ( Utils.RPGMAKER_NAME === 'MZ' )
      $._registerMZPluginCommand( $._pluginName, command, fn );

  };

//-----------------------------------------------------------------------------
  $._registerMVPluginCommand = function ( command, fn )
  { // compare the current version with the target version.
//-----------------------------------------------------------------------------

    $._commands[command] = fn;

  };

//-----------------------------------------------------------------------------
  $._registerMZPluginCommand = function ( pluginName, command, fn )
  { // compare the current version with the target version.
//-----------------------------------------------------------------------------

    PluginManager.registerCommand( pluginName, command, fn );

  };
//=============================================================================
// RPG MAKER MV SPECIFIC CODE :
//=============================================================================

  if ( Utils.RPGMAKER_NAME === 'MV' ) {

    if ( $.compareVersion( Utils.RPGMAKER_VERSION, '1.5.0' ) < 0 ) {
      console.error( `Warning: ${$._pluginName} was developed for MV 1.5.0+ compatability with older versions is not garunteed!` );
    }

//-----------------------------------------------------------------------------
    $.alias( Game_Interpreter, 'pluginCommand', function( command, args ) {
//-----------------------------------------------------------------------------

      alias( this, command, args );
      command = command.toLowerCase()
      if ( $._commands[command] ) $._commands[command]( args );

    } );

  }

//=============================================================================
// Utilities :
//=============================================================================

  $.requirements = {
    'item': '$gameParty._items[%1] >= %2',
    'armor': '$gameParty.members()[0].isEquipped( $dataArmors[%1] )',
    'weapon': '$gameParty.members()[0].isEquipped( $dataWeapons[%1] )',
    'switch': '$gameSwitches.value( %1 ) === %2',
    'variable': '$gameVariables.value( %1 ) >= %2',
    'stat': '$gameParty.members()[0].%1 >= %2',
    'state':'$gameParty.members()[0].isStateAffected( %1 )',
  }

//=============================================================================
// Game_CharacterBase :
//=============================================================================

//-----------------------------------------------------------------------------
  $.alias( Game_CharacterBase, 'initMembers', function()
  { // Aliased initMembers of class Game_CharacterBase.
//-----------------------------------------------------------------------------

    alias( this );
    this._carryId = 0;
    this._picked = false;
    this._thrown = false;
    this._pickable = false;
    this._pickupRequirement = null;
    this._carryThrough = this._through;
    this._carryPriority = this._priorityType;
    this._throwRange = $._params.throwDistance;
    this._throwEventData = { start: -1, end: -1 };
    this._pickupEventData = { start: -1, end: -1 };


  } );

//-----------------------------------------------------------------------------
  $.alias( Game_CharacterBase, 'updateMove', function()
  { // Aliased update of class Game_CharacterBase.
//-----------------------------------------------------------------------------

    if ( this.isHeld() ) return;
    alias( this );

    var carriedEvent = this.carriedEvent();
    if ( !!carriedEvent ) {
      carriedEvent._x = this.x;
      carriedEvent._y = this.y - 1;
      carriedEvent._realX = this._realX;
      carriedEvent._realY = this._realY - 1;
    }


  } );

//-----------------------------------------------------------------------------
  $.alias( Game_CharacterBase, 'updateJump', function()
  { // Aliased updateJump of class Game_CharacterBase.
//-----------------------------------------------------------------------------

    alias( this );
    if ( this.isThrown() && this._jumpCount === 0 ) {

      this.setPriorityType( this._carryPriority );
      this.setThrough( this._carryThrough );
      this._picked = false;
      this._thrown = false;

    }


  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'carriedEvent', function()
  { // return the event this character is currently carrying( if any ).
//-----------------------------------------------------------------------------

    return $gameMap.event( this._carryId ) || null;

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'isPickingUp', function()
  { // return if the character is picking up an event.
//-----------------------------------------------------------------------------

    if ( !this.carriedEvent() ) return false;
    return this.carriedEvent().isJumping();

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'isHeld', function()
  { // return if this event is being held by another character.
//-----------------------------------------------------------------------------

    return this._picked;

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'isThrown', function()
  { // return if this event is being held by another character.
//-----------------------------------------------------------------------------

    return this._thrown;

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'isThrowable', function()
  { // return if the character is throwable.
//-----------------------------------------------------------------------------

    return this._pickable;

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'throwRange', function()
  { // return the throw range of the character.
//-----------------------------------------------------------------------------

    return this._throwRange + 1;

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'pickUpEvent', function( eventId )
  { // pick up the event with id specified.
//-----------------------------------------------------------------------------

    this._carryId = eventId;

    var event = this.carriedEvent();
    if ( !event ) return;

    var x = $gameMap.deltaX( this.x, event.x );
    var y = $gameMap.deltaX( this.y, event.y ) - 1;

    event._carryPriority = event._priorityType;
    event._carryThrough = event.isThrough();
    event.setPriorityType( 2 );
    event.setThrough( true );
    event._picked = true;
    event.jump( x, y );

    $gameMap._interpreter.setup( event.list(), event._eventId );
    $gameMap._interpreter._index = event._pickupEventData.start;
    $gameTemp._terminateEventIndex = event._pickupEventData.end;

    AudioManager.playSe( Chaucer.pickThrow._params.pickupSe );

    const vId = Chaucer.pickThrow._params.pickedVariable;
    $gameVariables.setValue( vId, eventId );

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'throwEvent', function()
  { // throw the currently held event.
//-----------------------------------------------------------------------------

    var event = this.carriedEvent();

    if ( !event || event.isJumping() ) return false;

    var throwPosition = this.getThrowPosition();
    if ( event ) event.jump( throwPosition.x, throwPosition.y );
    event._thrown = true;
    this._carryId = 0;

    $gameMap._interpreter.setup( event.list(), event._eventId );
    $gameMap._interpreter._index = event._throwEventData.start;
    $gameTemp._terminateEventIndex = event._throwEventData.end;

    AudioManager.playSe( Chaucer.pickThrow._params.throwSe );

    const vId = Chaucer.pickThrow._params.pickedVariable;
    $gameVariables.setValue( vId, 0 );

    return true;

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'getThrowPosition', function()
  { // return the throw position for the currently held event.
//-----------------------------------------------------------------------------

    var event = this.carriedEvent();

    var direction = this.direction();
    var dx = $gameMap.roundXWithDirection( this.x, direction );
    var dy = $gameMap.roundYWithDirection( this.y, direction );

    var deltaX = $gameMap.deltaX( dx, event.x ) * this.throwRange();
    var deltaY = ( $gameMap.deltaY( dy, event.y ) - 1 ) * this.throwRange() + 1;

    return this.adjustThrowPosition( deltaX, deltaY );

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'adjustThrowPosition', function( x, y )
  { // adjust the throw position to ensure valid destination.
//-----------------------------------------------------------------------------

    var regions = $._params.restrictedRegions;
    var point = new Point( x, y );
    var signX = Math.sign( x );
    var signY = Math.sign( y );

    var d = this.direction();

    if ( Math.abs( x ) > 0 ) {
      for ( var i = 0, l = Math.abs( x ); i < l; i++ ) {
        point.set( this.x + i * signX, this.y + y - 1 );

        if ( !this.canPass( point.x, point.y, d ) ) break;
        if ( regions.indexOf( $gameMap.regionId(
          $gameMap.roundXWithDirection( point.x, d ),
          $gameMap.roundYWithDirection( point.y, d )
        ) ) > -1 ) break;

      }

    } else if ( Math.abs( y - 1 ) > 0 ) {
      for ( var i = 0, l = Math.abs( y - 1 ); i < l; i++ ) {

        point.set( this.x + x, this.y + i * signY );

        if ( !this.canPass( point.x, point.y, d ) ) break;
        if ( regions.indexOf( $gameMap.regionId(
          $gameMap.roundXWithDirection( point.x, d ),
          $gameMap.roundYWithDirection( point.y, d )
        ) ) > -1 ) break;

      }

    }
    point.set( point.x - this.x, ( point.y - this.y ) + 1 );

    return point

  } );

  //-----------------------------------------------------------------------------
  $.expand( Game_CharacterBase, 'setPickupRequirements', function( args )
  { // set pickup requirements from arguments.
  //-----------------------------------------------------------------------------

    var requirements = [];

    for ( var i = 0, l = args.length; i < l; i++ ) {

      var data = args[i].trim().toLowerCase().split( ' ' );
      if ( data[0] !== 'require' ) continue;

      requirements[i] = $.requirements[data[1]].format( data[2], data[3] );

    }
    this._pickupRequirement = requirements;

  } );

//=============================================================================
// Game_Event :
//=============================================================================

//-----------------------------------------------------------------------------
  $.alias( Game_Event, 'clearPageSettings', function()
  { // Aliased refresh of class Game_Event.
//-----------------------------------------------------------------------------

    alias( this );
    this._carryId = 0;
    this._picked = false;
    this._thrown = false;
    this._pickable = false;
    this._pickupRequirement = null;
    this._throwRange = $._params.throwDistance;
    this._throwEventData = { start: -1, end: -1 };
    this._pickupEventData = { start: -1, end: -1 };

  } );

//-----------------------------------------------------------------------------
  $.alias( Game_Event, 'setupPageSettings', function()
  { // Aliased setupPageSettings of class Game_Event.
//-----------------------------------------------------------------------------

    alias( this );
    if ( this.page() ) this.setupThrowFromList( this.list() );

  } );

//-----------------------------------------------------------------------------
  $.expand( Game_Event, 'canPickup', function()
  { // return if this event can be picked up.
//-----------------------------------------------------------------------------

    return this._pickupRequirement.every( function( requirement ) {
      return eval( requirement )
    } );


  } );

//-----------------------------------------------------------------------------
  $.expand( Game_Event, 'setupThrowFromList', function( list )
  { // setup throw settings from list data of the event.
//-----------------------------------------------------------------------------

    var throwStarted = false;
    var pickupStarted = false;
    var param = '';
    for ( var i = 0, l = list.length; i < l; i++ ) {

      if ( i === ( l - 1 ) ) {
        if ( pickupStarted ) this._pickupEventData.end = i;
        if ( throwStarted ) this._throwEventData.end = i;
      }

      if ( list[i].code !== 108 && list[i].code !== 408 ) continue;

      if ( list[i].parameters[0].toLowerCase().match( /throwable\s*(.*)/ ) ) {
        args = ( RegExp.$1 || "" ).replace( ':', '' ).split( '&' );
        this.setPickupRequirements( args );
        this._pickable = true;

      } else if ( list[i].parameters[0].toLowerCase().match( /throw/ ) ) {
        if ( pickupStarted ) this._pickupEventData.end = i;
        this._throwEventData.start = i;
        pickupStarted = false;
        throwStarted = true;

      } else if ( list[i].parameters[0].toLowerCase().match( /pickup/ ) ) {
        if ( throwStarted ) this._throwEventData.end = i;
        this._pickupEventData.start = i;
        pickupStarted = true;
        throwStarted = false;

      }

    }

  } );

//=============================================================================
// Game_Player :
//=============================================================================

//-----------------------------------------------------------------------------
  $.alias( Game_Player, 'performTransfer', function()
  { // Aliased performTransfer of class Game_Player.
//-----------------------------------------------------------------------------

    alias( this );

    const vId = Chaucer.pickThrow._params.pickedVariable;
    $gameVariables.setValue( vId, 0 );
    this._carryId = 0;


  } );

//-----------------------------------------------------------------------------
  $.alias( Game_Player, 'startMapEvent', function( x, y, triggers, normal )
  { // Aliased startMapEvent of class Game_Player.
//-----------------------------------------------------------------------------

    this.pickupMapEvent( x, y, triggers, normal );
    alias( this, x, y, triggers, normal );

  } );

//-----------------------------------------------------------------------------
  $.alias( Game_Player, 'triggerButtonAction', function()
  { // Aliased triggerButtonAction of class Game_Player.
//-----------------------------------------------------------------------------

    const result = alias( this );
    if ( Input.isTriggered( 'ok' ) && !result && this.throwEvent() ) return true;
    return result;

  } );

//-----------------------------------------------------------------------------
  $.alias( Game_Player, 'canMove', function()
  { // Aliased canMove of class Game_Player.
//-----------------------------------------------------------------------------

    return alias( this ) && !this.isPickingUp();


  } );

  //-----------------------------------------------------------------------------
  $.expand( Game_Player, 'pickupMapEvent', function ( x, y, triggers, normal )
  { // attempt to pickup map event at position specified.
  //-----------------------------------------------------------------------------

    var events = $gameMap.eventsXy( x, y );

    for ( var i = 0; i < events.length; i++ ) {

      if ( !events[i] ) continue;
      if ( !events[i].isTriggerIn( triggers ) ) continue;
      if ( events[i].isNormalPriority() !== normal ) continue;
      if ( !events[i].isThrowable() || !events[i].canPickup() ) continue;
      this.pickUpEvent( events[i].eventId() );

      break;

    }

    return this._carryId > 0;

  } );

//=============================================================================
// Game_Interpreter :
//=============================================================================

//-----------------------------------------------------------------------------
  $.alias( Game_Interpreter, 'executeCommand', function()
  { // Aliased update of class Game_Interpreter.
//-----------------------------------------------------------------------------

    if ( this._list && $gameTemp._terminateEventIndex == this._index ) {
      $gameTemp._terminateEventIndex = -1;
      return this.command115();
    }
    return alias( this );

  } );

//=============================================================================
// Plugin Comamnds :
//=============================================================================

//-----------------------------------------------------------------------------
  $.registerPluginCommand( 'set_throw_distance', function( args )
  { // register command for set_throw_distance.
//-----------------------------------------------------------------------------

    if ( Utils.RPGMAKER_NAME === 'MV' )
      $gamePlayer._throwRange = Number( args[0] ) || 1;

    else if ( Utils.RPGMAKER_NAME === 'MZ' )
      $gamePlayer._throwRange = Number( args.distance ) || 1;

  } );

//-----------------------------------------------------------------------------
  $.registerPluginCommand( 'force_pickup', function( args )
  { // register command for force_pickup.
//-----------------------------------------------------------------------------

    if ( Utils.RPGMAKER_NAME === 'MV' )
      $gamePlayer.pickUpEvent( Number( args[0] ) || 0 );

    else if ( Utils.RPGMAKER_NAME === 'MZ' )
      $gamePlayer.pickUpEvent( Number( args.eventId ) );

  } );

//-----------------------------------------------------------------------------
  $.registerPluginCommand( 'force_throw', function( args )
  { // register command for force_throw.
//-----------------------------------------------------------------------------

    if ( Utils.RPGMAKER_NAME === 'MV' )
    $gamePlayer.throwEvent( Number( args[0] ) || 0 );

    else if ( Utils.RPGMAKER_NAME === 'MZ' )
    $gamePlayer.throwEvent( Number( args.eventId ) );


  } );

//=============================================================================
} )( Chaucer.pickThrow );
//=============================================================================
