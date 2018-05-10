init = () => {
    //vars used during interactive drawing
    mouseCursor = {x:0, y:0};
    mouseDown = false;
    currentTool = 2;
    startX = 0;
    startY = 0;
    drawCursorX = 0;
    drawCursorY = 0;
    endX = 0;
    endY = 0;
    palette1 = document.getElementById("color1");
    palette2 = document.getElementById("color2");
    palette1.onclick = selectColor1;
    palette2.onclick = selectColor2;
    parsed = [];
    
    script = document.getElementById('script');
    script.addEventListener('click', deleteItem);
    
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
    ELLIPSE = 12;
    FELLIPSE = 13;
    ui = {
        color1: 22,
        color2: 22
    }
    activeBatch = [
        [9, 22, 22],
        [11, 0],
        ];
    
    
    makeUI();
    drawBatch();
    loop();
}

makeUI = () => {
        
    var button;
    var uisection = document.getElementsByTagName("header")[0];

    button = document.createElement("button");
    button.innerHTML = 'clear';
    uisection.appendChild(button);
    button.addEventListener ("click", resetCanvas);

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
    button = document.createElement("button");
    button.innerHTML = 'ellipse';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = ELLIPSE;
    });
    button = document.createElement("button");
    button.innerHTML = 'fillEllipse';
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
       currentTool = FELLIPSE;
    });

    ditherSelect = document.getElementById('dither').onchange = setDither;
    //ditherSelect.addEventListener

    
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
    drawCursorX = cursorX;
    drawCursorY = cursorY;
    mouseDown = true;
    if(e.altKey){
        updateColors(pget(mouseCursor.x,mouseCursor.y), ui.color2);
    }
}

drawEnd = e => {
    endX = mouseCursor.x;
    endY = mouseCursor.y;
    mouseDown = false;
    let offsetX = 0, offsetY = 0;
    switch(currentTool){
        case PSET:
            activeBatch.push([currentTool, endX, endY]);
            break;
        case LINE:
            activeBatch.push([currentTool, startX, startY, endX, endY]);
            break;
        case LINETO:
            activeBatch.push([currentTool, endX, endY]);
            break;

        case RECT:
            activeBatch.push([currentTool,startX, startY, endX, endY]);
            break;
            
        case FRECT:
            activeBatch.push([currentTool,startX, startY, endX, endY]);
            break;
        
        case CIRCLE:
            let leg1 = Math.abs(startX - endX),
                leg2 = Math.abs(startY - endY),
                r = Math.hypot(leg1, leg2)|0;
            activeBatch.push([currentTool, startX, startY, r]);
            break;
        
        case FCIRCLE:
            let fleg1 = Math.abs(startX - endX),
                fleg2 = Math.abs(startY - endY),
                fr = Math.hypot(fleg1, fleg2)|0;
            activeBatch.push([currentTool, startX, startY, fr]);
            break;
        
        case FLOOD:
            activeBatch.push([currentTool, endX, endY]);
            break;

        case ELLIPSE:
            offsetX = Math.abs(startX - endX);
            offsetY = Math.abs(startY - endY);
            activeBatch.push([currentTool, startX-offsetX, startY-offsetY, offsetX*2, offsetY*2])
            break;
        case FELLIPSE:
            offsetX = Math.abs(startX - endX);
            offsetY = Math.abs(startY - endY);
            activeBatch.push([currentTool, startX-offsetX, startY-offsetY, offsetX*2, offsetY*2])
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
        let offsetX = 0;
        let offsetY = 0;
        //cursorX = startX;
        //cursorY = startY;
        switch(currentTool) { 
            case PSET:
                pset(endX, endY);
                break;
            case LINE:
                line(startX, startY, endX, endY);
                break;
            case LINETO:
                line(drawCursorX, drawCursorY, endX, endY);
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
                floodFill(endX, endY);
                break;
            
            case ELLIPSE:
                offsetX = Math.abs(startX - endX);
                offsetY = Math.abs(startY - endY);
                ellipse(startX-offsetX, startY-offsetY, offsetX*2, offsetY*2 );
                break;

            case FELLIPSE:
                offsetX = Math.abs(startX - endX);
                offsetY = Math.abs(startY - endY);
                fillEllipse(startX-offsetX, startY-offsetY, offsetX*2, offsetY*2 );
                break;
            
            default: //no valid draw command found
            setColors(4,4); 
            fillRect(0,0,320,180);
            batch = []; //to prevent infinite loop and bail if malformed
        }
    } 
}
processBatch = (o) => {
    //each tuple in a batch consists of [drawcommand, ...parameters]
    //each element in an array is a nested array with command tuple ^
 o.forEach(drawCommand);
    
}

drawBatch = (o) => {
    renderTarget = BUFFER;
    clear(0);
    processBatch(activeBatch);
    parseBatch(activeBatch);
    scriptDisplay(parsed);
    //updateColors(ui.color1, ui.color2);    
    renderTarget = SCREEN;
}
scriptDisplay = (o) =>{
    script.innerHTML='';
    o.forEach(function(e,i,a){
        let item = document.createElement("li");
        let text = document.createElement("span");
        let del = document.createElement('button');
        del.className = 'deleteItem';
        text.innerHTML = e;
        del.innerHTML = "X";
        item.appendChild(text);
        item.appendChild(del);
        script.appendChild(item);
    })
}
deleteItem = (e) => {
    var el = e.target;
    var listItem;
    var list;
    if (el.classList.contains("deleteItem")) {
      listItem = el.parentNode;
      list = listItem.parentNode;
      console.log([...list.children].indexOf(listItem))
      activeBatch.splice( [...list.children].indexOf(listItem), 1 )
      list.removeChild(listItem);
      drawBatch(activeBatch);
    }
}
parseBatch = (o) => { 
    parsed = [];
    o.forEach(parseCommand);
}
drawCommand = (elem, i, arr) =>{
    switch(elem[0]) { 
        case PSET:
            pset(elem[1], elem[2]);

            break;
        case LINE:
            line(elem[1], elem[2], elem[3], elem[4]);
            break;

        case LINETO:
            lineTo(elem[1], elem[2]); 
            break;

        case RECT:
            rect(elem[1], elem[2], elem[3], elem[4]);
            break;
            
        case FRECT:
            fillRect(elem[1], elem[2], elem[3], elem[4]);
            break;
        
        case CIRCLE:
            circle(elem[1], elem[2], elem[3]);
            break;
        
        case FCIRCLE:
            fillCircle(elem[1], elem[2], elem[3]);
            break;
        
        case FLOOD:
            floodFill(elem[1], elem[2]);
            break;
        
        case SETCOLORS:
            setColors(elem[1], elem[2]);
            break;
        
        case SETDITHER:
            pat = dither[elem[1]];
            break;
        
        case ELLIPSE:
            ellipse(elem[1], elem[2], elem[3], elem[4]);
            break;

        case FELLIPSE:
            fillEllipse(elem[1], elem[2], elem[3], elem[4]);
            break;
            
        

        default:
        setColors(4); 
        fillRect(0,0,320,180);
        //batch = []; //to prevent infinite loop and bail if malformed
    }
}
parseCommand = (elem, i, arr) => {
    res = "";
    switch(elem[0]){
            case PSET:
                res+=`pset: ${elem[1]}, ${elem[2]} \n`
                break;
            case LINE:
                res+=`line: ${elem[1]}, ${elem[2]}, ${elem[3]}, ${elem[4]}\n` 
                break;
            case LINETO:
                res+=`lineTo: ${elem[1]}, ${elem[2]}\n` 
                break;
    
            case RECT:
                res+=`rect: ${elem[1]}, ${elem[2]}, ${elem[3]}, ${elem[4]}\n` 
                break;
                
            case FRECT:
                res+=`fillRect: ${elem[1]}, ${elem[2]}, ${elem[3]}, ${elem[4]}\n`      
                break;
            
            case CIRCLE:
                res+=`circle: ${elem[1]}, ${elem[2]}, ${elem[3]}\n` 
                break;
            
            case FCIRCLE:
                res+=`fillCircle: ${elem[1]}, ${elem[2]}, ${elem[3]}\n` 
                break;
            
            case FLOOD:
                res+=`floodFill: ${elem[1]}, ${elem[2]}\n` 
                break;

            case SETCOLORS:
                res+=`setColors: ${elem[1]}, ${elem[2]}\n`
                break;
            case SETDITHER:
                res+=`setDither: ${elem[1]}`
                break;
            case ELLIPSE:
                res+=`ellipse: ${elem[1]}, ${elem[2]}, ${elem[3]}, ${elem[4]}\n`
                break;
            case FELLIPSE:
                res+=`fillEllipse: ${elem[1]}, ${elem[2]}, ${elem[3]}, ${elem[4]}\n`
                break;
            default: break;
        
    } //end switch
    parsed.push(res);
}
updateColors = (a,b=cursorColor2) => {
    ui.color1 = a;
    ui.color2 = b;
    cursorColor = a;
    cursorColor2 = b;
    activeBatch.push([9,a,b]);    
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
setDither = (e) => {
    let value = parseInt(document.getElementById('dither').value);
    pat = dither[value];
    activeBatch.push([SETDITHER, value]);
}
resetCanvas = (e) => {
    activeBatch = [];
    updateColors(22,22);
    drawBatch(activeBatch);
 }

loop = () =>{
    requestAnimationFrame(loop)
    renderTarget = SCREEN;
    clear(0);
    renderSource = BUFFER;
    spr(0,0,320,180,0,0);
    drawActive();
    //fillEllipse(64,64,128,64,4,4);
    circle(mouseCursor.x,mouseCursor.y,3,27,27)
    cursorColor = ui.color1;
    cursorColor2 = ui.color2;
    render() 
}

canvas.addEventListener("mousemove", setCursor);
canvas.addEventListener("mousedown", drawStart);
canvas.addEventListener("mouseup", drawEnd);

init();
