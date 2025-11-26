/*:
 * @target MZ
 * @plugindesc Manages multiple parties, allowing switching and visibility (items per group).
 * @author Tomazella Games
 * @help
 * This plugin enables managing multiple groups in RPG Maker MZ. 
 * Groups can exchange items and actors, and are visible on the map.
 * 
 * This plugin is licensed under GPL-3 license:
 * - License link: https://www.gnu.org/licenses/gpl-3.0.en.html
 * - The plugin is Open Source, and you can change, update, edit,
 *  use for commercial or personal projects, but it always has to use
 *  the same license, and always be open source.
 * 
 * Website: https://tomazellagames.com/
 * 
 * # How to Use:
 * 
 * 1. Open Tools -> Plugin Manager... ⚙️
 * 2. Double click on the TomazellaGames_MultiGroupManager.js.🖱️🖱️
 * 3. On Parameters, double click Extra Groups.🖱️🖱️
 * 4. Double click an empty row to create, or an existing row to edit
 *  (Always Double Click to edit or add an item on the plugins window). ➕/✏️
 * 5. Open Initial Actors and choose what actors start on that group. 🎭➡️👥
 * 6. Set the Initial Map ID for the group. 🗺️
 * 7. Select the X and Y starting positions. 📍
 * 8. You can leave the other options as they are, unless you want
 *  to interact with the group since the game start.
 * 
 * ## How to find values 🔍
 * - To find the correct `X` and `Y` positions and Map ID:
 *   - Go to the map you want to start the party. 🗺️
 *   - Change to Mode -> Event (or hit F6) 🖱️
 *   - Click the map cell you want to use. 🖱️
 *   - On the bottom right of the program you'll see some informations. ℹ️
 *     - The rightmost information is the `X, Y` position. 📍
 *     - The next one (to the left) is current Zoom (Usually 100%) 🔍
 *     - Then you have info in the format `MAP_ID:NAME_NAME (WIdth, Height)`,
 *       just get the Map ID. 🔢
 * 
 * ## Plugin Commands 🔌
 * You can use the following plugin commands for this plugin:
 * 
 * ### Switch Group 🔄
 * Params:
 * - Group Index (default group is 0) 🔢
 * Effect: Change the control to the chosen group. 👥➡️👥
 * 
 * ### Set Group Discovered 👁️
 * Params:
 * - Group ID: The group that will be affected by this command 🔢
 * - Discovered: `True` or `False` ✅/❌
 * Effect: Set the discovered state (shown on the Switch Group window) 👁️
 * 
 * ### Set Group Can Swap 🔄
 * Params:
 * - Group ID: The group that will be affected by this command 🔢
 * - Can Swap: `True` or `False` ✅/❌
 * Effect: Set if this group can be swapped to
 *         (can be selected on the Switch Group window) 🔄
 * 
 * ### Modify Group Actor 🎭
 * Params:
 * - Group ID: The group that will be affected by this command 🔢
 * - Actor ID: The actor that will be affected by this command 🎭
 * - Action: `add` or `remove` ➕/➖
 * Effect: Adds or Removes the selected actor from the selected group 🎭➡️👥
 * 
 * ### Modify Group Item 📦
 * Params:
 * - Group ID: The group that will be affected by this command 🔢
 * - Item Type: `Item`, `Weapon` or `Armor`,
 *               the RPG Maker MZ default item types 🛡️/⚔️/💊
 * - Item ID: The index of the item on the selected item type 🔢
 * - Amount: `Integer` value, the desired quantity of items of that
 *           type and ID the party will have. 🔢
 * Effect: Sets the exact amount of items of that ID and type
 *         to that party. 📦➡️👥
 * 
 * ### Transport Group 🚚
 * Params:
 * - Group ID: The group that will be affected by this command 🔢
 * - Map ID: The map the group will be transported to 🗺️
 * - X Position: x position on the selected map the group will transfer 📍
 * - Y Position: y position on the selected map the group will transfer 📍
 * Effect: Sets the selected group position to the desired map coordinate
 * 
 * @command SwitchGroup
 * @text Switch Group
 * @desc Switches to the specified group.
 *
 * @arg groupIndex
 * @text Group Index
 * @type number
 * @min 0
 * @default 0
 * @desc Index of the group to switch to (0 = main group, 1 = extra group 1, etc.).
 * 
 * @command SetGroupDiscovered
 * @text Set Group Discovered
 * @desc Changes the "discovered" status of a group.
 *
 * @arg groupId
 * @text Group ID
 * @type number
 * @min 0
 * @default 1
 * @desc The ID of the group to modify.
 *
 * @arg discovered
 * @text Discovered
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc Whether the group is discovered.
 *
 * @command SetGroupCanSwap
 * @text Set Group Can Swap
 * @desc Changes the "canSwap" status of a group.
 *
 * @arg groupId
 * @text Group ID
 * @type number
 * @min 0
 * @default 1
 * @desc The ID of the group to modify.
 *
 * @arg canSwap
 * @text Can Swap
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc Whether the group can be swapped.
 *
 * @command ModifyGroupActor
 * @text Modify Group Actor
 * @desc Adds or removes an actor from a group.
 *
 * @arg groupId
 * @text Group ID
 * @type number
 * @min 0
 * @default 0
 * @desc The ID of the group to modify.
 *
 * @arg actorId
 * @text Actor ID
 * @type actor
 * @desc The actor to add or remove.
 *
 * @arg action
 * @text Action
 * @type select
 * @option Add
 * @value add
 * @option Remove
 * @value remove
 * @default add
 * @desc Whether to add or remove the actor.
 *
 * @command ModifyGroupItem
 * @text Modify Group Item
 * @desc Adds or removes an item, weapon, or armor from a group.
 *
 * @arg groupId
 * @text Group ID
 * @type number
 * @min 0
 * @default 0
 * @desc The ID of the group to modify.
 *
 * @arg itemType
 * @text Item Type
 * @type select
 * @option Item
 * @value item
 * @option Weapon
 * @value weapon
 * @option Armor
 * @value armor
 * @default item
 * @desc The type of item to modify.
 *
 * @arg itemId
 * @text Item ID
 * @type number
 * @default 1
 * @desc The ID of the item, weapon, or armor to modify.
 *
 * @arg amount
 * @text Amount
 * @type number
 * @default 1
 * @desc The quantity to add or remove (use negative values to remove).
 *
 * @command TransportGroup
 * @text Transport Group
 * @desc Transports a group to a position on any map.
 *
 * @arg groupId
 * @text Group ID
 * @type number
 * @min 0
 * @default 0
 * @desc The ID of the group to transport.
 *
 * @arg mapId
 * @text Map ID
 * @type number
 * @min 1
 * @default 1
 * @desc The ID of the map to transport to.
 *
 * @arg x
 * @text X Position
 * @type number
 * @default 0
 * @desc The X position to transport to.
 *
 * @arg y
 * @text Y Position
 * @type number
 * @default 0
 * @desc The Y position to transport to.
 * 
 * @param extraGroups
 * @text Extra Groups
 * @type struct<Group>[]
 * @desc Define extra groups and their starting positions.
 * @default []
 * 
 * @param textGroupSwitchPrompt
 * @text Group Switch Prompt
 * @type text
 * @desc Text shown when asking the player to switch groups.
 * @default Switch to this group?
 * 
 * @param textGroupSwitchPrompt
 * @text Group Switch Prompt
 * @type text
 * @desc Text shown when asking the player to switch groups.
 * @default Switch to this group?
 * 
 * @param enableGroupSwitch
 * @text Enable Group Switching
 * @type boolean
 * @on Yes
 * @off No
 * @desc Enable or disable group switching directly by the player.
 * @default true
 *
 * @param enableGroupCollision
 * @text Enable Group Collision
 * @type boolean
 * @on Yes
 * @off No
 * @desc Enable or disable collision between groups.
 * @default true
 */

/*~struct~Group:
 * @param actors
 * @text Initial Actors
 * @type actor[]
 * @desc Initial actors of this group.
 * 
 * @param startMapId
 * @text Initial Map ID
 * @type number
 * @min 1
 * @desc Map ID where the group starts.
 * @default 1
 * 
 * @param startX
 * @text Initial X Position
 * @type number
 * @desc X-coordinate where the group starts.
 * @default 0
 * 
 * @param startY
 * @text Initial Y Position
 * @type number
 * @desc Y-coordinate where the group starts.
 * @default 0
 * 
 * @param discovered
 * @text Is discovered at start
 * @type boolean
 * @on Yes
 * @off No
 * @desc Whether the group can be seen in the swap group menu from the start of the game.
 * @default false
 * 
 * @param canSwap
 * @text Can Swap at Start
 * @type boolean
 * @on Yes
 * @off No
 * @desc Whether the group can be swapped at the start of the game.
 * @default false
 */

(() => {
    const pluginName = "TomazellaGames_MultiGroupManager";
    const parameters = PluginManager.parameters(pluginName);

    // Plugin parameters
    const extraGroups = JSON.parse(parameters["extraGroups"] || "[]").map(group => JSON.parse(group));
    const enableGroupSwitch = JSON.parse(parameters["enableGroupSwitch"] || "true");
    const enableGroupCollision = JSON.parse(parameters["enableGroupCollision"] || "true");
	const textGroupSwitchPrompt = parameters["textGroupSwitchPrompt"] || "Switch to this group?";
	
	// Namespace for all TomazellaGames plugins
    window.TomazellaGames = window.TomazellaGames || {};

    // Groups and related properties
    window.groups = [];
    window.currentGroupIndex = 0;
	window.wantToChangeToGroupIndex = -1;
	window.wantToChangeGroupFromAnotherMap = false;
	const groupEventExtraId = 90;
	// const targetSelfSwitch = "D";
	window.savedDataMapEvents = null;
    window.savedGameMapEvents = null;
	window.savedGroupPositions = {};
	window.savedEventsMapId = -1;
	
	TomazellaGames.MultiGroupManager = {
		resetSavedEvents() {
			window.savedDataMapEvents = null;
			window.savedGameMapEvents = null;
			window.savedGroupPositions = {};
			window.savedEventsMapId = -1;
			console.log("Reseting saved events for map", $gameMap.mapId());
		},
	};

	/**
	 * Initializes groups with parameters and starting values.
     */
    function initializeGroups() {
		groups = [{
            id: 0,
            actors: $dataSystem.partyMembers,
            mapId: $dataSystem.startMapId,
            x: $dataSystem.startX,
            y: $dataSystem.startY,
			inventory: { items: {}, weapons: {}, armors: {}, gold: $dataSystem.startGold || 0 },
			discovered: true,
			canSwap: true
        }];
        extraGroups.forEach((group, index) => {
            try {
                const parsedActors = JSON.parse(group.actors);
                if (Array.isArray(parsedActors)) {
					const discovered = !!(group.discovered === "true");
					const canSwap = !!(group.canSwap === "true");
					groups.push({
						id: index + 1,
						actors: parsedActors.map(Number),
						mapId: Number(group.startMapId),
						x: Number(group.startX),
						y: Number(group.startY),
						inventory: { items: {}, weapons: {}, armors: {}, gold: 0 },
						discovered: discovered,
						canSwap: canSwap && discovered
					});
                } else {
                    console.error(`Error initializing group ${index + 1}: actors is not an array`, group.actors);
                }
            } catch (e) {
                console.error("Error analysing group.actors:", e);
            }
        });
		console.log(groups)
    }

	/**
	 * Make sure map contents are up to changes
	 */
	function refreshEvents() {
		$gameMap.refresh();
	}

	// TODO make this work on different maps
	/**
     * Switches to the specified group, saving and restoring relevant data.
     * @param {number} forceGroupId - The group ID to switch to. If not specified, cycles to the next group.
     */
    window.switchGroup = function (forceGroupId = -1) {
		let targetGroupIndex = forceGroupId % groups.length;
		if (forceGroupId < 0) targetGroupIndex = (currentGroupIndex + 1) % groups.length;
		if (targetGroupIndex === currentGroupIndex) return;
		
		const lastGroup = groups[currentGroupIndex];
		lastGroup.x = $gamePlayer.x;
		lastGroup.y = $gamePlayer.y;
		lastGroup.mapId = $gameMap.mapId();
		
		const targetGroup = groups[targetGroupIndex];
		
		if (!targetGroup.canSwap || !targetGroup.discovered || !lastGroup.canSwap) {
			SoundManager.playBuzzer();
			return;
		}
		
		// if (lastGroup.mapId !== targetGroup.mapId) {
			// $gamePlayer.reserveTransfer(targetGroup.mapId, targetGroup.x, targetGroup.y, $gamePlayer.direction(), 0);
			// $gamePlayer.performTransfer();
		// }
		
		// Determine the next group to switch to
		currentGroupIndex = targetGroupIndex;
		
		// Save current group's inventory
        saveInventory(lastGroup.inventory);
		 // Restore the inventory of the new active group
        loadInventory(targetGroup.inventory);
		
        // Remove all actors from the current group
		$gameParty.members().forEach(actor => {
			$gameParty.removeActor(actor.actorId());
		});
        // Add actors from the new active group
		targetGroup.actors.forEach(actorId => {
			$gameParty.addActor(actorId);
		});
		
		// refresh event positions
		toggleEventForGroup(lastGroup);
		toggleEventForGroup(targetGroup);
		refreshEvents();
		
        // Transfer the player to the new group's position
		$gamePlayer.reserveTransfer(targetGroup.mapId, targetGroup.x, targetGroup.y, $gamePlayer.direction(), 0);
		
		if (lastGroup.mapId !== targetGroup.mapId) {
			setTimeout(() => {
				$gamePlayer.performTransfer();
				
				targetGroup.x = $gamePlayer.x;
				targetGroup.y = $gamePlayer.y;
				targetGroup.mapId = $gameMap.mapId();
				
				groups.forEach((group, index) => {
					createEventForGroup(group);
					toggleEventForGroup(group);
				});
				refreshEvents();
				
				if (SceneManager._scene._spriteset) {
					SceneManager._scene._spriteset.refreshCharacterSprites();
				}
			}, 0);
		} else {
			$gamePlayer.performTransfer();
				
			targetGroup.x = $gamePlayer.x;
			targetGroup.y = $gamePlayer.y;
			targetGroup.mapId = $gameMap.mapId();
			
			// groups.forEach((group, index) => {
				// createEventForGroup(group);
				// toggleEventForGroup(group);
			// });
			// refreshEvents();
			
			if (SceneManager._scene._spriteset) {
				SceneManager._scene._spriteset.refreshCharacterSprites();
			}
		}
		
		
		
		// if (SceneManager._scene._spriteset) {
			// SceneManager._scene._spriteset.refreshCharacterSprites();
		// }
		
        // Refresh character sprites to avoid visual glitches
		// if (lastGroup.mapId === targetGroup.mapId) {
			// refreshEvents();
			// SceneManager._scene._spriteset.refreshCharacterSprites();
		// } else {
			// // TomazellaGames.MultiGroupManager.resetSavedEvents();
			// // groups.forEach((group, index) => {
				// // createEventForGroup(group);
				// // toggleEventForGroup(group);
			// // });
			// // refreshEvents();
		// }
		
		// Play switch sound
		SoundManager.playRecovery();
		console.log("Changed to %s, from %s | Map: %s", currentGroupIndex, lastGroup.id, $gameMap.mapId());
	}
	
	/**
     * Saves the inventory of the current group.
     * @param {Object} inventory - The inventory to save.
     */
	function saveInventory(inventory) {
        inventory.items = JSON.parse(JSON.stringify($gameParty._items));
        inventory.weapons = JSON.parse(JSON.stringify($gameParty._weapons));
        inventory.armors = JSON.parse(JSON.stringify($gameParty._armors));
		inventory.gold = $gameParty.gold();
    }
	
	/**
     * Loads the inventory of the active group.
     * @param {Object} inventory - The inventory to load.
     */
	function loadInventory(inventory) {
        $gameParty._items = JSON.parse(JSON.stringify(inventory.items));
        $gameParty._weapons = JSON.parse(JSON.stringify(inventory.weapons));
        $gameParty._armors = JSON.parse(JSON.stringify(inventory.armors));
		$gameParty._gold = inventory.gold;
    }
	
	/**
     * Creates an event for a specific group with appropriate properties.
     * @param {Object} group - The group for which the event is created.
     */
	function createEventForGroup(group) {
		const mainActorId = group.actors[0];
		const mainActorData = $dataActors[mainActorId];
		let characterName = mainActorData ? mainActorData.characterName : "";
		let characterIndex = mainActorData ? mainActorData.characterIndex : 0;
		if (!characterName) {
			console.warn(`Main actor for group ${group.id} doesn't have a sprite. Using default image.`);
			characterName = "Actor1";
		}
		createEvent(group.x, group.y, group.id, characterName, characterIndex);
	};
	
	/**
     * Toggles visibility of a group event.
     * @param {Object} group - The group whose event should be toggled.
     * @param {boolean} show - Whether to show or hide the event.
     */
	function toggleEventForGroup(group) {
		let id = group.id + groupEventExtraId;
		const event = $gameMap.event(id);
		if (event) {
			event.locate(group.x, group.y);
		} else {
			createEventForGroup(group);
		}
		refreshEvents();
	}
	
	/**
     * Creates a new event dynamically with specified properties.
     * @param {number} x - X-coordinate of the event.
     * @param {number} y - Y-coordinate of the event.
     * @param {number} id - Unique ID for the event.
     * @param {string} characterName - Character graphic filename.
     * @param {number} characterIndex - Character graphic index.
     * @param {Array} commands - Event commands.
     * @param {string} eventName - Name of the event.
     */
    function createEvent(x, y, groupId, characterName = "", characterIndex = 0) {
		const event_name = `Group[${groupId}]`;
		const id = groupId + groupEventExtraId;
		if ($dataMap.events[id]) {
			const existingEvent = $dataMap.events[id];
			if (
				existingEvent.name === event_name &&
				existingEvent.x === x &&
				existingEvent.y === y &&
				existingEvent.pages?.length > 0
			) {
				return;
			} else {
				console.warn(`Evento ${id} está corrompido ou incompleto. Recriando...`);
			}
		}
		
		const sameMap = `groups[${groupId}]?.mapId === $gameMap.mapId()`;
		const otherGroup = `${groupId} !== window.currentGroupIndex`;
		const discovered = `groups[${groupId}]?.discovered === true`;
		const condition = discovered + " && " + otherGroup + " && " + sameMap;
		
		const canSwapCondition = condition + ` && groups[${groupId}]?.canSwap === true`;
		
        const eventData = {
            id: id,
            name: event_name,
            x: x,
            y: y,
            pages: [
				{
					conditions: { switch1Valid: false, switch2Valid: false, variableValid: false, selfSwitchValid: false },
					image: { tileId: 0, characterName: "", characterIndex: 0, direction: 2, pattern: 0 },
					moveType: 0,
					trigger: 0,
					list: [],
					directionFix: false,
					priorityType: 0,
					walkAnime: false,
					stepAnime: false,
					moveSpeed: 0,
					moveFrequency: 0
				},
                {
                    conditions: {
						switch1Valid: false, switch2Valid: false,
						variableValid: false,
						customCondition: condition
					},
                    image: { tileId: 0, characterName: characterName || "", characterIndex: characterIndex, direction: 2, pattern: 0 },
                    moveType: 0,
                    trigger: enableGroupCollision ? 0 : 1,
                    list: [
						{ code: 102, indent: 0, parameters: [["Can't switch to this group now"], 2] },
						{ code: 402, indent: 0, parameters: [0] },
						{ code: 0, indent: 0 }
					],
                    directionFix: false,
                    priorityType: enableGroupCollision ? 1 : 0,
                    walkAnime: true,
                    stepAnime: true,
                    moveSpeed: 3,
                    moveFrequency: 3
                },
                {
                    conditions: {
						switch1Valid: false, switch2Valid: false,
						variableValid: false,
						customCondition: canSwapCondition
					},
                    image: { tileId: 0, characterName: characterName || "", characterIndex: characterIndex, direction: 2, pattern: 0 },
                    moveType: 0,
                    trigger: enableGroupCollision ? 0 : 1,
                    list: [
						{ code: 102, indent: 0, parameters: [[textGroupSwitchPrompt], 2] },
						{ code: 402, indent: 0, parameters: [0] },
						{ code: 355, indent: 1, parameters: [`switchGroup(${groupId});`] },
						{ code: 0, indent: 0 }
					],
                    directionFix: false,
                    priorityType: enableGroupCollision ? 1 : 0,
                    walkAnime: true,
                    stepAnime: true,
                    moveSpeed: 3,
                    moveFrequency: 3
                }
            ]
        };
		if (!$dataMap.events[id]) {
			$dataMap.events[id] = eventData;
		} else {
			Object.assign($dataMap.events[id], eventData);
		}
		$gameMap.setupEvents();
		refreshEvents();
    }
	
	/**
	 * Call the plugin command from events
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_Game_Interpreter_pluginCommand.call(this, command, args);
	};
	
	/**
	 * Updates current group inventory as soon as we change items
	 */
	const _Game_Party_gainItem = Game_Party.prototype.gainItem;
	Game_Party.prototype.gainItem = function(item, amount, includeEquip) {
		_Game_Party_gainItem.call(this, item, amount, includeEquip);
		
		if (groups) {
			const currentGroup = groups[currentGroupIndex];
			if (currentGroup) {
				currentGroup.inventory.items = JSON.parse(JSON.stringify(this._items));
				currentGroup.inventory.weapons = JSON.parse(JSON.stringify(this._weapons));
				currentGroup.inventory.armors = JSON.parse(JSON.stringify(this._armors));
				currentGroup.inventory.gold = this.gold();
			}
		}
	};

	/**
	 * Adds the groups events to the current map
	 */
	const _Game_Map_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId) {
		if(groups.length==0) initializeGroups();
		_Game_Map_setup.call(this, mapId);
		if (SceneManager._scene instanceof Scene_Map) {
			groups.forEach((group, index) => {
				createEventForGroup(group);
				toggleEventForGroup(group);
			});
			refreshEvents();
			console.log("Criou grupos para o mapa", $gameMap.mapId());
		
			 
		}
		
	};
	
	/**
	 * Release current sprites and update the correct ones
	 */
	Spriteset_Map.prototype.refreshCharacterSprites = function() {
		// Remove current sprites
		if (this._characterSprites) {
			this._characterSprites.forEach(sprite => {
				if (sprite.parent) {
					sprite.parent.removeChild(sprite);
				}
			});
		}
		// Restore characters sprites
		this.createCharacters();
	};
	
	/**
	 * Save current map events so groups sprites and events are not lost when opening menu
	 */
    const _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
		window.savedEventsMapId = $gameMap.mapId();
        savedDataMapEvents = JSON.parse(JSON.stringify($dataMap.events));
        savedGameMapEventIds = $gameMap._events.map(event => event ? event.eventId() : null);
		savedGroupPositions = groups.map(group => ({
			mapId: group.mapId,
			x: group.x,
			y: group.y
		}));
        _Scene_Menu_create.call(this);
    };

    /**
	 * Overriding Scene_Map.start to handle restoring events
	 */
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
		console.warn("Scene_Map.prototype.start START", $gameMap.mapId());
		console.log("window.savedEventsMapId %s | $gameMap.mapId() %s", window.savedEventsMapId, $gameMap.mapId());
		if (window.savedEventsMapId == $gameMap.mapId() && !window.wantToChangeGroupFromAnotherMap) {
			if (savedDataMapEvents && savedGameMapEventIds) {
				// Restore events in $dataMap
				$dataMap.events = JSON.parse(JSON.stringify(savedDataMapEvents));
				// Restore events in $gameMap as instances of Game_Event
				$gameMap._events = savedGameMapEventIds.map(eventId => {
					if (eventId !== null && $dataMap.events[eventId]) {
						const eventData = $dataMap.events[eventId];
						if (eventData && typeof eventData.x === "number" && typeof eventData.y === "number") {
							try {
								return new Game_Event($gameMap.mapId(), eventId);
							} catch (error) {
								console.error(`Error creating the event ${eventId}:`, error);
								return null;
							}
						} else {
							console.warn(`Event ${eventId} doesn't have valid coordinates.`);
							return null;
						}
					}
					console.warn(`Event ${eventId} not found or invalid.`);
					return null;
				});
				$gameMap.refresh();
				this._spriteset.refreshCharacterSprites(); // Clear and recreate the sprites
			}
			if (savedGroupPositions && savedGroupPositions.length > 0) {
				groups.forEach((group, index) => {
					const position = savedGroupPositions[index];
					if (position) {
						group.mapId = position.mapId;
						group.x = position.x;
						group.y = position.y;
					}
				});
				groups.forEach(group => {
					// createEventForGroup(group);
					toggleEventForGroup(group);
				});
				refreshEvents();
			}
		} else {
			TomazellaGames.MultiGroupManager.resetSavedEvents();
			window.wantToChangeGroupFromAnotherMap = false;
			// groups.forEach((group, index) => {
				// createEventForGroup(group);
				// toggleEventForGroup(group);
			// });
			// refreshEvents();
			// console.log("Criou grupos para o mapa", $gameMap.mapId());
		}
		
		// if (wantToChangeToGroupIndex >= 0 && wantToChangeToGroupIndex != currentGroupIndex) {
			// console.log("Is going to change to %s, from %s", wantToChangeToGroupIndex, currentGroupIndex);
			// switchGroup(wantToChangeToGroupIndex);
		// }
		// wantToChangeToGroupIndex = -1;
		
        _Scene_Map_start.call(this);
		
		if (wantToChangeToGroupIndex >= 0 && wantToChangeToGroupIndex != currentGroupIndex) {
			console.log("Is going to change to %s, from %s", wantToChangeToGroupIndex, currentGroupIndex);
			switchGroup(wantToChangeToGroupIndex);
		}
		wantToChangeToGroupIndex = -1;
		console.warn("Scene_Map.prototype.start END", $gameMap.mapId());
    };
	
	/**
	 * Add the option to switch groups
	 */
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
		_Scene_Map_update.call(this);
		if (enableGroupSwitch && Input.isTriggered('pageup')) {
			switchGroup(currentGroupIndex - 1);
		}
		if (enableGroupSwitch && Input.isTriggered('pagedown')) {
			switchGroup();
		}
		
		// if (wantToChangeToGroupIndex >= 0 && wantToChangeToGroupIndex != currentGroupIndex) {
			// console.log("Is going to change to %s, from %s", wantToChangeToGroupIndex, currentGroupIndex);
			// switchGroup(wantToChangeToGroupIndex);
			// wantToChangeToGroupIndex = -1;
		// }
	};

	/**
	 * Initialize the groups when a new game is created.
	 */
    const _Scene_Title_commandNewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function() {
        _Scene_Title_commandNewGame.call(this);
        initializeGroups();
    };
	
	/**
	 * Adds the ability to check custom conditions in events. Only accessible by code.
	 */
	const _Game_Event_meetsConditions = Game_Event.prototype.meetsConditions;
	Game_Event.prototype.meetsConditions = function(page) {
		if (!_Game_Event_meetsConditions.call(this, page)) {
			return false;
		}

		if (page.conditions.customCondition) {
			try {
				const result = eval(page.conditions.customCondition); // Avalia a condição
				return !!result; // Garante que o resultado seja um valor booleano
			} catch (error) {
				console.error("Erro ao avaliar a condição personalizada:", page.conditions.customCondition, error);
				return false; // Retorna `false` para evitar travar o jogo
			}
		}

		// Todas as condições foram atendidas
		return true;
	};

	
	/**
	 * Save groups data to persist through game sessions
	 */
	const _DataManager_makeSaveContents = DataManager.makeSaveContents;
	DataManager.makeSaveContents = function() {
		const contents = _DataManager_makeSaveContents.call(this);
		contents.groups = window.groups; // Salvar os grupos
		contents.currentGroupIndex = window.currentGroupIndex; // Salvar o índice do grupo atual
		return contents;
	};
	
	/**
	 * Overload load data to get groups data
	 */
	const _DataManager_extractSaveContents = DataManager.extractSaveContents;
	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this);
		window.groups = contents.groups || groups;
		window.wantToChangeToGroupIndex = contents.currentGroupIndex || -1;
	};
	
	// Plugin commands ----------------------------------------
	
	/**
	 * Plugin command to switch groups
	 */
	PluginManager.registerCommand(pluginName, "SwitchGroup", args => {
		const groupIndex = Number(args.groupIndex) - 1;
		if (!isNaN(groupIndex) && groups[groupIndex]) {
			switchGroup(groupIndex);
		} else {
			console.error(`Grupo inválido: ${groupIndex}`);
		}
	});
	
	PluginManager.registerCommand(pluginName, "SetGroupDiscovered", args => {
        const groupId = Number(args.groupId);
        const discovered = args.discovered === "true";
        const group = groups[groupId];
        if (group) {
            group.discovered = discovered;
            group.canSwap = discovered && group.canSwap; // Ensure "canSwap" is only true if "discovered" is true.
			if (discovered) {
				createEventForGroup(group);
			}
            console.log(`Group ${groupId} discovered status set to: ${discovered}`);
        } else {
            console.error(`Group ${groupId} not found.`);
        }
    });

    PluginManager.registerCommand(pluginName, "SetGroupCanSwap", args => {
        const groupId = Number(args.groupId);
        const canSwap = args.canSwap === "true";
        const group = groups[groupId];
        if (group) {
            group.canSwap = canSwap;
			createEventForGroup(group);
            console.log(`Group ${groupId} canSwap status set to: ${canSwap}`);
        } else {
            console.error(`Group ${groupId} not found.`);
        }
    });

    PluginManager.registerCommand(pluginName, "ModifyGroupActor", args => {
        const groupId = Number(args.groupId);
        const actorId = Number(args.actorId);
        const action = args.action;
        const group = groups[groupId];
        if (group) {
            if (action === "add" && !group.actors.includes(actorId)) {
                group.actors.push(actorId);
                console.log(`Actor ${actorId} added to group ${groupId}.`);
				createEventForGroup(group);
            } else if (action === "remove" && group.actors.includes(actorId)) {
                group.actors = group.actors.filter(id => id !== actorId);
                console.log(`Actor ${actorId} removed from group ${groupId}.`);
				createEventForGroup(group);
            } else {
                console.warn(`Action "${action}" on actor ${actorId} for group ${groupId} could not be completed.`);
            }
        } else {
            console.error(`Group ${groupId} not found.`);
        }
    });
	
	PluginManager.registerCommand(pluginName, "ModifyGroupItem", args => {
        const groupId = Number(args.groupId);
        const itemType = args.itemType;
        const itemId = Number(args.itemId);
        const amount = Number(args.amount);
        const group = groups[groupId];
        if (group) {
            let inventory;
            if (itemType === "item") {
                inventory = group.inventory.items;
            } else if (itemType === "weapon") {
                inventory = group.inventory.weapons;
            } else if (itemType === "armor") {
                inventory = group.inventory.armors;
            } else {
                console.error(`Invalid item type: ${itemType}`);
                return;
            }
            inventory[itemId] = (inventory[itemId] || 0) + amount;
            if (inventory[itemId] <= 0) delete inventory[itemId]; // Remove item if quantity is zero or less.
            console.log(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} ${itemId} quantity changed by ${amount} for group ${groupId}.`);
        } else {
            console.error(`Group ${groupId} not found.`);
        }
    });

    PluginManager.registerCommand(pluginName, "TransportGroup", args => {
        const groupId = Number(args.groupId);
        const mapId = Number(args.mapId);
        const x = Number(args.x);
        const y = Number(args.y);
        const group = groups[groupId];
        if (group) {
            group.mapId = mapId;
            group.x = x;
            group.y = y;
            console.log(`Group ${groupId} transported to Map ${mapId}, X: ${x}, Y: ${y}.`);
			createEventForGroup(group);
        } else {
            console.error(`Group ${groupId} not found.`);
        }
    });

    PluginManager.registerCommand(pluginName, "InitializeGroups", initializeGroups);
})();
