// assets 
var csvSrc = "csv/atlas.csv";
var atlasSrc = "images/atlas.png";

// game size
var width = 288;
var height = 512;

// physics
var xVel = -4;
var gravity = 1.5;
var jumpVel = -14;
var maxFallVel = 15;

// bird
var birdX = 69;
var birdStartY = 236;
var birdWidth = 25;
var birdHeight = 15;
var birdRenderOffsetX = -11;
var birdRenderOffsetY = -18;

// bird animation
var sineWaveA = 15;
var sineWaveT = 45;
var swingT = 5;

// pipe
var pipeWidth = 48;
var pipeHeight = 320;
var pipeSpacing = 172;
var pipeGap = 100;
var pipeStartX = 360;
var pipeRandomBoundary = 80;

// land
var landStartX = 0;
var landWidth = 288;
var landY = 400;

// ql
var qlAlpha = 0.6;
var qlGamma = 0.8;
var qlResolution = 12;
var qlAliveReward = 1;
var qlDeadReward = -100;
var qlEpsilon = 0;
var qlExploreJumpRate = 0.1;

// init fps
var inverseDefaultFPS = 1000 / 40;
var fpsRefreshInterval = 800;

// Public Date object
const DATE = new Date();

// dead animation
var deadFlashFrame = 5;

// play ui
var playingScoreMidX = 144;
var playingScoreY = 41;
var playingScoreSpacing = 22;

// game over ui
var gameOverTextX = 40;
var gameOverTextY = 123;
var gameOverPanelX = 24;
var gameOverPanelY = 195;
var panelScoreRightX = 218;
var panelScoreY = 231;
var panelMaxScoreY = 272;
var panelScoreSpacing = 16;
var medalX = 55;
var medalY = 240;

// ready ui
var tutorialX = 88;
var tutorialY = 218;
var readyTextX = 46;
var readyTextY = 146;