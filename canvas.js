let canvas = document.getElementById('mycanvas');
let pen = canvas.getContext('2d');

let currentTool ='pencil' ;
let isDrawing = false ;
let startX, startY, currentX, currentY ;
let currentColor = "black";
let currentLineWidth = 1;



// //*********  Standard DATA- OBJECT  for all shapes rectangle,circle/ellipse.line)*******************/
// {
//   type: "rectangle | ellipse | line | triangle | freehand",
//   x: number,
//   y: number,
//   width: number,
//   height: number,
//   points: []   // only used for lines/freehand
//   color: "black"
// }
//****************************/
// ---------------- TOOL SELECT ----------------

let navbar = document.querySelector('.navbar');

navbar.addEventListener('change', (e)=>{
    if(e.target.id === "colorPicker"){
        currentColor = e.target.value;
    }

    if(e.target.id === "brushSize"){
        currentLineWidth = Number(e.target.value) ;
    }
});

navbar.addEventListener("click",(e)=>{

    // Clear Canvas
    if(e.target.id === "clear"){ 
        pen.clearRect(0,0,canvas.width,canvas.height);
        allShapes = [];
    }

    //Save /Dowwnload image
    else if(e.target.id === "saveBtn"){
        const image_url = canvas.toDataURL("image/png");
        let link = document.createElement('a');
        link.href = image_url;
        link.download = "canvas-image.png"; // filename
        link.click();   // actually click after craeting <a>..
    }

     //Select Current Shape
     //  Only update tool if it's a drawing tool
    else if(["rectangle","circle","line","pencil"].includes(e.target.id)){
        currentTool = e.target.id;
    }
});

// cursor -style change
function updateCursor(){
    if(currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line'){
        canvas.style.cursor = "crosshair";
    }
    else if(currentTool === 'pencil'){
        canvas.style.cursor = "crosshair";
    }
    else{
        canvas.style.cursor = "default";
    }
}

updateCursor() ;

// ---------------- DRAW FUNCTIONS ----------------
function drawRectangle(data){
    pen.beginPath();

    pen.strokeStyle = data.color ?? 'black';
    pen.lineWidth = data.lineWidth ?? 1 ;
    pen.strokeRect( data.x, data.y,data.width,data.height);
}

function drawEllipse(data){// ellipse/circle
    let centerX = data.x +data.width /2;
    let centerY = data.y +data.height /2;

    pen.beginPath();
    pen.strokeStyle = data.color ?? "black";
    pen.lineWidth = data.lineWidth ?? 1;

    pen.ellipse(centerX, centerY, Math.abs(data.width /2), Math.abs(data.height /2),0,0, 2*Math.PI)
    pen.stroke() ;
    pen.closePath();
}

function drawTriangle( data){
    const{x, y,x1, y1, x2,y2} = data ;

    pen.beginPath();// if not written , pen color will be previous one
    pen.strokeStyle = data.color ?? "black";
    pen.lineWidth = data.lineWidth ?? 1;

    pen.moveTo(x,y);
    pen.lineTo(x1,y1);
    pen.lineTo(x2,y2);
    pen.lineTo(x,y);
    pen.stroke() ;
    pen.closePath() ;
}

function drawLine(data){
    let p1 = data.points[0] ;
    let p2 = data.points[1] ;

    pen.beginPath();
    pen.strokeStyle = data.color ?? "black";
    pen.lineWidth = data.lineWidth ?? 1;
    pen.moveTo(p1.x, p1.y);
    pen.lineTo(p2.x, p2.y);
    pen.stroke();
    pen.closePath();

}
//free-hand function, call after MouseUp-->USES STORED DATA 
function drawFreeHand(data ){
    let points = data.points ; //array of points
    if(points.length === 0) return ;

    pen.beginPath();
    pen.strokeStyle = data.color ?? "black";
    pen.lineWidth = data.lineWidth ?? 1;
    pen.moveTo(points[0].x, points[0].y);
    for(let i=1; i<points.length; i++){
        pen.lineTo(points[i].x, points[i].y);
    }
    pen.stroke();
    pen.closePath();
}

let allShapes =[] ;
//preview function
function renderShapes(){
    pen.clearRect(0,0,canvas.width, canvas.height) ;
    allShapes.forEach( data =>{
        if(data.type === 'rectangle'){
            drawRectangle(data) ;
        }
        else if(data.type ==='line'){
            drawLine(data);
        }
        else if(data.type ==='triangle'){
            drawTriangle(data);
        }
        else if (data.type === 'ellipse'){
            drawEllipse(data);
        }
        else if(data.type === 'freehand'){
            drawFreeHand(data);
        }
    })
}

//------ LIVE -PREVIEW   (While dragging mouse,Fast, dynamic, incomplete data )-----
function temporaryDraw(points, color, lineWidth){
    if(points.length === 0) return ;

    pen.beginPath();
    pen.strokeStyle = color ;
    pen.lineWidth = lineWidth ;
    pen.moveTo(points[0].x, points[0].y);
    for(let i =1;i<points.length ; i++){
        pen.lineTo(points[i].x, points[i].y)
    }
    pen.stroke();
    pen.closePath() ;
}

// -------------  MOUSE EVENTS  ----------------------
let freeHandPoints =[] ;


canvas.addEventListener('mousedown', (e)=>{
    console.log(e);
    isDrawing = true;
    freeHandPoints =[];

    startX = e.offsetX;
    startY =e.offsetY ;
})

//Mouse move preview
canvas.addEventListener('mousemove', (e)=>{
    
    if( !isDrawing) return ;
    currentX = e.offsetX;
    currentY = e.offsetY ;

    let width =  currentX - startX ;
    let height = currentY- startY ;

    let x = startX ;
    let y = startY ;

    if(width < 0){
        x = currentX ;
        width = Math.abs(width) ;
    }
    if(height < 0){
        y = currentY ;
        height = Math.abs(height);
    }

    renderShapes(); //1) RE-PAINT entire canvas with previous things...

    //2) LIVE - draw acc to shapes-(rectangle/circle/ellipse/line/freeHand)
    if(currentTool === 'rectangle'){
        pen.strokeStyle =currentColor;
        pen.lineWidth = currentLineWidth ;
        pen.strokeRect(x,y, width, height);
    }
    else if(currentTool === 'circle'){
        pen.beginPath();
        pen.strokeStyle = currentColor;
        pen.lineWidth = currentLineWidth;
        pen.ellipse(x +width/2, y+height/2, Math.abs(width/2), Math.abs(height/2), 0, 0, 2*Math.PI);
        pen.stroke();
    }
    else if(currentTool === 'pencil'){
        if(!isDrawing) return ;
        pen.strokeStyle = currentColor;
        pen.lineWidth = currentLineWidth;
        freeHandPoints.push({x: e.offsetX, y: e.offsetY})
        temporaryDraw(freeHandPoints,currentColor, currentLineWidth) ;
    }
    else if(currentTool === 'line'){
        pen.beginPath();
        pen.strokeStyle = currentColor;
        pen.lineWidth = currentLineWidth;
        pen.moveTo(startX, startY);
        pen.lineTo(currentX, currentY);
        pen.stroke();
    }
    // else if(currentTool === 'arrow'){

    // }
})
//Mouse up (store shape)
canvas.addEventListener('mouseup', (e)=>{
    isDrawing = false ;
    currentX = e.offsetX;
    currentY = e.offsetY;

    let width =  currentX - startX ;
    let height = currentY- startY ;

    let x = startX ;
    let y = startY ;

    if(width < 0){
        x = currentX ;
        width = Math.abs(width) ;
    }
    if(height < 0){
        y = currentY ;
        height = Math.abs(height);
    }
    
    if(currentTool === 'rectangle'){
        allShapes.push({
            type: 'rectangle',
            x: x ,
            y: y ,
            width: width ,
            height: height ,
            color :currentColor,
            lineWidth :currentLineWidth
        }) ;
    }
    else if(currentTool === 'circle'){
        allShapes.push({
            type: 'ellipse',
            x: x ,
            y: y ,
            width: width ,
            height: height ,
            color :currentColor,
            lineWidth :currentLineWidth
        }) ;
    }
    else if(currentTool === 'line'){
        allShapes.push({
            type: 'line',
            points : [
                {x: startX, y:startY },
                {x: currentX, y:currentY}
            ] ,
            color :currentColor,
            lineWidth :currentLineWidth
        }) ;
    }
    else if(currentTool === 'pencil'){
        allShapes.push( {
            type :'freehand',
            points: freeHandPoints,
            color: currentColor,
            lineWidth: currentLineWidth
        });
    }
    renderShapes();
})

