document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // --- AUGUST'S STATS (FROM CHARACTER SHEET) ---
    // =================================================================
    const character = {
        level: 6,
        maxHp: 72,
        abilityScores: {
            str: 19,
            dex: 14,
            con: 17,
        },
        // Equipment & Features affecting stats
        armor: { base: 14, type: 'medium' }, // Breastplate
        miscAcBonus: 1,                      // Cloak of Protection
        fightingStyle: 'defense',            // +1 AC from Defense Style
        magicWeaponBonus: 1,                 // +1 Masterwork Longsword
        rageDamageBonus: 2,
        rageAttackBonus: 2,                  // HOUSE RULE: +2 to hit while raging
    };
    // =================================================================

    // --- STATE VARIABLES ---
    let state = {
        isRaging: false,
        isShieldEquipped: true,
        currentHp: 0,
        currentRages: 0,
        currentEchoUses: 0,
    };

    // --- DERIVED STATS (Calculated automatically) ---
    const derived = {
        profBonus: 0,
        strMod: 0,
        dexMod: 0,
        conMod: 0,
    };

    // --- ELEMENT REFERENCES ---
    const body = document.body;
    const currentHpEl = document.getElementById('current-hp');
    const maxHpEl = document.getElementById('max-hp');
    const acEl = document.getElementById('armor-class');
    const profBonusEl = document.getElementById('prof-bonus');
    
    const rageUsesEl = document.getElementById('rage-uses');
    const maxRagesEl = document.getElementById('max-rages');
    const echoUsesEl = document.getElementById('echo-uses');
    const maxEchoUsesEl = document.getElementById('max-echo-uses');
    
    const rageBtn = document.getElementById('rage-btn');
    const shieldBtn = document.getElementById('shield-btn');
    const secondWindBtn = document.getElementById('second-wind-btn');
    const actionSurgeBtn = document.getElementById('action-surge-btn');
    const unleashBtn = document.getElementById('unleash-btn');
    const shieldReminderEl = document.getElementById('shield-reminder');
    
    // Attack Spans
    const attackBonusEl = document.getElementById('attack-bonus');
    const damageDiceEl = document.getElementById('damage-dice');
    const damageModEl = document.getElementById('damage-mod');
    const crossbowAttackBonusEl = document.getElementById('crossbow-attack-bonus');
    const crossbowDamageModEl = document.getElementById('crossbow-damage-mod');
    const beastAttackBonusEls = document.querySelectorAll('.beast-attack-bonus');
    const beastDamageModEls = document.querySelectorAll('.beast-damage-mod');
    
    const shortRestBtn = document.getElementById('short-rest-btn');
    const longRestBtn = document.getElementById('long-rest-btn');

    // --- CORE CALCULATION & DISPLAY FUNCTION ---
    function updateCharacterDisplay() {
        // AC Calculation
        let dexBonusForAc = Math.min(derived.dexMod, 2);
        let currentAc = character.armor.base + dexBonusForAc + character.miscAcBonus;
        if (character.fightingStyle === 'defense') { currentAc += 1; }
        if (state.isShieldEquipped) { currentAc += 2; }
        acEl.textContent = currentAc;

        // Longsword Calculation
        let longswordAttackBonus = derived.strMod + derived.profBonus + character.magicWeaponBonus;
        let longswordDamageMod = derived.strMod + character.magicWeaponBonus;
        if (state.isRaging) {
            longswordAttackBonus += character.rageAttackBonus;
            longswordDamageMod += character.rageDamageBonus;
        }
        attackBonusEl.textContent = `+${longswordAttackBonus}`;
        damageModEl.textContent = longswordDamageMod >= 0 ? `+${longswordDamageMod}` : longswordDamageMod;
        damageDiceEl.textContent = state.isShieldEquipped ? '1d8' : '1d10';

        // Crossbow Calculation (Unaffected by Rage/Stance)
        const crossbowAttackBonus = derived.dexMod + derived.profBonus;
        const crossbowDamageMod = derived.dexMod;
        crossbowAttackBonusEl.textContent = `+${crossbowAttackBonus}`;
        crossbowDamageModEl.textContent = crossbowDamageMod >= 0 ? `+${crossbowDamageMod}` : crossbowDamageMod;

        // Beast Weapons Calculation
        const beastAttackBonus = derived.strMod + derived.profBonus; // Base is +7
        let beastDamageMod = derived.strMod; // Base is +4
        if (state.isRaging) {
            beastDamageMod += character.rageDamageBonus; // Raging becomes +6
        }
        beastAttackBonusEls.forEach(el => el.textContent = `+${beastAttackBonus}`);
        beastDamageModEls.forEach(el => el.textContent = beastDamageMod >= 0 ? `+${beastDamageMod}` : beastDamageMod);
        
        // Update UI states
        body.classList.toggle('raging', state.isRaging);
        shieldBtn.classList.toggle('active', state.isShieldEquipped);
        shieldBtn.textContent = state.isShieldEquipped ? 'Unequip Shield' : 'Equip Shield';
        rageBtn.textContent = state.isRaging ? 'END RAGE' : 'RAGE';
        rageUsesEl.textContent = state.currentRages;
        echoUsesEl.textContent = state.currentEchoUses;
        shieldReminderEl.classList.toggle('hidden', !state.isShieldEquipped);
    }
    
    // --- EVENT LISTENERS ---
    rageBtn.addEventListener('click', () => {
        if (state.isRaging) {
            state.isRaging = false;
        } else if (state.currentRages > 0) {
            state.isRaging = true;
            state.currentRages--;
        } else {
            alert("No rages left!");
        }
        updateCharacterDisplay();
    });

    shieldBtn.addEventListener('click', () => {
        state.isShieldEquipped = !state.isShieldEquipped;
        updateCharacterDisplay();
    });
    
    unleashBtn.addEventListener('click', () => {
        if (state.currentEchoUses > 0) {
            state.currentEchoUses--;
            updateCharacterDisplay();
        } else {
            alert("No uses of Unleash Incarnation left!");
        }
    });

    secondWindBtn.addEventListener('click', () => {
        if (!secondWindBtn.classList.contains('used')) {
            secondWindBtn.classList.add('used');
            secondWindBtn.textContent = 'USED';
        }
    });

    actionSurgeBtn.addEventListener('click', () => {
        if (!actionSurgeBtn.classList.contains('used')) {
            actionSurgeBtn.classList.add('used');
            actionSurgeBtn.textContent = 'USED';
        }
    });

    shortRestBtn.addEventListener('click', () => {
        alert("Short Rest! Action Surge and Second Wind are restored.");
        secondWindBtn.classList.remove('used');
        secondWindBtn.textContent = 'USE';
        actionSurgeBtn.classList.remove('used');
        actionSurgeBtn.textContent = 'USE';
    });

    longRestBtn.addEventListener('click', () => {
        alert("Long Rest! All resources have been restored.");
        initialize();
    });

    // --- INITIALIZATION FUNCTION ---
    function initialize() {
        // Calculate derived stats
        derived.profBonus = Math.ceil(1 + (character.level / 4));
        derived.strMod = Math.floor((character.abilityScores.str - 10) / 2);
        derived.dexMod = Math.floor((character.abilityScores.dex - 10) / 2);
        derived.conMod = Math.floor((character.abilityScores.con - 10) / 2);
        
        // Reset state
        state.currentHp = character.maxHp;
        state.currentRages = 3;
        state.currentEchoUses = derived.conMod;
        state.isRaging = false;

        // Reset short rest abilities
        secondWindBtn.classList.remove('used');
        secondWindBtn.textContent = 'USE';
        actionSurgeBtn.classList.remove('used');
        actionSurgeBtn.textContent = 'USE';
        
        // Update static display elements
        currentHpEl.value = character.maxHp;
        maxHpEl.textContent = character.maxHp;
        profBonusEl.textContent = derived.profBonus;
        maxRagesEl.textContent = state.currentRages;
        maxEchoUsesEl.textContent = state.currentEchoUses;

        // Run the main display function to set everything correctly
        updateCharacterDisplay();
    }

    // --- RUN INITIALIZATION ON PAGE LOAD ---
    initialize();
});
