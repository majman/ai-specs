
function selectSimilarText(options){
    var selectedObjects = doc.selection;
    if ( selectedObjects.length > 0 ) {
        if ( selectedObjects[0].typename == "TextFrame" ) {
            var selected = selectedObjects[0];
            var textStyle = new TextStyle(selected.textRange, '', selected);

            findSimilarTextFrames(textStyle, options);
        }
    }else{
        alert('select a text object first');
    }
}
function findSimilarTextFrames(textStyle, options){
    var allTextFrames = activeDocument.textFrames;
    var len = allTextFrames.length;
    for(var i = 0; i < len; i++){
        var frame =  allTextFrames[i];
        frame.selected = false;

        var lockedOrHidden = checkIfLockedOrHidden(frame);
        if(!lockedOrHidden) {

            var characterAttributes = frame.textRange.characterAttributes;
            var tFont, tFamily, tColor, tStyle;
            var tOpacity = frame.opacity;
            try{
                tFont = characterAttributes.textFont;
                tFamily = tFont.family;
                tColor = getColorValues(characterAttributes.fillColor);
                tStyle = tFont.style;

                var styleColor = getColorValues(textStyle.color);
                var doSelect = true;
                if(options['by-size'] && frame.textRange.size != textStyle.size){
                    continue;
                }
                if(options['by-color'] && !colorsEqual(tColor, styleColor)){
                    continue;
                }
                if(options['by-family'] && tFamily != textStyle.family){
                    continue;
                }
                if(options['by-style'] && tStyle != textStyle.style){
                    continue;
                }
                if(options['by-opacity'] && tOpacity != textStyle.opacity){
                    continue;
                }
                frame.selected = true;
            }catch(e){
                // alert(frame.contents+' '+e);
                continue;
            }
        }
    }
    // exploreObject(log);
}
var log = {};
var logI = 0;
function colorsEqual(c1, c2){
    // log[logI] = {
    //     color1: c1[0],
    //     color2: c2[0]
    // }
    // logI ++;
    if(c1[0] == c2[0] && c1[1] == c2[1] && c1[2] == c2[2]){
        return true;
    }
    return false;
}
