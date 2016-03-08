#include "underscore.js";
#include "json2.js";
#include "utils.js";
#include "colorInfo.js";
#include "artboard-utils.js";
#include "divide-text-frame.js";
#include "CreateCss.js";
#include "selectTextByProps.js";

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

var red = new RGBColor();
red.red = 255;
red.green = 0;
red.blue = 0;

var rectBackgroundColor = new RGBColor();
rectBackgroundColor.red = 49;
rectBackgroundColor.green = 54;
rectBackgroundColor.blue = 61;



var specTextFont = textFonts.getByName('AvenirNextCondensed-DemiBold');
var specMult = 1.25;
var specSize = 16; //14 * specMult >> 0;
var specSizeLg = 18;
var specSizeSm = specSize * 0.85 >> 0;
var specAutoLeading = false;
var specLeading = 22; //20 * specMult >> 0;
var artboardPadding = 150;

var selectionInfo;
var specLayer;
var idx,
    actArtboard,
    artboardRect,
    artboardLeft,
    artboardTop,
    artboardWidth,
    artboardHeight;

// Whitespace vars for string building
var br = "\r";
var tab = "   ";
var brTab = br + tab;


// store all specs objects / options for session
var specItems = {
    total: 0
};
var specOptions = {
    units: "dp",
    fontUnits: "dp",
    objectPadding: 10,
    unitBase: 3,
    colorSpec: false,
    guessBase: true
};
var allTextStyles = [];


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
        if(options.guessBase == true){
            specOptions.unitBase = guessBaseUnits();
        }
    }catch(e){
        alert(e);
    }
}

function getAllTextStyles(options){
    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);

    allTextStyles = [];
    var atf = getAllTextFrames();
    _.each(atf, function(tf){
        getTextStyles(tf);
    })

    writeAllTextStyles();
}

function getAllTextFrames(){
    var allTextFrames = activeDocument.textFrames;
    var len = allTextFrames.length;
    var atf = [];
    for(var i = 0; i < len; i++){
        var tf = allTextFrames[i];
        var lockedOrHidden = checkIfLockedOrHidden(tf);
        if(!lockedOrHidden) {
            // only add text frames with a set name;
            var n = tf.name;
            if(n.length > 0){
                atf.push(tf);
            }
        }
    }
    return atf;
}

function getSpecPos(obj, style){
    var x = 0;
    var y = artboardTop + (obj.top - artboardTop);
    var x2 = obj.left - artboardLeft;
    var y2 = y;

    // on left or right half of artboard
    if(obj.left - artboardLeft > artboardWidth/2) {
        x = artboardLeft + artboardWidth + artboardPadding;
        style.isLeft = false;
    } else {
        x = artboardLeft - artboardPadding;
        style.isLeft = true;
    }
    style.obj = obj;
    style.gb = getGeometricBounds(obj);
    style.itemPos = {x: x2, y: y2};
    style.pos = {x: x, y: y + style.size/2};
    style.width = obj.width;
    style.height = obj.height;

    return {x: x, y: y};
}

function writeAllTextStyles(){
    if(allTextStyles.length <= 0){
        alert('no named textFrames found');
        return false;
    }

    allTextStyles = _.sortBy(allTextStyles, function(s){
        return s.itemPos.y;
    }).reverse();

    var allTextStylesGroup = specLayer.groupItems.add();
    allTextStylesGroup.name = 'All Text Styles ';

    var specGroups = [];
    _.each(allTextStyles, function(ts, i){
        var textStylesGroup = allTextStylesGroup.groupItems.add();
        textStylesGroup.name = 'Text Styles '+i;

        // build text string
        var str = buildTextSpecString(ts.itemName + brTab, ts);
        var tf = textStylesGroup.textFrames.add();
        tf.contents = str;
        setSpecStyles(tf, white);

        if(ts.isLeft == true){
            textStylesGroup.left = Math.abs(artboardLeft - textStylesGroup.width - artboardPadding/2);
        }else {
            textStylesGroup.left = Math.abs(artboardLeft + artboardWidth + artboardPadding/2);
        }
        textStylesGroup.top = ts.pos.y;
        var r = geometricBoundsToRect(tf.geometricBounds, textStylesGroup.pathItems, 15);

        // hitTest()
        if(specGroups.length >= 1){
            _.each(specGroups, function(specGroup){
                var ht = hitTest(textStylesGroup, specGroup)
                if(ht == true){
                    if(textStylesGroup.top > specGroup.top){
                        textStylesGroup.top = specGroup.top + specGroup.height + 20;
                    }else {
                        textStylesGroup.top = specGroup.top - specGroup.height - 20;
                    }
                }
            });
        }

        // draw pointers
        if(ts.isLeft == true){
            var p3 = [textStylesGroup.left + textStylesGroup.width, textStylesGroup.top - (textStylesGroup.height - specLeading)/2]
            var p4 = [ts.gb.left, ts.gb.center[1]];
            drawSpecLine(p3, p4, textStylesGroup);

        }else {
            var gb2 = getGeometricBounds(textStylesGroup);
            var p3 = [ts.gb.right, ts.gb.center[1]];
            var p4 = [artboardLeft + artboardWidth + artboardPadding/2, gb2.center[1]];
            drawSpecLine(p3, p4, textStylesGroup);
        }

        specGroups.push(textStylesGroup);
    });

}
function drawSpecLine(p1, p2, group){
    var newPath = group.pathItems.add();
    newPath.setEntirePath( Array( p1, p2 ) );
    newPath.stroked = true;
    newPath.filled = false;
    newPath.strokeColor = specColor;
    newPath.zOrder(ZOrderMethod.SENDTOBACK);
    return newPath;
}

function setSpecStyles(tf, col){
    tf.textRange.characterAttributes.textFont = specTextFont;
    tf.textRange.characterAttributes.size = specSize;
    tf.textRange.characterAttributes.autoLeading = specAutoLeading;
    tf.textRange.characterAttributes.leading = specLeading;
    tf.textRange.fillColor = col;
}

function getTextStyles(tf){
    var words = tf.words;
    var n = tf.name;
    var len = words.length;
    var prevStyle = null;

    for(var i = 0; i < len; i++){
        var w = words[i];
        var style = new TextStyle(w, n, tf);
        var f = _.find(allTextStyles, function(s){
            return s.id == style.id;
        });
        if(f == undefined){
            getSpecPos(tf, style);
            allTextStyles.push(style)
        }
    }
}

function TextStyle(tRange, itemName, tf){
    var ca = tRange.characterAttributes;
    var textFont = ca.textFont;
    this.name = textFont.name;
    this.color = ca.fillColor;
    this.size = ca.size;
    this.family = textFont.family;
    this.style = textFont.style;
    this.leading = ca.leading;
    this.tracking = ca.tracking;
    this.opacity = 100;
    this.lines = tf.lines.length;

    try {
        this.opacity = tf.opacity;
    }catch(e){}

    this.itemName = itemName;
    this.id = '';
    _.each(this, function(v, k){
        this.id += v;
    }, this);

    return this;
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
    artboardHeight = (artboardRect[3] - artboardRect[1]);

}

// guess artboard base unit from width
function guessBaseUnits(){
    var w = Math.round(artboardWidth);
    var bUnit = 1;
    // android
    if(w == 1080){
        bUnit = 3;
    }else if(w = 1080/2){
        bUnit = 2;

    // iPhone Retina 640
    }else if(w = 640){
        bUnit = 2
    }
    return bUnit;
}


function SelectionInfo(direction, options){
    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);
    selectedObjects = actDoc.selection;

    var numObjects = selectedObjects.length;

    if(direction == "spaceBetween"){
        var sp = new Spacing(selectedObjects)
        this.specItems = specItems;
        return this;
    }
    for(var i = 0; i < numObjects; i++){
        var o = selectedObjects[i];
        if(o.typename == "TextFrame"){
            var spec = new TextSpecLayer(o);
        } else {
            var spec = new SpecLayer(o, direction);
        }

    }
    this.specItems = specItems;

    return this;
}

// Vertical & Horizontal dimensions and spacing
function SpecLayer(object, direction) {
    this.object = object;

    // Do Spacing
    if(direction == 'spaceBetween'){
        try {
            this.spaceBetween = new Spacing(this);
            addSpecItem('spaceBetween', this.spaceBetween);
        } catch(e) {
            alert(e);
        }
        return this;
    }

    // Do Width / Height specs
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


function TextSpecLayer(object, direction) {
    this.object = object;
    try {
        this.text = new TextSpec(this)
        addSpecItem('textItem', this.text);
    } catch(e) {
        alert(e);
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

    var style = TextStyle(textRange, object.name, object);

    var specGroup = specLayer.groupItems.add();

    // build text string
    var str = buildTextSpecString('', style);

    this.tf = specGroup.textFrames.add();
    this.tf.contents = object.name + brTab + str;

    setSpecStyles(this.tf, rectBackgroundColor);

    // place textfield on left or right
    if(object.left - artboardLeft > artboardWidth/2){
        this.alignRight = true;
        this.tf.left = artboardLeft + artboardWidth + specOptions.objectPadding*2 + specOptions.objectPadding * 2;
    }else {
        this.tf.left = artboardLeft - this.tf.width - specOptions.objectPadding*2 - 80;
    }

    this.tf.top = object.top;

    var r = geometricBoundsToRect(this.tf.geometricBounds, specGroup.pathItems, 15);
    return this;
}

function buildTextSpecString(start, style){
    var fontSize = Math.round(style.size / specOptions.unitBase);
    var rgb = getColorValues(style.color);
    var hex = rgbToHex(style.color.red, style.color.green, style.color.blue);

    var str = start;
    str += 'font-family: ' + style.family + brTab;
    str += 'font-style: ' + style.style + brTab;
    str += 'font-size: ' + fontSize + specOptions.fontUnits + brTab;
    str += 'rgb: rgb(' + rgb.join() + ')' + brTab;
    str += 'hex: ' + hex;

    if(style.lines.length > 1){
        str += brTab + 'leading: ' + (Number(style.leading / specOptions.unitBase)) + specOptions.fontUnits;
    }
    if(style.opacity < 100){
        str += brTab + 'opacity: ' + Math.round(style.opacity);
    }
    if(style.tracking > 0){
        str += brTab + 'letter-spacing: ' + style.size * (style.tracking * .001);
    }
    return str;
}

function distFromEdge(edge, options){
    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);
    var numObjects = selectedObjects.length;
    for(var i = 0; i < numObjects; i++){

        var ob1 = selectedObjects[i];
        var gb1 = getGeometricBounds(ob1);
        var dist = 0;
        var length = 0;
        var p1 = [0,0];
        var p2 = [0,0];
        var lengthTf;
        var alignText = 'top';

        if(edge == 'left'){
            dist = Math.abs(gb1.left - artboardLeft);
            p1 = [artboardLeft, gb1.center[1]];
            p2 = [gb1.left, gb1.center[1]];
        }else if(edge == 'right'){
            dist = Math.abs((artboardLeft + artboardWidth) - gb1.right);
            p1 = [gb1.right, gb1.center[1]];
            p2 = [artboardLeft + artboardWidth, gb1.center[1]];
        }else if(edge == 'top'){
            alignText = 'left';
            dist = Math.abs(gb1.top);
            p1 = [gb1.center[0], 0];
            p2 = [gb1.center[0], gb1.top];
        }else if(edge == 'bottom'){
            alignText = 'left';
            dist = Math.abs(artboardHeight - gb1.bottom);
            p1 = [gb1.center[0], gb1.bottom];
            p2 = [gb1.center[0], artboardHeight];
        }
        length = Math.round(dist / specOptions.unitBase);


        try {
            lengthTf = addText(length + " " + specOptions.units, p1, p2, dist, alignText);
        } catch(e){
            alert(e);
        }


        var cpItems = specLayer.compoundPathItems.add();
        var newPath = cpItems.pathItems.add();
        newPath.setEntirePath( Array( p1, p2 ) );
        newPath.stroked = true;
        newPath.filled = false;
        newPath.strokeColor = specColor;
        cpItems.name = edge + " edge " + length;
    }
}

function Spacing(selectedObjects, dir){
    var numObjects = selectedObjects.length;

    if(numObjects == 2){
        var ob1 = selectedObjects[0];
        var ob2 = selectedObjects[1];

        var gb1 = getGeometricBounds(ob1);  // {left, top, right, bottom, center}
        var gb2 = getGeometricBounds(ob2);

        this.p1 = [0,0];
        this.p2 = [0,0];

        var lengthTf;
        var paragraph, leading, length;
        var textAlign = '';
        if(Math.round(gb1.top) == Math.round(gb2.top) || dir == 'horz'){
            var spacing = getSpacing(gb1, gb2, 'horz');
            textAlign = 'top';
        }else if(Math.round(gb1.left) == Math.round(gb2.left) || dir == 'vert'){
            var spacing = getSpacing(gb1, gb2, 'vert');
            textAlign = 'left';
        }else {
            return;
        }

        var diff = spacing.diff;
        length = diff / specOptions.unitBase;
        this.p1 = spacing.p1;
        this.p2 = spacing.p2;

        try {
            lengthTf = addText(length + " " + specOptions.units, this.p1, this.p2, diff, textAlign);
        } catch(e){
            alert(e);
        }

        this.path = specLayer.compoundPathItems.add();
        var newPath = this.path.pathItems.add();
        newPath.setEntirePath( Array( this.p1, this.p2 ) );
        newPath.stroked = true;
        newPath.filled = false;
        newPath.strokeColor = specColor;
        this.path.name = direction + " line-" + Math.round(length);
    }

    return this;
}

function getSpacing(gb1, gb2, dir){
    var sorted;
    var a, b;
    var p1, p2;
    if(dir == 'horz'){
        sorted = _.sortBy([gb1,gb2], function(ob){
            return ob.center[0]
        });
        a = sorted[0].right;
        b = sorted[1].left;

        p1 = [a, sorted[0].center[1]];
        p2 = [b, sorted[0].center[1]];
    }else {
        sorted = _.sortBy([gb1,gb2], function(ob){
            return ob.center[1]
        });
        var a = sorted[0].top;
        var b = sorted[1].bottom;
        p1 = [sorted[0].center[0], b];
        p2 = [sorted[0].center[0], a];
    }
    var diff = Math.round(b - a);
    return {
        diff: diff,
        p1: p1,
        p2: p2
    };
}

function addText(txt, p1, p2, diff, pos){
    var justification;
    var tf = specLayer.textFrames.add();

    tf.contents = txt;
    tf.textRange.characterAttributes.textFont = specTextFont;
    tf.textRange.characterAttributes.size = specSizeSm;
    tf.textRange.fillColor = specColor;
    var paragraph = tf.paragraphs[0];
    // .characterAttributes.leading
    var ca = paragraph.characterAttributes;
    var leading = specLeading;
    try {
        leading = ca.leading;
    } catch(e){

    }

    if(pos && pos == 'top'){
        justification = Justification.CENTER;
        tf.left = p1[0] + diff/2;
        tf.top = p1[1] + leading + specOptions.objectPadding;
    }else if(pos && pos == 'left'){
        justification = Justification.RIGHT;

        tf.left = p1[0] - specOptions.objectPadding;
        tf.top = p1[1] - diff/2 + leading/2;

    }else {
        justification = Justification.LEFT;
    }

    paragraph.justification = justification;
    return tf;
}
// direction: "horz" | "vert"
function Spec(direction, group){
    var length;

    this.direction = direction;
    this.object = group.object;
    this.height = Math.round(this.object.height);
    this.width = Math.round(this.object.width);

    this.p1 = [0,0];
    this.p2 = [0,0];

    if(direction == "horz"){
        length = this.width / specOptions.unitBase;
        this.p1 = [this.object.left, this.object.top + specOptions.objectPadding];
        this.p2 = [this.object.left + this.width, this.object.top + specOptions.objectPadding];
        this.tf = addText(length + " " + specOptions.units, this.p1, this.p2, this.width, 'top');
    }else if(direction == "vert"){
        length = this.height / specOptions.unitBase;
        this.p1 = [this.object.left - specOptions.objectPadding, this.object.top];
        this.p2 = [this.object.left - specOptions.objectPadding, this.object.top - this.height];
        this.tf = addText(length + " " + specOptions.units, this.p1, this.p2, this.height, 'left');
    }
    if(specOptions.colorSpec == true){
        if(direction == 'vert' && group.horz != undefined){
            // skip
        }else {

        }
    }

    // Create the path items
    this.path = specLayer.compoundPathItems.add();
    var newPath = this.path.pathItems.add();
    newPath.setEntirePath( Array( this.p1, this.p2 ) );
    newPath.stroked = true;
    newPath.filled = false;
    newPath.strokeColor = specColor;
    this.path.name = direction + " line-" + Math.round(length);

    this.tf.textRange.characterAttributes.textFont = specTextFont;
    this.tf.textRange.characterAttributes.size = specSize;
    this.tf.textRange.fillColor = specColor;
    return this;
}

function getColorSpecs(options){

    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);

    var numObjects = selectedObjects.length;
    for(var i = 0; i < numObjects; i++){

        try {
            var obj = selectedObjects[i];
            if(obj.typename == "TextFrame"){
                continue;
            }

            var objColor;
            if(obj.filled){
                objColor = obj.fillColor;
            }else if(obj.stroked){
                objColor = obj.strokeColor;
            }else {
                continue;
            }
            var group = specLayer.groupItems.add();

            var objName = obj.name;
            var isGrad = false;
            var txt = objName;
            if(objColor.typename == 'SpotColor'){
                objColor = objColor.spot.color;
            }else if(objColor.typename == 'GradientColor'){
                isGrad = true;
            }else if(objColor.typename != 'RGBColor'){

            }

            if(!isGrad){
                var hex = rgbToHex(objColor.red, objColor.green, objColor.blue);
                txt += br + 'color: #'+hex;

                var op = 100;
                try {
                    op = obj.opacity;
                }catch(e) {
                    alert(e);
                }
                if(op != 100){
                    txt += br + 'opacity: ' + Math.round(op) + "%";
                }

            }else {
                var stops = objColor.gradient.gradientStops;
                var gText = ' gradient';

                _.each(stops, function(stop, i){
                    if(stop.color.typename == 'RGBColor'){
                        var hex = rgbToHex(stop.color.red, stop.color.green, stop.color.blue);
                        var op = Math.round(stop.opacity) + '%';
                        var rp = Math.round(stop.rampPoint)+ '%';
                        gText += br + 'color '+ i +': #'+hex + ', opacity: ' + op + ', stop: '+rp;
                    }else if(stop.color.typename == 'GrayColor'){
                        var perc = ((100 - stop.color.gray)/100) * 255;
                        // alert(perc);
                        var hex = rgbToHex(perc, perc, perc);
                        var op = Math.round(stop.opacity) + '%';
                        var rp = Math.round(stop.rampPoint)+ '%';
                        gText += br + 'color '+ i +': #'+hex + ', opacity: ' + op + ', stop: '+rp;
                    }
                });
                txt += gText;
            }

            var gb = getGeometricBounds(obj);

            var p1 = [gb.right, gb.center[1]];
            var p2 = [artboardLeft + artboardWidth + 50, gb.center[1]];

            var tf = addText(txt);
            tf.move(group, ElementPlacement.PLACEATBEGINNING);

            var gb2 = getGeometricBounds(tf);
            drawColorSquare(objColor, 0, artboardTop-gb2.center[1], group);

            group.left = p2[0];
            group.top = p2[1];

            var gb3 = getGeometricBounds(group);

            p1[1] = gb3.center[1];
            p2[1] = gb3.center[1];
            var newPath = group.pathItems.add();
            newPath.setEntirePath( Array( p1, p2 ) );
            newPath.stroked = true;
            newPath.filled = false;
            newPath.strokeColor = specColor;

        }catch(e){
            alert(e);
        }
    }
}

// get colors based on Illustrator Color Type
function getColorValues(color) {
    if(color.typename) {
        switch(color.typename) {
            case "RGBColor":
                return  [Math.floor(color.red), Math.floor(color.green), Math.floor(color.blue)];
            case "GrayColor":
                return [Math.floor(color.gray), Math.floor(color.gray), Math.floor(color.gray)];
            case "SpotColor":
                return getColorValues(color.spot.color);
        }
    }
    return "Non Standard Color Type";
}



// find center of geometric bounds [x,y]
function findCenter(pi){
    var gb = pi.geometricBounds;  // [left, top, right, bottom]
    return [(gb[0] + gb[2]) / 2, (gb[1] + gb[3]) / 2];
}


function getGeometricBounds(ob){
    var gb = ob.geometricBounds; // [left, top, right, bottom]
    var c = findCenter(ob);
    return {
        left: gb[0],
        top: gb[1],
        right: gb[2],
        bottom: gb[3],
        center: c,
        item: ob
    }
}


// load xLib
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


// button functions
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

$.spaceBetweenSpec = function(options) {
    selectionInfo = new SelectionInfo('spaceBetween', options);
    dispatchCEPEvent("My Custom Event", 'spaceBetweenSpec');
    return "complete";
}

$.horzSpacing = function(options) {
    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);
    var selectedObjects = actDoc.selection;
    var sp = new Spacing(selectedObjects, 'horz');
    dispatchCEPEvent("My Custom Event", 'horzSpacing');
    return "complete";
}

$.vertSpacing = function(options) {
    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);
    var selectedObjects = actDoc.selection;
    var sp = new Spacing(selectedObjects, 'vert');
    dispatchCEPEvent("My Custom Event", 'vertSpacing');
    return "complete";
}



$.specColors = function(options) {
    colorInfo = new ColorInfo(options);
    dispatchCEPEvent("My Custom Event", 'colors');
    return "complete";
}



$.specAllText = function(options) {
    getAllTextStyles(options);
    dispatchCEPEvent("My Custom Event", 'specAllText');
    return "complete";
}

$.makeArtboardBackground = function(options) {
    bigArtboardBackground();
    dispatchCEPEvent("My Custom Event", 'makeArtboardBackground');
    return "complete";
}
$.makeAllArtboardBackgrounds = function(options) {
    allArtboardBackgrounds();
    dispatchCEPEvent("My Custom Event", 'allArtboardBackgrounds');
    return "complete";
}

$.divideTextFrameLines = function(options) {
    divideTextFrame();
    dispatchCEPEvent("My Custom Event", 'divideTextFrame');
    return "complete";
}

$.specDistFromLeft = function(options) {
    distFromEdge('left', options);
    dispatchCEPEvent("My Custom Event", 'distFromEdge');
    return "complete";
}
$.specDistFromRight = function(options) {
    distFromEdge('right', options);
    dispatchCEPEvent("My Custom Event", 'distFromEdge');
    return "complete";
}
$.specDistFromTop = function(options) {
    distFromEdge('top', options);
    dispatchCEPEvent("My Custom Event", 'distFromEdge');
    return "complete";
}
$.specDistFromBottom = function(options) {
    distFromEdge('bottom', options);
    dispatchCEPEvent("My Custom Event", 'distFromEdge');
    return "complete";
}
$.getSelectedColorSpecs = function(options) {
    getColorSpecs(options);
    dispatchCEPEvent("My Custom Event", 'getColorSpecs');
    return "complete";
}

$.doEditArtboardNames = function() {
    editArtboardNames();
    dispatchCEPEvent("My Custom Event", 'editArtboardNames');
    return "complete";
}
$.doAddArtboardNames = function() {
    addArtboardNames();
    dispatchCEPEvent("My Custom Event", 'addArtboardNames');
    return "complete";
}

$.selectSimilarText = function(options) {
    selectSimilarText(options);
    dispatchCEPEvent("My Custom Event", 'selectSimilarText');
    return "complete";
}

$.objectDetails = function(options) {
    exploreObject();
    dispatchCEPEvent("My Custom Event", 'objectDetails');
    return "complete";
}
$.artboardsToLayers = function(options) {
    artboardsToLayers();
    dispatchCEPEvent("My Custom Event", 'artboardsToLayers');
    return "complete";
}


$.testFunction = function(options) {
    try {
        createNewDoc();
        // selectScriptFile();
        // listScripts();
    }catch (e){
        alert(e);
    }

    dispatchCEPEvent("My Custom Event", 'test');
    return "complete";
}



$.runScriptFromFile = function(options) {
    // alert('runScriptFromFile '+options);

    runScriptFromFile(scriptFolderPath+'/'+options);
    dispatchCEPEvent("My Custom Event", 'runScriptFromFile');
    return "complete";
}

$.addRemoteItems = function(data) {
    // alert(data);
    addRemoteItems(data);
}


var scriptFolderPath = '~/Dropbox/SharedAdobeScripts';
var folderFiles = [];
var folderObjects = {};
var listData = listScripts();
dispatchCEPEvent("My Custom Event", listData);

function listScripts(){
    var ob = {type: 'listScripts'};
    var str = '';

    if(scriptFolderPath != null){

        var scriptFolder = Folder(scriptFolderPath);
        if(scriptFolder.exists){
            str = decodeURI(scriptFolder);
            addScriptFiles(scriptFolder);
        }
    }
    ob.str = str;
    ob.folderFiles = folderFiles;
    ob.folderObjects = folderObjects;
    // alert(_.size(folderObjects.SharedAdobeScripts));
    ob = JSON.stringify(ob);
    return ob;
}

function addScriptFiles(scriptFolder, parent){
    var parent = parent || folderObjects;

    if(parent[scriptFolder.name] == undefined){
        parent[scriptFolder.name] = {
            'files': [],
            'folders': {}
        }
    }
    var sf = parent[scriptFolder.name];
    var tempFolderFiles = scriptFolder.getFiles(function(f){
        return f instanceof Folder || (f instanceof File && f.name.match(/(\.js$|\.jsx$)/));
    });
    _.each(tempFolderFiles, function(ff){

        if(ff instanceof File == true){
            var n = decodeURI(ff.name);
            sf.files.push(n);
            folderFiles.push(n);
        }else {
           var childFolder = Folder(ff);
           addScriptFiles(childFolder, sf.folders);
        }
   });
}


