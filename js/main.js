init = () => {
    
    PSET = 1;
    LINE = 2;
    LINETO = 3;
    RECT = 4;
    FRECT = 5;
    CIRCLE = 6;
    FCIRCLE = 7;
    FLOOD = 8;
    SETCOLORS = 9;
    ui = {
        color1: 22,
        color2: 0
    }

    setColors(ui.color1, ui.color2);
    makeUI();
    loop();
}

makeUI = () => {
    var button = document.createElement("button");
    button.innerHTML = 'random color1';
    var uisection = document.getElementsByTagName("header")[0];
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
        ui.color1=Math.random()*64|0,0;
    });

    button = document.createElement("button");
    button.innerHTML = 'random color2';
    var uisection = document.getElementsByTagName("header")[0];
    uisection.appendChild(button);
    button.addEventListener ("click", function() {
        ui.color2=Math.random()*64|0,0;
    });
}

drawBatch = (o) => {
    let batch = [...o];
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
loop = () =>{
    requestAnimationFrame(loop)
    renderTarget = SCREEN;
    clear(0);
    //setColors([0,4]);
    // pat = dither[8];
    // fillRect(0,0,320,180);
    
    for(var i = 0; i < 64; i++){
        let x = i%64,
            y = i%64,
            rspace = 5,
            cspace = 3;
        pat = dither[0];
        fillRect(x*rspace,0,x*rspace+4,4,i,0);
    }
    setColors(22,22);

    /*PSET = 1;
    LINE = 2;
    LINETO = 3;
    RECT = 4;
    FRECT = 5;
    CIRCLE = 6;
    FCIRCLE = 7;
    FLOOD = 8;
    SETCOLORS = 9;*/

    drawBatch([
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

    ])

    render()
    
    setColors(ui.color1, ui.color2)
}


init();
