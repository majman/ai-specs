#include "underscore.js";
#include "colorInfo.js";

var actDoc;
var selectedObjects;


var specColor = new RGBColor();
specColor.red = 0;
specColor.green = 255;
specColor.blue = 255;

var white = new RGBColor();
white.red = 255;
white.green = 255;
white.blue = 255;

var specTextFont = textFonts.getByName('AvenirNext-Medium');
var specTextFontBold = textFonts.getByName('AvenirNext-Bold');
var specMult = 1.25;
var specSize = 14 * specMult >> 0;
var specSizeLg = 18;
var specAutoLeading = false;
var specLeading = 20 * specMult >> 0;

var selectionInfo;

var specLayer;
var idx,
    actArtboard,
    artboardRect,
    artboardLeft,
    artboardTop,
    artboardWidth;


// store all specs objects / options for session
var specItems = {
    total: 0
};
var specOptions = {
    units: "dp",
    fontUnits: "pt",
    objectPadding: 10,
    unitBase: 3
};

function addSpecItem(type, item){
    if(specItems[type]){
        specItems[type].push(item);
    }else {
        specItems[type] = [item];
    }
    specItems.total ++;
}

function updateOptions(options){
    try{
        _.each(options, function(v, k){
            if(typeof(specOptions[k]) == "number"){
                v = Number(v);
            }
            specOptions[k] = v;
        });
    }catch(e){
        alert(e);
    }
}



function getSpecLayer(){
    actDoc = app.activeDocument;
    try {
        specLayer = actDoc.layers.getByName('specs');
    }
    catch(e) {
        specLayer = actDoc.layers.add();
        specLayer.name = 'specs';
    }
    specLayer.locked = false;
    specLayer.visible = true;
    return specLayer;
}

function updateArtboardInfo(){
    actDoc = app.activeDocument;
    selectedObjects = actDoc.selection;

    idx = actDoc.artboards.getActiveArtboardIndex();
    actArtboard = actDoc.artboards[idx];
    artboardRect = actArtboard.artboardRect;
    artboardLeft = artboardRect[0];
    artboardTop = artboardRect[1];
    artboardWidth = artboardRect[2] - artboardRect[0];
}


function SelectionInfo(direction, options){
    updateArtboardInfo();
    getSpecLayer()
    updateOptions(options);
    selectedObjects = actDoc.selection;

    var numObjects = selectedObjects.length;

    for(var i = 0; i < numObjects; i++){
        var o = selectedObjects[i];
        var spec = new SpecLayer(o, direction);
    }
    this.specItems = specItems;

    alignTextItems();
    return this;
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

    }else {

    }

}

function SpecLayer(object, direction) {
    this.object = object;

    if ( this.object.typename == "TextFrame" ) {
        try {
            this.text = new TextSpec(this)
            addSpecItem('textItem', this.text);
        } catch(e) {
            alert(e);
        }
        return this;
    }

    if(this.object.width > 0 && direction != 'vert'){

        try {
            this.horz = new Spec('horz', this);
            addSpecItem('dimension', this.horz);
        }catch(e) {
            alert('horz '+e);
        }
    }
    if(this.object.height > 0 && direction != 'horz'){
        try {
            this.vert = new Spec('vert', this);
            addSpecItem('dimension', this.vert);
        }catch(e) {
            alert('vert '+e);
        }
    }

    return this;
}

function TextSpec(group){
    this.alignRight = false;

    var object = group.object;
    var textRange;
    try {
        textRange = object.textRange;
    } catch (e) {
        textRange = object.textRanges[0];
    }

    var characterAttributes = textRange.characterAttributes;

    var textFont = characterAttributes.textFont;

    var fontOpacity = 100;
    try {
        fontOpacity = object.opacity;
    }catch(e) {
        alert(e);
    }


    var fontSize = Math.round(characterAttributes.size / specOptions.unitBase);
    var fontColor = characterAttributes.fillColor;

    var rgb = getColorValues(fontColor);
    var hex = rgbToHex(fontColor.red, fontColor.green, fontColor.blue);
    var fontName = textFont.family;
    var fontStyle = textFont.style;
    var leading = characterAttributes.leading;
    var tracking = characterAttributes.tracking;
    var letterSpacing = fontSize * (tracking * .001);

    var str = '';
    var br = "\r  ";

    str += 'font-family: ' + fontName + br;
    str += 'font-style: ' + fontStyle + br;
    str += 'font-size: ' + fontSize + specOptions.fontUnits +  br;
    str += 'color: rgb(' + rgb.join() +"), "+ hex + br;

    if(textRange.lines.length > 1){
        str += 'leading: ' + (Number(leading / specOptions.unitBase)) + specOptions.fontUnits + br;
    }
    if(fontOpacity < 100){
        str += 'opacity: ' + Math.round(fontOpacity) + br;
    }
    if(tracking > 0){
        str += 'letter-spacing: ' + letterSpacing + specOptions.fontUnits + br;
    }


    this.tf = specLayer.textFrames.add();


    var n = object.name;
    this.tf.contents = n + br;

    this.tf.textRange.characterAttributes.textFont = specTextFont;
    this.tf.contents += str;

    this.tf.textRange.characterAttributes.size = specSize;
    this.tf.textRange.characterAttributes.autoLeading = specAutoLeading;
    this.tf.textRange.characterAttributes.leading = specLeading;
    this.tf.textRange.fillColor = white;

    var line1 = this.tf.textRange.lines[0];

    line1.characterAttributes.textFont = specTextFontBold;


    if(object.left - artboardLeft > artboardWidth/2){
        this.alignRight = true;
        this.tf.left = artboardLeft + artboardWidth + specOptions.objectPadding*2 + specOptions.objectPadding * 2;
    }else {
        this.tf.left = artboardLeft - this.tf.width - specOptions.objectPadding*2 - 80;
    }

    this.tf.top = object.top;

    return this;
}




// direction: "horz" | "vert"
function Spec(direction, group){

    var paragraph, leading, length;

    this.direction = direction;
    this.object = group.object;
    this.height = Math.round(this.object.height);
    this.width = Math.round(this.object.width);
    this.gb = this.geometricBounds;
    this.center = findCenter(this.object);

    this.tf = specLayer.textFrames.add();
    this.p1 = [0,0];
    this.p2 = [0,0];



    if(direction == "horz"){

        length = this.width / specOptions.unitBase;
        this.tf.contents = length + " " + specOptions.units;

        paragraph = this.tf.paragraphs[0];
        leading = paragraph.leading;
        paragraph.justification = Justification.CENTER;

        this.tf.left = this.center[0] - this.tf.width/2;
        this.tf.top = this.object.top + leading + specOptions.objectPadding;
        this.p1 = [this.object.left, this.object.top + specOptions.objectPadding];
        this.p2 = [this.object.left + this.width, this.object.top + specOptions.objectPadding];

    }else if(direction == "vert"){

        length = this.height / specOptions.unitBase;
        this.tf.contents = length + " " + specOptions.units;

        paragraph = this.tf.paragraphs[0];
        leading = paragraph.leading;
        paragraph.justification = Justification.RIGHT;

        this.tf.left = this.object.left - this.tf.width - specOptions.objectPadding*2;
        this.tf.top = this.center[1] + leading/2;

        this.p1 = [this.object.left - specOptions.objectPadding, this.object.top];
        this.p2 = [this.object.left - specOptions.objectPadding, this.object.top - this.height];

    }


    this.path = specLayer.compoundPathItems.add();
    // Create the path items
    var newPath = this.path.pathItems.add();
    newPath.setEntirePath( Array( this.p1, this.p2 ) );
    newPath.stroked = true;
    newPath.filled = false;
    newPath.strokeColor = specColor;

    this.tf.textRange.characterAttributes.textFont = specTextFont;
    this.tf.textRange.characterAttributes.size = specSizeLg;
    this.tf.textRange.fillColor = specColor;

    this.path.name = direction + " line-" + Math.round(length);

    return this;
}

function getColorValues(color) {
        if(color.typename) {
            switch(color.typename) {
                case "RGBColor":
                    return  [Math.floor(color.red), Math.floor(color.green), Math.floor(color.blue)] ;
                case "GrayColor":
                    return [Math.floor(color.gray), Math.floor(color.gray), Math.floor(color.gray)];
                case "SpotColor":
                    return getColorValues(color.spot.color);
            }
        }
    return "Non Standard Color Type";
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// alert( rgbToHex(0, 51, 255) ); // #0033ff


function findCenter(pi){
    var gb = pi.geometricBounds; // left, top, right, bottom
    return [(gb[0] + gb[2]) / 2, (gb[1] + gb[3]) / 2];
}







try {
    var xLib = new ExternalObject("lib:\PlugPlugExternalObject");
} catch (e) {
    alert(e);
}

function dispatchCEPEvent(_type, _data) {
    if (xLib) {
        var eventObj = new CSXSEvent();
        eventObj.type = _type;
        eventObj.data = _data;
        eventObj.dispatch();
    }
}

$.testAlert2 = function() {
    selectionInfo = new SelectionInfo();
    dispatchCEPEvent("My Custom Event", 'test alert');
    return "[Return Message from evalScript() callback]";
}

$.spec = function(options) {

    selectionInfo = new SelectionInfo(null, options);
    dispatchCEPEvent("My Custom Event", 'both');
    return "complete";
}

$.specHorz = function(options) {
    selectionInfo = new SelectionInfo('horz', options);
    dispatchCEPEvent("My Custom Event", 'spec');
    return "complete";
}
$.specVert = function(options) {
    selectionInfo = new SelectionInfo('vert', options);
    dispatchCEPEvent("My Custom Event", 'spec');
    return "complete";
}


$.specColors = function(options) {

    colorInfo = new ColorInfo(options);
    dispatchCEPEvent("My Custom Event", 'colors');
    return "complete";
}