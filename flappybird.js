
//board
let board;
let boardWidth=500;
let boardHeight=640;
let context;

//background
let bgImg;
let bgX;
let bgX2=500;

let oasisBg;
let desertBg;
let oasisTopPipe;
let oasisBottomPipe;
let desertTopPipe;
let desertBottomPipe;

let currentTheme="";

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

let slowMotionTimer=0;
let doublePointsTimer=0;
let magnetTimer=0;
let shieldRotation=0;
let animationStarted=false;


window.onload=function(){
    board=this.document.getElementById("board");
    board.height=boardHeight;
    board.width=boardWidth;
    context=board.getContext("2d");

    //draw flappy bird
    //context.fillStyle="green";
    //context.fillRect(birdImg,bird.x,bird.y,bird.width,bird.height);

    oasisBg=new Image();
    oasisBg.src="./flappybirdbg.png";
    // oasisBg.onload=function(){
    //     bgX=0;
    //     bgX2=boardWidth;
    // }

    oasisTopPipe=new Image();
    oasisTopPipe.src="./toppipe.png";
    
    oasisBottomPipe=new Image();
    oasisBottomPipe.src="./bottompipe.png";


    desertBg=new Image();
    desertBg.src="./desert_bg1.jpg";
    // desertBg.onload=function(){
    //     bgX=0;
    //     bgX2=boardWidth;
    // }

    desertTopPipe=new Image();
    desertTopPipe.src="./dessert_pipe_top.png";

    desertBottomPipe=new Image();
    desertBottomPipe.src="./dessert_pipe_bottom.png";


    birdImg1=new Image();
    birdImg1.src="./flappybird0.png";

    birdImg2=new Image();
    birdImg2.src="./flappybird1.png";

    birdImg3=new Image();
    birdImg3.src="./flappybird2.png";

    birdImg4=new Image();
    birdImg4.src="./flappybird3.png";

    birdFrames=[birdImg1,birdImg2,birdImg3,birdImg4];
    // birdImg.onload=function(){
    //     context.drawImage(birdImg,bird.x,bird.y,bird.width,bird.height);
    // }


    jumpSound.src = "./sfx_wing.wav";
    scoreSound.src = "./sfx_point.wav";
    hitSound.src = "./sfx_hit.wav";
    dieSound.src = "./sfx_die.wav";

    bgMusic.src = "./bgflappybird.mp3";
    coinSound.src = "./sfx_point.wav";
    powerupSound.src="./sfx_swooshing.wav";

    bgMusic.loop=true;
    bgMusic.volume=0.3;

    totalCoins=parseInt(localStorage.getItem('totalCoins')) || 0;
    updateCoinDisplay();

    // document.getElementById("totalCoinsDisplay").style.display="block";

    if(this.document.getElementById("themePopup")){
        this.document.getElementById("themePopup").style.display="block";
    }

    if(this.document.getElementById("difficultyMenu")){
        this.document.getElementById("difficultyMenu").style.display="none";
    }
    if(this.document.getElementById("difficultyMenu")){
        this.document.getElementById("difficultyMenu").style,display="none"
    }
    if(this.document.getElementById("instructions")){
        this.document.getElementById("instructions").style.display="none";
    }
    if(this.document.getElementById("pauseMenu")){
        this.document.getElementById("pauseMenu").style.display="none";
    }
    if(this.document.getElementById("gameOverPopup")){
        this.document.getElementById("gameOverPopup").style.display="none";
    }

    // requestAnimationFrame(update);
    // setInterval(placePipes,1500); //every 1.5 seconds
    this.document.addEventListener("keydown",handleKeyPress);

    this.document.getElementById("startBtn").addEventListener("click",startGame);
    this.document.getElementById("restartBtn").addEventListener("click",restartGame);

    this.document.getElementById("oasisBtn").addEventListener("click",()=>selectTheme("oasis"));
    this.document.getElementById("desertBtn").addEventListener("click",()=>selectTheme("desert"));

    this.document.getElementById("easyBtn").addEventListener("click",()=>setDifficulty("easy"));
    this.document.getElementById("mediumBtn").addEventListener("click",()=>setDifficulty("medium"));
    this.document.getElementById("hardBtn").addEventListener("click",()=>setDifficulty("hard"));

    this.document.getElementById("resumeBtn").addEventListener("click",togglePause);
}


function selectTheme(theme){
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

    document.getElementById("themePopup").style.display="none";
    document.getElementById("startBtn").style.display="block";
    document.getElementById("difficultyMenu").style.display="block";

    if(!animationStarted){
        animationStarted=true;
        requestAnimationFrame(update);
    }
}

let pipeInterval;
let coinInterval;
let powerupInterval;

function updateCoinDisplay(){
    if(document.getElementById("mainCoinDisplay")){
        document.getElementById("mainCoinDisplay").innerText=totalCoins;
    }
}

function setDifficulty(level){
    difficulty=level;

    if(level==="easy"){
        baseVelocityX=-1.5;
        velocityX=-1.5;
        pipeGap=boardHeight/3;
        gravity=0.1;
    }
    else if(level==="medium"){
        baseVelocityX=-2;
        velocityX=-2;
        pipeGap=boardHeight/4;
        gravity=0.15;
    }
    else if(level==="hard"){
        baseVelocityX=-3;
        velocityX=-3;
        pipeGap=boardHeight/5;
        gravity=0.2;
    }

    document.querySelectorAll(".difficulty-btn").forEach(btn=> {
        btn.classList.remove("active");
    });
    document.getElementById(level+"Btn").classList.add("active");
}

function startGame(){
    if(!gameStarted){
        gameStarted=true;
        gameReady=false;
        bgX=0;
        bgX2=boardWidth;
        currentFrame=0;
        frameCount=0;
        lastMileStone=0;
        isNewHighScore=false;
        hitSoundPlayed=false;
        dieSoundPlayed=false;
        sessionCoins=0;
        shieldRotation=0;
        
        if(currentTheme==="oasis"){
            bgColor='#70c5ce';
        }
        else{
            bgColor='#f4a460';
        }

        document.body.style.backgroundColor=bgColor;

        hasShield=false;
        hasSlowMotion=false;
        hasDoublePoints=false;
        hasMagnet=false;
        slowMotionTimer=0;
        doublePointsTimer=0;
        magnetTimer=0;

        document.getElementById("startBtn").style.display="none";
        document.getElementById("difficultyMenu").style.display="none";
        document.getElementById("instructions").style.display="block";
        // pipeInterval=setInterval(placePipes,1500);
        playSound(bgMusic);
    }
}

function restartGame(){
    bird.y=birdY;
    bird.x=birdX;
    pipeArray=[];
    coinArray=[];
    powerupArray=[];
    score=0;
    gameOver=false;
    velocityY=0;
    gameStarted=true;
    gameReady=false;
    gamePaused=false;
    bgX=0;
    bgX2=boardWidth;
    currentFrame=0;
    frameCount=0;
    lastMileStone=0;
    isNewHighScore=false;
    hitSoundPlayed=false;
    dieSoundPlayed=false;
    sessionCoins=0;
    shieldRotation=0;

    if(currentTheme==="oasis"){
        bgColor='#70c5ce';
    }
    else if(currentTheme==='desert'){
        bgColor='#f4a460'
    }

    document.body.style.backgroundColor=bgColor;
    
    hasShield=false;
    hasSlowMotion=false;
    hasDoublePoints=false;
    hasMagnet=false;
    slowMotionTimer=0;
    doublePointsTimer=0;
    magnetTimer=0;

    velocityX=baseVelocityX;

    document.getElementById("gameOverPopup").style.display="none";
    document.getElementById("instructions").style.display="block";

    clearInterval(pipeInterval);
    clearInterval(coinInterval);
    clearInterval(powerupInterval);
    // pipeInterval=setInterval(placePipes,1500);
    playSound(bgMusic);
}

function togglePause(){
    if(!gameStarted || gameOver){
        return;
    }

    gamePaused=!gamePaused;

    if(gamePaused){
        document.getElementById("pauseMenu").style.display="block";
        bgMusic.pause();
    }
    else{
        document.getElementById("pauseMenu").style.display="none";
        playSound(bgMusic);
    }
}

function playSound(audio){
    audio.currentTime=0;
    audio.play().catch(e=>console.log(e));
}

function handleKeyPress(e){
    if(e.code=="KeyP"){
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


    if((e.code=="Space" || e.code=="ArrowUp" || e.code=="KeyX") && gameStarted && !gameOver && !gamePaused){
        if(!gameReady){
            gameReady=true;
            velocityY=0;
            document.getElementById("instructions").style.display="none";
            pipeInterval=setInterval(placePipes,1500);
            coinInterval=setInterval(placeCoins,2000);
            powerupInterval=setInterval(placePowerups,3000);
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

    let coinY=Math.random()*(boardHeight-200)+100;

    let coin={
        x:boardWidth,
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
    let powerupY=Math.random()*(boardHeight-250)+125;

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

function activePowerup(type){
    playSound(powerupSound);

    if(type==="shield"){
        hasShield=true;
        showPowerupMessage("🛡️ Shield Activated!");
    }
    else if(type==="slowmotion"){
        hasSlowMotion=true;
        slowMotionTimer=300;
        velocityX=baseVelocityX/2;
        showPowerupMessage("⏳ Slow Motion!");
    }
    else if(type==="doublepoints"){
        hasDoublePoints=true;
        doublePointsTimer=300;
        showPowerupMessage("✨ Double Points!");
    }
    else if(type==="magnet"){
        hasMagnet=true;
        magnetTimer=300;
        showPowerupMessage("🧲 Magnet!");
    }
}

let powerupMessage="";
let powerupMessageTimer=0;

function showPowerupMessage(msg){
    powerupMessage=msg;
    powerupMessageTimer=60;
}


function update(){
    requestAnimationFrame(update);

    if(!bgImg || !topPipeImg || !bottomPipeImg){
        return;
    }
    document.body.style.backgroundColor=bgColor;
    context.clearRect(0,0,board.width,board.height);

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

        context.fillStyle="white";
        context.font="45px sans-serif";
        context.fillText("🪙 "+Math.floor(score),10,45);
        context.font="25px sans-serif";
        context.fillText("Best: "+Math.floor(highScore),10,80);
        context.fillText("Coins: "+Math.floor(totalCoins),10,110);

        return;
    }

    if(hasSlowMotion && slowMotionTimer>0){
        slowMotionTimer--;
        if(slowMotionTimer==0){
            hasSlowMotion=false;
            velocityX=baseVelocityX;
        }
    }

    if(hasDoublePoints && doublePointsTimer>0){
        doublePointsTimer--;
        if(doublePointsTimer==0){
            hasDoublePoints=false;
        }
    }

    if(hasMagnet && magnetTimer>0){
        magnetTimer--;
        if(magnetTimer===0){
            hasMagnet=false;
        }
    }

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

    if(hasShield){
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
        context.drawImage(birdFrames[currentFrame],bird.x,bird.y,bird.width,bird.height);
    }

    if(bird.y>board.height && !gameOver && gameReady){
        gameOver=true;
        if(!dieSoundPlayed){
            playSound(dieSound);
            dieSoundPlayed=true;
        }
        bgMusic.pause();
        bgMusic.currentTime=0;
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

                if(distance<200){
                    coin.x+=dx*0.1;
                    coin.y+=dy*0.1;

                    context.strokeStyle="rgba(255, 215, 0, 0.7)";
                    context.lineWidth=2;
                    context.beginPath();
                    context.moveTo(bird.x+bird.width/2,bird.y+bird.height/2);
                    context.lineTo(coin.x+coin.width/2,coin.y+coin.height/2);
                    context.stroke();
                }
            }

            if(!coin.collected){

                context.save();
                context.translate(coin.x+coin.width/2,coin.y+coin.height/2);
                context.rotate(coin.rotation);

                context.fillStyle="rgba(0,0,0,0.3)";
                context.beginPath();
                context.ellipse(2,2,coinWidth/2,coinHeight/2,0,0,Math.PI*2);
                context.fill();


                context.fillStyle = "#FFD700";
                context.strokeStyle = "#FFA500";
                context.lineWidth=3;
                context.beginPath();
                context.arc(0,0,coinWidth/2,0,Math.PI*2);
                context.fill();
                context.stroke();

                context.fillStyle="#FFA500";
                context.beginPath();
                context.arc(0,0,coinWidth/4,0,Math.PI*2);
                context.fill();

                context.fillStyle="#FFA500";
                context.font="bold 18px Arial";
                context.textAlign="center";
                context.textBaseline="middle";
                context.fillText("$",0,0);
                context.restore();
            }

            if(!coin.collected && detectCollision(bird,coin)){
                coin.collected=true;
                score+=3;
                sessionCoins++;
                totalCoins++;
                localStorage.setItem('totalCoins',totalCoins);
                updateCoinDisplay();

                playSound(coinSound)
                createCoinParticles(coin.x,coin.y);
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
                context.shadowBlur=0;

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
                let points=hasDoublePoints?1:0.5;
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


            if(detectCollision(bird,pipe) && !gameOver){
                if(hasShield){
                    hasShield=false;
                    showPowerupMessage("🛡️ Shield Lost!");
                    playSound(powerupSound);
                    createShieldBreakEffect();
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
                }
                
            }
        }
        
        while (pipeArray.length>0 && pipeArray[0].x<-pipeWidth){
            pipeArray.shift(); 
        }
    }

    if(gameStarted  && gameOver){
        for(let i=0;i<pipeArray.length;i++){
            let pipe=pipeArray[i];
            context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);
        }
    }

    
    context.fillStyle="white";
    context.strokeStyle="black";
    context.lineWidth=3;
    context.font="45px sans-serif";
    context.fillText("🪙 "+Math.floor(score),10,45);
    context.strokeText("🪙 "+Math.floor(score),10,45);


    context.font="25px sans-serif";
    context.strokeText("Best: "+Math.floor(highScore),10,80);
    context.fillText("Best: "+Math.floor(highScore),10,80);
    context.strokeText("Coins: 💰 "+Math.floor(totalCoins),10,110);
    context.fillText("Coins: 💰 "+Math.floor(totalCoins),10,110);
    
    let powerupY=150;
    context.font="20px sans-serif";
    context.fillStyle="white";
    // context.strokeStyle="black";
    // context.lineWidth=2;

    if(hasShield){
        context.strokeText("🛡️ Shield",10,powerupY);
        context.fillStyle="cyan";
        context.fillText("🛡️ Shield",10,powerupY);
        context.fillStyle="white";
        powerupY+=30;
    }
    if(hasSlowMotion){
        let timeLeft=Math.ceil(slowMotionTimer/60);
        context.strokeText("⏳ Slow Motion: "+timeLeft+"s",10,powerupY);
        context.fillStyle="#9370DB";
        context.fillText("⏳ Slow Motion: "+timeLeft+"s",10,powerupY);
        context.fillStyle="white";
        powerupY+=30;
    }
    if(hasDoublePoints){
        let timeLeft=Math.ceil(doublePointsTimer/60);
        context.strokeText("⚡ Double Points: "+timeLeft+"s",10,powerupY);
        context.fillStyle="gold";
        context.fillText("⚡ Double Points: "+timeLeft+"s",10,powerupY);
        context.fillStyle="white";
        powerupY+=30;
    }
    if(hasMagnet){
        let timeLeft=Math.ceil(magnetTimer/60);
        context.strokeText("🧲 Magnet: "+timeLeft+"s",10,powerupY);
        context.fillStyle="hotpink";
        context.fillText("🧲 Magnet: "+timeLeft+"s",10,powerupY);
        context.fillStyle="white";
        powerupY+=30;
    }

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

    if(powerupMessageTimer>0){
        context.fillStyle="cyan";
        context.font="bold 35px sans-serif";
        context.textAlign="center";
        context.strokeStyle="black";
        context.lineWidth=4;
        context.strokeText(powerupMessage,board.width/2,board.height/2+100);
        context.fillText(powerupMessage,board.width/2,board.height/2+100);
        context.textAlign="left";
        powerupMessageTimer--;

    }


    if(gameOver){
        document.getElementById("gameOverPopup").style.display="block";
        document.getElementById("finalScore").innerText=Math.floor(score);
        document.getElementById("sessionCoins").innerText=Math.floor(sessionCoins);
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

let coinParticles=[];

function createCoinParticles(x,y){
    for(let i=0;i<8;i++){
        coinParticles.push({
            x:x,
            y:y,
            vx:(Math.random()-0.5)*4,
            vy:(Math.random()-0.5)*4,
            life:20,
            color:"#FFD700"
        });
    }
}

function createShieldBreakEffect(){
    for(let i=0;i<12;i++){
        coinParticles.push({
            x:bird.x+bird.width/2,
            y:bird.y+bird.height/2,
            vx:Math.cos(i*Math.PI/6)*5,
            vy:Math.sin(i*Math.PI/6)*5,
            life:30,
            color:"#00BFFF"
        })
    }
}

function placePipes(){
    if(gameOver || !gameStarted){
        return;
    }

    //(0.1)*pipeheight/2.
    //0->-128 (pipeHeight/4)
    //1->-128-256(pipeHeight/4-pipeheight/2)=-3/4 pipeHeight

    let randomPipeY=pipeY-pipeHeight/4-Math.random()*(pipeHeight/2);

    let openingSpace=pipeGap;

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
