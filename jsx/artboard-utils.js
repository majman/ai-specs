var doc = app.activeDocument;

function bigArtboardBackground(){
    var minArtboardX = 0;
    var maxArtboardX = 0;
    var minArtboardY = 0;
    var maxArtboardY = 0;
    var padding = 100;

    for (var abNumber = 0; abNumber < doc.artboards.length; abNumber++) {
        doc.artboards.setActiveArtboardIndex(abNumber);


        var activeArtboard =  doc.artboards[abNumber];
        var activeArtboardRect =  activeArtboard.artboardRect;
        var abX =  activeArtboardRect[0];
        var abY = -activeArtboardRect[1];
        var abW =  Math.round(activeArtboardRect[2] - abX);
        var abH = -activeArtboardRect[3] - abY;
        var artboardAspectRatio =  abH/abW;


        if(abX < minArtboardX){
            minArtboardX = abX;
        }
        if(abX + abW > maxArtboardX){
            maxArtboardX = abX + abW;
        }

        if(abY < minArtboardY){
            minArtboardY = abY;
        }
        if(abY + abH > maxArtboardY){
            maxArtboardY = abY + abH;
        }

    }

    var totalWidth = maxArtboardX - minArtboardX;
    var totalHeight = maxArtboardY - minArtboardY;
    var fill = new RGBColor();
    var bgLayer = createBackgroundLayer();
    bgLayer.zOrder(ZOrderMethod.SENDTOBACK);
    var rectRef = bgLayer.pathItems.rectangle(minArtboardY + padding, minArtboardX - padding, totalWidth + padding * 2, totalHeight + padding * 2);
    rectRef.fillColor = fill;
    rectRef.stroked = false;

    bgLayer.locked = true;
    // alert('min: ('+minArtboardX+', '+minArtboardY+'); max: ('+maxArtboardX+', '+maxArtboardY+')');
}

function allArtboardBackgrounds(){

    var padding = 0;

    var bgLayer = createBackgroundLayer();
    bgLayer.zOrder(ZOrderMethod.SENDTOBACK);

    var fill = new RGBColor();
    for (var abNumber = 0; abNumber < doc.artboards.length; abNumber++) {
        // doc.artboards.setActiveArtboardIndex(abNumber);

        var ab =  doc.artboards[abNumber];
        var abRect =  ab.artboardRect;
        var abX =  abRect[0];
        var abY = abRect[1];
        var abW =  Math.round(abRect[2] - abX);
        var abH = abY - abRect[3];
        var artboardAspectRatio =  abH/abW;

        var rectRef = bgLayer.pathItems.rectangle(abY + padding, abX - padding, abW + padding * 2, abH + padding * 2);
        rectRef.fillColor = fill;
        rectRef.stroked = false;
        rectRef.name = ab.name + ' Background';

    }
    // rectRef.selected = true;
    // for(i=0;i<doc.artboards.length;i++){
    //     var top=artboardRef[i].artboardRect[1];
    //     var left=artboardRef[i].artboardRect[0];
    //     var width=artboardRef[i].artboardRect[2]-artboardRef[i].artboardRect[0];
    //     var height=artboardRef[i].artboardRect[1]-artboardRef[i].artboardRect[3];
    //     var rect = docRef.pathItems.rectangle (top+bleedTop, left-bleedLeft, width+(+bleedLeft)+(+bleedRight), height+(+bleedTop)+(+bleedBottom));
    //     rect.fillColor = rect.strokeColor = new NoColor();
    //     rect.name = name;
    // }

    // bgLayer.locked = true;
    // alert('min: ('+minArtboardX+', '+minArtboardY+'); max: ('+maxArtboardX+', '+maxArtboardY+')');
}

function addArtboardNames(){
    updateArtboardInfo();
    getSpecLayer();

    try {
        var abNamesGroup;
        try {
            abNamesGroup = activeDocument.groupItems.getByName('Artboard Names');
        } catch(e) {
            abNamesGroup = specLayer.groupItems.add();
            abNamesGroup.name = 'Artboard Names';
        }
        for (var abNumber = 0; abNumber < activeDocument.artboards.length; abNumber++) {
            // activeDocument.artboards.setActiveArtboardIndex(abNumber);
            var ab =  activeDocument.artboards[abNumber];
            var n = ab.name;
            var abTF;
            try {
                abTF = abNamesGroup.textFrames.getByName('Artboard '+abNumber);
            } catch(e) {

                abTF = abNamesGroup.textFrames.add();
                abTF.name = 'Artboard '+abNumber;
                var abRect =  ab.artboardRect;
                var abX =  abRect[0];
                var abY = abRect[1];

                setSpecStyles(abTF, white);
                abTF.top = abY + abTF.height * 2;
                abTF.left = abX;
            }
            // var tf = abNamesGroup.textFrames.add();
            abTF.contents = toTitleCase(n);
        }
    } catch(e){
        alert(e);
    }
}
function toTitleCase(string) {
    // \u00C0-\u00ff for a happy Latin-1
    return string.toLowerCase().replace(/_/g, ' ').replace(/\b([a-z\u00C0-\u00ff])/g, function (_, initial) {
        return initial.toUpperCase();
    }).replace(/(\s(?:de|a|o|e|da|do|em|ou|[\u00C0-\u00ff]))\b/ig, function (_, match) {
        return match.toLowerCase();
    });
}

function createBackgroundLayer(){
    var actDoc = app.activeDocument;
    var bgLayer;
    try {
        bgLayer = actDoc.layers.getByName('Artboard Background');
    }catch(e) {
        bgLayer = actDoc.layers.add();
        bgLayer.name = 'Artboard Background';
    }
    bgLayer.locked = false;
    bgLayer.visible = true;
    return bgLayer;
}



function renameArtboardsFromLayers(){
    if (app.documents.length == 0) {
        alert("No Open / Active Document Found");
    } else {
        var doc = app.activeDocument;
        if (doc.artboards.length == doc.layers.length && doc.layers.length == doc.artboards.length) {
            for (var i = 0, l = doc.artboards.length; i < l; i++) {
                var ab = doc.artboards[i];
                ab.name = doc.layers[i].name;
            }
            alert("Finished:\nRenaming of Artboards to match Layer names is complete");
        } else {
            alert("Opps: This wont work!\n The number of Layers and Artboards do not match");
        }
    }
}

function adjustArtboardName(pre, suff){
    if (app.documents.length == 0) {
        alert("No Open / Active Document Found");
    } else {
        var doc = app.activeDocument;
        for (var i = 0, l = doc.artboards.length; i < l; i++) {
            var ab = doc.artboards[i];
            ab.name = pre + ab.name + suff;
        }
    }
}
function replaceArtboardName(find, repl){
    if (app.documents.length == 0) {
        alert("No Open / Active Document Found");
    } else {
        var doc = app.activeDocument;
        for (var i = 0, l = doc.artboards.length; i < l; i++) {
            var ab = doc.artboards[i];
            var n = ab.name;
            n = n.replace( new RegExp(find,'g'), repl );
            ab.name = n;
        }
    }
}

var renameDlg = {
    title: 'Rename Artboards',
    groups: [
        {
            'type': 'edittext',
            'label': 'prefix',
            'default': ''
        },
        {
            'type': 'edittext',
            'label': 'suffix',
            'default': ''
        },
        {
            'type': 'edittext',
            'label': 'find',
            'defaults': ''
        },
        {
            'type': 'edittext',
            'label': 'replace',
            'defaults': ''
        }
    ]
}
function onRenameDialog(){
    // alert('onRenameDialog');
    try {
        var pre = this._groups._prefix.getValue();
        var suf = this._groups._suffix.getValue();
        adjustArtboardName(pre, suf);

        var find = this._groups._find.getValue();
        var repl = this._groups._replace.getValue();
        replaceArtboardName(find, repl);
        return true;
    }catch(e){
        alert(e);
    }


}

function editArtboardNames(){
    showDialogue(renameDlg, onRenameDialog);
}

function createNewDoc(){
    var sourceDoc = app.activeDocument;
    var activeIndex = sourceDoc.artboards.getActiveArtboardIndex();
    var ab =  sourceDoc.artboards[activeIndex];
    var abName = ab.name;
    var abRect =  ab.artboardRect;
    var abX =  abRect[0];
    var abY = abRect[1];
    var abW = abRect[2] - abRect[0];
    var abH = -(abRect[3] - abRect[1]);


    sourceDoc.selectObjectsOnActiveArtboard();
    sel = sourceDoc.selection; // get selection

    var sourceDocOrigin = sourceDoc.rulerOrigin;

    var newDoc = app.documents.add(DocumentColorSpace.RGB, abW, abH);
    newDoc.rulerOrigin = sourceDocOrigin;
    // var newAb = newDoc.artboards[0];
    // newAb.artboardRect = abRect;

    // sourceDoc.activate();


    // ABsNames[i] = ABs[i].name;
    moveObjects(sel, newDoc, abX, abY); // move selection

    // newDoc.activate();

    var newAB = newDoc.artboards.add(abRect);
    newAB.name = abName;


}

//  -1500, 1996
//  src: -1455.68554360945, 1566.76451241754
//  dst: -705.68554360945, -429.235487582462



// move selected objects (sel) to destination document
function moveObjects(sel, destDoc, newX, newY) {
    var hasDocCoords = app.coordinateSystem == CoordinateSystem.DOCUMENTCOORDINATESYSTEM;
    var log = newX + ', '+ newY + "\n";
    for (k=0; k<sel.length; k++) {
        // duplicate items to the same layer in dest document, give both documents have the same layer structure
        var layerName = sel[k].layer.name;
        var abLayer;
        try {
            abLayer = destDoc.layers.getByName(layerName);
        }catch(e) {
            abLayer = destDoc.layers.add();
            abLayer.name = layerName;
        }
        try {
            var newItem = sel[k].duplicate(destDoc.layers[layerName],ElementPlacement.PLACEATEND);

            var pos = hasDocCoords ? destDoc.convertCoordinate (newItem.position, CoordinateSystem.DOCUMENTCOORDINATESYSTEM, CoordinateSystem.ARTBOARDCOORDINATESYSTEM) : newItem.position;
            var pgLeft = pos[0] + newX;
            var pgTop = pos[1] - newY;
            newItem.position = [pgLeft, pgTop];

            if(k == 0){
                log += 'src: ' + sel[k].position[0] + ", " + sel[k].position[1] + "\n";
                log += 'dst: ' + pgLeft + ", " + pgTop + "\n";
            }
        }catch(e){

        }
    }
    alert(log);
}
function testFunction(){

    createNewDoc();
}


function artboardsToLayers(){
    updateArtboardInfo();
    var abNames = [];
    try {
        for (var i = 0; i < activeDocument.artboards.length; i++) {
            var ab =  activeDocument.artboards[i];
            var abName = ab.name;
            if(_.contains(abNames, abName)){
                abName += '-'+i
            }
            abNames[i] = abName;
            if(abName.charAt(0) == '-'){
                continue;
            }

            var abLayer;
            try {
                abLayer = activeDocument.layers.getByName(abName);
            }catch(e) {
                abLayer = activeDocument.layers.add();
                abLayer.name = abName;
            }

            activeDocument.artboards.setActiveArtboardIndex(i);
            activeDocument.selection = null;
            activeDocument.selectObjectsOnActiveArtboard();
            var abObjects = activeDocument.selection;
            var abObjectCount = abObjects.length;
            try {
                for (var j = 0; j < abObjectCount; j++) {
                    var pgItem = abObjects[j];
                    pgItem.move(abLayer, ElementPlacement.PLACEATEND);
                }
            }catch(e){
                alert(e);
            }
        }
    } catch(e){
        alert(e);
    }
}