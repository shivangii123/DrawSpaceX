
let canvas = document.querySelector('#myCanvas'); // drawing area
let pen = canvas.getContext('2d');


// //-------------------- FREE-Hand drawing -----------------------------

// let isDrawing = false ;

// canvas.addEventListener('mousedown', (e)=>{
//     isDrawing = true ;

//     pen.beginPath();
//     pen.moveTo(e.offsetX, e.offsetY); // mouse position relative to the event target element
    
//     // ****** If offsetX/Y fails-> for realtime cordinates use.. ********
//     // ***** clientX → mouse position relative to the viewport *********
//     // **** rect.left → canvas position relative to viewport   *********
//     // const rect = canvas.getBoundingClientRect();
//     // const x = e.clientX - rect.left; //->>canvasX = mouseX - canvasLeft
//     // const y = e.clientY - rect.top;  //->>canvasY = mouseY - canvasTop
//     // pen.moveTo(x,y);
//     ////////////////////////////////////////
   
// })

// canvas.addEventListener('mousemove', (e)=>{
//     if(!isDrawing) return ;

//     pen.lineTo(e.offsetX, e.offsetY);
//     pen.stroke();
// })
// canvas.addEventListener('mouseup',(e)=>{   // mouse released inside canvas
//     isDrawing= false ;})
// canvas.addEventListener('mouseleave', (e)=>{ //cursor leaves canvas area while still pressing mouse
//     isDrawing = false ;
// })


//----------------- Color Picker -----------------------------
let colorPicker = document.querySelector('#colorPicker');
colorPicker.addEventListener('change', (e)=>{
    pen.strokeStyle = e.target.value ;
})

//----------------- Brush Size/Thickness ---------------------------
let brushSize = document.querySelector('#brushSize');
brushSize.addEventListener('change', (e)=>{
    pen.lineWidth = e.target.value ;
})

//----------------- Clear canvas ---------------------------
let resetBtn = document.querySelector('#resetBtn');
resetBtn.addEventListener('click', (e)=>{
    pen.clearRect(0,0,canvas.width,canvas.height);
})

//----------------- Save/download image ---------------------------
let saveBtn = document.querySelector('#saveBtn');
saveBtn.addEventListener('click', (e)=>{
    const image_url = canvas.toDataURL("image/png");

    let link = document.createElement('a');
    link.href= image_url;
    link.download ="canvas-image.png"; // filename
    link.click(); // actually click after craeting <a>..
})

//----------------------- Dynamic- Shapes----------------------


    let currentTool = 'Pencil';
    isDrawing = false ;
    let startX, startY , currentX, currentY;

    let shapes = [] ;


    document.querySelector('.navbar')
    .addEventListener('click', (e)=>{
        currentTool = e.target.id;
    })


    // Render-function
    function render(){

        pen.clearRect(0,0,canvas.width, canvas.height); // 1) clear canvas

        for(let shape of shapes){ //2) loop over shapes array :
            if(shape.type === 'rectangle'){ // if : rectangle -> pen,drawRect
                pen.strokeRect(shape.x, shape.y, shape.width, shape.height );

            }
            else if (shape.type === 'circle'){ //if circle -> pen.arc
                pen.beginPath();
                pen.arc(shape.x, shape.y, 30, 0, 2* Math.PI );
                pen.stroke() ;
            }
        }
    }

    canvas.addEventListener('mousedown',(e)=>{
        if(currentTool === 'pencil'){
            isDrawing = true;
            
            pen.beginPath(); // naya pen lelo , change color
            pen.moveTo(e.offsetX, e.offsetY);
        }
        else if(currentTool ===  'rectangle' ){
            isDrawing = true ,
            startX = e.offsetX;
            startY = e.offsetY ;

        }
        else if(currentTool ===  'circle' ){
            isDrawing = true ;
            x = e.offsetX,
            y = e.offsetY
            console.log(e);
        }
    })

    canvas.addEventListener('mousemove', (e)=>{

        if(currentTool === 'pencil'){

            if(!isDrawing) {return ;}
    
            pen.lineTo(e.offsetX, e.offsetY);
            pen.stroke();
        }

        //Mousemove->> dragging-> Temporary Rectgl appears and stretches
        else if(currentTool === 'rectangle' && isDrawing){
            currentX = e.offsetX ;
            currentY = e.offsetY ;       
            
            render();
            // just a preview of Rectngl , not storing it 
            pen.strokeRect(startX, startY, currentX -startX, currentY- startY )
        }
        else if (currentTool === 'circle' && isDrawing){
            
        }
    })

    canvas.addEventListener('mouseup', (e)=>{

        if(currentTool === 'pencil'){
                isDrawing = false;

            // let freeDrawObj ={
            //     type :"stroke" ,
            //     points :[
            //         {x:10,y:20},
            //         {x:12,y:22},
            //         {x:14,y:25}
            //     ]
            // }  
            shapes.push(freeDrawObj)  
        }

        //MouseUp ->> rectangle permanent, store
        else if(currentTool === 'rectangle'){

            width = currentX - startX ;
            height = currentY - startY ;
            

            let rectangle =  {  // create a shape object(Rectangle)
                type: "rectangle",
                x : startX,
                y : startY,
                width: width,
                height : height
            }
            shapes.push(rectangle); // Now rectangle exists in memory, not just on pixels
            render() ; //render() will draw shapes every time
            isDrawing = false;

        }

        else if (currentTool === 'circle'){
            shapes.push(
                {
                    type: "circle",
                    centerX :startX,
                    centerY :startY,
                    // radius: radius 
                }
            )
            render();
        }
        else if(currentTool === 'Arrow'){
            shapes.push(
                { type :"arrow",
                    x1 :startX,
                    y1 :startY,
                    x2 :currentX,
                    y2 :currentY
                }
            )
            render();
        }

    })

