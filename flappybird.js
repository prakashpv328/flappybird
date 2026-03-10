
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


const POWERUP_DURATION_MS=5000;
const POWERUP_MESSAGE_MS=1000;
const INVULNERABLE_MS=250;

const MAGNET_RANGE_PX=200;
const MAGNET_PULL=0.10;

let jumpSound=new Audio();
let scoreSound=new Audio();
let hitSound=new Audio();
let bgMusic=new Audio();
let dieSound=new Audio();
let coinSound=new Audio();
let powerupSound=new Audio();

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

let shieldTimer=0
let slowMotionTimer=0;
let doublePointsTimer=0;
let magnetTimer=0;

let shieldRotation=0;
let animationStarted=false;

let invulnerableFrames=0;

let pipeInterval=null;
let coinInterval=null;
let powerupInterval=null;

let lastGapTop=140;
let lastGapBottom=500;

let powerupMessage=""
let powerupMessageTimer=0;

let inLobby=true;

function nowMs(){
    return performance.now();
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
        displayGameHistory();
    }
}

function resetAllData(){
    if(confirm('This will delete Entire Data,This is not reversible')){
        localStorage.removeItem('flappyBirdHistory');
        localStorage.removeItem('flappyBirdHighScore');
        localStorage.removeItem("totalCoins");

        highScore=0;
        totalCoins=0;

        updateLobbyStats();
        displayHistory();
        
        alert('All data reset');
        closeSettings();
    }
}

function displayHistory(){
    const historyList=document.getElementById('historyList');
    const history=loadGameHistory();

    if(history.length===0){
        historyList.innerHTML='<p class="no-history">NO Games played<p>';
        return ;
    }
    historyList.innerHTML='';

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
        historyList.appendChild(historyItem);
    })
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

    //draw flappy bird
    //context.fillStyle="green";
    //context.fillRect(birdImg,bird.x,bird.y,bird.width,bird.height);

    oasisBg=new Image();
    oasisBg.src="./Images/flappybirdbg.png";
    // oasisBg.onload=function(){
    //     bgX=0;
    //     bgX2=boardWidth;
    // }

    oasisTopPipe=new Image();
    oasisTopPipe.src="./Images/toppipe.png";
    
    oasisBottomPipe=new Image();
    oasisBottomPipe.src="./Images/bottompipe.png";


    desertBg=new Image();
    desertBg.src="./Images/desert_bg1.jpg";
    // desertBg.onload=function(){
    //     bgX=0;
    //     bgX2=boardWidth;
    // }

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
    // birdImg.onload=function(){
    //     context.drawImage(birdImg,bird.x,bird.y,bird.width,bird.height);
    // }


    jumpSound.src = "./Sounds/sfx_wing.wav";
    scoreSound.src = "./Sounds/sfx_point.wav";
    hitSound.src = "./Sounds/sfx_hit.wav";
    dieSound.src = "./Sounds/sfx_die.wav";

    bgMusic.src = "./Sounds/bgflappybird.mp3";
    coinSound.src = "./Sounds/sfx_point.wav";
    powerupSound.src="./Sounds/sfx_swooshing.wav";

    bgMusic.loop=true;
    bgMusic.volume=0.3;

    totalCoins=parseInt(localStorage.getItem('totalCoins')) || 0;
    highScore=parseInt(localStorage.getItem('flappyBirdHighScore'))||0;
    updateLobbyStats();
    applyTheme(currentTheme);

    // document.getElementById("totalCoinsDisplay").style.display="block";

    // if(this.document.getElementById("themePopup")){
    //     this.document.getElementById("themePopup").style.display="block";
    // }

    // if(this.document.getElementById("difficultyMenu")){
    //     this.document.getElementById("difficultyMenu").style.display="none";
    // }
    // if(this.document.getElementById("difficultyMenu")){
    //     this.document.getElementById("difficultyMenu").style.display="none"
    // }
    // if(this.document.getElementById("instructions")){
    //     this.document.getElementById("instructions").style.display="none";
    // }
    // if(this.document.getElementById("pauseMenu")){
    //     this.document.getElementById("pauseMenu").style.display="none";
    // }
    // if(this.document.getElementById("gameOverPopup")){
    //     this.document.getElementById("gameOverPopup").style.display="none";
    // }

    // requestAnimationFrame(update);
    // setInterval(placePipes,1500); //every 1.5 seconds
    this.document.addEventListener("keydown",handleKeyPress);

    this.document.getElementById("startBtn").addEventListener("click",startGame);
    this.document.getElementById("restartBtn").addEventListener("click",restartGame);
    this.document.getElementById("backToLobbyBtn").addEventListener("click",backToLobby)

    this.document.getElementById("settingsBtn").addEventListener("click",openSettings);
    this.document.getElementById("closeSettingsBtn").addEventListener("click",closeSettings);

    this.document.getElementById("historyBtn").addEventListener("click",openHistory);
    this.document.getElementById("closeHistoryBtn").addEventListener("click",closeHistory);



    this.document.getElementById("settingsOasisBtn").addEventListener("click",()=>changeTheme("oasis"));
    this.document.getElementById("settingsDesertBtn").addEventListener("click",()=>changeTheme("desert"));

    this.document.getElementById("settingsEasyBtn").addEventListener("click",()=>setDifficulty("easy"));
    this.document.getElementById("settingsMediumBtn").addEventListener("click",()=>setDifficulty("medium"));
    this.document.getElementById("settingsHardBtn").addEventListener("click",()=>setDifficulty("hard"));

    this.document.getElementById("clearHistoryBtn").addEventListener("click",clearGameHistory);
    this.document.getElementById("resetAllBtn").addEventListener("click",resetAllData);
    // this.document.getElementById("resumeBtn").addEventListener("click",togglePause);

    // board.addEventListener("click",function(event){
    //     if(!gameStarted || !gameReady ||gameOver) return ;

    //     const rect=board.getBoundingClientRect();
    //     const x=event.clientX-rect.left;
    //     const y=event.clientY-rect.top;

    //     console.log(`clicked at:x=${x},y=${y}`);

    //     if(x>=0 && x<70 && y>=50 && y<=120){
    //         togglePause();
    //     }
    // });

    updateDifficultyButtons();
    updateThemeButtons();

    if(!animationStarted){
        animationStarted=true;
        requestAnimationFrame(update);
    }
}

function updateLobbyStats(){
    if(document.getElementById("lobbyBestScore")){
        document.getElementById("lobbyBestScore").innerText=Math.floor(highScore);
    }
    if(document.getElementById("lobbyTotalCoins")){
        document.getElementById("lobbyTotalCoins").innerText=Math.floor(totalCoins);
    }
}

function openSettings(){
    document.getElementById("settingsPopup").style.display='flex';
}
function closeSettings(){
    document.getElementById("settingsPopup").style.display="none";
}

function openHistory(){
    displayHistory();
    document.getElementById("historyPopup").style.display="flex";
}

function closeHistory(){
    document.getElementById("historyPopup").style.display="none";
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

    // if(!animationStarted){
    //     animationStarted=true;
    //     requestAnimationFrame(update);
    // }
}

function updateThemeButtons(){
    document.querySelectorAll(".theme-option-btn").forEach(btn=>{
        btn.classList.remove("active");
    })
    if(currentTheme==="oasis"){
        document.getElementById("settingsOasisBtn").classList.add("active");
    }
    else if(currentTheme==="desert"){
        document.getElementById("settingsDesertBtn").classList.add("active");
    }
}

function updateDifficultyButtons(){
    document.querySelectorAll(".difficulty-option-btn").forEach(btn=>{
        btn.classList.remove("active");
    })

    if(difficulty==="easy"){
        document.getElementById("settingsEasyBtn").classList.add("active");
    }
    else if(difficulty==="medium"){
        document.getElementById("settingsMediumBtn").classList.add("active");
    }
    else if(difficulty==="hard"){
        document.getElementById("settingsHardBtn").classList.add('active');
    }
}


// function updateCoinDisplay(){
//     if(document.getElementById("mainCoinDisplay")){
//         document.getElementById("mainCoinDisplay").innerText=totalCoins;
//     }
// }

function applyDifficultySettings(){

    if(difficulty==="easy"){
        baseVelocityX=-1.5;
        // velocityX=-1.5;
        pipeGap=boardHeight/3;
        gravity=0.1;

        pipeSpawnMs=2000;
        coinSpawnMs=2400;
        powerupSpawnMs=4200;

    }
    else if(difficulty==="medium"){
        baseVelocityX=-2;
        // velocityX=-2;
        pipeGap=boardHeight/4;
        gravity=0.15;

        pipeSpawnMs=1500;
        coinSpawnMs=2000;
        powerupSpawnMs=3000;
    }
    else if(difficulty==="hard"){
        baseVelocityX=-3;
        // velocityX=-3;
        pipeGap=boardHeight/5;
        gravity=0.2;

        pipeSpawnMs=1200;
        coinSpawnMs=1700;
        powerupSpawnMs=2500;
    }

    velocityX=baseVelocityX*speedMultiplier;

    // document.querySelectorAll(".difficulty-btn").forEach(btn=> {
    //     btn.classList.remove("active");
    // });
    // document.getElementById(level+"Btn").classList.add("active");
}

function clearAllIntervals(){
    if(pipeInterval){
        clearInterval(pipeInterval);
        pipeInterval=null;
    }
    if(coinInterval){
        clearInterval(coinInterval);
        coinInterval=null;
    }
    if(powerupInterval){
        clearInterval(powerupInterval);
        powerupInterval=null;
    }
}

function startAllIntervals(){
    clearAllIntervals();

    const pipeMs=Math.round(pipeSpawnMs/speedMultiplier);
    const coinMs=Math.round(coinSpawnMs/speedMultiplier);
    const powerMs=Math.round(powerupSpawnMs/speedMultiplier);


    pipeInterval=setInterval(placePipes,pipeMs);
    coinInterval=setInterval(placeCoins,coinMs);
    powerupInterval=setInterval(placePowerups,powerMs);
}

function applySpeedMultiplier(mult){
    speedMultiplier=mult;
    velocityX=baseVelocityX*speedMultiplier;

    if(gameStarted && gameReady && !gameOver && !gamePaused){
        startAllIntervals();
    }

}

function setDifficulty(level){
    difficulty=level;
    applyDifficultySettings();
    updateDifficultyButtons();

    //  document.querySelectorAll(".difficulty-btn").forEach(btn=>{
    //     btn.classList.remove("active");
    //  })
    //  document.getElementById(level+"Btn").classList.add("active");

     if(gameStarted && gameReady && !gameOver){
        startAllIntervals();
     }
}

// applyDifficultySettings();

function startGame(){
    if(!gameStarted){
        inLobby=false;
        gameStarted=true;
        gameReady=false;
        gameOver=false;
        gamePaused=false;

        bird.x=birdX;
        bird.y=birdY;

        bgX=0;
        bgX2=boardWidth;

        pipeArray=[];
        coinArray=[];
        powerupArray=[];

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
        
        shieldTimer=0;
        slowMotionTimer=0;
        doublePointsTimer=0;
        magnetTimer=0;

        invulnerableFrames=0;

        powerupMessage="";
        powerupMessageTimer=0;

        speedMultiplier=1;
        applyDifficultySettings();

        
        if(currentTheme==="oasis"){
            bgColor='#70c5ce';
        }
        else{
            bgColor='#f4a460';
        }

        document.body.style.backgroundColor=bgColor;

        document.getElementById("startBtn").style.display="none";
        document.querySelector(".lobby-stats").style.display="none";
        document.querySelector(".top-right-buttons").style.display="none";
        document.querySelector(".powerup-legend").style.display="block";
        document.getElementById("instructions").style.display="block";
        document.getElementById("gameOverPopup").style.display="none";
        // document.getElementById("pauseMenu").style.display="none";
        // pipeInterval=setInterval(placePipes,1500);
        playSound(bgMusic);
    }
}

function backToLobby(){
    inLobby =true;
    gameStarted=false;
    gameReady=false;
    gameOver=false;
    gamePaused=false;

    clearAllIntervals();

    bgMusic.pause();
    bgMusic.currentTime=0;

    bird.x=birdX;
    bird.y=birdY;
    bgX=0;
    bgX2=boardWidth;

    pipeArray=[];
    coinArray=[];
    powerupArray=[];

    score=0;
    velocityY=0;
    currentFrame=0;
    frameCount=0;


    applyTheme(currentTheme);
    applyDifficultySettings();
    updateLobbyStats();

    document.getElementById('startBtn').style.display="block";
    document.querySelector(".lobby-stats").style.display="flex";
    document.querySelector(".top-right-buttons").style.display="flex";
    document.querySelector(".powerup-legend").style.display="none";
    document.getElementById("instructions").style.display="none";
    document.getElementById("gameOverPopup").style.display="none";
    // document.getElementById("pauseMenu").style.display="none";
}

function restartGame(){
    // bird.y=birdY;
    // bird.x=birdX;
    // pipeArray=[];
    // coinArray=[];
    // powerupArray=[];
    // score=0;
    // gameOver=false;
    // velocityY=0;
    // gameStarted=true;
    // gameReady=false;
    // gamePaused=false;
    // bgX=0;
    // bgX2=boardWidth;
    // currentFrame=0;
    // frameCount=0;
    // lastMileStone=0;
    // isNewHighScore=false;
    // hitSoundPlayed=false;
    // dieSoundPlayed=false;
    // sessionCoins=0;
    // shieldRotation=0;
    // invulnerableFrames=0;

    // hasShield=false;
    // hasSlowMotion=false;
    // hasDoublePoints=false;
    // hasMagnet=false;
    // slowMotionTimer=0;
    // doublePointsTimer=0;
    // magnetTimer=0;

    // velocityX=baseVelocityX;

    // // if(currentTheme==="oasis"){
    // //     bgColor='#70c5ce';
    // // }
    // // else if(currentTheme==='desert'){
    // //     bgColor='#f4a460'
    // // }

    // // document.body.style.backgroundColor=bgColor;
    
    // document.getElementById("pauseMenu").style.display="none";
    // document.getElementById("gameOverPopup").style.display="none";
    // document.getElementById("instructions").style.display="block";

    // // clearInterval(pipeInterval);
    // // clearInterval(coinInterval);
    // // clearInterval(powerupInterval);
    // // // pipeInterval=setInterval(placePipes,1500);
    // clearAllIntervals();
    // playSound(bgMusic);

    gameStarted=false;
    clearAllIntervals();
    startGame();
}

function togglePause(){
    if(!gameStarted || gameOver || !gameReady){
        return;
    }

    gamePaused=!gamePaused;

    if(gamePaused){
        bgMusic.pause();
        clearAllIntervals();
    }
    else{
        playSound(bgMusic);

        if(gameReady){
            startAllIntervals();
        }
    }
}

function playSound(audio){
    audio.currentTime=0;
    audio.play().catch(e=>console.log(e));
}

function handleKeyPress(e){
    if(e.code=="Space" && gameStarted && gameReady && !gameOver){
        togglePause();
        return;
    }

    
    if((e.code=="Space" || e.code=="Enter") && document.getElementById("startBtn").style.display!="none"){
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
            document.getElementById("instructions").style.display="none";
            // pipeInterval=setInterval(placePipes,1500);
            // coinInterval=setInterval(placeCoins,2000);
            // powerupInterval=setInterval(placePowerups,3000);
            startAllIntervals();
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

    const t=nowMs();

    if(type==="shield"){
        hasShield=true;
        shieldTimer=t+POWERUP_DURATION_MS;
        showPowerupMessage("🛡️ Shield Activated!");
    }
    else if(type==="slowmotion"){
        hasSlowMotion=true;
        slowMotionTimer=t+POWERUP_DURATION_MS;
        applySpeedMultiplier(0.5);
        showPowerupMessage("⏳ Slow Motion!");
    }
    else if(type==="doublepoints"){
        hasDoublePoints=true;
        doublePointsTimer=t+POWERUP_DURATION_MS;
        showPowerupMessage("✨ Double Points!");
    }
    else if(type==="magnet"){
        hasMagnet=true;
        magnetTimer=t+POWERUP_DURATION_MS;
        showPowerupMessage("🧲 Magnet!");
    }
}


function update(){
    requestAnimationFrame(update);

    if(!bgImg || !topPipeImg || !bottomPipeImg){
        return;
    }

    const t=nowMs();

    if(hasShield && t>=shieldTimer){
        hasShield=false;
    }
    if(hasSlowMotion && t>=slowMotionTimer){
        hasSlowMotion=false;
        applySpeedMultiplier(1);
    }
    if(hasDoublePoints && t>=doublePointsTimer){
        hasDoublePoints=false;
    }
    if(hasMagnet && t>=magnetTimer){
        hasMagnet=false;
    }


    document.body.style.backgroundColor=bgColor;
    context.clearRect(0,0,board.width,board.height);

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

        // context.fillStyle="white";
        // context.font="45px sans-serif";
        // context.fillText("🪙 "+Math.floor(score),10,45);
        // context.font="25px sans-serif";
        // context.fillText("Best: "+Math.floor(highScore),10,80);
        // context.fillText("Coins: "+Math.floor(totalCoins),10,110);

        return;
    }

    // if(hasSlowMotion && slowMotionTimer>0){
    //     slowMotionTimer--;
    //     if(slowMotionTimer==0){
    //         hasSlowMotion=false;
    //         applySpeedMultiplier(1);
    //     }
    // }

    // if(hasDoublePoints && doublePointsTimer>0){
    //     doublePointsTimer--;
    //     if(doublePointsTimer==0){
    //         hasDoublePoints=false;
    //     }
    // }

    // if(hasMagnet && magnetTimer>0){
    //     magnetTimer--;
    //     if(magnetTimer===0){
    //         hasMagnet=false;
    //     }
    // }

    // if(hasShield && shieldTimer>0){
    //     shieldTimer--;
    //     if(shieldTimer===0){
    //         hasShield=false;
    //     }
    // }

    if(gameStarted  && !gameOver){
        bgX+=velocityX;
        bgX2+=velocityX;

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

    //bird
    if(gameStarted && gameReady && !gameOver){
        velocityY+=gravity;
        bird.y=Math.max(bird.y+velocityY,0); 

        frameCount++;
        if(frameCount>=5){
            currentFrame=(currentFrame+1)%4;
            frameCount=0;
        }
    }

    if(hasShield && shieldTimer>t){
        shieldRotation+=0.05;

        context.save();
        context.translate(bird.x+bird.width/2,bird.y+bird.height/2);
        context.rotate(shieldRotation);


        context.strokeStyle="rgba(0, 200, 255, 0.8)";
        context.lineWidth=4;
        context.beginPath();
        context.arc(0,0,28,0,Math.PI*2);
        context.stroke();

        context.strokeStyle="rgba(100, 150, 255, 0.5)";
        context.lineWidth=2;
        context.beginPath();
        context.arc(0,0,32,0,Math.PI*2);
        context.stroke();

        for(let i=0;i<6;i++){
            let angle=(Math.PI*2/6)*i+shieldRotation;
            let x=Math.cos(angle)*30;
            let y=Math.sin(angle)*30;
            context.fillStyle="rgba(0, 200, 255, 0.6)";
            context.beginPath();
            context.arc(x,y,3,0,Math.PI*2);
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
        clearAllIntervals();

        saveGameHistory(score,sessionCoins);
    }

    if(gameStarted && gameReady && !gameOver){
        for(let i=0;i<coinArray.length;i++){
            let coin=coinArray[i];
            coin.x+=velocityX;
            coin.rotation+=0.1;

            if(hasMagnet){
                let dx=(bird.x+bird.width/2)-(coin.x+coin.width/2);
                let dy=(bird.y+bird.height/2)-(coin.y+coin.height/2);
                let distance=Math.sqrt(dx*dx+dy*dy);

                if(distance<MAGNET_RANGE_PX){
                    coin.x+=dx*0.1;
                    coin.y+=dy*0.1;

                    // context.strokeStyle="rgba(255, 215, 0, 0.7)";
                    // context.lineWidth=2;
                    // context.beginPath();
                    // context.moveTo(bird.x+bird.width/2,bird.y+bird.height/2);
                    // context.lineTo(coin.x+coin.width/2,coin.y+coin.height/2);
                    // context.stroke();
                }
            }

            if(!coin.collected){

                context.save();
                context.translate(coin.x+coin.width/2,coin.y+coin.height/2);
                context.rotate(coin.rotation);

                // context.fillStyle="rgba(0,0,0,0.3)";
                // context.beginPath();
                // context.ellipse(2,2,coinWidth/2,coinHeight/2,0,0,Math.PI*2);
                // context.fill();


                context.fillStyle = "#FFD700";
                context.strokeStyle = "#FFA500";
                context.lineWidth=3;
                context.beginPath();
                context.arc(0,0,coinWidth/2,0,Math.PI*2);
                context.fill();
                context.stroke();

                // context.fillStyle="#FFA500";
                // context.beginPath();
                // context.arc(0,0,coinWidth/4,0,Math.PI*2);
                // context.fill();

                context.fillStyle="#FFA500";
                context.font="bold 18px Arial";
                context.textAlign="center";
                context.textBaseline="middle";
                context.fillText("$",0,0);
                context.restore();
            }

            if(!coin.collected && detectCollision(bird,coin)){
                coin.collected=true;

                let coinPoints=hasDoublePoints&& doublePointsTimer>0?6:3;
                score+=coinPoints;
                sessionCoins++;
                totalCoins++;
                localStorage.setItem('totalCoins',totalCoins);
                // updateCoinDisplay();

                playSound(coinSound)
                // createCoinParticles(coin.x,coin.y);
            }
        }

        while(coinArray.length>0 && coinArray[0].x<-coinWidth){
            coinArray.shift();
        } 
    }

    if(gameStarted && gameReady && !gameOver){
        for(let i=0;i<powerupArray.length;i++){
            let powerup=powerupArray[i];
            powerup.x+=velocityX;
            powerup.float+=0.1;
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

        while(powerupArray.length>0 && powerupArray[0].x<-powerupWidth){
            powerupArray.shift();
        } 
    }

    //pipes

    if(gameStarted && gameReady && !gameOver){
        for(let i=0;i<pipeArray.length;i++){
            let pipe=pipeArray[i];
            pipe.x+=velocityX;
            context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);

            if(!pipe.passed && bird.x>pipe.x+pipe.width){
                let points=(hasDoublePoints && doublePointsTimer>nowMs())?1:0.5;
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
                if(hasShield && shieldTimer>t){
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
                    clearAllIntervals();

                    saveGameHistory(score,sessionCoins);
                }
                
            }
        }
        
        while (pipeArray.length>0 && pipeArray[0].x<-pipeWidth){
            pipeArray.shift(); 
        }
    }

    // if(gameStarted  && gameOver){
    //     for(let i=0;i<pipeArray.length;i++){
    //         let pipe=pipeArray[i];
    //         context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);
    //     }
    // }

    
    

    if(showMilestoneMessage && milestoneMessageTimer>0){
        context.fillStyle="yellow";
        context.font="bold 40px sans-serif";
        context.textAlign="center";
        context.strokeStyle="black";
        context.lineWidth=4;
        context.strokeText("AMAZING!",board.width/2,board.height/2-50);
        context.fillText("AMAZING!",board.width/2,board.height/2-50);
        context.strokeText(lastMileStone+" POINTS!",board.width/2,board.height/2);
        context.fillText(lastMileStone+" POINTS!",board.width/2,board.height/2);
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
        document.getElementById("gameOverPopup").style.display="block";
        document.getElementById("finalScore").innerText=Math.floor(score);

        const coinsThisGame=document.getElementById("coinsThisGame");
        if(coinsThisGame) coinsThisGame.innerText=Math.floor(sessionCoins);


        document.getElementById("totalCoinsDisplay").innerText=Math.floor(totalCoins);

        if(isNewHighScore){
            document.getElementById("highScoreMessage").style.display="block";
        }
        else{
            document.getElementById("highScoreMessage").style.display="none";
        }
        // bgMusic.pause();
        // bgMusic.currentTime=0;
    }
}

function drawHUD(t){
    context.fillStyle="white";
    context.strokeStyle="black";
    context.lineWidth=3;

    context.font="30px sans-serif";
    context.strokeText("🪙 "+Math.floor(score),10,45);
    context.fillText("🪙 "+Math.floor(score),10,45);

    if(gameStarted && gameReady){
        context.font="35px sans-serif";
        let pauseIcon=gamePaused?"▶️":"⏸️";
        context.strokeText(pauseIcon,10,90);
        context.fillText(pauseIcon,10,90);
    }


    // context.font="25px sans-serif";
    // context.strokeText("Best: "+Math.floor(highScore),10,80);
    // context.fillText("Best: "+Math.floor(highScore),10,80);

    // context.strokeText("Coins: 💰 "+Math.floor(totalCoins),10,110);
    // context.fillText("Coins: 💰 "+Math.floor(totalCoins),10,110);

    context.font="18px sans-serif";
    let y=130;


    if(hasShield && shieldTimer>0){
        context.strokeText("🛡️ "+Math.ceil((shieldTimer-t)/1000)+"s",10,y);
        context.fillText("🛡️ "+Math.ceil((shieldTimer-t)/1000)+"s",10,y);
        y+=22;
    }
    if(hasSlowMotion && slowMotionTimer>0){
        context.strokeText("⏳ "+Math.ceil((slowMotionTimer-t)/1000)+"s",10,y);
        context.fillText("⏳ "+Math.ceil((slowMotionTimer-t)/1000)+"s",10,y);
        y+=22;
    }
    if(hasDoublePoints && doublePointsTimer>0){
        context.strokeText("✨ "+Math.ceil((doublePointsTimer-t)/1000)+"s",10,y);
        context.fillText("✨ "+Math.ceil((doublePointsTimer-t)/1000)+"s",10,y);
        y+=22;
    }
    if(hasMagnet && magnetTimer>0){
        context.strokeText("🧲 "+Math.ceil((magnetTimer-t)/1000)+"s",10,y);
        context.fillText("🧲 "+Math.ceil((magnetTimer-t)/1000)+"s",10,y);
        y+=22;
    }
    
    // let powerupY=150;
    // context.font="20px sans-serif";
    // context.fillStyle="white";
    // // context.strokeStyle="black";
    // // context.lineWidth=2;

    // if(hasShield){
    //     context.strokeText("🛡️ Shield",10,powerupY);
    //     context.strokeStyle="cyan";
    //     context.fillText("🛡️ Shield",10,powerupY);
    //     context.fillStyle="white";
    //     powerupY+=30;
    // }
    // if(hasSlowMotion){
    //     let timeLeft=Math.ceil(slowMotionTimer/60);
    //     context.strokeText("⏳ Slow Motion: "+timeLeft+"s",10,powerupY);
    //     context.fillStyle="#9370DB";
    //     context.fillText("⏳ Slow Motion: "+timeLeft+"s",10,powerupY);
    //     context.fillStyle="white";
    //     powerupY+=30;
    // }
    // if(hasDoublePoints){
    //     let timeLeft=Math.ceil(doublePointsTimer/60);
    //     context.strokeText("⚡ Double Points: "+timeLeft+"s",10,powerupY);
    //     context.fillStyle="gold";
    //     context.fillText("⚡ Double Points: "+timeLeft+"s",10,powerupY);
    //     context.fillStyle="white";
    //     powerupY+=30;
    // }
    // if(hasMagnet){
    //     let timeLeft=Math.ceil(magnetTimer/60);
    //     context.strokeText("🧲 Magnet: "+timeLeft+"s",10,powerupY);
    //     context.fillStyle="hotpink";
    //     context.fillText("🧲 Magnet: "+timeLeft+"s",10,powerupY);
    //     context.fillStyle="white";
    //     powerupY+=30;
    // }
}

// let coinParticles=[];

// function createCoinParticles(x,y){
//     for(let i=0;i<8;i++){
//         coinParticles.push({
//             x:x,
//             y:y,
//             vx:(Math.random()-0.5)*4,
//             vy:(Math.random()-0.5)*4,
//             life:20,
//             color:"#FFD700"
//         });
//     }
// }

// function createShieldBreakEffect(){
//     for(let i=0;i<12;i++){
//         coinParticles.push({
//             x:bird.x+bird.width/2,
//             y:bird.y+bird.height/2,
//             vx:Math.cos(i*Math.PI/6)*5,
//             vy:Math.sin(i*Math.PI/6)*5,
//             life:30,
//             color:"#00BFFF"
//         })
//     }
// }

function placePipes(){
    if(gameOver || !gameStarted || !gameReady){
        return;
    }

    //(0.1)*pipeheight/2.
    //0->-128 (pipeHeight/4)
    //1->-128-256(pipeHeight/4-pipeheight/2)=-3/4 pipeHeight

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

// function moveBird(e){
//     if((e.code=="Space" || e.code=="ArrowUp" || e.code=="keyX" ) && gameStarted && !gameOver){
//         velocityY=-4;  //jump
//     }

//     if(!gameReady){
//         gameReady=true;
//         document.getElementById("instructions").style.display="none";
//         pipeInterval=setInterval(placePipes,1500);
//     }
// }

function detectCollision(a,b){
    return  a.x<b.x+b.width && 
            a.x+a.width>b.x && 
            a.y<b.y+b.height &&
            a.y+a.height>b.y  
    }
