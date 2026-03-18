
//board
let board;
let boardWidth=500;
let boardHeight=640;
let context;

//background
let bgImg;
let bgX=0;
let bgX2=500;

let oasisBg;
let desertBg;
let oasisTopPipe;
let oasisBottomPipe;
let desertTopPipe;
let desertBottomPipe;

let currentTheme="oasis";

//bird
let birdWidth=34;
let birdHeight=24;
let birdX=boardWidth/8;
let birdY=boardHeight/2;

let birdImg1;
let birdImg2;
let birdImg3;
let birdImg4;
let birdFrames=[];
let currentFrame=0;
let frameCount=0;

let bird={
    x:birdX,
    y:birdY,
    width:birdWidth,
    height:birdHeight
}

let pipeArray=[];
let pipeWidth=64;
let pipeHeight=512;
let pipeX=boardWidth;
let pipeY=0;
let topPipeImg;
let bottomPipeImg;


//physics
let velocityX=-2;
let velocityY=0;
let gravity=0.1;
let baseVelocityX=-2;

let gameOver=false;
let gameStarted=false;
let gameReady=false;
let gamePaused=false;
let score=0;

let highScore=localStorage.getItem('flappyBirdHighScore') || 0;
let isNewHighScore=false;

let hitSoundPlayed=false;
let dieSoundPlayed=false;


let difficulty="medium";
let pipeGap=boardHeight/4;

let pipeSpawnMs=1500;
let coinSpawnMs=2000;
let powerupSpawnMs=3000;

let speedMultiplier=1;

let lastCoinSound=0;


const POWERUP_DURATION_MS=5000;
const POWERUP_MESSAGE_MS=1000;
const INVULNERABLE_MS=250;

const MAGNET_RANGE_PX=250;
const MAGNET_PULL=0.20;

let jumpSound=new Audio();
let scoreSound=new Audio();
let hitSound=new Audio();
let bgMusic=new Audio();
let dieSound=new Audio();
let coinSound=new Audio();
let powerupSound=new Audio();

let musicEnabled=true;
let sfxEnabled=true;
let musicVolume=0.3;
let sfxVolume=0.5;


let lastMileStone=0;
let showMilestoneMessage=false;
let milestoneMessageTimer=0;

let bgColor='#70c5ce';

let coinArray=[];
let coinWidth=30;
let coinHeight=30;
let totalCoins=0;
let sessionCoins=0;

let powerupArray=[]
let powerupWidth=40;
let powerupHeight=40;

let hasShield=false;
let hasSlowMotion=false;
let hasDoublePoints=false;
let hasMagnet=false;

let shieldRemainingMs=0
let slowMotionRemainingMs=0;
let doublePointsRemainingMs=0;
let magnetRemainingMs=0;

let lastUpdateMs=0;

let shieldRotation=0;
let animationStarted=false;

let invulnerableFrames=0;

let lastPipeSpawn=0;
let lastCoinSpawn=0;
let lastPowerupSpawn=0;

// let pipeInterval=null;
// let coinInterval=null;
// let powerupInterval=null;

let lastGapTop=140;
let lastGapBottom=500;

let powerupMessage=""
let powerupMessageTimer=0;

let inLobby=true;

const TWO_PI=Math.PI*2;
const coinRadius=coinWidth/2;
const MOBILE_SPEED_MULT=3;

let isTouchDevice=false;
let pauseIconHitbox={x:0,y:0,w:0,h:0};

const FLAP_SPEED_LOBBY=8;
const FLAP_SPEED_GAME=10;

const LOBBY_BOB_SPEED=0.05;
const LOBBY_BOB_AMPLITUDE=10;

let lobbyBaseBirdX=birdX;
let lobbyBaseBirdY=birdY;
let lobbyTime=0;

function detectTouchDevice(){
    return ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints>0 ));
}

function getCanvasPointFromClient(clientX,clientY){
    const rect=board.getBoundingClientRect();
    const scaleX=boardWidth/rect.width;
    const scaleY=boardHeight/rect.height;
    return {
        x:(clientX-rect.left)*scaleX,
        y:(clientY-rect.top)*scaleY
    };
}

function isAnyPopupOpen(){
    return (domCache.settingsPopup && domCache.settingsPopup.style.display === 'flex') ||
    (domCache.historyPopup && domCache.historyPopup.style.display ==='flex')||
    (domCache.soundPopup && domCache.soundPopup.style.display==='flex')||
    (domCache.gameOverPopup && domCache.gameOverPopup.style.display==='block');
}

function handleCanvasPointerDown(e){
    if(!isTouchDevice) return;
    if(isAnyPopupOpen()) return;
    if(!gameStarted) return;

    const pt=getCanvasPointFromClient(e.clientX,e.clientY);

    const hb=pauseIconHitbox;
    const hitPause=pt.x>=hb.x && pt.x<=hb.x+hb.w &&
                    pt.y>=hb.y && pt.y<=hb.y+hb.h;

    if(hitPause){
        togglePause();
        return;
    }

    if(gameOver){
        restartGame();
        return;
    }

    if(gamePaused) return;

    if(!gameReady){
        gameReady=true;
        velocityY=0;
        domCache.instructions.style.display="none";
        resetSpawnTimersToNow();
        resetUpdateClockToNow();

        frameCount=0;
        return;
    }

    if(difficulty==="easy") velocityY=-6;
    else if(difficulty==="medium") velocityY=-7;
    else if(difficulty==="hard") velocityY=-8;

    playSound(jumpSound);
}

const MOBILE_BG_SPEED_MULT=1;
const MOBILE_SPAWN_SLOW_MULT=1.5;

let domCache={};

function cacheDOMElements(){
    domCache.startBtn=document.getElementById("startBtn");
    domCache.heading=document.getElementById("heading");
    domCache.restartBtn=document.getElementById("restartBtn");
    domCache.backToLobbyBtn=document.getElementById("backToLobbyBtn");
    domCache.settingsBtn=document.getElementById("settingsBtn");
    domCache.closeSettingsBtn=document.getElementById("closeSettingsBtn");
    domCache.historyBtn=document.getElementById("historyBtn");
    domCache.closeHistoryBtn=document.getElementById("closeHistoryBtn");
    domCache.settingsOasisBtn=document.getElementById("settingsOasisBtn");
    domCache.settingsDesertBtn=document.getElementById("settingsDesertBtn");
    domCache.settingsEasyBtn=document.getElementById("settingsEasyBtn");
    domCache.settingsMediumBtn=document.getElementById("settingsMediumBtn");
    domCache.settingsHardBtn=document.getElementById("settingsHardBtn");
    domCache.clearHistoryBtn=document.getElementById("clearHistoryBtn");
    domCache.resetAllBtn=document.getElementById("resetAllBtn");
    domCache.instructions=document.getElementById("instructions");
    domCache.settingsPopup=document.getElementById("settingsPopup");
    domCache.historyPopup=document.getElementById("historyPopup");
    domCache.historyList=document.getElementById("historyList");
    domCache.lobbyBestScore=document.getElementById("lobbyBestScore");
    domCache.lobbyTotalCoins=document.getElementById("lobbyTotalCoins");
    domCache.lobbyStats=document.querySelector(".lobby-stats");
    domCache.topRightButtons=document.querySelector(".top-right-buttons");
    domCache.powerupLegend=document.querySelector(".powerup-legend");
    domCache.gameOverPopup=document.getElementById("gameOverPopup");
    domCache.finalScore=document.getElementById("finalScore");
    domCache.coinsThisGame=document.getElementById("coinsThisGame");
    domCache.totalCoinsDisplay=document.getElementById("totalCoinsDisplay");
    domCache.highScoreMessage=document.getElementById("highScoreMessage");

    
    domCache.soundBtn= document.getElementById("soundBtn");
    domCache.soundPopup=document.getElementById("soundPopup");
    domCache.closeSoundBtn=document.getElementById("closeSoundBtn");
    domCache.musicToggle=document.getElementById("musicToggle");
    domCache.sfxToggle=document.getElementById("sfxToggle");
    domCache.musicVolumeSlider=document.getElementById("musicVolume");
    domCache.sfxVolumeSlider=document.getElementById("sfxVolume");
    domCache.musicVolumeValue=document.getElementById("musicVolumeValue");
    domCache.sfxVolumeValue=document.getElementById("sfxVolumeValue");
}

function nowMs(){
    return performance.now();
}

function resetSpawnTimersToNow(){
    const t=nowMs();
    lastPipeSpawn=t;
    lastCoinSpawn=t;
    lastPowerupSpawn=t;
}

function resetUpdateClockToNow(){
    lastUpdateMs=nowMs();
}

function updatePowerupRemainingTimers(t){
    if(!gameStarted || !gameReady || gameOver || gamePaused){
        lastUpdateMs=t;
        return;
    }

    const dt=t-lastUpdateMs;
    lastUpdateMs=t;

    if(dt<=0) return;

    if(shieldRemainingMs>0){
        shieldRemainingMs=Math.max(0,shieldRemainingMs-dt);
        if(shieldRemainingMs===0) hasShield=false;
    }

    if(slowMotionRemainingMs>0){
        slowMotionRemainingMs=Math.max(0,slowMotionRemainingMs-dt);
        if(slowMotionRemainingMs===0){
            hasSlowMotion=false;
            applySpeedMultiplier(1);
        }
    }
    if(doublePointsRemainingMs>0){
        doublePointsRemainingMs=Math.max(0,doublePointsRemainingMs-dt);
        if(doublePointsRemainingMs===0) hasDoublePoints=false;
    }
    if(magnetRemainingMs>0){
        magnetRemainingMs=Math.max(0,magnetRemainingMs-dt);
        if(magnetRemainingMs===0) hasMagnet=false;
    }
}

function loadSoundSettings(){
    const savedMusicEnabled=localStorage.getItem('flappyMusicEnabled');
    const savedSfxEnabled=localStorage.getItem('flappySfxEnabled');
    const savedMusicVolume=localStorage.getItem('flappyMusicVolume');
    const savedSfxVolume=localStorage.getItem('flappySfxVolume');

    if(savedMusicEnabled!==null) musicEnabled=savedMusicEnabled==="true";
    if(savedSfxEnabled!==null) sfxEnabled=savedSfxEnabled==="true";
    if(savedMusicVolume!==null) musicVolume=parseFloat(savedMusicVolume);
    if(savedSfxVolume!==null) sfxVolume=parseFloat(savedSfxVolume);

    bgMusic.volume=musicVolume;
    // sfx.volume=sfxVolume;
}

function saveSoundSettings(){
    localStorage.setItem('flappyMusicEnabled',musicEnabled);
    localStorage.setItem('flappySfxEnabled',sfxEnabled);
    localStorage.setItem('flappyMusicVolume',musicVolume);
    localStorage.setItem('flappySfxVolume',sfxVolume);
}

function updateSoundControls(){
    if(domCache.musicToggle){
        domCache.musicToggle.checked=musicEnabled;
    }
    if(domCache.sfxToggle){
        domCache.sfxToggle.checked=sfxEnabled;
    }
    if(domCache.musicVolumeSlider){
        domCache.musicVolumeSlider.value=Math.round(musicVolume*100);
    }
    if(domCache.sfxVolumeSlider){
        domCache.sfxVolumeSlider.value=Math.round(sfxVolume*100);
    }
    if(domCache.musicVolumeValue){
        domCache.musicVolumeValue.innerText=Math.round(musicVolume*100)+'%';
    }
    if(domCache.sfxVolumeValue){
        domCache.sfxVolumeValue.innerText=Math.round(sfxVolume*100)+'%';
    }
    updateSoundButtonIcon();
}

function updateSoundButtonIcon(){
    if(domCache.soundBtn){
        if(!musicEnabled && !sfxEnabled){
            domCache.soundBtn.innerText='🔇';
        }
        else if(!musicEnabled || musicVolume===0){
            domCache.soundBtn.innerText='🔈';
        }
        else{
            domCache.soundBtn.innerText='🔊';
        }
    }
}

function openSound(){
    domCache.soundPopup.style.display='flex';
    updateSoundControls();
}

function closeSound(){
    domCache.soundPopup.style.display='none';
}

function toggleMusic(){
    musicEnabled=domCache.musicToggle.checked;
    saveSoundSettings();
    updateSoundButtonIcon();

    if(!musicEnabled){
        bgMusic.pause();
    }
    else if(gameStarted && gameReady && !gameOver && !gamePaused){
        playMusic();
    }
}

function toggleSfx(){
    sfxEnabled=domCache.sfxToggle.checked;
    saveSoundSettings();
    updateSoundButtonIcon();
}

function setMusicVolume(){
    musicVolume=domCache.musicVolumeSlider.value/100;
    bgMusic.volume=musicVolume;
    domCache.musicVolumeValue.innerText=Math.round(musicVolume*100)+'%';
    saveSoundSettings();
    updateSoundButtonIcon();
}

function setSfxVolume(){
    sfxVolume=domCache.sfxVolumeSlider.value/100;
    domCache.sfxVolumeValue.innerText=Math.round(sfxVolume*100)+'%';
    saveSoundSettings();

    jumpSound.volume=sfxVolume;
    scoreSound.volume=sfxVolume;
    hitSound.volume=sfxVolume;
    dieSound.volume=sfxVolume;
    coinSound.volume=sfxVolume;
    powerupSound.volume=sfxVolume;
}

function playMusic(){
    // if(musicEnabled){
    //     bgMusic.currentTime=0;
    //     bgMusic.volume=musicVolume;
    //     bgMusic.play().catch(e=>{});
    // }

    if(musicEnabled && bgMusic.paused){
        bgMusic.volume=musicVolume;
        bgMusic.play().catch(e=>{});
    }
}

function playSound(audio){
    // if(audio===bgMusic){
    //     if(musicEnabled ){
    //         audio.currentTime=0;
    //         audio.volume=musicVolume;
    //         audio.play().catch(e=>{});
    //     }
    // }
    // else{
    //     if(sfxEnabled){
    //         audio.currentTime=0;
    //         audio.volume=sfxVolume;
    //         audio.play().catch(e=>{});
    //     }
    // }
    if(audio === bgMusic){
        playMusic();
        return;
    }

    if(!sfxEnabled) return;

    if(isTouchDevice){
        try{
            audio.pause();
            audio.currentTime=0;
            audio.volume=sfxVolume;
            audio.play().catch(()=>{});
        }
        catch(e){}
        return;
    }

    const sound=audio.cloneNode();
    sound.volume=sfxVolume;
    sound.play().catch(()=>{});
}



function saveGameHistory(score,coins){
    let history=JSON.parse(localStorage.getItem('flappyBirdHistory')||'[]');

    const gameData={
        score:Math.floor(score),
        coins:Math.floor(coins),
        date:new Date().toISOString(),
        difficulty:difficulty,
        theme:currentTheme
    };

    history.unshift(gameData);

    if(history.length>50){
        history=history.slice(0,50);
    }
    localStorage.setItem('flappyBirdHistory',JSON.stringify(history));
}

function loadGameHistory(){
    return JSON.parse(localStorage.getItem('flappyBirdHistory')||'[]');
}

function clearGameHistory(){
    if(confirm('Are you sure ? This is not reversible.')){
        localStorage.removeItem('flappyBirdHistory');
        alert('Game history cleared!');
        displayHistory();
    }
}

function resetAllData(){
    if(confirm('This will delete Entire Data,This is not reversible')){
        localStorage.removeItem('flappyBirdHistory');
        localStorage.removeItem('flappyBirdHighScore');
        localStorage.removeItem("totalCoins");
        localStorage.removeItem('flappyMusicEnabled');
        localStorage.removeItem('flappySfxEnabled');
        localStorage.removeItem('flappyMusicVolume');
        localStorage.removeItem('flappySfxVolume');

        highScore=0;
        totalCoins=0;

        musicEnabled=true;
        sfxEnabled=true;
        musicVolume=0.3;
        sfxVolume=1.0;

        updateSoundControls();

        updateLobbyStats();
        displayHistory();
        
        alert('All data reset');
        closeSettings();
    }
}

function displayHistory(){
    const historyList=domCache.historyList;
    const history=loadGameHistory();

    if(history.length===0){
        historyList.innerHTML='<p class="no-history">NO Games played<p>';
        return ;
    }
    historyList.innerHTML='';

    const fragment=document.createDocumentFragment();

    history.forEach((game,index)=>{
        const gameDate=new Date(game.date);
        const formattedDate=gameDate.toLocaleDateString()+' '+gameDate.toLocaleTimeString();

        const historyItem=document.createElement('div');
        historyItem.className='history-item';

        historyItem.innerHTML=`
        <div class="history-date">${formattedDate}</div>

        <div class="history-header">
            <div class="history-left-info">
                <span class="history-meta">${getDifficultyEmoji(game.difficulty)}${game.difficulty.toUpperCase()}</span>
                <span class="history-meta">${getThemeEmoji(game.theme)}${game.theme.toUpperCase()}</span>
            </div>
            <div class="history-right-info">
                <span class="history-score">🪙 Score: ${game.score}</span>
                <span class="history-coins">💰 Coins: ${game.coins}</span>
            </div>
        </div>
        `;
        fragment.appendChild(historyItem);
    })
    historyList.appendChild(fragment);
}

function getDifficultyEmoji(difficulty){
    switch(difficulty){
        case 'easy':return '🟢';
        case 'medium':return '🟡';
        case 'hard':return '🔴';
        default:return '⚪';
    }
}

function getThemeEmoji(theme){
    switch(theme){
        case 'oasis':return '🌴';
        case 'desert':return '🏜️';
        default:return '🎨';
    }
}

window.onload=function(){
    board=this.document.getElementById("board");
    board.height=boardHeight;
    board.width=boardWidth;
    context=board.getContext("2d");

    cacheDOMElements();
    loadSoundSettings();

    isTouchDevice=detectTouchDevice();

    if(isTouchDevice && domCache.powerupLegend){
        domCache.powerupLegend.style.display="none";
    }

    board.addEventListener("pointerdown",handleCanvasPointerDown,{passive:true});

    oasisBg=new Image();
    oasisBg.src="./Images/flappybirdbg.png";

    oasisTopPipe=new Image();
    oasisTopPipe.src="./Images/toppipe.png";
    
    oasisBottomPipe=new Image();
    oasisBottomPipe.src="./Images/bottompipe.png";


    desertBg=new Image();
    desertBg.src="./Images/desert_bg1.jpg";

    desertTopPipe=new Image();
    desertTopPipe.src="./Images/desert_pipe_top.png";

    desertBottomPipe=new Image();
    desertBottomPipe.src="./Images/desert_pipe_bottom.png";


    birdImg1=new Image();
    birdImg1.src="./Images/flappybird0.png";

    birdImg2=new Image();
    birdImg2.src="./Images/flappybird1.png";

    birdImg3=new Image();
    birdImg3.src="./Images/flappybird2.png";

    birdImg4=new Image();
    birdImg4.src="./Images/flappybird3.png";

    birdFrames=[birdImg1,birdImg2,birdImg3,birdImg4];

    jumpSound.src = "./Sounds/sfx_wing.wav";
    scoreSound.src = "./Sounds/sfx_point.wav";
    hitSound.src = "./Sounds/sfx_hit.wav";
    dieSound.src = "./Sounds/sfx_die.wav";

    bgMusic.src = "./Sounds/bgflappybird.mp3";
    coinSound.src = "./Sounds/sfx_point.wav";
    powerupSound.src="./Sounds/sfx_swooshing.wav";

    jumpSound.preload="auto";
    scoreSound.preload="auto";
    hitSound.preload="auto";
    dieSound.preload="auto";
    coinSound.preload="auto";
    powerupSound.preload="auto";

    bgMusic.loop=true;
    bgMusic.volume=musicVolume;

    jumpSound.volume=sfxVolume;
    scoreSound.volume=sfxVolume;
    hitSound.volume=sfxVolume;
    dieSound.volume=sfxVolume;
    coinSound.volume=sfxVolume;
    powerupSound.volume=sfxVolume;

    totalCoins=parseInt(localStorage.getItem('totalCoins')) || 0;
    highScore=parseInt(localStorage.getItem('flappyBirdHighScore'))||0;
    updateLobbyStats();
    applyTheme(currentTheme);
    updateSoundControls();


    this.document.addEventListener("keydown",handleKeyPress);

    domCache.startBtn.addEventListener("click",startGame);
    domCache.restartBtn.addEventListener("click",restartGame);
    domCache.backToLobbyBtn.addEventListener("click",backToLobby)

    domCache.settingsBtn.addEventListener("click",openSettings);
    domCache.closeSettingsBtn.addEventListener("click",closeSettings);
    domCache.historyBtn.addEventListener("click",openHistory);
    domCache.closeHistoryBtn.addEventListener("click",closeHistory);

    domCache.settingsOasisBtn.addEventListener("click",()=>changeTheme("oasis"));
    domCache.settingsDesertBtn.addEventListener("click",()=>changeTheme("desert"));
    domCache.settingsEasyBtn.addEventListener("click",()=>setDifficulty("easy"));
    domCache.settingsMediumBtn.addEventListener("click",()=>setDifficulty("medium"));
    domCache.settingsHardBtn.addEventListener("click",()=>setDifficulty("hard"));
    
    domCache.clearHistoryBtn.addEventListener("click",clearGameHistory);
    domCache.resetAllBtn.addEventListener("click",resetAllData);

    domCache.soundBtn.addEventListener("click",openSound);
    domCache.closeSoundBtn.addEventListener("click",closeSound);
    domCache.musicToggle.addEventListener("change",toggleMusic);
    domCache.sfxToggle.addEventListener("change",toggleSfx);
    domCache.musicVolumeSlider.addEventListener("input",setMusicVolume);
    domCache.sfxVolumeSlider.addEventListener("input",setSfxVolume);


    updateDifficultyButtons();
    updateThemeButtons();

    backToLobby();

    if(!animationStarted){
        animationStarted=true;
        resetUpdateClockToNow();
        requestAnimationFrame(update);
    }
}

function updateLobbyStats(){
    if(domCache.lobbyBestScore){
        domCache.lobbyBestScore.innerText=Math.floor(highScore);
    }
    if(domCache.lobbyTotalCoins){
        domCache.lobbyTotalCoins.innerText=Math.floor(totalCoins);
    }
}

function openSettings(){
    domCache.settingsPopup.style.display='flex';
}
function closeSettings(){
    domCache.settingsPopup.style.display="none";
}

function openHistory(){
    displayHistory();
    domCache.historyPopup.style.display="flex";
}

function closeHistory(){
    domCache.historyPopup.style.display="none";
}

function changeTheme(theme){
    currentTheme=theme;
    applyTheme(theme);
    updateThemeButtons();
}


function applyTheme(theme){
    currentTheme=theme;

    if(theme==="oasis"){
        bgImg=oasisBg;
        topPipeImg=oasisTopPipe;
        bottomPipeImg=oasisBottomPipe;
        bgColor='#70c5ce';
    }
    else if(theme==="desert"){
        bgImg=desertBg;
        topPipeImg=desertTopPipe;
        bottomPipeImg=desertBottomPipe;
        bgColor='#f4a460';
    }

    document.body.style.backgroundColor=bgColor;

    bgX=0;
    bgX2=boardWidth;
}

function updateThemeButtons(){
    document.querySelectorAll(".theme-option-btn").forEach(btn=>{
        btn.classList.remove("active");
    })
    if(currentTheme==="oasis"){
        domCache.settingsOasisBtn.classList.add("active");
    }
    else if(currentTheme==="desert"){
        domCache.settingsDesertBtn.classList.add("active");
    }
}

function updateDifficultyButtons(){
    document.querySelectorAll(".difficulty-option-btn").forEach(btn=>{
        btn.classList.remove("active");
    })

    if(difficulty==="easy"){
        domCache.settingsEasyBtn.classList.add("active");
    }
    else if(difficulty==="medium"){
        domCache.settingsMediumBtn.classList.add("active");
    }
    else if(difficulty==="hard"){
        domCache.settingsHardBtn.classList.add('active');
    }
}

function applyDifficultySettings(){
    let mobgravity=isTouchDevice?0.2:0;

    if(difficulty==="easy"){
        baseVelocityX=-1.5;
        pipeGap=boardHeight/3;
        gravity=0.1+mobgravity;

        pipeSpawnMs=2000;
        coinSpawnMs=2400;
        powerupSpawnMs=4200;

    }
    else if(difficulty==="medium"){
        baseVelocityX=-2;
        pipeGap=boardHeight/4;
        gravity=0.15+mobgravity;

        pipeSpawnMs=1500;
        coinSpawnMs=2000;
        powerupSpawnMs=3000;
    }
    else if(difficulty==="hard"){
        baseVelocityX=-3;
        pipeGap=boardHeight/5;
        gravity=0.2+mobgravity;

        pipeSpawnMs=1200;
        coinSpawnMs=1700;
        powerupSpawnMs=2500;
    }
    let mobMult=(isTouchDevice?MOBILE_SPEED_MULT:1);
    velocityX=baseVelocityX*speedMultiplier*mobMult;

}

// function clearAllIntervals(){
//     if(pipeInterval){
//         clearInterval(pipeInterval);
//         pipeInterval=null;
//     }
//     if(coinInterval){
//         clearInterval(coinInterval);
//         coinInterval=null;
//     }
//     if(powerupInterval){
//         clearInterval(powerupInterval);
//         powerupInterval=null;
//     }
// }

// function startAllIntervals(){
//     clearAllIntervals();

//     const pipeMs=Math.round(pipeSpawnMs/speedMultiplier);
//     const coinMs=Math.round(coinSpawnMs/speedMultiplier);
//     const powerMs=Math.round(powerupSpawnMs/speedMultiplier);


//     pipeInterval=setInterval(placePipes,pipeMs);
//     coinInterval=setInterval(placeCoins,coinMs);
//     powerupInterval=setInterval(placePowerups,powerMs);
// }

function applySpeedMultiplier(mult){
    speedMultiplier=mult;
    let mobMult=(isTouchDevice?MOBILE_SPEED_MULT:1);
    velocityX=baseVelocityX*speedMultiplier*mobMult;

}

function setDifficulty(level){
    difficulty=level;
    applyDifficultySettings();
    updateDifficultyButtons();
}

function startGame(){
    if(!gameStarted){
        inLobby=false;
        gameStarted=true;
        gameReady=false;
        gameOver=false;
        gamePaused=false;
        heading.textContent="";

        bird.x=birdX;
        bird.y=birdY;

        bgX=0;
        bgX2=boardWidth;

        pipeArray.length=0;
        coinArray.length=0;
        powerupArray.length=0;

        score=0;
        velocityY=0;

        currentFrame=0;
        frameCount=0;
        lastMileStone=0;

        isNewHighScore=false;
        hitSoundPlayed=false;
        dieSoundPlayed=false;
        showMilestoneMessage=false;
        milestoneMessageTimer=0;

        sessionCoins=0;
        shieldRotation=0;
        
        hasShield=false;
        hasSlowMotion=false;
        hasDoublePoints=false;
        hasMagnet=false;
        
        shieldRemainingMs=0;
        slowMotionRemainingMs=0;
        doublePointsRemainingMs=0;
        magnetRemainingMs=0;

        invulnerableFrames=0;

        powerupMessage="";
        powerupMessageTimer=0;

        speedMultiplier=1;
        applyDifficultySettings();

        // lastPipeSpawn=0;
        // lastCoinSpawn=0;
        // lastPowerupSpawn=0
        resetSpawnTimersToNow();
        resetUpdateClockToNow();

        
        if(currentTheme==="oasis"){
            bgColor='#70c5ce';
        }
        else{
            bgColor='#f4a460';
        }

        domCache.heading.style.display="none";

        document.body.style.backgroundColor=bgColor;

        domCache.startBtn.style.display="none";
        domCache.lobbyStats.style.display="none";
        domCache.topRightButtons.style.display="none";

        if(isTouchDevice){
            domCache.powerupLegend.style.display="none";
        }else{
            domCache.powerupLegend.style.display="block";
        }

        domCache.instructions.style.display="block";
        domCache.gameOverPopup.style.display="none";
        playSound(bgMusic);
    }
}

function backToLobby(){
    inLobby =true;
    gameStarted=false;
    gameReady=false;
    gameOver=false;
    gamePaused=false;

    bgMusic.pause();
    bgMusic.currentTime=0;

    lobbyBaseBirdX=boardWidth/2-birdWidth/2;
    lobbyBaseBirdY=boardHeight/2-birdHeight/2;
    lobbyTime=0;

    bird.x=lobbyBaseBirdX;
    bird.y=lobbyBaseBirdY;

    pipeArray.length=0;
    coinArray.length=0;
    powerupArray.length=0;

    score=0;
    velocityY=0;
    currentFrame=0;
    frameCount=0;


    applyTheme(currentTheme);
    applyDifficultySettings();
    updateLobbyStats();

    domCache.heading.style.display="block";

    domCache.startBtn.style.display="block";
    domCache.lobbyStats.style.display="flex";
    domCache.topRightButtons.style.display="flex";
    domCache.powerupLegend.style.display="none";
    domCache.instructions.style.display="none";
    domCache.gameOverPopup.style.display="none";
}

function restartGame(){

    gameStarted=false;
    startGame();
}

function togglePause(){
    if(!gameStarted || gameOver || !gameReady){
        return;
    }

    gamePaused=!gamePaused;

    if(gamePaused){
        bgMusic.pause();
    }
    else{
        playSound(bgMusic);

        resetSpawnTimersToNow();
        resetUpdateClockToNow();
    }
}


function handleKeyPress(e){
    if(e.code=="Space" && gameStarted && gameReady && !gameOver){
        togglePause();
        return;
    }

    
    if((e.code=="Space" || e.code=="Enter") && domCache.startBtn.style.display!="none"){
        startGame()
        return;
    }

    if((e.code=="Space" || e.code=="Enter") && gameOver){
        restartGame();
        return;
    }


    if(( e.code=="ArrowUp" || e.code=="KeyW") && gameStarted && !gameOver && !gamePaused){
        if(!gameReady){
            gameReady=true;
            velocityY=0;
            domCache.instructions.style.display="none";
            resetSpawnTimersToNow();
            resetUpdateClockToNow();

            frameCount=0;
        }
        else{
            if(difficulty==="easy"){
                velocityY=-4;
            }
            else if(difficulty==="medium"){
                velocityY=-5;
            }
            else if(difficulty==="hard"){
                velocityY=-6;
            }
            playSound(jumpSound);
        }

    }
}

function placeCoins(){
    if(gameOver || !gameStarted || !gameReady) return;

    const padding=40;
    const minY=Math.max(0,lastGapTop+padding);
    const maxY=Math.min(boardHeight-coinHeight,lastGapBottom-padding);
    if(maxY<=minY) return ;

    let coinY=minY + Math.random()*(maxY-minY);

    let coin={
        x:boardWidth+220,
        y:coinY,
        width:coinWidth,
        height:coinHeight,
        collected:false,
        rotation:0
    };

    coinArray.push(coin);
}

function placePowerups(){
    if(gameOver || !gameStarted || !gameReady) return;

    if(Math.random()>0.6) return;

    let powerupTypes=["shield","slowmotion","doublepoints","magnet"];
    let randomType=powerupTypes[Math.floor(Math.random()*powerupTypes.length)];
    
    const padding=50;
    const minY=Math.max(0,lastGapTop+padding);
    const maxY=Math.min(boardHeight-powerupHeight,lastGapBottom-padding);
    if(maxY<=minY) return;

    let powerupY=minY+Math.random()*(maxY-minY);


    const minOffsetX=180;
    const maxOffsetX=360;
    const spawnX=pipeX+(minOffsetX +Math.random()*(maxOffsetX-minOffsetX));

    let powerup={
        x:spawnX,
        y:powerupY,
        width:powerupWidth,
        height:powerupHeight,
        type:randomType,
        collected:false,
        float:0
    }
    powerupArray.push(powerup);
}

function showPowerupMessage(msg){
    powerupMessage=msg;
    powerupMessageTimer=nowMs()+POWERUP_MESSAGE_MS;
}

function activePowerup(type){
    playSound(powerupSound);

    resetUpdateClockToNow();

    if(type==="shield"){
        hasShield=true;
        shieldRemainingMs=POWERUP_DURATION_MS;
        showPowerupMessage("🛡️ Shield Activated!");
    }
    else if(type==="slowmotion"){
        hasSlowMotion=true;
        slowMotionRemainingMs=POWERUP_DURATION_MS;
        applySpeedMultiplier(0.5);
        showPowerupMessage("⏳ Slow Motion!");
    }
    else if(type==="doublepoints"){
        hasDoublePoints=true;
        doublePointsRemainingMs=POWERUP_DURATION_MS;
        showPowerupMessage("✨ Double Points!");
    }
    else if(type==="magnet"){
        hasMagnet=true;
        magnetRemainingMs=POWERUP_DURATION_MS;
        showPowerupMessage("🧲 Magnet!");
    }
}


function update(){
    requestAnimationFrame(update);

    if(!bgImg || !topPipeImg || !bottomPipeImg){
        return;
    }

    const t=nowMs();

    const spawnSlow=isTouchDevice?MOBILE_SPAWN_SLOW_MULT:1;

    if(gameStarted && gameReady && !gameOver && !gamePaused){
        const pipeMs=(pipeSpawnMs*spawnSlow)/speedMultiplier;
        const coinMs=(coinSpawnMs*spawnSlow)/speedMultiplier;
        const powerMs=(powerupSpawnMs*spawnSlow)/speedMultiplier;

        if(t-lastPipeSpawn>=pipeMs){
            placePipes();
            lastPipeSpawn=t;
        }
        if(t-lastCoinSpawn>=coinMs){
            placeCoins();
            lastCoinSpawn=t;
        }
        if(t-lastPowerupSpawn>=powerMs){
            placePowerups();
            lastPowerupSpawn=t;
        }
    }

    updatePowerupRemainingTimers(t);

    // if(hasShield && t>=shieldTimer){
    //     hasShield=false;
    // }
    // if(hasSlowMotion && t>=slowMotionTimer){
    //     hasSlowMotion=false;
    //     applySpeedMultiplier(1);
    // }
    // if(hasDoublePoints && t>=doublePointsTimer){
    //     hasDoublePoints=false;
    // }
    // if(hasMagnet && t>=magnetTimer){
    //     hasMagnet=false;
    // }


    // document.body.style.backgroundColor=bgColor;
    context.clearRect(0,0,boardWidth,boardHeight);

    if(invulnerableFrames>0){
        invulnerableFrames--;
    }

    if(gamePaused){
        if(bgImg.complete){
            context.drawImage(bgImg,bgX,0,boardWidth,boardHeight);
            context.drawImage(bgImg,bgX2,0,boardWidth,boardHeight);
        }

        if(birdFrames[currentFrame] && birdFrames[currentFrame].complete){
            context.drawImage(birdFrames[currentFrame],bird.x,bird.y,bird.width,bird.height);
        }

        for(let i=0;i<pipeArray.length;i++){
            let pipe=pipeArray[i];
            context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);
        }

        drawHUD(t);
        return;
    }

    if(gameStarted  && !gameOver){
        const bgVel=isTouchDevice?(velocityX * MOBILE_BG_SPEED_MULT):velocityX;
        bgX+=bgVel;
        bgX2+=bgVel;

        if(bgX<=-boardWidth){
            bgX=bgX2+boardWidth;
        }
        if(bgX2<=-boardWidth){
            bgX2=bgX+boardWidth;
        }
    }

    if(bgImg.complete){
        context.drawImage(bgImg,bgX,0,boardWidth,boardHeight);
        context.drawImage(bgImg,bgX2,0,boardWidth,boardHeight);
    }

    if(inLobby && !gameStarted){
        lobbyTime+=1;

        lobbyBaseBirdX=boardWidth/2-birdWidth/2;
        lobbyBaseBirdY=boardHeight/2-birdHeight/2;

        const bob=Math.sin(lobbyTime*LOBBY_BOB_SPEED)*LOBBY_BOB_AMPLITUDE;
        bird.x=lobbyBaseBirdX;
        bird.y=lobbyBaseBirdY+bob;

        frameCount++;
        if(frameCount>=FLAP_SPEED_LOBBY){
            currentFrame=(currentFrame+1)%4;
            frameCount=0;
        }

    }

    //bird
    if(gameStarted && gameReady && !gameOver){
        velocityY+=gravity;
        bird.y=Math.max(bird.y+velocityY,0); 

        frameCount++;
        if(frameCount>=FLAP_SPEED_GAME){
            currentFrame=(currentFrame+1)%4;
            frameCount=0;
        }
    }

    if(hasShield && shieldRemainingMs>0){
        shieldRotation+=0.05;

        context.save();
        context.translate(bird.x+bird.width/2,bird.y+bird.height/2);
        context.rotate(shieldRotation);


        context.strokeStyle="rgba(0, 200, 255, 0.8)";
        context.lineWidth=4;
        context.beginPath();
        context.arc(0,0,28,0,TWO_PI);
        context.stroke();

        context.strokeStyle="rgba(100, 150, 255, 0.5)";
        context.lineWidth=2;
        context.beginPath();
        context.arc(0,0,32,0,TWO_PI);
        context.stroke();

        for(let i=0;i<6;i++){
            let angle=(TWO_PI/6)*i+shieldRotation;
            let x=Math.cos(angle)*30;
            let y=Math.sin(angle)*30;
            context.fillStyle="rgba(0, 200, 255, 0.6)";
            context.beginPath();
            context.arc(x,y,3,0,TWO_PI);
            context.fill();
        }

        context.restore();

    }

    if(birdFrames[currentFrame] && birdFrames[currentFrame].complete){
        if(invulnerableFrames===0 || Math.floor(invulnerableFrames/5)%2===0){
            context.drawImage(birdFrames[currentFrame],bird.x,bird.y,bird.width,bird.height);
        }
    }

    if(bird.y>board.height && !gameOver && gameReady){
        gameOver=true;
        if(!dieSoundPlayed){
            playSound(dieSound);
            dieSoundPlayed=true;
        }
        bgMusic.pause();
        bgMusic.currentTime=0;

        saveGameHistory(score,sessionCoins);
    }

    if(gameStarted && gameReady && !gameOver){

        const birdCenterX=bird.x+bird.width/2;
        const birdCenterY=bird.y+bird.height/2;

        for(let i=coinArray.length-1;i>=0;i--){
            let coin=coinArray[i];
            coin.x+=velocityX;
            coin.rotation+=0.1;

            if(coin.x<-coinWidth){
                coinArray.splice(i,1);
                continue;
            }

            if(hasMagnet && magnetRemainingMs>0 && !coin.collected){
                let dx=birdCenterX-(coin.x+coin.width/2);
                let dy=birdCenterY-(coin.y+coin.height/2);
                let distance=dx*dx+dy*dy;

                if(distance<MAGNET_RANGE_PX * MAGNET_RANGE_PX){
                    coin.x+=dx*MAGNET_PULL;
                    coin.y+=dy*MAGNET_PULL;
                }
            }

            if(!coin.collected){

                context.save();
                context.translate(coin.x+coin.width/2,coin.y+coin.height/2);
                context.rotate(coin.rotation);

                context.fillStyle = "#FFD700";
                context.strokeStyle = "#FFA500";
                context.lineWidth=3;
                context.beginPath();
                context.arc(0,0,coinRadius,0,TWO_PI);
                context.fill();
                context.stroke();

                context.fillStyle="#FFA500";
                context.font="bold 18px Arial";
                context.textAlign="center";
                context.textBaseline="middle";
                context.fillText("$",0,0);
                context.restore();
            }

            if(!coin.collected && detectCollision(bird,coin)){
                coin.collected=true;

                let coinPoints=(hasDoublePoints&& doublePointsRemainingMs>0)?6:3;
                score+=coinPoints;
                sessionCoins++;
                totalCoins++;
                localStorage.setItem('totalCoins',totalCoins);


                if(nowMs()-lastCoinSound>50){
                    playSound(coinSound);
                    lastCoinSound=nowMs();
                }
            }
        }

        // while(coinArray.length>0 && coinArray[0].x<-coinWidth){
        //     coinArray.shift();
        // } 
    }

    if(gameStarted && gameReady && !gameOver){
        for(let i=powerupArray.length-1;i>=0;i--){
            let powerup=powerupArray[i];
            powerup.x+=velocityX;
            powerup.float+=0.1;

            if(powerup.x<-powerupWidth){
                powerupArray.splice(i,1);
                continue;
            }

            let floatOffset=Math.sin(powerup.float)*5;

            if(!powerup.collected){
                let color,icon,glowColor;
                if(powerup.type==="shield"){
                    color="#00BFFF";
                    icon="🛡️";
                    glowColor = "rgba(0, 191, 255, 0.5)";
                }
                else if(powerup.type==="slowmotion"){
                    color = "#9370DB";
                    icon="⏳";
                    glowColor = "rgba(147, 112, 219, 0.5)";
                }
                else if(powerup.type==="doublepoints"){
                    color = "#FFD700";
                    icon="✨";
                    glowColor = "rgba(255, 215, 0, 0.5)";
                }
                else if(powerup.type==="magnet"){
                    color = "#FF69B4";
                    icon="🧲";
                    glowColor = "rgba(255, 105, 180, 0.5)";
                }


                context.fillStyle=color;
                context.strokeStyle="white";
                context.lineWidth=3;
                context.fillRect(powerup.x,powerup.y+floatOffset,powerup.width,powerup.height);
                context.strokeRect(powerup.x,powerup.y+floatOffset,powerup.width,powerup.height);
                // context.shadowBlur=0;

                context.font="28px Arial";
                context.textAlign="center";
                context.textBaseline="middle";
                context.fillText(icon,powerup.x+powerup.width/2,powerup.y+powerup.height/2+floatOffset);
                context.textAlign="left";
            }

            let checkPowerup={
                x:powerup.x,
                y:powerup.y+floatOffset,
                width:powerup.width,
                height:powerup.height
            }

            if(!powerup.collected && detectCollision(bird,checkPowerup)){
                powerup.collected=true;
                activePowerup(powerup.type);
            }
        }

        // while(powerupArray.length>0 && powerupArray[0].x<-powerupWidth){
        //     powerupArray.shift();
        // } 
    }

    //pipes

    if(gameStarted && gameReady && !gameOver){
        for(let i=0;i<pipeArray.length;i++){
            let pipe=pipeArray[i];
            pipe.x+=velocityX;
            
            if(pipe.x<-pipe.width){
                pipeArray.splice(i,1);
                i--;
                continue;
            }
            context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);

            if(!pipe.passed && bird.x>pipe.x+pipe.width){
                let points=(hasDoublePoints && doublePointsRemainingMs>0)?1:0.5;
                score+=points; 
                pipe.passed=true;

                playSound(scoreSound);
    
                if(score>highScore){
                    highScore=score;
                    localStorage.setItem('flappyBirdHighScore',highScore);
                    isNewHighScore=true;
                }

                if(Math.floor(score)%10===0 && Math.floor(score)!==lastMileStone && score>0){
                    lastMileStone=Math.floor(score);
                    showMilestoneMessage=true;
                    milestoneMessageTimer=60;

                    velocityX-=0.3;

                    if(currentTheme==="oasis"){
                        if(Math.floor(score)===10){
                            bgColor='#87CEEB';
                        }
                        else if(Math.floor(score)===20){
                            bgColor="#FFB6C1";
                        }
                        else if(Math.floor(score)===30){
                            bgColor="#DDA0DD";
                        }
                        else if(Math.floor(score)>=40){
                            bgColor="#FF6347";
                        }
                    }
                    else if(currentTheme==="desert"){
                        if(Math.floor(score)===10){
                            bgColor='#daa520';
                        }
                        else if(Math.floor(score)===20){
                            bgColor='#cd853f';
                        }
                        else if(Math.floor(score)===30){
                            bgColor='#d2691e';
                        }
                        else if(Math.floor(score)>=40){
                            bgColor='#8b4513';
                        }
                    }
                }
            }


            if(invulnerableFrames<=0 && detectCollision(bird,pipe) && !gameOver){
                if(hasShield && shieldRemainingMs>0){
                    // hasShield=false;
                    invulnerableFrames=10;
                    showPowerupMessage("🛡️ Blocked!");
                    playSound(powerupSound);
                    // createShieldBreakEffect();
                    // bird.x=Math.max(bird.x-8,0);
                }
                else{
                    gameOver=true;
                    if(!hitSoundPlayed){
                        playSound(hitSound);
                        hitSoundPlayed=true;
                    }
                    if(!dieSoundPlayed){
                        playSound(dieSound);
                        dieSoundPlayed=true;
                    }
                    bgMusic.pause();
                    bgMusic.currentTime=0;

                    saveGameHistory(score,sessionCoins);
                }
                
            }
        }
        
        // while (pipeArray.length>0 && pipeArray[0].x<-pipeWidth){
        //     pipeArray.shift(); 
        // }
    }

    if(showMilestoneMessage && milestoneMessageTimer>0){
        context.fillStyle="yellow";
        context.font="bold 40px sans-serif";
        context.textAlign="center";
        context.strokeStyle="black";
        context.lineWidth=4;
        context.strokeText("AMAZING!",boardWidth/2,boardHeight/2-50);
        context.fillText("AMAZING!",boardWidth/2,boardHeight/2-50);
        context.strokeText(lastMileStone+" POINTS!",boardWidth/2,boardHeight/2);
        context.fillText(lastMileStone+" POINTS!",boardWidth/2,boardHeight/2);
        context.textAlign="left";
        milestoneMessageTimer--;

        if(milestoneMessageTimer===0){
            showMilestoneMessage=false;
        }
    }

    if(powerupMessage && powerupMessageTimer>t){
        context.fillStyle="cyan";
        context.font="bold 35px sans-serif";
        context.textAlign="center";
        context.strokeStyle="black";
        context.lineWidth=4;
        context.strokeText(powerupMessage,board.width/2,board.height/2+100);
        context.fillText(powerupMessage,board.width/2,board.height/2+100);
        context.textAlign="left";

    }
     
    if(gameStarted && gameReady && !gameOver){
        drawHUD(t);
    }


    if(gameOver){
        domCache.gameOverPopup.style.display="block";
        domCache.finalScore.innerText=Math.floor(score);

        const coinsThisGame=domCache.coinsThisGame;
        if(coinsThisGame) coinsThisGame.innerText=Math.floor(sessionCoins);


        domCache.totalCoinsDisplay.innerText=Math.floor(totalCoins);

        if(isNewHighScore){
            domCache.highScoreMessage.style.display="block";
        }
        else{
            domCache.highScoreMessage.style.display="none";
        }
    }
}

function drawHUD(t){
    context.fillStyle="white";
    context.strokeStyle="black";
    context.lineWidth=3;

    context.font="30px sans-serif";
    context.textAlign="center";
    context.strokeText(Math.floor(score),boardWidth/2,50);
    context.fillText(Math.floor(score),boardWidth/2,50);
    context.textAlign="left";

    if(gameStarted && gameReady){
        context.font="35px sans-serif";
        let pauseIcon=gamePaused?"▶️":"⏸️";
        context.strokeText(pauseIcon,12,45);
        context.fillText(pauseIcon,12,45);

        pauseIconHitbox={x:0,y:0,w:80,h:80};
    }
    else{
        pauseIconHitbox={x:0,y:0,w:0,h:0};
    }

    context.font="18px sans-serif";
    let y=130;


    if(hasShield && shieldRemainingMs>0){
        context.strokeText("🛡️ "+Math.ceil((shieldRemainingMs)/1000)+"s",10,y);
        context.fillText("🛡️ "+Math.ceil((shieldRemainingMs)/1000)+"s",10,y);
        y+=22;
    }
    if(hasSlowMotion && slowMotionRemainingMs>0){
        context.strokeText("⏳ "+Math.ceil((slowMotionRemainingMs)/1000)+"s",10,y);
        context.fillText("⏳ "+Math.ceil((slowMotionRemainingMs)/1000)+"s",10,y);
        y+=22;
    }
    if(hasDoublePoints && doublePointsRemainingMs>0){
        context.strokeText("✨ "+Math.ceil((doublePointsRemainingMs)/1000)+"s",10,y);
        context.fillText("✨ "+Math.ceil((doublePointsRemainingMs)/1000)+"s",10,y);
        y+=22;
    }
    if(hasMagnet && magnetRemainingMs>0){
        context.strokeText("🧲 "+Math.ceil((magnetRemainingMs)/1000)+"s",10,y);
        context.fillText("🧲 "+Math.ceil((magnetRemainingMs)/1000)+"s",10,y);
        y+=22;
    }
    
}

function placePipes(){
    if(gameOver || !gameStarted || !gameReady){
        return;
    }

    let randomPipeY=pipeY-pipeHeight/4-Math.random()*(pipeHeight/2);


    let openingSpace=pipeGap;

    lastGapTop=randomPipeY+pipeHeight;
    lastGapBottom=randomPipeY+pipeHeight+openingSpace;

    let topPipe={
        img:topPipeImg,
        x:pipeX,
        y:randomPipeY,
        width:pipeWidth,
        height:pipeHeight,
        passed:false
    }
    pipeArray.push(topPipe);

    let bottomPipe={
        img:bottomPipeImg,
        x:pipeX,
        y:randomPipeY+pipeHeight+openingSpace,
        width:pipeWidth,
        height:pipeHeight,
        passed:false
    }
    pipeArray.push(bottomPipe);
}

function detectCollision(a,b){
    return  a.x<b.x+b.width && 
            a.x+a.width>b.x && 
            a.y<b.y+b.height &&
            a.y+a.height>b.y  
    }
