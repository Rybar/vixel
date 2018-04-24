- refactor rect and fillrect to allow starting from bottom left  
- undo/redo (script interaction)
~~image-based color pickers~~
~~fix flood-fill bug DONE~~ 
- refactor flood fill to handle dither fills  
    -will require filling to a buffer in one color,  
    then pset'ing the buffer to screen to handle dither routine  
- dither pattern picker  
    -a 4x4 table that you can flip bits on to build the pattern  
- dither pattern editor  
    -simple 0-15 picker for preset bayer dither patterns  
- erase/draw with color 0  
    - add another color? -not sure.  
- ellipse tool
    - from middle like circle or box?
- arrange buttons in multiple rows
- add/create tool icons

- script interaction  
    -  parse batch into human-readable list
    -  display list on side bar in organized way with editable fields "LINE | 64 | 64 | 128 | 250"
    -  delete commands from anywhere in the list
    -  insert commands anywhere in the list
        - click at insert point and then start drawing OR  
        - select a command and punch in numbers yourself
        