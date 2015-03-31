// var sourceFolder = Folder.selectDialog("Please select the folder with Files to process");
var path = '~/Dropbox/Resources/Adobe Scripts/Script Bay/Illustrator';
var sourceFolder = Folder.selectDialog('Please select the folder to be imported:', Folder(path));
var fileList = sourceFolder.getFiles(/\.(js|jsx)$/i);


var folderPath = '~/Dropbox/Resources/Adobe Scripts/Script Bay/Illustrator';
var sourceFolder = new Folder(folderPath);
var fileList = sourceFolder.getFiles(/\.(js|jsx)$/i);

// alert( fileList.length );