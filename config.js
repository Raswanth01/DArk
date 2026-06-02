// =========================================================================
// --- DArk: ECHO SECTOR - MASTER SYSTEM STATE DATABASE ---
// =========================================================================

const THEME = {
    colors: {
        voidBackground: "#05050b",       
        radarFloor:     "#1a2636",       
        gridLine:       "rgba(0, 255, 200, 0.01)", 
        wallNormal:     "#121224",       
        wallOutline:    "#5fecff",       
        playerAvatar:   "#00ffcc",       
        playerShield:   "#00ffff",       
        playerInvis:    "rgba(0, 255, 200, 0.2)", 
        textLight:      "#ffffff",
        textAlert:      "#ff3333",       
        currencyGold:   "#ffcc00",       
        shopBg:         "rgba(6, 6, 18, 0.98)" 
    },
    fonts: {
        hudText:      "14px monospace",
        overlayTitle: "40px monospace",
        overlaySub:   "16px monospace",
        shopItem:     "18px monospace"
    }
};
const sounds = {

    // Gameplay
    bgm: new Audio("audio/bgm.wav"), //
    lockdownMusic: new Audio("audio/lockdown.wav"), //

    // End screens
    victoryMusic: new Audio("audio/victory.wav "), //
    deathMusic: new Audio("audio/death.wav"), //

    // Combat
    playerShoot: new Audio("audio/laser_shot.wav"), //
    enemyShoot: new Audio("audio/enemy_laser.wav"), //

    crateHit: new Audio("audio/crate_hit.wav"), //


    alert: new Audio("audio/alert.wav"),
    enemyDown: new Audio("audio/enemy_down.wav"), //
    explosion: new Audio("audio/explosion.wav"), //
    enemyHit: new Audio("audio/enemy_hit.wav"), //

    // Doors
    doorOpen: new Audio("audio/door_open.mp3"), //

    clang: new Audio("audio/door_slam.wav"), //

    // Items
    pickup: new Audio("audio/pickup.wav"), //

 

    // Cloak
    cloakOn: new Audio("audio/cloak_on.wav"), //

    // Shield
    shieldHit: new Audio("audio/shield_hit.wav"), //

    // Player
    playerHit: new Audio("audio/player_hit.wav") //
    
};


sounds.bgm.loop = true;
sounds.lockdownMusic.loop = true;
sounds.victoryMusic.loop = false; 
sounds.deathMusic.loop = false;

sounds.bgm.volume = 0.3;
sounds.lockdownMusic.volume = 0.4;
sounds.victoryMusic.volume = 0.4;
sounds.deathMusic.volume = 0.4;
sounds.crateHit.volume = 0.1;
sounds.doorOpen.volume = 0.5;
sounds.lockdownMusic.volume = 0.6;
sounds.playerShoot.volume = 0.4;
sounds.alert.volume = 0.2;

function playSound(sound) {

    if (!sound) return;

    let s = sound.cloneNode();

    s.volume = sound.volume;

    s.currentTime = 0;

    s.play();
}

const ENEMY_TYPES = {

    PATROL: {
        type: "PATROL",
        hp: 4,
        speed: 2,
        color: "#ffcc00",
        radius: 12,

        creditDrop: 10,
        stopDistance: 80,
        fireRate: 60,
        damage: 10
    },

    SNIPER: {
        type: "SNIPER",
        hp: 3,
        speed: 0,
        color: "#ff00ff",
        radius: 11,

        creditDrop: 25,
        stopDistance: 300,
        fireRate: 120,
        damage: 20
    },

    DASH: {
        type: "DASH",
        hp: 6,
        speed: 2.5,
        color: "#ff6600",
        radius: 13,

        creditDrop: 20,
        stopDistance: 40,
        fireRate: 45,
        damage: 10
    },

    CLOAKED: {
        type: "CLOAKED",
        hp: 4,
        speed: 2.2,
        color: "#444455",
        radius: 12,

        creditDrop: 35,
        stopDistance: 80,
        fireRate: 90,
        damage: 15
    },

    EXPLOSIVE: {
        type: "EXPLOSIVE",
        hp: 1,
        speed: 4,
        color: "#cc0000",
        radius: 10,

        creditDrop: 15,
        stopDistance: 0,
        fireRate: 999999,
        damage: 40
    }
};



// Global baseline variables (declared using standard var/let for explicit scope linking)
var roomIDs = [];
var wallSegments = [];
var doors = [];
var bullets = [];
var previousPlayerRoomID = 0;
var enemies = [];
var items = [];        
var roomGrid = [];   
var obstacles = []; 
var activeLockdowns = {};
var flashlightEnabled = true;


var currentLayer = 1; 
var pendingLayer = null;
var keycards = {
    BLUE: false,
    RED: false,
    GREEN: false
};
var doorsLocked = false;
var score = 0;
var credits = 0;
var gameTimer = 0;
var frameCount = 0;
var gameStatus = "PLAYING";
let offsetX = 0;
let offsetY = 0;
let worldScale = 1;
var playerX = 0;
var playerY = 0;
var playerAngle = 0;
var playerBaseSpeed = 4.2; 
var playerRadius = 12; 
var playerHealth = 100;
var maxHealth = 100;
var bulletSpeed = 10; 

var upgrades = { damageMultiplier: 1.0, maxBounces: 4, alternateFire: false };
var powerups = { invisibilityTimer: 0,cloakCharges: 0, shieldHealth: 0, maxShieldHealth: 100};

const TILE_SIZE = 36; 
var keys = { w: false, a: false, s: false, d: false, shift: false };
var mouse = { x: 0, y: 0 };

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();