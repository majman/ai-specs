/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {


    var csInterface = new CSInterface();
    var message = '';

    // Reloads extension panel
    function reloadPanel() {
        location.reload();
    }
    $('#btn_reload').on('click', reloadPanel)

    // Loads / executes a jsx file
    function loadJSXFile(pPath) {
        var scriptPath = csInterface.getSystemPath(SystemPath.EXTENSION) + pPath;
        csInterface.evalScript('$._ext.evalFile("' + scriptPath + '")');
    }

    function addMessage(str){
        $("#output").text(str);
    }
    function appendMessage(str){
        var m = $("#output").html();
        $("#output").text(m + "\n" + str);
    }

    function init() {
        csInterface.addEventListener("My Custom Event", function(e) {
            var dataType = typeof(e.data);
            var str;
            if(dataType == "object"){
                str = JSON.stringify(e.data);
            }else {
                str = e.data;
            }
            appendMessage(str)
        });
        themeManager.init();

        loadJSXFile("/jsx/measurements.js")

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

        $('#specAllText').on('click', function(){
            var o = getOptions();
            var stringified = $.stringify(o);
            csInterface.evalScript("$.specAllText("+stringified+")");
        });
        $('#makeArtboardBackground').on('click', function(){
            csInterface.evalScript("$.makeArtboardBackground()");
        });

        $('#testFunction').on('click', function(){
            // var o = getOptions();
            // var stringified = $.stringify(o);
            // csInterface.evalScript("$.testFunction()");
            var o = getOptions();
            addMessage($.stringify(o));
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