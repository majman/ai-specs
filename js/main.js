/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {


    var csInterface = new CSInterface();
    var message = '';

    // Opens the chrome developer tools in host app
    function showDevTools() {
        window.__adobe_cep__.showDevTools();
    }

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

    // Loads / executes all jsx files in the given folder
    function loadJSXFiles(pFolderPath) {
        var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + pFolderPath;
        csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
    }


    csInterface.addEventListener("My Custom Event", function(evt) {

            var m = $("#output").text();
            message = m + evt.data + "\n\n";
            $("#output").text(message);

    });

    var eventScope = "GLOBAL";
    var eventType;



    function init() {
        themeManager.init();

        loadJSXFile("/jsx/library.js")

        function getOptions(){
            var options = {};
            var m = $("#output").text();
            message = m + "\n\n";

            $('.form-val').each(function(i){
                $this = $(this);
                if(!$this.hasClass('input-empty')){
                    var v;
                    if($this.hasClass('num-val')){
                        v = $this.val().replace(/[^0-9.]/g, "");
                    }else {
                        v = $this.val();
                    }
                    options[$this.attr('id')] = v;
                    message +=  $this.attr('id') + " = "+ v + "; ";
                }
            });
            // $("#output").text(message);
            return options;
        }

        csInterface.evalScript("$.getScripts()");





    }

    init();

}());

jQuery.extend({
    stringify  : function stringify(obj) {
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