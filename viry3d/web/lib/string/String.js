define(["require", "exports", "../container/Vector"], function (require, exports, Vector_1) {
    "use strict";
    var VRString = (function () {
        function VRString(str) {
            this.m_string = str;
        }
        VRString.prototype.Size = function () {
            return this.m_string.length;
        };
        VRString.prototype.Empty = function () {
            return this.Size() == 0;
        };
        VRString.prototype.Substring = function (start, count) {
            if (count != null && count < 0) {
                count = this.Size() - start;
            }
            return new VRString(this.m_string.substr(start, count));
        };
        VRString.prototype.IndexOf = function (str, start) {
            return this.m_string.indexOf(str, start);
        };
        VRString.prototype.Split = function (separator, exclude_empty) {
            var result = new Vector_1.Vector();
            var start = 0;
            while (true) {
                var index = this.IndexOf(separator, start);
                if (index >= 0) {
                    var str_1 = this.Substring(start, index - start);
                    if (!str_1.Empty() || exclude_empty == null || !exclude_empty) {
                        result.Add(str_1);
                    }
                    start = index + separator.length;
                }
                else {
                    break;
                }
            }
            var str = this.Substring(start, -1);
            if (!str.Empty() || exclude_empty == null || !exclude_empty) {
                result.Add(str);
            }
            return result;
        };
        VRString.prototype.Contains = function (str) {
            return this.m_string.indexOf(str) >= 0;
        };
        VRString.prototype.toString = function () {
            return this.m_string.toString();
        };
        VRString.prototype.Equals = function (str) {
            return this.m_string == str.m_string;
        };
        return VRString;
    }());
    exports.VRString = VRString;
});
//# sourceMappingURL=String.js.map