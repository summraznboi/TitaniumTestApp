var supportDirURL = Ti.Filesystem.applicationSupportDirectory;
var supportDir = Ti.Filesystem.getFile(supportDirURL);
if (!supportDir.exists()) {
	supportDir.createDirectory();
}
exports.get = function(key) {
	var keyFile = Ti.Filesystem.getFile(supportDir.resolve(), key);
	if (!keyFile.exists()) {
		return null;
	}
	var myBlob = keyFile.read();
	var blobStream = Ti.Stream.createStream({ source: myBlob, mode: Ti.Stream.MODE_READ });
	var newBuffer = Ti.createBuffer({ length: myBlob.length });
	var numBytes = blobStream.read(newBuffer);
	if (myBlob.length === numBytes) {
		return newBuffer.toString();
	} else {
		Ti.API.error('Reading from Zypsee storage with key ' + key + ' failed');
		return null;
	}
};
exports.put = function(key, value) {
	var keyFile = Ti.Filesystem.getFile(supportDir.resolve(), key);
	keyFile.write(value);
};
