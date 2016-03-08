/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/




var csInterface = new CSInterface();
var message = '';

// Reloads extension panel
function reloadPanel() {
    location.reload();
}
$('#btn_reload').on('click', reloadPanel);

// Loads / executes a jsx file
function loadJSXFile(pPath) {
    var scriptPath = csInterface.getSystemPath(SystemPath.EXTENSION) + pPath;
    // alert(csInterface.evalScript)
    try {
        csInterface.evalScript('$._ext.evalFile("' + scriptPath + '")');
    }catch(e){
        alert('error '+e);
    }
}

function addMessage(str){
    $("#output").text(str);
}
function appendMessage(str){
    // var m = $("#output").html();
    var m = 'Last Operation:';
    var prev = $("#output").html();
    $("#output").html(m + "<br>" + str);
}

function init() {
    csInterface.addEventListener("My Custom Event", function(e) {
        var dataType = typeof(e.data);
        var str = '';
        if(dataType == "object"){
            if(e.data.type == 'listScripts'){
                addScripts(e.data);
            }else {
                str = JSON.stringify(e.data);
            }
        }else {
            str = e.data;
        }
        appendMessage(str)
    });

    function addScripts(data){

        var folderFiles = data.folderFiles;
        var html = ''

        if(typeof(folderFiles) == "string"){
            folderFiles = JSON.parse(folderFiles);
            // alert('folderfiles == string')
        }
        _.each(folderFiles, function(ff, i){
            html += '<button id="linkedScript-'+i+'" class="flex-item button linked-button" data-fileName="'+ff+'">'+ff.replace(/(\.js$|\.jsx$)/, '')+'</button>';
        });
        $("#linked-scripts").html(html);

        $('.linked-button').on('click', function(e){
            var fname = $(this).attr('data-fileName');
            csInterface.evalScript("$.runScriptFromFile("+$.stringify(fname)+")");
            return false;
        })
        if(data.folderObjects){
            $('#output').text('folderObjects');
            var folderObjects = data.folderObjects;
            if(typeof(folderObjects) == "string"){
                $('#output').text(' -- '+folderObjects);
                // folderObjects = JSON.parse(folderObjects);
            }else {
                // $('#output').text(JSON.stringify(folderObjects));
                var fHtml = '';
                // _.each(folderObjects, function(fo){});
            }
        }
    }

    themeManager.init();

    loadJSXFile("/jsx/measurements.jsx");



    function getOptions(){
        var options = {};
        var m = $("#output").text();
        message = m + "\n\n";

        $('.form-val').each(function(i){
            $this = $(this);

            var key = $this.attr('id');
            var val;
            if($this.hasClass('num-val')){
                val = $this.val().replace(/[^0-9.]/g, "");
            }else if($this.attr('type') == "checkbox"){

                if($this.is(':checked') == true){
                    val = true;
                }else {
                    val = false;
                }

            }else {
                val = $this.val();
            }
            options[key] = val;

            message +=  key + " = "+ val + "; \n\r";

        });

        addMessage(message);
        return options;
    }
    $('#auto_spec').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.spec("+stringified+")");
    });
    $('#horz_spec').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specHorz("+stringified+")");
    });
    $('#vert_spec').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specVert("+stringified+")");
    });
    $('#colors_spec').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specColors("+stringified+")");
    });

    $('#spaceBetweenSpec').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.spaceBetweenSpec("+stringified+")");
    });
    $('#h-spacing').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.horzSpacing("+stringified+")");
    });
    $('#v-spacing').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.vertSpacing("+stringified+")");
    });


    $('#specAllText').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specAllText("+stringified+")");
    });
    $('#makeArtboardBackground').on('click', function(){
        csInterface.evalScript("$.makeArtboardBackground()");
    });

    $('#makeAllArtboardBackgrounds').on('click', function(){
        csInterface.evalScript("$.makeAllArtboardBackgrounds()");
    });
    $('#divideTextFrame').on('click', function(){
        csInterface.evalScript("$.divideTextFrameLines()");
    });

    $('#specDistFromLeft').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specDistFromLeft("+stringified+")");
    });
    $('#specDistFromRight').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specDistFromRight("+stringified+")");
    });
    $('#specDistFromTop').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specDistFromTop("+stringified+")");
    });
    $('#specDistFromBottom').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.specDistFromBottom("+stringified+")");
    });
    $('#getSelectedColorSpecs').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.getSelectedColorSpecs("+stringified+")");
    });
    $('#doEditArtboardNames').on('click', function(){
        csInterface.evalScript("$.doEditArtboardNames()");
    });
    $('#doAddArtboardNames').on('click', function(){
        csInterface.evalScript("$.doAddArtboardNames()");
    });
    $('#artboardsToLayers').on('click', function(){
        csInterface.evalScript("$.artboardsToLayers()");
    });



    $('#selectSimilarText').on('click', function(){
        var o = getOptions();
        var stringified = $.stringify(o);
        csInterface.evalScript("$.selectSimilarText("+stringified+")");
    });


    $('#objectDetails').on('click', function(){
        csInterface.evalScript("$.objectDetails()");
    });

    $('#testFunction').on('click', function(){
        // var o = getOptions();
        // var stringified = $.stringify(o);
        // csInterface.evalScript("$.testFunction()");
        // var o = getOptions();
        // addMessage($.stringify(o));

        csInterface.evalScript("$.testFunction()");

    });

    $('#run-input').on('click', function(){
        // var scr = $('#live-input').val();

        // alert(scr)
        try {
            var scr = editor.getValue();
            csInterface.evalScript("$.runScriptFromInput("+$.stringify(scr)+")");
        } catch (e){
            alert('error ');
        }
    });

    var watchTestIndex = 0;
    function watchTest(){
        csInterface.evalScript("$.runWatchTest()");
        watchTestIndex++;
        if(watchTestIndex < 10){
            $('#output2').text(watchTestIndex);
            setTimeout(function(){
                watchTest()
            }, 1000);
        }else {
            $('#output2').text('done');
        }
    }
    // watchTest();


    // remote assets
    var cleanFileName = function(name) {
      name = name.split(' ').join('-');
      return name.replace(/\W/g, '');
    };

    var createTempFolder = function() {
        var tempFolderName = 'remoteImages/';
        var tempFolder;
        // if(relativePath != undefined){
        //     tempFolder = relativePath + '/' + tempFolderName;
        // }else {
        //     tempFolder = '/tmp/' + tempFolderName;
        // }
        tempFolder = '/tmp/' + tempFolderName;


      if (window.navigator.platform.toLowerCase().indexOf('win') > -1) {
        tempFolder = csInterface.getSystemPath(SystemPath.USER_DATA) + '/../Local/Temp/' + tempFolderName;
      }
      window.cep.fs.makedir(tempFolder);
      return tempFolder;
    };

    var downloadAndOpenInIllustrator = function(url, name, song) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
            if (this.status == 200 || this.status == 304) {
                var uInt8Array = new Uint8Array(this.response);
                var i = uInt8Array.length;
                var binaryString = new Array(i);
                while (i--)
                    binaryString[i] = String.fromCharCode(uInt8Array[i]);
                var imgData = binaryString.join('');

                $('#output2').append(imgData.naturalWidth);
                var base64 = window.btoa(imgData);

                var downloadedFile = createTempFolder() + name + '.jpg';

                window.cep.fs.writeFile(downloadedFile, base64, cep.encoding.Base64);

                var data = {
                    'path': downloadedFile
                }
                if(song){
                    data = {
                        'path': downloadedFile,
                        'songname': song.name,
                        'artistname': song.artist.name,
                        'albumname': song.album.name
                    }
                }
                var stringified = $.stringify(data);
                // alert('downloadAndOpenInIllustrator '+ data.songName);
                csInterface.evalScript("$.addRemoteItems("+stringified+")");
            }
        };
        xhr.send();
    };

    var addThumbToContainer = function(url, song) {
        var n = cleanFileName(song.name)+'jpg';
        downloadAndOpenInIllustrator(url, n, song);
    };

    function addImageToPlaceholder(url){
        var n = cleanFileName(url);
        downloadAndOpenInIllustrator(url, n);
    }

    var keys = {
        'flickr' : {
            'api_key': 'e54c45ed6c52a5f6871bf8b4dd959902'
        }
    }

    // var flickr = 'https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=e54c45ed6c52a5f6871bf8b4dd959902&tags=kitten&per_page=10&format=json&auth_token=72157664924612309-abde365098dc3117&api_sig=b883ae77f9784c2a1313d8b7a32e0635'

    var IMAGE_SERVER =  'http://direct.rhapsody.com/imageserver/images/';
    // 'image200': constants.IMAGE_SERVER + id + '/200x200.jpeg',
    // 'image300': constants.IMAGE_SERVER + id + '/300x300.jpeg',
    // 'image600': constants.IMAGE_SERVER + id + '/600x600.jpeg',

    var flickrURL = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';

    function searchFlickr(tags){
        // var scr = '\
        //     alert(selection.length); \
        // ';
        // csInterface.evalScript("$.runScriptFromInput("+$.stringify(scr)+")");
        csInterface.evalScript("app.activeDocument.selection.length;", function(selectionLength){
            if(selectionLength){
                $('#output2').append('search flickr<br>');
                // { "id": "24983615034", "owner": "129702353@N08", "secret": "c2a4376a66", "server": "1630", "farm": 2, "title": "Cat", "ispublic": 1, "isfriend": 0, "isfamily": 0 },
                // https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg

                var data = {
                    'api_key': keys.flickr.api_key,
                    'format': 'json',
                    'tags': tags || 'kitten',
                    'sort': 'interestingness-desc',
                    'per_page': selectionLength,
                    'page': Math.random() * 5 >> 0,
                    'nojsoncallback': 1,
                    'content_type': 1,
                    'media': 'photos',
                    'orientation':'square'
                }
                var request = {
                    'url': flickrURL,
                    'data': data,
                    'dataType': "json",
                    'success': function(response){

                        var count = response.photos.photo.length;
                        var html = '';
                        _.each(response.photos.photo, function(photo){
                            var src = 'https://farm'+photo.farm+'.staticflickr.com/'+photo.server+'/'+photo.id+'_'+photo.secret+'.jpg'
                            addImageToPlaceholder(src);
                            html += '<img src="'+src+'" width="100"/>';
                        });
                        // $('#output2').append('<code>got response: <br>' + html);
                    },
                    'error': function(response){
                        $('#output2').append('<code>error: <br>' + JSON.stringify(response));
                    }
                }
                $.ajax(request);

            }
        });


    }
    var searchRhapsody = function(user, count, size, offset) {
        var url = 'http://napi-gateway-stage.rhapsody.com/v1/members/'+user+'/favorites?apikey=2a0n4Uj1CAmMpGa5GyRqym7Hjm7bLMji&limit='+count+'&offset='+offset;


        $.getJSON(url, function (response) {
            _.each(response, function(song){
                var id = song.id;
                var img = IMAGE_SERVER + id + '/'+size+'.jpeg';
                addThumbToContainer(img, song);
            });
        });
    };

    $('#flickr-search-btn').on('click', function(){
        var tags = $.trim($('#flickr-tags').val());
        if(tags.length == 0){
            tags = 'kittens';
        }
        searchFlickr(tags);
    })

    $('#get-remote').on('click', function(){

        var count = $('#remoteCount').val();
        var user = $('#rhap-users').val();
        var size = $('#rhap-image-size').val();
        var offset = $('#rhap-image-offset').val();
        searchRhapsody(user, Number(count), size, offset);
    });

    var optionHtml = '';
    _.each(rhapUsers, function(user, i){
        optionHtml += '<option value="'+user.userGuid+'">'+user.nick+'</option>';

    });
    $('#rhap-users').append(optionHtml)
}


var relativePath;
if(csInterface && csInterface.evalScript){
    csInterface.evalScript("app.activeDocument.path;", function(cbResult){
        relativePath = cbResult;
    });
}


// alert(app.activeDocument.path);


jQuery.extend({
    stringify : function stringify(obj) {
        if ("JSON" in window) {
            return JSON.stringify(obj);
        }
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        } else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);

            for (n in obj) {
                v = obj[n];
                t = typeof(v);
                if (obj.hasOwnProperty(n)) {
                    if (t == "string") v = '"' + v + '"'; else if (t == "object" && v !== null) v = jQuery.stringify(v);
                    json.push((arr ? "" : '"' + n + '":') + String(v));
                }
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    }
});

var editor = ace.edit("editor");
    editor.setTheme("ace/theme/textmate");
    editor.session.setMode("ace/mode/javascript");


function storeLocalSettings () {
    editor.resize();

    var toggled = {};
    _.each($('.toggle-input'), function(el){
        var id = el.id;
        if(el.checked == true){
            toggled[id] = true;
        }else {
            toggled[id] = false;
        }
    });
    localStorage.setItem (
        "com.majman.specs.toggled",
        JSON.stringify(toggled)
    );
}
function getLocalSettings () {
    var str = localStorage.getItem ("com.majman.specs.toggled");
    if (str) {
        var settings = JSON.parse(str);
        // console.log('settings',settings);
        _.each(settings, function(v, k){
            $('#'+k)[0].checked = v;
        })
    }
}

$('.toggle-input').on('change', storeLocalSettings);
getLocalSettings();



init();
