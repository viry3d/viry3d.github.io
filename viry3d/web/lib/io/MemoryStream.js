define(["require", "exports"], function (require, exports) {
    "use strict";
    function utf8_array_to_string(array) {
        var out = "";
        var len = array.length;
        var i = 0;
        var char2 = 0;
        var char3 = 0;
        while (i < len) {
            var c = array[i++];
            switch (c >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    // 0xxxxxxx
                    out += String.fromCharCode(c);
                    break;
                case 12:
                case 13:
                    // 110x xxxx   10xx xxxx
                    char2 = array[i++];
                    out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                    break;
                case 14:
                    // 1110 xxxx  10xx xxxx  10xx xxxx
                    char2 = array[i++];
                    char3 = array[i++];
                    out += String.fromCharCode(((c & 0x0F) << 12) |
                        ((char2 & 0x3F) << 6) |
                        ((char3 & 0x3F) << 0));
                    break;
            }
        }
        return out;
    }
    var MemoryStream = (function () {
        function MemoryStream(buffer, little_endian) {
            this.m_position = 0;
            this.m_size = 0;
            this.m_buffer = new DataView(buffer);
            this.m_size = buffer.byteLength;
            this.m_little_endian = little_endian;
        }
        MemoryStream.prototype.ReadUint16 = function () {
            var v = this.m_buffer.getUint16(this.m_position, this.m_little_endian);
            this.m_position += 2;
            return v;
        };
        MemoryStream.prototype.ReadInt = function () {
            var v = this.m_buffer.getInt32(this.m_position, this.m_little_endian);
            this.m_position += 4;
            return v;
        };
        MemoryStream.prototype.ReadUInt = function () {
            var v = this.m_buffer.getUint32(this.m_position, this.m_little_endian);
            this.m_position += 4;
            return v;
        };
        MemoryStream.prototype.ReadFloat = function () {
            var v = this.m_buffer.getFloat32(this.m_position, this.m_little_endian);
            this.m_position += 4;
            return v;
        };
        MemoryStream.prototype.ReadBool = function () {
            var v = this.m_buffer.getUint8(this.m_position);
            this.m_position += 1;
            return v != 0;
        };
        MemoryStream.prototype.ReadByte = function () {
            var v = this.m_buffer.getUint8(this.m_position);
            this.m_position += 1;
            return v;
        };
        MemoryStream.prototype.ReadBytes = function (size) {
            var v = new Uint8Array(this.m_buffer.buffer, this.m_position, size);
            this.m_position += size;
            return v;
        };
        MemoryStream.prototype.ReadString = function (size) {
            var v = utf8_array_to_string(new Uint8Array(this.m_buffer.buffer, this.m_position, size));
            this.m_position += size;
            return v;
        };
        MemoryStream.prototype.SubStream = function (offset, size) {
            var stream = new MemoryStream(this.m_buffer.buffer, this.m_little_endian);
            stream.m_position = offset;
            stream.m_size = size;
            return stream;
        };
        MemoryStream.prototype.GetSize = function () {
            return this.m_size;
        };
        MemoryStream.prototype.GetSlice = function () {
            return this.m_buffer.buffer.slice(this.m_position, this.m_position + this.m_size);
        };
        return MemoryStream;
    }());
    exports.MemoryStream = MemoryStream;
});
//# sourceMappingURL=MemoryStream.js.map