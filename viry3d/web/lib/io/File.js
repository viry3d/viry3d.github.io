define(["require", "exports"], function (require, exports) {
    "use strict";
    var File = (function () {
        function File() {
        }
        File.Request = function (type, path, finish, progress) {
            var request = new XMLHttpRequest();
            if (request != null) {
                request.onreadystatechange = function () {
                    if (request.readyState == 4) {
                        if (request.status == 200) {
                            if (type == "xml") {
                                var xml = request.responseXML;
                                if (xml != null) {
                                    finish(xml);
                                }
                                else {
                                    finish(null);
                                    console.error("File.Request failed", path, type);
                                }
                            }
                            else {
                                finish(request.response);
                            }
                        }
                        else {
                            finish(null);
                            console.error("File.Request failed", path, type);
                        }
                    }
                };
                request.onprogress = function (e) {
                    if (e.lengthComputable && progress != null) {
                        progress(e);
                    }
                };
                request.open("GET", path, true);
                if (type == "xml") {
                    request.overrideMimeType("text/xml");
                }
                else {
                    try {
                        request.responseType = type;
                    }
                    catch (e) { }
                }
                request.send(null);
            }
            else {
                alert("browser does not support XMLHttpRequest");
            }
        };
        File.ReadXml = function (path, finish) {
            File.Request("xml", path, finish, null);
        };
        File.ReadAllBytes = function (path, finish, progress) {
            if (progress === void 0) { progress = null; }
            File.Request("arraybuffer", path, finish, progress);
        };
        File.ReadAllText = function (path, finish) {
            File.Request("text", path, finish, null);
        };
        File.WriteAllText = function (path, text) {
        };
        File.Exist = function (path) {
            return false;
        };
        return File;
    }());
    exports.File = File;
});
//# sourceMappingURL=File.js.map