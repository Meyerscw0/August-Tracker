document.addEventListener('DOMContentLoaded', () => {
    // =================================================================
    // --- AUGUST'S STATS (FROM CHARACTER SHEET) ---
    // =================================================================
    const character = {
        level: 6,
        maxHp: 72, // [cite: 25]
        abilityScores: {
            str: 19, // [cite: 14]
            dex: 14, // [cite: 27]
            con: 17, // [cite: 40]
        },
        // Equipment & Features affecting stats
        armor: { base: 14, type: 'medium' }, // Breastplate 
        miscAcBonus: 1,                      // Cloak of Protection 
        fightingStyle: 'defense',            // +1 AC from Defense Style 
        magicWeaponBonus: 1,                 // +1 Masterwork Longsword 
        rageDamageBonus: 2,                  // [cite: 148]
    };
    // =================================================================

    // --- STATE VARIABLES ---
    let state = {
        isRaging: false,
        isShieldEquipped: true, // Start with shield equipped as default
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
    
    const attackBonusEl = document.getElementById('attack-bonus');
    const damageDiceEl = document.getElementById('damage-dice');
    const damageModEl = document.getElementById('damage-mod');
    const beastModEls = document.querySelectorAll('.beast-mod');
    
    const shortRestBtn = document.getElementById('short-rest-btn');
    const longRestBtn = document.getElementById('long-rest-btn');

    // --- CORE CALCULATION & DISPLAY FUNCTION ---
    function updateCharacterDisplay() {
        // AC Calculation (Medium Armor)
        let dexBonusForAc = Math.min(derived.dexMod, 2); // Medium armor max dex is +2
        let currentAc = character.armor.base + dexBonusForAc + character.miscAcBonus;
        if (character.fightingStyle === 'defense') {
            currentAc += 1; // Defense fighting style bonus 
        }
        if (state.isShieldEquipped) {
            currentAc += 2; // Shield bonus 
        }
        acEl.textContent = currentAc; // Total should be 20 with shield, 18 without

        // Attack Calculation
        const attackBonus = derived.strMod + derived.profBonus + character.magicWeaponBonus;
        attackBonusEl.textContent = `+${attackBonus}`;

        // Damage Calculation
        let damageModifier = derived.strMod + character.magicWeaponBonus;
        if (state.isRaging) {
            damageModifier += character.rageDamageBonus;
        }
        damageModEl.textContent = damageModifier >= 0 ? `+${damageModifier}` : damageModifier;
        beastModEls.forEach(el => el.textContent = damageModifier >= 0 ? `+${damageModifier}` : damageModifier);
        
        // Weapon Dice (Versatile)
        damageDiceEl.textContent = state.isShieldEquipped ? '1d8' : '1d10'; // [cite: 77]

        // Update UI states
        body.classList.toggle('raging', state.isRaging);
        shieldBtn.classList.toggle('active', state.isShieldEquipped);
        shieldBtn.textContent = state.isShieldEquipped ? 'Unequip Shield' : 'Equip Shield';
        rageBtn.textContent = state.isRaging ? 'END RAGE' : 'RAGE';
        rageUsesEl.textContent = state.currentRages;
        echoUsesEl.textContent = state.currentEchoUses;
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
        state.currentRages = 3; // [cite: 148]
        state.currentEchoUses = derived.conMod; // Based on CON 17 (+3) [cite: 40, 151]
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
