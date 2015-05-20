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

// artboardBackground();