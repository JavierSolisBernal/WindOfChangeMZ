//=============================================================================
// Actor Stepping Animation
// by Shaz
// added functionality by Stadler
// Last Updated: 2021.03.22
//
// Revisions:
// 2015.10.30 Fixed TypeError: Cannot read property 'actor' of undefined.
// 2021.03.20 Allow using the notetag for classes and states.
// 2021.03.22 RMMV uses ECMA5 which doesn't support arrow functions yet.
//=============================================================================
 
/*:
 * @target MZ & MV
 * @plugindesc Allows party leader/followers to have stepping anim on map
 * @author Shaz
 *
 * @help This plugin does not provide plugin commands.
 *
 * Add <stepanim> to the note box of an Actor, a Class or a State to turn on
 * stepping animation for the actor's sprite on the map, as the party leader
 * or a follower.
 * Terms
 * free for use in commercial games
 *
 */
 
(function() {
    var setSteppingAnimation = function(thiz, character) {
        if (character) {
            thiz.setStepAnime(
                character.actor().meta.stepanim ||
                character.currentClass().meta.stepanim ||
                character.states().some(function(s) { return s.meta.stepanim; }) ||
                false
            );
        }
    };
 
    var _Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        _Game_Player_update.call(this, sceneActive);
        setSteppingAnimation(this, $gameParty.leader());
    };
  
    var _Game_Follower_update = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function() {
        _Game_Follower_update.call(this);
        setSteppingAnimation(this, this.actor());
    };
})();