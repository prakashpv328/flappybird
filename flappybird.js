
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

let gameOver=false;
let gameStarted=false;
let gameReady=false;
let score=0;

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

    requestAnimationFrame(update);
    // setInterval(placePipes,1500); //every 1.5 seconds
    document.addEventListener("keydown",handleKeyPress);

    document.getElementById("startBtn").addEventListener("click",startGame);
    document.getElementById("restartBtn").addEventListener("click",restartGame);

}

let pipeInterval;

function startGame(){
    if(!gameStarted){
        gameStarted=true;
        gameReady=false;
        bgX=0;
        bgX2=boardWidth;
        currentFrame=0;
        frameCount=0;
        document.getElementById("startBtn").style.display="none";
        document.getElementById("instructions").style.display="block";
        // pipeInterval=setInterval(placePipes,1500);
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
    bgX=0;
    bgX2=boardWidth;
    document.getElementById("gameOverPopup").style.display="none";
    document.getElementById("instructions").style.display="block";

    clearInterval(pipeInterval);
    // pipeInterval=setInterval(placePipes,1500);
}


function handleKeyPress(e){

    
    if((e.code=="Space" || e.code=="Enter") && document.getElementById("startBtn").style.display!="none"){
        startGame()
        return;
    }

    if((e.code=="Space" || e.code=="Enter") && gameOver){
        restartGame();
        return;
    }


    if((e.code=="Space" || e.code=="ArrowUp" || e.code=="keyX") && gameStarted && !gameOver){
        frameCount=0;
        if(!gameReady){
            gameReady=true;
            velocityY=0;
            document.getElementById("instructions").style.display="none";
            pipeInterval=setInterval(placePipes,1500);
        }
        else{
            velocityY=-4;
        }

    }
}

function update(){
    requestAnimationFrame(update);
    context.clearRect(0,0,board.width,board.height);

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

    if(bird.y>board.height){
        gameOver=true;
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
            }

            if(detectCollision(bird,pipe)){
                gameOver=true;
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

    if(gameOver){
        document.getElementById("gameOverPopup").style.display="block";
        document.getElementById("finalScore").innerText=score;
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

    let openingSpace=board.height/4;

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
