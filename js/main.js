init = () => {

    mouseCursor = {x:0, y:0};
    mouseDown = false;
    currentTool = 2;
    startX = 0;
    startY = 0;
    endX = 0;
    endY = 0;
    
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
        color2: 0
    }
    activeBatch = [
        1,19,4, 1,8,8, 1,16,16, 1,32,32, 1,64,64,
        9, 4, 1,
        2,128,64,320,180,
        9,17,0,
        3,WIDTH/2, HEIGHT/2, 3,310,10, 3,53,53,
        9,42,0,
        RECT, 4, 4, 90,90,
        FRECT,90,90,140,140,
        CIRCLE, 300,140,9,
        FCIRCLE,WIDTH/2,HEIGHT,10
    ];

    makeUI();
    loop();
}

makeUI = () => {
        
    var button = document.createElement("button");
    button.innerHTML = 'random color1';
    var uisection = document.getElementsByTagName("header")[0];
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
        updateColors(Math.random()*64|0);
    });

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
    document.getElementById('script').innerHTML = JSON.stringify(activeBatch);
}

drawActive = e => {
    endX = mouseCursor.x;
    endY = mouseCursor.y;
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
updateColors = (a,b=cursorColor2) => {
    ui.color1 = a;
    ui.color2 = b;
    setColors(a,b);
    activeBatch.push(9,a,b);    
}
selectColor1 = (e) => {
    updateColors(parseInt(e.target.value));

}
selectColor2 = (e) => {
    updateColors(ui.color1, parseInt(e.target.value) )
}
loop = () =>{
    requestAnimationFrame(loop)
    renderTarget = SCREEN;
    clear(0);
    //color bar
    // for(var i = 0; i < 64; i++){
    //     let x = i%64,
    //         y = i%64,
    //         rspace = 5,
    //         cspace = 3;
    //     pat = dither[0];
    //     fillRect(x*rspace,0,x*rspace+4,4,i,0);
    // }

    processBatch(activeBatch)
    drawActive();
    //document.getElementById('script').innerHTML = JSON.stringify(activeBatch);
    circle(mouseCursor.x,mouseCursor.y,3,27,27)

    render()
    
    
}

canvas.addEventListener("mousemove", setCursor);
canvas.addEventListener("mousedown", drawStart);
canvas.addEventListener("mouseup", drawEnd);
document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[name="color1"]').onchange=selectColor1;
    document.querySelector('select[name="color2"]').onchange=selectColor2;
},false);
init();
