
//---------------hitTest functions ---------------
function hitTest(a,b){
    var OK=0;
    if(isWithinX(a,b) || isWithinX(b,a)){
        OK++;
    }
    if(isWithinY(a,b) || isWithinY(b,a)){
        OK++;
    }
    if (OK<2){
        //alert("miss.");
        return false;
    }else{
        //alert("Hit!")
            return true;
    }
}
function isWithinX(a,b){
    var p1 = a.geometricBounds[0];
    var p2 = b.geometricBounds[0];
    if(p2<=p1 && p1<=p2+b.width){
         return true;
    }else{
        return false;
    }
}
function isWithinY(a,b){
    var p3 = a.geometricBounds[1];
    var p4 = b.geometricBounds[1];
    if(p3>=p4 && p4>=(p3-a.height)){
        return true;
    }
        return false;
}