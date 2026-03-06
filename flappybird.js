
//board
let board;
let boardWidth=500;
let boardHeight=640;
let context;

//background
let bgImg;
let bgX;
let bgX2=500;

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

let lastMileStone=0;
let showMilestoneMessage=false;
let milestoneMessageTimer=0;

let bgColor='#70c5ce';


window.onload=function(){
    board=this.document.getElementById("board");
    board.height=boardHeight;
    board.width=boardWidth;
    context=board.getContext("2d");

    //draw flappy bird
    //context.fillStyle="green";
    //context.fillRect(birdImg,bird.x,bird.y,bird.width,bird.height);

    bgImg=new Image();
    bgImg.src="./flappybirdbg.png";
    bgImg.onload=function(){
        bgX=0;
        bgX2=boardWidth;
    }

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

    topPipeImg=new Image();
    topPipeImg.src="./toppipe.png";

    bottomPipeImg=new Image();
    bottomPipeImg.src="./bottompipe.png";

    jumpSound.src = "./sfx_wing.wav";
    scoreSound.src = "./sfx_point.wav";
    hitSound.src = "./sfx_hit.wav";
    dieSound.src = "./sfx_die.wav";

    bgMusic.src = "./bgflappybird.mp3";

    bgMusic.loop=true;
    bgMusic.volume=0.3;

    requestAnimationFrame(update);
    // setInterval(placePipes,1500); //every 1.5 seconds
    document.addEventListener("keydown",handleKeyPress);

    document.getElementById("startBtn").addEventListener("click",startGame);
    document.getElementById("restartBtn").addEventListener("click",restartGame);

    document.getElementById("easyBtn").addEventListener("click",()=>setDifficulty("easy"));
    document.getElementById("mediumBtn").addEventListener("click",()=>setDifficulty("medium"));
    document.getElementById("hardBtn").addEventListener("click",()=>setDifficulty("hard"));

    document.getElementById("resumeBtn").addEventListener("click",togglePause);
}

let pipeInterval;

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
        bgColor='#70c5ce';
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
    bgColor='#70c5ce';

    velocityX=baseVelocityX;

    document.getElementById("gameOverPopup").style.display="none";
    document.getElementById("instructions").style.display="block";

    clearInterval(pipeInterval);
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

function update(){
    requestAnimationFrame(update);
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
        context.fillText("🪙 "+score,10,45);
        context.font="25px sans-serif";
        context.fillText("Best"+highScore,10,80);

        return;
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

    //pipes

    if(gameStarted && gameReady && !gameOver){
        for(let i=0;i<pipeArray.length;i++){
            let pipe=pipeArray[i];
            pipe.x+=velocityX;
            context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);

            if(!pipe.passed && bird.x>pipe.x+pipe.width){
                score+=0.5; 
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
            }


            if(detectCollision(bird,pipe)){
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
    context.font="45px sans-serif";
    context.fillText("🪙 "+score,10,45);
    context.font="25px sans-serif";
    context.fillText("High Score: "+highScore,10,80);

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

        if(milestoneMessageTimer<=0){
            showMilestoneMessage=false;
        }
    }


    if(gameOver){
        document.getElementById("gameOverPopup").style.display="block";
        document.getElementById("finalScore").innerText=score;

        if(isNewHighScore){
            document.getElementById("highScoreMessage").style.display="block";
        }
        else{
            document.getElementById("highScoreMessage").style.display="none";
        }
        bgMusic.pause();
        bgMusic.currentTime=0;
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
