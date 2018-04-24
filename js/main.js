init = () => {
    //vars used during interactive drawing
    mouseCursor = {x:0, y:0};
    mouseDown = false;
    currentTool = 2;
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
    palette1 = document.getElementById("color1");
    palette2 = document.getElementById("color2");
    palette1.onclick = selectColor1;
    palette2.onclick = selectColor2;
    
    script = document.getElementById('script');
    
    //drawing commands used in the batch script
    PSET = 1;
    LINE = 2;
    LINETO = 3;
    RECT = 4;
    FRECT = 5;
    CIRCLE = 6;
    FCIRCLE = 7;
    FLOOD = 8;
    SETCOLORS = 9;
    SETPATTERN = 10;
    SETDITHER = 11;
    ui = {
        color1: 22,
        color2: 22
    }
    //pre-draw a red cube. This was drawn in-tool and pasted here,
    //I added new-lines so you can see each command. 
    activeBatch = [
        9,22,22,
        1,159,70,
        9,3,27,
        9,4,27,
        1,82,49,
        2,82,49,159,70,
        2,159,70,163,155,
        2,159,70,205,36,
        2,163,156,201,107,
        2,205,37,201,106,
        2,81,49,93,134,
        2,93,134,162,156,
        2,81,48,146,23,
        2,146,23,204,35,
        8,153,45,9,3,27,
        8,174,90,9,2,27,
        8,133,103
        ];
    script.contentEditable = true;
    makeUI();
    updateColors(22,22);
    pat = dither[8];
    drawBatch();
    loop();
}

makeUI = () => {
        
    var button;
    var uisection = document.getElementsByTagName("header")[0];

    button = document.createElement("button");
    button.innerHTML = 'clear';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       activeBatch = [];
    });

    button = document.createElement("button");
    button.innerHTML = 'pset';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = PSET;
    });

    button = document.createElement("button");
    button.innerHTML = 'line';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = LINE;
    });

    button = document.createElement("button");
    button.innerHTML = 'lineTo';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = LINETO;
    });

    button = document.createElement("button");
    button.innerHTML = 'rect';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = RECT;
    });

    button = document.createElement("button");
    button.innerHTML = 'fillRect';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = FRECT;
    });

    button = document.createElement("button");
    button.innerHTML = 'circle';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = CIRCLE;
    });

    button = document.createElement("button");
    button.innerHTML = 'fillCircle';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = FCIRCLE;
    });

    button = document.createElement("button");
    button.innerHTML = 'floodFill';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = FLOOD;
    });

    
}

getMousePos = (canvas, evt) =>  {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y
  
    return {
      x: ( (evt.clientX - rect.left) * scaleX)|0,   // scale mouse coordinates after they have
      y: ( (evt.clientY - rect.top) * scaleY)|0     // been adjusted to be relative to element
    }
}
setCursor = e => {
    mouseCursor = getMousePos(c,e);
}

drawStart = e => {
    startX = mouseCursor.x;
    startY = mouseCursor.y;
    mouseDown = true;
    if(e.altKey){
        updateColors(pget(mouseCursor.x,mouseCursor.y), ui.color2);
    }
}

drawEnd = e => {
    endX = mouseCursor.x;
    endY = mouseCursor.y;
    mouseDown = false;
    
    switch(currentTool){
        case PSET:
            activeBatch.push(currentTool, endX, endY);
            break;
        case LINE:
            activeBatch.push(currentTool, startX, startY, endX, endY);
            break;
        case LINETO:
            activeBatch.push(currentTool, endX, endY);
            break;

        case RECT:
            activeBatch.push(currentTool,startX, startY, endX, endY);
            break;
            
        case FRECT:
            activeBatch.push(currentTool,startX, startY, endX, endY);
            break;
        
        case CIRCLE:
            let leg1 = Math.abs(startX - endX),
                leg2 = Math.abs(startY - endY),
                r = Math.hypot(leg1, leg2)|0;
            activeBatch.push(currentTool, startX, startY, r);
            break;
        
        case FCIRCLE:
            let fleg1 = Math.abs(startX - endX),
                fleg2 = Math.abs(startY - endY),
                fr = Math.hypot(fleg1, fleg2)|0;
            activeBatch.push(currentTool, startX, startY, fr);
            break;
        
        case FLOOD:
            activeBatch.push(currentTool, endX, endY);
            break;
        default: break;
    }
    //script.innerHTML = JSON.stringify(activeBatch);
    drawBatch();
}

drawActive = e => {
    endX = mouseCursor.x;
    endY = mouseCursor.y;
    renderTarget = SCREEN;
    if(mouseDown){
        switch(currentTool) { 
            case PSET:
                pset(endX, endY);
                break;
            case LINE:
                line(startX, startY, endX, endY);
                break;
            case LINETO:
                line(cursorX, cursorY, endX, endY);
                break;
            case RECT:
                rect(startX, startY, endX, endY);
                break;     
            case FRECT:
                fillRect(startX, startY, endX, endY);
                break;     
            case CIRCLE:
                let leg1 = Math.abs(startX - endX),
                    leg2 = Math.abs(startY - endY),
                    r = Math.hypot(leg1, leg2)|0;
                circle(startX, startY, r);
                break; 
            case FCIRCLE:
                let fleg1 = Math.abs(startX - endX),
                    fleg2 = Math.abs(startY - endY),
                    fr = Math.hypot(fleg1, fleg2)|0;
                fillCircle(startX, startY, fr);
                break;
            
            case FLOOD:
                floodFill(endX, endY, cursorColor);
                break;
            
            default: //no valid draw command found
            setColors(4); 
            fillRect(0,0,320,180);
            batch = []; //to prevent infinite loop and bail if malformed
        }
    } 
}
processBatch = (o) => {
    let batch = [...o];
    let step = [];
    //each tuple in a batch consists of [drawcommand, ...parameters]
 while( batch.length > 0) {
    switch(batch.shift()) {  //pop the first one,
        case PSET:
            pset(...batch.splice(0,2));
            break;
        case LINE:
            line(...batch.splice(0,4));
            break;

        case LINETO:
            lineTo(...batch.splice(0,2)); 
            break;

        case RECT:
            rect(...batch.splice(0,4));
            break;
            
        case FRECT:
            fillRect(...batch.splice(0,4));
            break;
        
        case CIRCLE:
            circle(...batch.splice(0,3));
            break;
        
        case FCIRCLE:
            fillCircle(...batch.splice(0,3));
            break;
        
        case FLOOD:
            floodFill(...batch.splice(0,2));
            break;
        
        case SETCOLORS:
            setColors(...batch.splice(0,2));
            break;

        default:
        setColors(4); 
        fillRect(0,0,320,180);
        batch = []; //to prevent infinite loop and bail if malformed
    }
 }
}
drawBatch = (o) => {
    renderTarget = BUFFER;
    clear(0);
    processBatch(activeBatch);
    updateColors(ui.color1, ui.color2);
    renderTarget = SCREEN;
}
parseBatch = (o) => { //stub function, does nothing yet
    let batch = [...o];
    results = [];
    while(batch.length > 0){
        
    }

}
updateColors = (a,b=cursorColor2) => {
    ui.color1 = a;
    ui.color2 = b;
    cursorColor = a;
    cursorColor2 = b;
    //setColors(a,b);
    activeBatch.push(9,a,b);    
}
selectColor1 = (e) => {
    let pos = getMousePos(palette1, e),
        row = Math.floor(pos.y/15),
        col = Math.floor(pos.x/15),
        color = row * 16 + col;
    updateColors(color);
}
selectColor2 = (e) => {
    let pos = getMousePos(palette2, e),
        row = Math.floor(pos.y/15),
        col = Math.floor(pos.x/15),
        color = row * 16 + col;
    updateColors(ui.color1, color);
}

loop = () =>{
    requestAnimationFrame(loop)
    renderTarget = SCREEN;
    clear(0);
    //draw the buffer
    renderSource = BUFFER;
    spr(0,0,320,180,0,0);
    drawActive();
    circle(mouseCursor.x,mouseCursor.y,3,27,27)
    cursorColor = ui.color1;
    cursorColor2 = ui.color2;
    render()
    
    
}

canvas.addEventListener("mousemove", setCursor);
canvas.addEventListener("mousedown", drawStart);
canvas.addEventListener("mouseup", drawEnd);

init();
