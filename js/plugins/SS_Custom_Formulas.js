//=============================================================================
// RPG Maker MZ - Custom Formulas
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Allows defining multiple named damage formulas as an array.
 * @author Squall_seawave
 * @version 1.1
 * @help
 * Each entry contains:
 * name:   The function name
 * params: Parameter list separated by commas
 * code:   JavaScript code to run
 * @param formulas
 * @text Formula List
 * @type struct<Formula>[]
 * @default []
 */


/*~struct~Formula:
*
* @param name
* @text Formula Name
* @desc The name used in the skill formula, e.g. attack → formula.attack(a,b)
* @type string

* @param parameters
* @text Parameters
* @desc the parameters of the function
* @type string[]
* @default []

* @param code
* @text JS Code
* @desc The JavaScript code executed with (a,b). Do NOT write function().
* @type note
* @default "return 0"
*/

(() => {
 
    const params = PluginManager.parameters("SS_Custom_Formulas");

    // Parse the array of {name, code}
    const rawList = JSON.parse(params["formulas"] || "[]");

    // Global object to hold functions
    window.formula = {};

    function preprocessCode(code) {
        // Remove quotes from <note>
        code = JSON.parse(code);
        // Replace V[n] with $gameVariables.value(n)
        code = code.replace(/\bV\[(\d+)\]/g, (_, id) => {
            return `$gameVariables.value(${id})`;
        });

        // Replace S[n] with $gameSwitches.value(n)
        code = code.replace(/\bS\[(\d+)\]/g, (_, id) => {
            return `$gameSwitches.value(${id})`;
        });

        // Items: I[5] → $dataItems[5]
        code = code.replace(/\bI\[(\d+)\]/g, (_, id) =>
            `$dataItems[${id}]`
        );

        // Weapons: W[2] → $dataWeapons[2]
        code = code.replace(/\bW\[(\d+)\]/g, (_, id) =>
            `$dataWeapons[${id}]`
        );

        // Armors: A[4] → $dataArmors[4]
        code = code.replace(/\bA\[(\d+)\]/g, (_, id) =>
            `$dataArmors[${id}]`
        );

        // SET VARIABLES: SV[n] = x
        code = code.replace(/\bSV\[(\d+)\]\s*=\s*([^;]+)/g,
            (_, id, val) => `$gameVariables.setValue(${id}, (${val}))`
        );

        // SET SWITCHES: SS[n] = true/false
        code = code.replace(/\bSS\[(\d+)\]\s*=\s*([^;]+)/g,
            (_, id, val) => `$gameSwitches.setValue(${id}, (${val}))`
        );

        // GET ACTOR BY ID: AID[3] → $gameActors.actor(3)
        code = code.replace(/\bAID\[(\d+)\]/g, (_, id) =>
            `$gameActors.actor(${id})`
        );

        return code;
    }
    
    // -------------------------------------------------------------
    //  GLOBAL MATH HELPERS (available inside formulas)
    // -------------------------------------------------------------
    const helpers = {
        clamp(x, min, max) { return Math.max(min, Math.min(max, x)); },
        rand(n) { return Math.random() * n; },
        randi(n) { return Math.floor(Math.random() * (n + 1)); },
        crit(x, rate) { return Math.random() < rate ? x * 2 : x; },
        percent(x, p) { return x * (p / 100); },
    };

    // Make helpers global inside eval scope
    Object.assign(window, helpers);

    for (const entry of rawList) {
        const obj = JSON.parse(entry);

        // Extract name & JS code
        const name = obj.name;
        let code = preprocessCode(obj.code);

        // Make sure params exists
        const paramList = obj.params ? obj.params.join(",") : "";

        // Create a function: new Function("a, b, c", "code inside")
        window[name] = new Function(paramList, code);
      
    }
 
})();