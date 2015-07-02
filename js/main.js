/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {


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
        csInterface.evalScript('$._ext.evalFile("' + scriptPath + '")');
    }

    function addMessage(str){
        $("#output").text(str);
    }
    function appendMessage(str){
        // var m = $("#output").html();
        var m = 'Last Operation:';
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
            //

            if(typeof(folderFiles) == "string"){
                folderFiles = JSON.parse(folderFiles);
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



        // remote assets
        var cleanFileName = function(name) {
          name = name.split(' ').join('-');
          return name.replace(/\W/g, '');
        };

        var createTempFolder = function() {
          var tempFolderName = 'com.adobe.rhapsody.extension/';
          var tempFolder = '/tmp/' + tempFolderName;
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
                    var base64 = window.btoa(imgData);

                    var downloadedFile = createTempFolder() + name + '.jpg';

                    window.cep.fs.writeFile(downloadedFile, base64, cep.encoding.Base64);

                    var data = {
                        'path': downloadedFile,
                        'songname': song.name,
                        'artistname': song.artist.name,
                        'albumname': song.album.name
                    }
                    var stringified = $.stringify(data);
                    // alert('downloadAndOpenInIllustrator '+ data.songName);
                    csInterface.evalScript("$.openDocument("+stringified+")");

                }
            };
            xhr.send();
        };

        var addThumbToContainer = function(url, song) {
            var n = cleanFileName(song.name)+'jpg';
            downloadAndOpenInIllustrator(url, n, song);
        };

        var IMAGE_SERVER =  'http://direct.rhapsody.com/imageserver/images/';
        // 'image200': constants.IMAGE_SERVER + id + '/200x200.jpeg',
        // 'image300': constants.IMAGE_SERVER + id + '/300x300.jpeg',
        // 'image600': constants.IMAGE_SERVER + id + '/600x600.jpeg',
        var searchRhapsody = function(query) {
          var url = 'http://napi-gateway-stage.rhapsody.com/v1/members/A15830BF51EC0152E0430A9603320152/favorites?apikey=2a0n4Uj1CAmMpGa5GyRqym7Hjm7bLMji&limit=5&offset=0'


          $.getJSON(url, function (response) {
            _.each(response, function(song){
                var id = song.id;
                var img = IMAGE_SERVER + id + '/120x120.jpeg';
                addThumbToContainer(img, song);
            });
          });
        };



        $('#get-remote').on('click', function(){
          searchRhapsody();
        });

    }
    init();
}());


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

var rhapUsers = [

    {
        'userGuid': 'A15830BF51EC0152E0430A9603320152',
        'nick': 'Marshall Jones'
    },
    {
        'userGuid': 'FBD985D9E38490A1E040960A39030E95',
        'nick': 'Jason Culler'
    },
    {
        'userGuid': '2496EA7CD48590BAE043C0A87FE490BA',
        'nick': 'Dan Kantor'
    },
    {
        'userGuid': 'FBDB6A665BC671E7E040960A39030B45',
        'nick': 'Kyle Klube'
    },
    {
        'userGuid': 'E7735EE6C8DF5026E033C0A87F165026',
        'nick': 'Brian Ringer'
    },
    {
        'userGuid': '0EFB12C4992B50A0E043C0A87FE450A0',
        'nick': 'Ken Murphy'
    },
    {
        'userGuid': '36CA3759E2E3603CE043C0A87FE4603C',
        'nick': 'Daniel Shumate'
    },
    {
        'userGuid': '035AFC9135191B11E050960A38034B3C',
        'nick': 'Keenan Popwell'
    },
    {
        'userGuid': '05E57F6DC9F080DAE043C0A87FE480DA',
        'nick': 'Peter Hilgendorf'
    },
    {
        'userGuid': 'E7735EE796E35026E033C0A87F165026',
        'nick': 'Paul Riley'
    },
    {
        'userGuid': 'FFBF69CCBC5FD00CE033C0A87F15D00C',
        'nick': 'Kim Liggins'
    },
    {
        'userGuid': 'C13D86BA0E5FDFDDE040960A38033AC1',
        'nick': 'Paul Springer'
    },
    {
        'userGuid': '0B75CEFAFC5640BCE043C0A87FE440BC',
        'nick': 'David Hose'
    },
    {
        'userGuid': "13C759546163F5FFE050960A38035F10",
        'nick': 'Nick Soman'
    }
];