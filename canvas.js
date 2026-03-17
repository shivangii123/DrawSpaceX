let canvas = document.getElementById('mycanvas');
let pen = canvas.getContext('2d');


//============== GLOBAL Variables ================
let currentTool ='pencil' ;
let isDrawing = false ;
let startX, startY, currentX, currentY ;
let currentColor = "black";
let currentLineWidth = 1;
let allowedTools = ["rectangle","rhombus","circle","arrow","line","pencil","eraser"];
let mouseX = 0, mouseY = 0;
let isErasing = false;
let eraserSize = 5 ; 

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
        eraserSize = Math.max(10, currentLineWidth * 5);
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
    else if(allowedTools.includes(e.target.id)){
        currentTool = e.target.id;
        updateCursor() ;
    }
});

// cursor -style change
function updateCursor(){
    if(['rectangle','circle','line','rhombus','arrow','pencil'].includes(currentTool)){
        canvas.style.cursor = "crosshair";
    }
    else{
        canvas.style.cursor = "default";
    }
}


//----------------- Eraser helpers----------------

function isPointInsideShape(x, y, shape){

    // RECTANGLE / ELLIPSE / RHOMBUS (use bounding box)
    if(shape.x !== undefined){
        return (
            x >= shape.x - eraserSize &&
            x <= shape.x + shape.width + eraserSize &&
            y >= shape.y - eraserSize &&
            y <= shape.y + shape.height + eraserSize
        );
    }

    // LINE / ARROW
    if(shape.points && shape.points.length === 2){
        let p1 = shape.points[0];
        let p2 = shape.points[1];

        return distanceToLine(x, y, p1, p2) < eraserSize;
    }

    // FREEHAND
    if(shape.points && shape.points.length > 2){
        for(let i = 0; i < shape.points.length; i++){
            let p = shape.points[i];
            let dist = Math.hypot(x - p.x, y - p.y);
            if(dist < eraserSize) return true;
        }
    }

    return false;
}


function distanceToLine(px, py, p1, p2){
    let A = px - p1.x;
    let B = py - p1.y;
    let C = p2.x - p1.x;
    let D = p2.y - p1.y;

    let dot = A * C + B * D;
    let len_sq = C * C + D * D;
    let param = dot / len_sq;

    let xx, yy;

    if(param < 0){
        xx = p1.x;
        yy = p1.y;
    } else if(param > 1){
        xx = p2.x;
        yy = p2.y;
    } else {
        xx = p1.x + param * C;
        yy = p1.y + param * D;
    }

    return Math.hypot(px - xx, py - yy);
}

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

function drawRhombus(data){
    let {x, y, width, height} = data;

    let cx = x + width/2;
    let cy = y + height/2;

    pen.beginPath();
    pen.strokeStyle = data.color ?? "black";
    pen.lineWidth = data.lineWidth ?? 1;

    pen.moveTo(cx, y);               // top
    pen.lineTo(x + width, cy);       // right
    pen.lineTo(cx, y + height);      // bottom
    pen.lineTo(x, cy);               // left
    pen.closePath();

    pen.stroke();
}
function drawArrow(data){
    let p1 = data.points[0];
    let p2 = data.points[1];

    let angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

    let headLength = 10;

    pen.beginPath();
    pen.strokeStyle = data.color ?? "black";
    pen.lineWidth = data.lineWidth ?? 1;

    // main line
    pen.moveTo(p1.x, p1.y);
    pen.lineTo(p2.x, p2.y);

    // arrow head
    pen.lineTo(
        p2.x - headLength * Math.cos(angle - Math.PI/6),
        p2.y - headLength * Math.sin(angle - Math.PI/6)
    );

    pen.moveTo(p2.x, p2.y);

    pen.lineTo(
        p2.x - headLength * Math.cos(angle + Math.PI/6),
        p2.y - headLength * Math.sin(angle + Math.PI/6)
    );

    pen.stroke();
}

let allShapes =[] ;
//preview function
function renderShapes(){
    pen.clearRect(0,0,canvas.width, canvas.height) ;
    allShapes.forEach( data =>{
        if(data.type === 'rectangle') drawRectangle(data) ;
        
        else if(data.type ==='line') drawLine(data);
        
        else if(data.type ==='triangle') drawTriangle(data);
        
        else if (data.type === 'ellipse') drawEllipse(data);
        
        else if(data.type === 'freehand') drawFreeHand(data);
        
        else if(data.type === 'rhombus') drawRhombus(data);
        
        else if(data.type === 'arrow') drawArrow(data);
    })
    // draw eraser TOOL
    if(currentTool === 'eraser'){
        pen.beginPath();
        pen.arc(mouseX, mouseY, eraserSize, 0, 2*Math.PI);

        // glow effect
        pen.strokeStyle = "black";
        pen.lineWidth = 2;

        pen.fillStyle = "rgba(0,0,0,0.05)";
        pen.fill();
        // pen.shadowColor = "rgba(0,0,0,0.3)";
        pen.shadowColor ="transparent";
        pen.shadowBlur = 10;

        pen.stroke();

        // reset shadow
        pen.shadowBlur = 0;
    }       
    
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

// -------------  MOUSE EVENTS LISTENERS  ----------------------
let freeHandPoints =[] ;


canvas.addEventListener('mousedown', (e)=>{

    if(currentTool === 'eraser'){
        isErasing = true;
        return ; // stop drawing logic
    }

    // normal drawing starts...
    isDrawing = true;
    freeHandPoints =[];

    startX = e.offsetX;
    startY =e.offsetY ;
});

//Mouse move preview
canvas.addEventListener('mousemove', (e)=>{

    // for eraser icon
    mouseX = e.offsetX;  
    mouseY = e.offsetY; 
    
    // always re-render if eraser selected
    if(currentTool === 'eraser'){

        if(isErasing){
            allShapes = allShapes.filter(shape =>
                !isPointInsideShape(mouseX, mouseY, shape)
            );
        }

        renderShapes();
        return;
}

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
    else if(currentTool === 'rhombus'){
        pen.beginPath();
        pen.strokeStyle = currentColor;
        pen.lineWidth = currentLineWidth;

        let cx = x + width/2;
        let cy = y + height/2;

        pen.moveTo(cx, y);
        pen.lineTo(x + width, cy);
        pen.lineTo(cx, y + height);
        pen.lineTo(x, cy);
        pen.closePath();

        pen.stroke();
    }
    else if(currentTool === 'arrow'){  // PREVIEW
        drawArrow({
            points: [
                {x: startX, y: startY},
                {x: currentX, y: currentY}
            ],
            color: currentColor,
            lineWidth: currentLineWidth
    });
}
})
//Mouse up (store shape)
canvas.addEventListener('mouseup', (e)=>{
    if(currentTool === 'eraser'){
        isErasing = false;
        return ; // stop shape creation
    }

    //-------- DRAWING logic starts------
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
            x ,y,width,height ,
            color :currentColor,
            lineWidth :currentLineWidth
        }) ;
    }
    else if(currentTool === 'circle'){
        allShapes.push({
            type: 'ellipse',
            x ,y,width,height ,
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
    else if(currentTool === 'rhombus'){
        allShapes.push({
            type: 'rhombus',
            x, y, width, height,
            color: currentColor,
            lineWidth: currentLineWidth
        });
    }
    else if(currentTool === 'arrow'){
        allShapes.push({
            type: 'arrow',
            points: [
                {x: startX, y:startY},
                {x: currentX, y:currentY}
            ],
            color: currentColor,
            lineWidth: currentLineWidth
        });
    }
    
    renderShapes();
})



/////////////////////////////////////////////////
