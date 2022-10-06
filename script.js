//input video stuff
const videoElement = document.getElementsByClassName('input_video')[0];
let videoWidth = document.getElementsByClassName('input_video')[0].clientWidth;
let videoHeight = document.getElementsByClassName('input_video')[0].clientHeight;

//annotated video stuff
const canvasElement = document.getElementsByClassName('output_canvas')[0];
const canvasCtx = canvasElement.getContext('2d');


const hands = new Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
}});
hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
hands.onResults(onResults);

function onResults(results) {
    canvasElement.width = document.getElementsByClassName('input_video')[0].clientWidth-10;
    canvasElement.height = document.getElementsByClassName('input_video')[0].clientHeight;
    
    canvasCtx.save();

    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
    if (results.multiHandLandmarks) {
        // console.log(results.multiHandLandmarks);
        for (const landmarks of results.multiHandLandmarks) {

            // console.log(landmarks);
            
            //console.log(pointer_x, pointer_y, pointer_z);
            drawBeaker(landmarks);
            // drawOnScreen(pointer_x,pointer_y,pointer_z);

            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS,
                            {color: '#00FF00', lineWidth: 3});
            drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 2});
        }
    }

    //const landmarks = results.multiLandMarks[0];
    
    canvasCtx.restore();
}

const camera = new Camera(videoElement, {
    onFrame: async () => {
    await hands.send({image: videoElement});
    },
    width: videoWidth,
    height: videoHeight,
});
camera.start();

let lastX=0, lastY=0;

function drawBeaker (landmarks) {
    let drawCanv = document.getElementById('drawing_canvas');
    drawCanv.width = document.getElementsByClassName('drawing_container')[0].clientWidth;
    drawCanv.height = document.getElementsByClassName('drawing_container')[0].clientHeight;
    const drawCtx = drawCanv.getContext('2d');

    let pointer = {x: landmarks[9].x, y: landmarks[9].y};
    let node1 = {x: landmarks[5].x, y: landmarks[5].y}; //pointer node
    let node2 = {x: landmarks[17].x, y: landmarks[17].y}; //pinky node

    // rotation setting
    let degrees = 0;
    let nodeDX = node1.x - node2.x;
    let nodeDY = node1.y - node2.y;

    console.log(`nodeDX = ${nodeDX}, nodeDY = ${nodeDY}`);

    let nodeDistance = ((nodeDX)**2 + (nodeDY)**2)**0.5;
    let initialDegree = Math.asin(nodeDX/nodeDistance);
    if (nodeDY > 0) {
        degrees = initialDegree;
    }
    else if (nodeDY == 0) {
        degrees = 0;
    }
    else if (nodeDY < 0) {
        degrees = initialDegree;
    } else{}

    let beaker = {x:0, y:pointer.y};
    beaker.x = 0.5 - (pointer.x-0.5);
    beaker.x *= drawCanv.width;
    beaker.y *= drawCanv.height;

    drawCtx.save();
    let startX = beaker.x-10;
    let startY = beaker.y-10;
    let width = 30, height = 90;

    drawCtx.translate(startX + width/2, startY + height/2);
    drawCtx.rotate(-(degrees*180)*Math.PI/180);
    drawCtx.rect(-width/2,-height/2,width,height);
    drawCtx.fill();

    drawCtx.restore();
    
    console.log(degrees);
    //console.log(`${pointer.x}, ${pointer.y}`);
    //console.log(`${node1.x}, ${node1.y}`);
    //console.log(`${node2.x}, ${node2.y}`); //need to .x or .y to console log the values
}


function drawOnScreen(x, y, z) { //for canvases, (0,0) is top left corner
    let drawingCanvas = document.getElementById('drawing_canvas');
    drawingCanvas.width = document.getElementsByClassName('drawing_container')[0].clientWidth;
    drawingCanvas.height = document.getElementsByClassName('drawing_container')[0].clientHeight;
    const drawingCtx = drawingCanvas.getContext('2d');

    //flipping x:
    x = 0.5 - (x-0.5);

    let rX = x*drawingCanvas.width;
    let rY = y*drawingCanvas.height;
    
    // console.log(rX, rY);

    //Processing degrees

    /*
    drawingCtx.beginPath();
    if(lerp(lastX, lastY, rX, rY)){
        //drawingCtx.fillStyle = 'red';
        //drawingCtx.fillRect(rX-10,rY-10,20,20);
        drawingCtx.arc(rX+5, rY+5, 10, 0, 2 * Math.PI, false);
        drawingCtx.fillStyle = 'blue';
        drawingCtx.fill();
        drawingCtx.lineWidth = 5;
        drawingCtx.strokeStyle = '#003300';
        drawingCtx.stroke();    

        lastX = rX;
        lastY = rY;
    }
    else {
        //drawingCtx.fillStyle = 'red';
        //drawingCtx.fillRect(lastX-10,lastY-10,20,20);
        drawingCtx.arc(lastX+10, lastY+10, 20, 0, 2 * Math.PI, false);
        drawingCtx.fillStyle = 'blue';
        drawingCtx.fill();
        drawingCtx.lineWidth = 5;
        drawingCtx.strokeStyle = '#003300';
        drawingCtx.stroke();    
    }

    //drawingCtx.restore();
    */
    
    drawingCtx.save();

    if(lerp(lastX, lastY, rX, rY)) {
        drawingCtx.fillRect(rX-10,rY-10,20,20);
        lastX = rX;
        lastY = rY;
    } else {
        drawingCtx.fillRect(lastX-10,lastY-10,20,20);
    }

    drawingCtx.restore();
}

function lerp(prevX, prevY, newX, newY) {
    if(Math.abs(newX-prevX)>0.01 && Math.abs(newY-prevY)>0.01) {
        return true;
    } else {
        return false;
    }
}