var doc = app.activeDocument;

function artboardBackground(){
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