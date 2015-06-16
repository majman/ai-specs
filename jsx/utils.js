function geometricBoundsToRect(geometricBounds, pathItems, padding){
    var x = geometricBounds[0];
    var y = geometricBounds[1];
    var w = geometricBounds[2] - x;
    var h = y - geometricBounds[3];
    var pi = pathItems || activeDocument.activeLayer.pathItems;

    var p = padding || 0;
    var p2 = p * 2;

    var rectRef = pi.rectangle(y + p, x - p, w + p2, h + p2);
    rectRef.stroked = false;
    rectRef.filled = true;
    rectRef.fillColor = white;
    rectRef.zOrder(ZOrderMethod.SENDBACKWARD);
    return rectRef;
}

function alignTextItems(){
    if(specItems.textItem && specItems.textItem.length > 1){
        var textItems = specItems.textItem;
        var minX;
        _.each(textItems, function(item){
            if(minX == undefined){
                minX = item.tf.left;
            }else if(!item.alignRight && item.tf.left < minX){
                minX = item.tf.left;
            }
        })

        // move tf specs to align left
        var prevItem;
        _.each(textItems, function(item){
            if(!item.alignRight){
                item.tf.left = minX;
                if(prevItem != undefined){
                    item.tf.top = prevItem.tf.top - prevItem.tf.height;
                }else {
                    alert('first item')
                }
                prevItem = item;
            }
        })
    }
}

function drawColorSquare(fill, x, y, group){
    var swatchSize = 30;
    var x = -swatchSize * 1.25 >> 0;
    var y = artboardTop - y + swatchSize/2;
    var rectRef = group.pathItems.rectangle(y, x, swatchSize, swatchSize);

    rectRef.fillColor = fill;
    rectRef.stroked = false;

    return rectRef;
}

function checkIfLockedOrHidden(el){
    if(el.locked == true || el.visible == false || el.hidden == true) {
        return true;
    }
    // recursive check parents
    if(el.parent && el.parent.typename != "Document"){
        return checkIfLockedOrHidden(el.parent)
    }
    return false;
}

//---------------hitTest functions ---------------
function hitTest(a,b){
    var OK=0;
    if(isWithinX(a,b) || isWithinX(b,a)){
        OK++;
    }
    if(isWithinY(a,b) || isWithinY(b,a)){
        OK++;
    }
    if (OK<2){
        //alert("miss.");
        return false;
    }else{
        //alert("Hit!")
            return true;
    }
}
function isWithinX(a,b){
    var p1 = a.geometricBounds[0];
    var p2 = b.geometricBounds[0];
    if(p2<=p1 && p1<=p2+b.width){
         return true;
    }else{
        return false;
    }
}
function isWithinY(a,b){
    var p3 = a.geometricBounds[1];
    var p4 = b.geometricBounds[1];
    if(p3>=p4 && p4>=(p3-a.height)){
        return true;
    }
        return false;
}


// color functions
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// group object types: edittext, radiobutton, statictext, slider
// var sampleWinOptions = {
//     title: 'Rename Artboards',
//     groups: [
//         {
//             'type': 'edittext',
//             'label': 'prefix',
//             'default': ''
//         },
//         {
//             'type': 'edittext',
//             'label': 'suffix',
//             'default': ''
//         }
//     ]
// }
function showDialogue(opts, onOK){
    var win = new Window('dialog', opts.title);

    win._groups = {};
    _.each(opts.groups, function(gr){
        var t = gr.title || undefined;
        if(gr.type == 'edittext'){
            var et = new EditTextWithLabel(win, gr.label, gr.default);
            win._groups['_'+gr.label] = et;
        }
    });

    // ok / cancel
    addOkCancelButtons(win, onOK);

    win.show();
}
function addOkCancelButtons(win, func){
    var gr = win.add("group");
    var btn_cancel = gr.add("button", undefined, "Cancel");
    var btn_ok = gr.add("button", undefined, "OK");
    btn_ok.onClick = _.bind(func, win);
}

var EditTextWithLabel = function(win, label, defaultvalue){
    this.gr = win.add("group");
    this.gr.add("statictext", undefined, label);
    this.et = this.gr.add("edittext", undefined, defaultvalue);
    this.et.characters = 10;
    // this.et.active = true;
    return this;
}
EditTextWithLabel.prototype = {
    getValue : function(){
        var v = this.et.text;
        return v;
    },
    activate : function(){
        this.et.active = true;
    }
}





/////////////////////////////////////////////////////////////////
// The Document Object Model Explorer v.2 -- CS
//>=--------------------------------------
//
// Select an object on the page, then run this script.
// It will return a list of everything that object contains.
// You can also manually explore the document object model by entering an object's path.
//
// As of version 2, a "displayErrors" variable has been added.
// Now users can view objects that failed.
// "displayErrors" defaults to true, but can be turned off by
// setting it to "0" in the first line of the script.
//
// Output is also now alphabetized, and is broken into multiple alerts if output is
// longer than the "maxLines" variable.
//
// Prompt can now be used as a javascript command line too.
// If user input returns a value, the value is returned in an alert box.
//>=--------------------------------------
// JS code (c) copyright: John Wundes ( john@wundes.com ) www.wundes.com
//copyright full text here:  http://www.wundes.com/js4ai/copyright.txt
//////////////////////////////////////////////////////////////////

function exploreObject(objectToExplore){
    var displayErrors = 1;
    var maxLines = 50;
    var bob = "";
    var disp_ar = new Array();
    //the item count object:
    var c = 0;
    var observed = objectToExplore || prompt("What do you want to explore? i.e.;\r   app (not used before CS)\r   documents\r   activeDocument.pageItems[0]","activeDocument.selection[0]");
    //assign prompt text to actual object;
    //   a side effect of which is,
    //   if the user input is actually a line of executable code,
    //   it gets run here:

    var thisObject = eval(observed);
    try {
        for (all in thisObject ) {
            c++;
            //attempt to decypher each sub object
            try {
                bob = all+"=";
                bob +=  eval(observed+"."+all);
                disp_ar.push(bob);
            }
            catch (e) {
                // if undecypherable, say why:
                if(displayErrors){
                    bob = all+"="+(e.toString().split(":"))[1];
                    disp_ar.push(bob);
                }
            }
            disp_ar.sort();
        }
        //decide arbitrary max length of list before switching to tabs.
        if(c > 1){
            // if object has more than one object content:
            var nicedisp = "";
            var dispLen = disp_ar.length;
            // if longer than max, divide by the amount longer than max, so you don't
            // end up with a dangling variable at the end.
            var maxNum = dispLen > maxLines ? dispLen/Math.ceil(dispLen/maxLines) : maxLines;
            var dispOutput = new Array("");
            var more = "";
            var myLoc = 0;
            for (var x=0;x<dispLen;x++) {
                // add spacing for formatting of line numbers less that 10.
                if(x < 9){
                    spc = "  ";
                } else {
                    spc = "";
                }
                var thisMod = Math.ceil(x%maxNum);
                if(thisMod==true && x>maxNum -1){
                    myLoc++;
                    //initialize array slot:
                    dispOutput[myLoc] = "";
                }
                dispOutput[myLoc] += (spc+(x+1)+") "+disp_ar[x]+"\r");
            }
            //show output page(s):
            var outLen = dispOutput.length;
            for (var a=0;a<outLen;a++){
                more = a<(outLen-1) ? " More..." : "";
                alert("Contents of:\r"+observed+"\r------------------------\r"+dispOutput[a]+more);
            }
        }else{
            alert("Value of:\r"+observed+"\r------------------------\r"+thisObject );
        }

    } catch (e) {
        //if object returns something, show it:
        if(thisObject != undefined){
            alert(thisObject);
        }
    }
    //handle spacing for columns
    function makeSpace(num){
        spc = "";
        for (var j=0;j<num ;j++ ){
            spc += "|";
        }
        return spc;
    }
}


