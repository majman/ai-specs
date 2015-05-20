#include "underscore.js";
#include "utils.js";
#include "colorInfo.js";
#include "artboard-bg.js";

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
var specSizeSm = specSize * 0.85 >> 0;
var specAutoLeading = false;
var specLeading = 20 * specMult >> 0;
var artboardPadding = 150;

var selectionInfo;

var specLayer;
var idx,
    actArtboard,
    artboardRect,
    artboardLeft,
    artboardTop,
    artboardWidth;

var br = "\r";
var brTab = "\r  "


// store all specs objects / options for session
var specItems = {
    total: 0
};
var specOptions = {
    units: "dp",
    fontUnits: "pt",
    objectPadding: 10,
    unitBase: 3,
    colorSpec: false,
    guessBase: true
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

        if(options.guessBase == true){
            specOptions.unitBase = guessBaseUnits();
        }

    }catch(e){
        alert(e);
    }


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

var allTextStyles = [];

function getAllTextStyles(options){
    updateArtboardInfo();
    getSpecLayer();
    updateOptions(options);


    allTextStyles = [];
    var atf = getAllTextFrames();
    _.each(atf, function(tf){
        getTextStyles(tf);
    })
    // allTextStyles = _.sortBy(allTextStyles, function(s){
    //     return s.itemName;
    // });
    writeAllTextStyles();
    // alert(atf.length+', ' + allTextStyles.length);
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

function drawColorSquare(fill, x, y, group){
    var swatchSize = 20;
    var x = -swatchSize * 1.25 >> 0;
    var y = artboardTop - y;
    var rectRef = group.pathItems.rectangle(y, x, swatchSize, swatchSize);

    rectRef.fillColor = fill;
    rectRef.stroked = false;
}

function getSpecPos(pItem, style){
    var x = 0;
    var y = artboardTop + (pItem.top - artboardTop);
    // -2160 , -2484.4462890625
    // alert(artboardTop+' , '+pItem.top);
    var x2 = pItem.left - artboardLeft;
    var y2 = y;

    style.isLeft = true;

    // on right half of artboard
    if(pItem.left - artboardLeft > artboardWidth/2) {
        x = artboardLeft + artboardWidth + artboardPadding;
        style.isLeft = false;
    } else {
        // on left half
        x = artboardLeft - artboardPadding;
    }

    style.itemPos = {x: x2, y: y2};
    style.pos = {x: x, y: y + style.size/2};

    style.width = pItem.width;
    style.height = pItem.height;

    return {x: x, y: y};
}

var placeSpecNearItem = true;

function writeAllTextStyles(){
    if(allTextStyles.length <= 0){
        alert('no named textFrames found');
    }

    allTextStyles = _.sortBy(allTextStyles, function(s){
        return s.itemPos.y;
    }).reverse();

    if(!placeSpecNearItem){
        var textStylesGroup = specLayer.groupItems.add();
        textStylesGroup.name = 'Text Styles';

        var tf = textStylesGroup.textFrames.add();
        tf.contents = '';
        var str = '';

        var lineNum = 0;

        _.each(allTextStyles, function(ts, i){
            var fSize = Math.round(ts.size / specOptions.unitBase);
            var rgb = getColorValues(ts.color);
            var hex = rgbToHex(ts.color.red, ts.color.green, ts.color.blue);

            // tf.textRange.characterAttributes.textFont = specTextFontBold;
            // str += 'Rule # ' + Number(i + 1) + brTab;
            str += ts.itemName + brTab;
            str += 'font-family: ' + ts.family + brTab;
            str += 'font-style: ' + ts.style + brTab;
            str += 'font-size: ' + fSize + specOptions.fontUnits +  brTab;
            str += 'color: rgb(' + rgb.join() +"), "+ hex + brTab;
            if(ts.opacity != 100){
                str += 'opacity: ' + ts.opacity + brTab;
                lineNum++;
            }
            str += br;

            lineNum += 6;

            try {
                drawColorSquare(ts.color, 0, lineNum * specLeading - (2 * specLeading) - specSize, textStylesGroup)
            }catch(e){
                alert(e)
            }


        });

        tf.contents += str;

        tf.textRange.characterAttributes.textFont = specTextFont;
        tf.textRange.characterAttributes.size = specSize;
        tf.textRange.characterAttributes.autoLeading = specAutoLeading;
        tf.textRange.characterAttributes.leading = specLeading;
        tf.textRange.fillColor = white;

        textStylesGroup.left = artboardLeft + artboardWidth + specOptions.objectPadding*2 + specOptions.objectPadding * 2;
    }else {
        var allTextStylesGroup = specLayer.groupItems.add();
        allTextStylesGroup.name = 'All Text Styles ';

        var specGroups = [];
        _.each(allTextStyles, function(ts, i){
            var textStylesGroup = allTextStylesGroup.groupItems.add();
            textStylesGroup.name = 'Text Styles '+i;

            var tf = textStylesGroup.textFrames.add();
            tf.contents = '';
            var str = '';

            var lineNum = 0;

            var fSize = Math.round(ts.size / specOptions.unitBase);
            var rgb = getColorValues(ts.color);
            var hex = rgbToHex(ts.color.red, ts.color.green, ts.color.blue);

            // tf.textRange.characterAttributes.textFont = specTextFontBold;
            // str += 'Rule # ' + Number(i + 1) + brTab;
            str += ts.itemName + brTab;
            str += 'font-family: ' + ts.family + brTab;
            str += 'font-style: ' + ts.style + brTab;
            str += 'font-size: ' + fSize + specOptions.fontUnits +  brTab;
            str += 'color: rgb(' + rgb.join() +"), "+ hex + brTab;
            if(ts.opacity != 100){
                str += 'opacity: ' + ts.opacity + brTab;
                lineNum++;
            }


            lineNum += 6;

            try {
                drawColorSquare(ts.color, 0, lineNum * specLeading - (2 * specLeading) - specSize, textStylesGroup)
            }catch(e){
                alert(e)
            }
            tf.contents += str;
            tf.textRange.characterAttributes.textFont = specTextFont;
            tf.textRange.characterAttributes.size = specSize;
            tf.textRange.characterAttributes.autoLeading = specAutoLeading;
            tf.textRange.characterAttributes.leading = specLeading;
            tf.textRange.fillColor = white;


            if(ts.isLeft == true){
                var p1 = [textStylesGroup.width + specOptions.objectPadding, specSize];
                var p2 = [textStylesGroup.width + specOptions.objectPadding, -textStylesGroup.height + specSize + specLeading];

                var path = textStylesGroup.compoundPathItems.add();
                var newPath = textStylesGroup.pathItems.add();
                newPath.setEntirePath( Array( p1, p2 ) );
                newPath.stroked = true;
                newPath.filled = false;
                newPath.strokeColor = specColor;

                var tsLeft = ts.pos.x - textStylesGroup.width;
                // var connectX = ts.itemPos.x + Math.abs(tsLeft) - artboardPadding/2;
                // var connectY = (p2[1] - p1[1])/2  + p1[1] >> 0;
                // var p3 = [p1[0], connectY]
                // var p4 = [connectX, connectY]


                // var newPath = textStylesGroup.pathItems.add();
                // newPath.setEntirePath( Array( p3, p4 ) );
                // newPath.stroked = true;
                // newPath.filled = false;
                // newPath.strokeColor = specColor;


                textStylesGroup.left = tsLeft;
                textStylesGroup.top = ts.pos.y;

            }else {
                var p1 = [-artboardPadding/2, specSize];
                var p2 = [-artboardPadding/2, -textStylesGroup.height + specSize + specLeading];

                var path = textStylesGroup.compoundPathItems.add();
                var newPath = textStylesGroup.pathItems.add();
                newPath.setEntirePath( Array( p1, p2 ) );
                newPath.stroked = true;
                newPath.filled = false;
                newPath.strokeColor = specColor;

                var tsLeft = ts.pos.x;


                var r = ts.itemPos.x + ts.width - artboardLeft;
                var distanceFromRight = artboardWidth - r;
                // alert(r + ', '+distanceFromRight + ', '+p1[0])

                // 890.9453125, 189.0546875, -75

                var connectX = p1[0] - distanceFromRight;
                var connectY = (p2[1] - p1[1])/2  + p1[1] >> 0;
                var p3 = [p1[0], connectY]
                var p4 = [connectX, connectY]


                var newPath = textStylesGroup.pathItems.add();
                newPath.setEntirePath( Array( p3, p4 ) );
                newPath.stroked = true;
                newPath.filled = false;
                newPath.strokeColor = specColor;


                textStylesGroup.left = tsLeft - Math.abs(connectX);
                textStylesGroup.top = ts.pos.y;

                specGroups.push(textStylesGroup)

            }

            // hitTest()
            if(specGroups.length >= 1){
                _.each(specGroups, function(specGroup){
                    var ht = hitTest(textStylesGroup, specGroup)
                    if(ht == true){

                        if(textStylesGroup.top > specGroup.top){
                            textStylesGroup.top = specGroup.top + specGroup.height;
                        }else {
                            textStylesGroup.top = specGroup.top - specGroup.height;
                        }
                    }
                });
            }

            var p1 = [textStylesGroup.left + textStylesGroup.width, textStylesGroup.top - (textStylesGroup.height  -  specLeading)/2]
            var p2 = [artboardLeft + ts.itemPos.x - specOptions.objectPadding, ts.itemPos.y - ts.height/2]
            var newPath = textStylesGroup.pathItems.add();
            newPath.setEntirePath( Array( p1, p2 ) );
            newPath.stroked = true;
            newPath.filled = false;
            newPath.strokeColor = specColor;


            specGroups.push(textStylesGroup);


        });



    }

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

    try {
        if(tf.opacity < 100){
            this.opacity = tf.opacity;
        }
    }catch(e){
        // opacity
    }

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
        var spec = new SpecLayer(o, direction);
    }
    this.specItems = specItems;

    // alignTextItems();
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

    // Do Text Specs
    if ( this.object.typename == "TextFrame" ) {
        try {
            this.text = new TextSpec(this)
            addSpecItem('textItem', this.text);
        } catch(e) {
            alert(e);
        }
        return this;
    }

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


    str += 'font-family: ' + fontName + brTab;
    str += 'font-style: ' + fontStyle + brTab;
    str += 'font-size: ' + fontSize + specOptions.fontUnits +  brTab;
    str += 'color: rgb(' + rgb.join() +"), "+ hex + brTab;

    if(textRange.lines.length > 1){
        str += 'leading: ' + (Number(leading / specOptions.unitBase)) + specOptions.fontUnits + brTab;
    }
    if(fontOpacity < 100){
        str += 'opacity: ' + Math.round(fontOpacity) + brTab;
    }
    if(tracking > 0){
        str += 'letter-spacing: ' + letterSpacing + specOptions.fontUnits + brTab;
    }


    this.tf = specLayer.textFrames.add();


    var n = object.name;
    this.tf.contents = n + brTab;

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

function Spacing(selectedObjects){
    // this.object = group.object;

    var numObjects = selectedObjects.length;
    // alert(numObjects)
    if(numObjects == 2){
        var ob1 = selectedObjects[0];
        var ob2 = selectedObjects[1];

        // {left, top, right, bottom, center}
        var gb1 = getGeometricBounds(ob1);
        var gb2 = getGeometricBounds(ob2);

        this.p1 = [0,0];
        this.p2 = [0,0];

        if(gb1.top == gb2.top){
            var sorted = _.sortBy([gb1,gb2], function(ob){
                return ob.center[0]
            });
            var l = sorted[0];
            var r = sorted[1];
            var diff = Math.round(r.left - l.right);

            var paragraph, leading, length;
            length = diff / specOptions.unitBase;

            this.p1 = [l.right, l.center[1]];
            this.p2 = [r.left, l.center[1]];

            try {
                addText(length + " " + specOptions.units, this.p1, this.p2, diff, 'top')
            } catch(e){
                alert(e);
            }


        }else if(gb1.left == gb2.left){
            var sorted = _.sortBy([gb1,gb2], function(ob){
                return ob.center[1]
            });
            var b = sorted[0];
            var t = sorted[1];

            // alert(b.center +' \n' + t.center)

            // return this;
            var diff = Math.round(t.bottom - b.top);

            var paragraph, leading, length;
            length = diff / specOptions.unitBase;

            this.p1 = [t.center[0], t.bottom];
            this.p2 = [t.center[0], b.top];
            try {
                addText(length + " " + specOptions.units, this.p1, this.p2, diff, 'left')
            } catch(e){
                alert(e);
            }
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

function addText(txt, p1, p2, diff, pos){
    var justification;
    var tf = specLayer.textFrames.add();
    tf.contents = txt;
    tf.textRange.characterAttributes.textFont = specTextFont;
    tf.textRange.characterAttributes.size = specSizeSm;
    tf.textRange.fillColor = specColor;

    var paragraph = tf.paragraphs[0];
    var leading = paragraph.leading;


    if(pos == 'top'){
        justification = Justification.CENTER;
        tf.left = p1[0] + diff/2;
        tf.top = p1[1] + leading + specOptions.objectPadding;
    }else if(pos == 'left'){
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


    if(specOptions.colorSpec == true){
        if(direction == 'vert' && group.horz != undefined){
            // skip
        }else {


            try {
                // selection[0].fillColor.typename

                var objColor = this.object.fillColor;
                var isGrad = false;
                if(objColor.typename == 'SpotColor'){
                    objColor = objColor.spot.color;
                }else if(objColor.typename == 'GradientColor'){
                    isGrad = true;
                }else if(objColor.typename != 'RGBColor'){

                }
                if(!isGrad){
                    var hex = rgbToHex(objColor.red, objColor.green, objColor.blue);
                    this.tf.contents += brTab + 'color: '+hex;
                    this.tf.top += leading * 1.5;
                    var op = 100;
                    try {
                        op = this.object.opacity;
                    }catch(e) {
                        alert(e);
                    }

                    if(op != 100){
                        this.tf.contents += brTab + 'opacity: ' + op + "%";
                        this.tf.top += leading * 1.5;
                    }

                }else {

                    var stops = objColor.gradient.gradientStops;
                    var gText = '';
                    _.each(stops, function(stop){
                        if(stop.color.typename == 'RGBColor'){
                            var hex = rgbToHex(stop.color.red, stop.color.green, stop.color.blue);
                            var op = Math.round(stop.opacity) + '%';
                            var rp = Math.round(stop.rampPoint)+ '%';
                            gText += brTab + 'color: '+hex + ', opacity: ' + op + ', stop: '+rp;
                        }
                    });

                    this.tf.contents += gText;
                    this.tf.top += leading * 1.5 * stops.length;

                }




            }catch(e){
                alert(e);
            }
        }
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

$.specColors = function(options) {
    colorInfo = new ColorInfo(options);
    dispatchCEPEvent("My Custom Event", 'colors');
    return "complete";
}

$.spaceBetweenSpec = function(options) {
    selectionInfo = new SelectionInfo('spaceBetween', options);
    dispatchCEPEvent("My Custom Event", 'spaceBetweenSpec');
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

$.testFunction = function(options) {
    var val = {"a": "foo"};
    dispatchCEPEvent("My Custom Event", stringify(val));
    return o;
}

function stringify(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"' + obj + '"';
        return String(obj);
    } else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n];
            t = typeof(v);
            if (obj.hasOwnProperty(n)) {
                if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
}