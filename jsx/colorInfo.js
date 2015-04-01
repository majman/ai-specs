function ColorInfo(options){
    updateArtboardInfo();
    getSpecLayer();

    var swatches = actDoc.swatchGroups[actDoc.swatchGroups.length - 1].getAllSwatches();

    var swatchGroup = specLayer.groupItems.add();
    swatchGroup.name = 'Colors';
    var swatchSize = specSize * 2.5 >> 0;

    var s;
    for(var i = 0, len = swatches.length; i < len; i++){
        s = swatches[i];

        var x = artboardLeft + artboardWidth + swatchSize * 3;
        var y = artboardTop - (i * (swatchSize + specOptions.objectPadding *2));

        var rectRef = swatchGroup.pathItems.rectangle(y, x, swatchSize, swatchSize);
        var rgbColor = s.color;
        rectRef.fillColor = rgbColor;


        var textRef = swatchGroup.textFrames.add();
        var hex = '';
        if(s.color.typename == 'RGBColor'){
            hex = rgbToHex(rgbColor.red, rgbColor.green, rgbColor.blue);
        }


        var cName = '';
        if(s.name.indexOf('R=') == -1){
            cName = s.name + "\r" + hex + ", rgb(" + getColorValues(s.color) + ")";
        }else {
            cName = hex + ", rgb(" + getColorValues(s.color) + ")";
        }
        textRef.contents = cName;

        textRef.textRange.characterAttributes.textFont = specTextFont;
        textRef.textRange.characterAttributes.size = specSize;
        textRef.textRange.characterAttributes.autoLeading = specAutoLeading;
        textRef.textRange.characterAttributes.leading = specLeading;
        textRef.textRange.fillColor = white;

        textRef.left = x + swatchSize + specOptions.objectPadding;
        textRef.top = y;
    }


    return this;
}