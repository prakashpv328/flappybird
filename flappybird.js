
//board
let board;
let boardWidth=500;
let boardHeight=640;
let context;

//bird
let birdWidth=34;
let birdHeight=24;
let birdX=boardWidth/8;
let birdY=boardHeight/2;
let birdImg;

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
    context=board.getContext("2d");//used for drawing on the board

    //draw flappy bird
    //context.fillStyle="green";
    //context.fillRect(birdImg,bird.x,bird.y,bird.width,bird.height);

    //load images
    birdImg=new Image();
    birdImg.src="./flappybird.png";
    birdImg.onload=function(){
        context.drawImage(birdImg,bird.x,bird.y,bird.width,bird.height);
    }

    topPipeImg=new Image();
    topPipeImg.src="./toppipe.png";

    bottomPipeImg=new Image();
    bottomPipeImg.src="./bottompipe.png";

    requestAnimationFrame(update);
    // setInterval(placePipes,1500); //every 1.5 seconds
    document.addEventListener("keydown",moveBird);

    document.getElementById("startBtn").addEventListener("click",startGame);
    document.getElementById("restartBtn").addEventListener("click",restartGame);

}

let pipeInterval;

function startGame(){
    if(!gameStarted){
        gameStarted=true;
        gameReady=false;
        document.getElementById("startBtn").style.display="none";
        document.getElementById("instructions").style.display="block";
        pipeInterval=setInterval(placePipes,1500);
    }
}

function restartGame(){
    bird.y=birdY;
    pipeArray=[];
    score=0;
    gameOver=false;
    velocityY=0;
    gameStarted=true;
    document.getElementById("gameOverPopup").style.display="none";
    document.getElementById("instructions").style.display="block";

    clearInterval(pipeInterval);
    // pipeInterval=setInterval(placePipes,1500);
}

function update(){
    requestAnimationFrame(update);
    context.clearRect(0,0,board.width,board.height);

    //bird
    if(gameStarted && gameReady && !gameOver){
        velocityY+=gravity;
        bird.y=Math.max(bird.y+velocityY,0); //apply gravity to current bird.y limit the bird.y to top of the canvas
    }

    context.drawImage(birdImg,bird.x,bird.y,bird.width,bird.height);

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
                score+=0.5; //0.5 because there are 2 pipes,top and biottom ! so when the bird passes the top pipe it will add 0.5 and when it passes the bottom pipe it will add another 0.5 and total score will be 1 ;0.5*2=1
                pipe.passed=true;
            }

            if(detectCollision(bird,pipe)){
                gameOver=true;
            }
        }

        //clear pipes
        while (pipeArray.length>0 && pipeArray[0].x<-pipeWidth){
            pipeArray.shift(); //remove first element from the array
        }
    }

    if(gameStarted  && gameOver){
        for(let i=0;i<pipeArray.length;i++){
            let pipe=pipeArray[i];
            context.drawImage(pipe.img,pipe.x,pipe.y,pipe.width,pipe.height);
        }
    }

    

    //score with coin icon
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

function moveBird(e){
    if((e.code=="Space" || e.code=="ArrowUp" || e.code=="keyX" ) && gameStarted && !gameOver){
        velocityY=-4;  //jump
    }

    if(!gameReady){
        gameReady=true;
        document.getElementById("instructions").style.display="none";
        pipeInterval=setInterval(placePipes,1500);
    }
}

function detectCollision(a,b){
    return a.x<b.x+b.width &&  //a's top leftcorner is to the left of b's top right corner
           a.x+a.width>b.x &&  //a's top right corner passes b's top left corner
           a.y<b.y+b.height && //a's top left corner is above b's bottom left corner
           a.y+a.height>b.y   //a's bottom left corner passes b's top left corner
}


