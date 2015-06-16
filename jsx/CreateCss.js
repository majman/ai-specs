//CSS tags all defined in one place
var backgroundStr = "background : ";
var borderStyleStr = "border-style : ";
var borderColorStr = "border-color : ";
var borderWidthStr = "border-width : ";
var borderRadiusStr = "border-radius : ";
var backgroundImageStr = "background-image : ";
var backgroundRepeatStr = "background-repeat : ";
var opacityStr = "opacity : ";
var opacityForIEStr = "opacity";
var positionStr = "position : ";
var leftStr = "left : ";
var topStr = "top : ";
var widthStr = "width : ";
var heightStr = "height : ";
var boxShadowStr = "box-shadow : ";
var fontFamilyStr = "font-family : ";
var fontWeightStr = "font-weight : ";
var fontStyleStr = "font-style : ";
var fontSizeStr = "font-size : ";
var lineHeightStr = "line-height : ";
var letterSpacingStr = "letter-spacing : ";
var fontVariantStr = "font-variant : ";
var textTransformStr = "text-transform : ";
var verticalAlignStr = "vertical-align : ";
var textColorStr = "color : ";
var textOutlineStr = "text-outline : ";
var textDecorationStr = "text-decoration : ";
var textShadowStr = "text-shadow : ";

var startColorStr = "startColorstr";
var endColorStr = "endColorstr";
var gradientStyleStr = "Stlye";
var noRepeatStr = "no-repeat";
var absoluteStr = "absolute ";
var alphaStr = "alpha";
var boldStr = "bold";
var italicStr = "italic";
var lineThroughStr = "line-through";
var underlineStr = "underline";
var newLineStr = "\r\n\t";
var newLineNoTabStr = "\r\n";
var rgbaStr = "rgba";
var coloStopStr = "color-stop";
var filterStr = "filter: ";
var linearGradientStr = "linear-gradient";
var radialGradientStr = "radial-gradient";

//global var
var num = 0;
var unitConversionFactor = 12;
var unitString = 'px';

var exportMode = "Generate CSS for Panel";

function getShapeCSS() {
    num = 0;
    var JSONString = app.sendScriptMessage("CSSExtract", exportMode, "test");
    parseJSON(JSONString);
}

function parseJSON(str) {
    // alert(str);
    var cssString = "";
    try {
        var myParentObj = eval(str);
        if (myParentObj != undefined) {
            for (var i in myParentObj) {
                var currentObj = myParentObj[i];
                for (var j in currentObj) {
                    if (currentObj[j].Name != undefined) {
                        if (currentObj[j].Name == "") {
                            currentObj[j].Name += "st" + num;
                            num++;
                        }
                        if (currentObj[j].Name != "") {
                            cssString += currentObj[j].Name;
                            cssString += newLineNoTabStr + "{";

                            // fill
                            if (currentObj[j].Fill != undefined) {
                                currentFill = currentObj[j].Fill;
                                if (currentFill.FillType == "solid" && currentFill.Color != undefined) {
                                    cssString += newLineStr + backgroundStr + "#" + rgbToHex(currentFill.Color.Red, currentFill.Color.Green, currentFill.Color.Blue) + ";";
                                    cssString += newLineStr + backgroundStr + rgbaStr + "(" + roundNumber(currentFill.Color.Red, 2) + ", " + roundNumber(currentFill.Color.Green, 2) + ", " + roundNumber(currentFill.Color.Blue, 2) + ", " + roundNumber(currentFill.Color.FillOpacity, 2) + ");";
                                } else if (currentFill.FillType == "gradient") {
                                    currentGradient = currentObj[j].Fill.Gradient;
                                    cssString += writeGradient(currentGradient);
                                }
                            }

                            // stroke
                            if (currentObj[j].Stroke != undefined) {
                                currentStroke = currentObj[j].Stroke;
                                if (currentStroke.Type != undefined) {
                                    cssString += newLineStr + borderStyleStr + currentStroke.Type + ";";
                                }

                                if (currentStroke.Color != undefined) {
                                    cssString += newLineStr + borderColorStr + "#" + rgbToHex(currentStroke.Color.Red, currentStroke.Color.Green, currentStroke.Color.Blue) + ";";
                                    cssString += newLineStr + borderColorStr + rgbaStr + "(" + roundNumber(currentStroke.Color.Red, 2) + ", " + roundNumber(currentStroke.Color.Green, 2) + ", " + roundNumber(currentStroke.Color.Blue, 2) + ", " + roundNumber(currentStroke.Color.StrokeOpacity, 2) + ");";
                                }

                                if (currentStroke.Width != undefined) {
                                    cssString += newLineStr + borderWidthStr + roundNumber(currentStroke.Width, 2) + unitString + ";";
                                }
                            }

                            // opacity
                            if (currentObj[j].Opacity != undefined) {
                                cssString += newLineStr + opacityStr + roundNumber(currentObj[j].Opacity, 2) + ";";
                            }

                            // width / height
                            if (currentObj[j].Shape != undefined) {
                                currentObjShape = currentObj[j].Shape;
                                cssString += newLineStr + widthStr + currentObjShape.w + unitString + ";";
                                cssString += newLineStr + heightStr + currentObjShape.h + unitString + ";";
                            }

                            // rounded corners
                            if (currentObj[j].RoundedCorner != undefined) {
                                cssString += GetRoundedCorners(currentObj[j].RoundedCorner);
                            }

                            //  box shadows
                            if (currentObj[j].boxShadow != undefined) {
                                currObjBoxShadow = currentObj[j].boxShadow;
                                cssString += newLineStr + boxShadowStr + roundNumber(currObjBoxShadow.HOffset, 2) + unitString + " " + roundNumber(currObjBoxShadow.VOffset, 2) + unitString + " " + roundNumber(currObjBoxShadow.Blur, 2) + unitString + " ";
                                cssString += rgbaStr + "(" + roundNumber(currObjBoxShadow.BoxColor.Red, 2) + ", " + roundNumber(currObjBoxShadow.BoxColor.Green, 2) + ", " + roundNumber(currObjBoxShadow.BoxColor.Blue, 2) + ", " + roundNumber(currObjBoxShadow.BoxColor.Opacity, 2) + ");";
                            }

                            cssString += newLineNoTabStr + "}" + newLineNoTabStr;
                        }
                    }
                }
            }
            alert(cssString);
            return cssString;
        }
    } catch (e) {
        alert(e);
    }

}

function writeGradient(currGradient) {
    var cssString = "";
    var currGradientStopArray = currGradient.GradientStopArray;
    if (currGradient.GradientType != undefined) {
        if (currGradient.GradientType == "linear") {
            currGradientStopArray = currGradient.GradientStopArray;
            cssString += newLineStr + backgroundStr + linearGradientStr + "(" + (90 - roundNumber(currGradient.GradientAngle, 2)) + "deg";
            for (var k in currGradientStopArray) {
                if (currGradientStopArray[k].ColorStop != undefined && currGradientStopArray[k].StopPosition != undefined)
                    cssString += ", " + rgbaStr + "(" + roundNumber(currGradientStopArray[k].ColorStop.Red, 2) + ", " + roundNumber(currGradientStopArray[k].ColorStop.Green, 2) + ", " + roundNumber(currGradientStopArray[k].ColorStop.Blue, 2) + ", " + roundNumber(currGradientStopArray[k].ColorStop.Opacity, 2) + ") " + roundNumber(currGradientStopArray[k].StopPosition, 2) + "%";
            }
            cssString += ");";
        } else {
            currGradientStopArray = currGradient.GradientStopArray;
            cssString += newLineStr + backgroundStr + radialGradientStr + "(" + roundNumber(currGradient.StartXPos, 2) + "% " + roundNumber(currGradient.StartYPos, 2) + "%, " + currGradient.RadialGradientType + " " + currGradient.sizeconst;
            for (var k in currGradientStopArray) {
                if (currGradientStopArray[k].ColorStop != undefined && currGradientStopArray[k].StopPosition != undefined)
                    cssString += ", " + rgbaStr + "(" + roundNumber(currGradientStopArray[k].ColorStop.Red, 2) + ", " + roundNumber(currGradientStopArray[k].ColorStop.Green, 2) + ", " + roundNumber(currGradientStopArray[k].ColorStop.Blue, 2) + ", " + roundNumber(currGradientStopArray[k].ColorStop.Opacity, 2) + ") " + roundNumber(currGradientStopArray[k].StopPosition, 2) + "%";
            }
            cssString += ");";
        }
    }
    return cssString;
}

function rgbToHex(R, G, B) {
    return toHex(R) + toHex(G) + toHex(B)
}

function toHex(N) {
    if (N == null) return "00";
    N = parseInt(N);
    if (N == 0 || isNaN(N)) return "00";
    N = Math.max(0, N);
    N = Math.min(N, 255);
    N = Math.round(N);
    return "0123456789ABCDEF".charAt((N - N % 16) / 16) + "0123456789ABCDEF".charAt(N % 16);
}

function roundNumber(num, dec) {
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

function GetRoundedCorners(currentObjRoundedCorner) {
    var cssString = "";
    if (currentObjRoundedCorner.TopLeft != undefined) {
        var radiusString = "";

        if ((currentObjRoundedCorner.TopLeft.radius1 == currentObjRoundedCorner.TopRight.radius1) &&
            (currentObjRoundedCorner.BottomRight.radius1 == currentObjRoundedCorner.BottomLeft.radius1) &&
            (currentObjRoundedCorner.TopLeft.radius1 == currentObjRoundedCorner.BottomLeft.radius1) &&
            (currentObjRoundedCorner.TopRight.radius1 == currentObjRoundedCorner.BottomRight.radius1)) {
            radiusString += currentObjRoundedCorner.TopLeft.radius1 + unitString;
        } else if ((currentObjRoundedCorner.TopLeft.radius1 == currentObjRoundedCorner.BottomRight.radius1) &&
            (currentObjRoundedCorner.TopRight.radius1 == currentObjRoundedCorner.BottomLeft.radius1) &&
            (currentObjRoundedCorner.TopLeft.radius1 != currentObjRoundedCorner.TopRight.radius1) &&
            (currentObjRoundedCorner.BottomRight.radius1 != currentObjRoundedCorner.BottomLeft.radius1)) {
            radiusString += currentObjRoundedCorner.TopLeft.radius1 + unitString + " " + currentObjRoundedCorner.TopRight.radius1 + unitString;
        } else {
            radiusString += currentObjRoundedCorner.TopLeft.radius1 + unitString + " " + currentObjRoundedCorner.TopRight.radius1 + unitString + " " + currentObjRoundedCorner.BottomRight.radius1 + unitString + " " + currentObjRoundedCorner.BottomLeft.radius1 + unitString;
        }

        if ((currentObjRoundedCorner.TopLeft.radius1 != currentObjRoundedCorner.TopLeft.radius2) ||
            (currentObjRoundedCorner.TopRight.radius1 != currentObjRoundedCorner.TopRight.radius2) ||
            (currentObjRoundedCorner.BottomRight.radius1 != currentObjRoundedCorner.BottomRight.radius2) ||
            (currentObjRoundedCorner.BottomLeft.radius1 != currentObjRoundedCorner.BottomLeft.radius2)) {
            if ((currentObjRoundedCorner.TopLeft.radius2 == currentObjRoundedCorner.TopRight.radius2) &&
                (currentObjRoundedCorner.BottomRight.radius2 == currentObjRoundedCorner.BottomLeft.radius2) &&
                (currentObjRoundedCorner.TopLeft.radius2 == currentObjRoundedCorner.BottomLeft.radius2) &&
                (currentObjRoundedCorner.TopRight.radius2 == currentObjRoundedCorner.BottomRight.radius2)) {
                radiusString += "  / " + currentObjRoundedCorner.TopLeft.radius2 + unitString;
            } else if ((currentObjRoundedCorner.TopLeft.radius2 == currentObjRoundedCorner.BottomRight.radius2) &&
                (currentObjRoundedCorner.TopRight.radius2 == currentObjRoundedCorner.BottomLeft.radius2) &&
                (currentObjRoundedCorner.TopLeft.radius2 != currentObjRoundedCorner.TopRight.radius2) &&
                (currentObjRoundedCorner.BottomRight.radius2 != currentObjRoundedCorner.BottomLeft.radius2)) {
                radiusString += "  / " + currentObjRoundedCorner.TopLeft.radius2 + unitString + " " + currentObjRoundedCorner.TopRight.radius2 + unitString;
            } else {
                radiusString += "  / " + currentObjRoundedCorner.TopLeft.radius2 + unitString + " " + currentObjRoundedCorner.TopRight.radius2 + unitString + " " + currentObjRoundedCorner.BottomRight.radius2 + unitString + " " + currentObjRoundedCorner.BottomLeft.radius2 + unitString;
            }
        }

        radiusString += ";";
        cssString += newLineStr + borderRadiusStr + radiusString;
    }

    return cssString;
}