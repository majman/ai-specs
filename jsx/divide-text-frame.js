/////////////////////////////////////////////////////////////////
//Divide TextFrame v.2.2 -- CS and up
//>=--------------------------------------
// Divides a multiline text field into separate textFrame objects.
// Basically, each line in the selected text object
// becomes it's own textFrame. Vertical Spacing of each new line is based on leading.
//
// This is the opposite of my "Join TextFrames" scripts which
// takes multiple lines and stitchs them back together into the same object.
// New in 2.1 now right and center justification is kept.
// New in 2.2 better error checking, and now will run on more than one text frame at a time.
//>=--------------------------------------
// JS code (c) copyright: John Wundes ( john@wundes.com ) www.wundes.com
//copyright full text here:  http://www.wundes.com/js4ai/copyright.txt
//////////////////////////////////////////////////////////////////

var ret_re = new RegExp("/[\x03]|[\f]|[\r\n]|[\r]|[\n]|[,]/");
var wspace_re = new RegExp("/[\x20]|[ ]/");

function divideTextFrame(){
    var doc = activeDocument;
    var genError = "DivideTextFrame must be run on a point-text text-frame. ";

    if(doc){
            var docsel = doc.selection;
            var sel = [];
        //remember initial selection set
             for(var itemCt = 0, len = docsel.length; itemCt < len; itemCt++){
                 if(docsel[itemCt].typename == "TextFrame"){
                      sel.push(docsel[itemCt]);
                 }
             }

            if(sel.length){  //alert(sel.length+" items found.");
                for(var itemCt=0, len = sel.length ;itemCt<len;itemCt++){
                    divide(sel[itemCt]);
                }
            }else{
                    alert(genError +"Please select a Text-Frame object. (Try ungrouping.)");
            }
    }else{
        alert(genError + "No document found.");
    };
}
function divide(item){

    //get object position
    var selWidth = item.width;
    if(item.contents.indexOf("\n") != -1){
        //alert("This IS already a single line object!");
    }else{

        //getObject justification
        var justification = item.story.textRange.justification;
        var wordSpacing = item.story.textRange.desiredWordSpacing;
        //make array
        var lineArr = fieldToArray(item);

        if(lineArr.length <= 1){
            return false;
        }

        var tfTop = item.top;
        var tfLeft = item.left;
        item.contents = lineArr[0];



        //for each array item, create a new text line
        var tr = item.story.textRange;
        var vSpacing = tr.leading;
        var newTF;
        for(j = 1; j < lineArr.length; j++){
            newTF = item.duplicate(item, ElementPlacement.PLACEBEFORE);
            newTF.contents = lineArr[j];
            newTF.top = tfTop - (vSpacing*j);
            if(justification == Justification.CENTER){
                newTF.left = (tfLeft + (selWidth/2)) - (newTF.width/2);
            } else if(justification == Justification.RIGHT){
                newTF.left = (tfLeft + selWidth) - newTF.width;
            } else {
                newTF.left = tfLeft;
            }
            newTF.selected = false;
        }
    }

    function fieldToArray(myField) {
        var retChars = new Array("\x03","\x0d","\f","\r","\n");
        var tmpTxt = myField.contents.toString();
        var tmpArr;
        for (all in retChars ){
            tmpArr = tmpTxt.split(retChars[all]);
        }
        return tmpTxt.split(ret_re);
    }
}
function lineToArray(myField) {
    var retChars = new Array("\x20"," ");
    var tmpTxt = myField.contents.toString();
    var tmpArr;
    for (all in retChars ){
        tmpArr = tmpTxt.split(retChars[all]);
    }
    return tmpTxt.split(wspace_re);
}

