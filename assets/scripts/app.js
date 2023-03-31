// global values that are hardcoded and will be used across all application
// thus these can be named with capital letters and underscore
const ATTACK_VALUE = 10;
const STRONG_ATTACK_VALUE = 17;
const MONSTER_ATTACK_VALUE = 14;
const HEAL_VALUE = 20;
let STAMINA = 2;

const MODE_ATTACK = 'ATTACK'; // MODE_ATTACK = 0
const MODE_STRONG_ATTACK = 'STRONG_ATTACK'; // MODE_ATTACK = 1
const MODE_HEAL = 'HEAL'; // MODE_HEAL = 2
const MODE_LOG = 'LOG'; // MODE_LOG = 3

const LOG_EVENT_PLAYER_ATTACK = 'PLAYER_ATTACK';
const LOG_EVENT_PLAYER_STRONG_ATTACK = 'PLAYER_STRONG_ATTACK';
const LOG_EVENT_PLAYER_HEAL = 'PLAYER_HEAL';
const LOG_EVENT_LOG = 'PLAYER_LOG';
const LOG_EVENT_MONSTER_ATTACK = 'MONSTER_ATTACK';
const LOG_EVENT_GAME_OVER = 'GAME_OVER';
const LOG_EVENT_PLAYER_OUT_OF_STAMINA = 'OUT_OF_STAMINA';

const enteredValue = prompt('Set max health for player and monster', '100');

let chosenMaxLife = parseInt(enteredValue);
let battleLog = [];

if (isNaN(chosenMaxLife) || chosenMaxLife <= 0) {
    chosenMaxLife = 100;
    alert(`Entered value is not a correct number, we have set it to default ${chosenMaxLife}.`);
}

let currentMonsterHealth = chosenMaxLife;
let currentPlayerHealth = chosenMaxLife;
let hasBonusLife = true;

adjustHealthBars(chosenMaxLife);

function writeToLog(event, value, monsterHealth, playerHealth) {
    let logEntry = {
        event: event,
        value: value,
        finalMonsterHealth: monsterHealth,
        finalPlayerHealth: playerHealth
    }
    // filling the log with SWITCH statements
    switch(event) {
        case LOG_EVENT_PLAYER_ATTACK:
            logEntry.target = 'MONSTER';
            // as switch-case is using fall-through mechanism, break is being used as only one case should be executed
            break;
        case LOG_EVENT_PLAYER_STRONG_ATTACK:
            logEntry.target = 'MONSTER';
            break;
        case LOG_EVENT_PLAYER_HEAL:
            logEntry.target = 'PLAYER';
            break;
        case LOG_EVENT_MONSTER_ATTACK:
            logEntry.target = 'PLAYER';
            break;
    }
    
    // alternative option using IF statements

    // if (event === LOG_EVENT_PLAYER_ATTACK) {
    //     logEntry.target = 'MONSTER';
    //     }
    // else if (event === LOG_EVENT_PLAYER_STRONG_ATTACK) {
    //     logEntry.target = 'MONSTER';
    //     }   
    // else if (event === LOG_EVENT_PLAYER_HEAL) {
    //     logEntry.target = 'PLAYER';
    //     }   
    // else if (event === LOG_EVENT_MONSTER_ATTACK) {
    //     logEntry.target = 'PLAYER';
    //     }

    battleLog.push(logEntry);
}

function reset() {
    currentMonsterHealth = chosenMaxLife;
    currentPlayerHealth = chosenMaxLife;
    resetGame(chosenMaxLife);
}

function fightResult() {
    const initialPlayerHealth = currentPlayerHealth;
    const monsterDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
    currentPlayerHealth -= monsterDamage;
    writeToLog(
        LOG_EVENT_MONSTER_ATTACK,
        monsterDamage,
        currentMonsterHealth,
        currentPlayerHealth
    )
    if (currentPlayerHealth <= 0 && hasBonusLife) {
        hasBonusLife = false;
        removeBonusLife();
        currentPlayerHealth = initialPlayerHealth;
        alert('You are lucky pal!');
        setPlayerHealth(initialPlayerHealth);
    }
    if (currentMonsterHealth <= 0 && currentPlayerHealth > 0) {
        alert  ('You won!');
        writeToLog(
            LOG_EVENT_GAME_OVER,
            'PLAYER WON',
            currentMonsterHealth,
            currentPlayerHealth
        )
    } else if (currentPlayerHealth <= 0 && currentMonsterHealth > 0) {
        alert ('You lost!');
        writeToLog(
            LOG_EVENT_GAME_OVER,
            'MONSTER WON',
            currentMonsterHealth,
            currentPlayerHealth
        )
    } else if (currentMonsterHealth <= 0 && currentPlayerHealth <= 0) {
        alert ('It is a draw!');
        writeToLog(
            LOG_EVENT_GAME_OVER,
            'DRAW',
            currentMonsterHealth,
            currentPlayerHealth
        )
    }
    if (currentMonsterHealth <= 0 || currentPlayerHealth <= 0) {
        alert('Game will now restart!')
        reset();
    }
}

function attackMonster(mode) {
    
    // FIRST OPTION - assigning damange value using classic IF statement
    let maxDamage;
    let logEvent;
    if (mode === MODE_ATTACK) {
        maxDamage = ATTACK_VALUE;
        logEvent = LOG_EVENT_PLAYER_ATTACK;
    } else if (mode === MODE_STRONG_ATTACK) {
        if (STAMINA > 0) {
            maxDamage = STRONG_ATTACK_VALUE;
            logEvent = LOG_EVENT_PLAYER_STRONG_ATTACK;
            STAMINA--;
        } else if (STAMINA <= 0) {
            alert('You tried to make a strong attack but you are out of stamina. Monster laught and hit you hard!');
            maxDamage = 0;
            logEvent = LOG_EVENT_PLAYER_OUT_OF_STAMINA;
        }
    }

    // SECOND OPTION - assigning damage value using TERNARY OPERATOR
    // const maxDamage =
    //     mode === MODE_ATTACK
    //     ? ATTACK_VALUE
    //     : STRONG_ATTACK_VALUE;
    // const logEvent =
    //     mode === MODE_ATTACK
    //     ? LOG_EVENT_PLAYER_ATTACK
    //     : LOG_EVENT_PLAYER_STRONG_ATTACK;

    const playerDamage = dealMonsterDamage(maxDamage);
    currentMonsterHealth -= playerDamage;
    writeToLog(
        logEvent,
        playerDamage,
        currentMonsterHealth,
        currentPlayerHealth
    )
    fightResult();
}

function attackHandler() {
    attackMonster(MODE_ATTACK);    
}

function strongAttackHandler() {
    attackMonster(MODE_STRONG_ATTACK); 
}

function healHandler() {
    let healValue;
    if (currentPlayerHealth >= chosenMaxLife - HEAL_VALUE) {
        healValue = chosenMaxLife - currentPlayerHealth;
        const approxHealValue = healValue.toFixed(0);
        alert(` Healed for ${approxHealValue}, as you can not heal above ${chosenMaxLife} health.`);
        currentPlayerHealth += healValue;
        increasePlayerHealth(healValue);
        writeToLog(
            LOG_EVENT_PLAYER_HEAL,
            healValue, 
            currentMonsterHealth,
            currentPlayerHealth
        )
    } else {
        healValue = HEAL_VALUE;
        currentPlayerHealth += healValue;
        writeToLog(
            LOG_EVENT_PLAYER_HEAL,
            healValue,
            currentMonsterHealth,
            currentPlayerHealth
        )
    }
    const monsterDamage = dealPlayerDamage(MONSTER_ATTACK_VALUE);
    currentPlayerHealth -= monsterDamage;
    increasePlayerHealth(healValue);
    
    writeToLog(
        LOG_EVENT_MONSTER_ATTACK,
        monsterDamage,
        currentMonsterHealth,
        currentPlayerHealth
    )
}

function printLogHandler() {

    // using for-in loop to save key-values pairs into the log
    let i = 0;
    for (const logEntry of battleLog) {
        console.log(`#${i}`);
        for (const key in logEntry) {
            console.log(`${key} => ${logEntry[key]}`);
        }
        i++;
    }

    // this could be done with for-of loop as well
    // let i = 0;
    // for (const logEntry of battleLog) {
    //     console.log(logEntry);
    //     console.log(i);
    //     i++;
    // }

    // this could be done as well with classic for loop as shown below
    // for (let i = 0; i < battleLog.length; i++) {
    //     console.log(battleLog[i]);
    //     console.log(i);
    // }
}

attackBtn.addEventListener('click', attackHandler);
strongAttackBtn.addEventListener('click', strongAttackHandler);
healBtn.addEventListener('click', healHandler);
logBtn.addEventListener('click', printLogHandler);