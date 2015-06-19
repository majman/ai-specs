function ArtboardInfo(artboard){
    this.artboardRect = artboard.artboardRect;
    this.x = artboard.artboardRect[0];
    this.y = artboard.artboardRect[1];
    this.width = artboard.artboardRect[2] - artboard.artboardRect[0];
    this.height = -(artboard.artboardRect[3] - artboard.artboardRect[1]);
    this.name = artboard.name;
    this.isRetina = Math.min(this.width,this.height) >= 640;
    this.isPortrait = this.height > this.width;

    var sel = actDoc.selectObjectsOnActiveArtboard();;
    this.children = actDoc.selection;
    this.items = {};
    this.types = [];

    for(var i = 0; i < this.children.length; i++){
        var item = this.children[i];
        var type = item.typename;
        if(this.items[type]){
            this.items[type].push(item);
        }else {
            this.items[type] = [item];
            this.types.push(type);
        }
    }
    return this;
}


ArtboardInfo.prototype.contains = function(component){
    var cx = component.position[0],
        cy = component.position[1],
        cw = component.width,
        ch = component.height,
        cMaxX = cx + cw, cMaxY = cy,
        cMinX = cx, cMinY = cy - ch,
        aMaxX = this.x + this.width,
        aMaxY = this.y,
        aMinX = this.x,
        aMinY = this.y - this.height;
    return aMinX <= cMaxX && cMinX <= aMaxX &&
            aMinY <= cMaxY && cMinY <= aMaxY;
}

