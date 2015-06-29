
var idoc = app.activeDocument;
var abs = idoc.artboards;
var abcount = abs.length; // save the artboard count

var abNames = [];
var abRects = [];

// add generic names for CS4. For CS5 and up use the actual names
function addGenericNames(){
    var ver = Number(app.version.split(".")[0]);
    if (ver<15) {
        for (i=0; i<abcount; i++) {
            abNames[i] = "Artboard " + (i+1); // CS4 - there's no way to get the initial order of the artboards, and no AB names in CS4
            abRects[i] = abs[i].artboardRect;
        }
    }
    else {
        for (i=0; i<abcount; i++) {
            abNames[i] = abs[i].name; // CS5 - to update artboard names
            abRects[i] = abs[i].artboardRect;
        }
    }
}


var win = new Window('dialog', 'Arrange Artbooards', undefined, {resizeable:true});
var lblhelp = win.add('statictext', undefined, ' use up and down \r arrows to navigate, \r + Shift to move', {multiline:true});
var ddL = win.add('listbox',undefined,abNames);
addIdxToDDL (ddL); // add a fixed index to each list item
ddL.items[0].selected = true;
ddL.active = true;
var btnArrange = win.add('button', undefined, 'Re Arrange');

ddL.addEventListener("keydown", checkSwapping);

var currSelection = null;
var prevSelection = null;
var prevSelIndex = null;
var swap = false;

ddL.alignment = ["fill","fill"];
win.preferredSize = [100,-1];
win.spacing = 6;
win.margins = 6;
win.alignChildren = ["fill", "bottom"];
win.helpTip = "\u00A9 2012 Carlos Canto";
btnArrange.helpTip = "Press Esc to Close";

// add a fixed index to each list item
function addIdxToDDL (ddL) {
    for (m=0; m<ddL.items.length; m++) {
        ddL.items[m].idx = m;
    }
}

// allow swapping if the Shift key is pressed
function checkSwapping(event){
    //alert(event.keyName);
    if (event.shiftKey && ((event.keyName=="Up" && ddL.selection.index>0 )|| (event.keyName=="Down" && ddL.selection.index<abcount-1))) {
        prevSelection = ddL.selection.text;
        prevSelIndex = ddL.selection.index;
        prevSelIdx = ddL.selection.idx;
        swap = true;
     }
}

ddL.onChange = function () {
    if (swap) {
        ddL.items[prevSelIndex].text = ddL.selection.text;
        ddL.selection.text = prevSelection;
        swap = false;
        ddL.items[prevSelIndex].idx = ddL.selection.idx;
        ddL.selection.idx = prevSelIdx;
    }
}

btnArrange.onClick = function(){
    for (j=0, k=abcount-1; j<abcount; j++, k--) {
        var idx = ddL.items[j].idx; // get hardcoded index of the first list item
        var abRect = abRects[idx]; // get artboard rect
        idoc.artboards.remove(k); // remove the last artboard
        var newab = idoc.artboards.add(abRect);
        newab.name = abNames[idx]; // this has no effect in CS4, it does not support name property
    }
    app.redraw();
    win.close();
}


win.onResizing = function () {this.layout.resize();}
win.onShow = function () {win.layout.resize();}

win.center();
win.show();