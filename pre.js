let ZSTD_compressBound,ZSTD_compress,ZSTD_getFrameContentSize,ZSTD_decompress,ZSTD_isError,ZSTD_getErrorName;

Module.preRun = function() {
	ZSTD_compressBound = cwrap("ZSTD_compressBound", "number", ["number"]);
	ZSTD_compress = cwrap("ZSTD_compress", "number", ["number", "number", "number", "number", "number"]);
	ZSTD_getFrameContentSize = cwrap("ZSTD_getFrameContentSize", "number", ["number", "number"]);
	ZSTD_decompress = cwrap("ZSTD_decompress", "number", ["number", "number", "number", "number"]);
	ZSTD_isError = cwrap("ZSTD_isError", "number", ["number"]);
	ZSTD_getErrorName = cwrap("ZSTD_getErrorName", "string", ["number"]);
};

function copy(src) {
	return new Uint8Array(src);
}

// https://github.com/facebook/zstd/blob/15c5e200235edc520c1bd678ed126a6dd05736e1/examples/simple_compression.c#L17
function compress(iSize, iBuff, compressionLevel) {
	let cBuffSize = ZSTD_compressBound(iSize);
	let cBuff = _malloc(cBuffSize);

	let cSize = ZSTD_compress(cBuff, cBuffSize, iBuff, iSize, compressionLevel);
	if (ZSTD_isError(cSize)) {
		_free(iBuff);
		_free(cBuff);
		throw new Error(ZSTD_getErrorName(cSize));
	}

	let cData = new Uint8Array(HEAPU8.buffer, cBuff, cSize);
	cData = copy(cData);

	_free(iBuff);
	_free(cBuff);

	return cData;
};

Module.compress = function(input, compressionLevel = 3) {
	if (!(input instanceof Uint8Array)) {
		throw new TypeError();
	}

	let iSize = input.byteLength;
	let iBuff = _malloc(iSize);
	HEAPU8.set(new Uint8Array(input), iBuff);

	return compress(iSize, iBuff, compressionLevel);
};

Module.compressString = function(input, compressionLevel) {
	// https://stackoverflow.com/a/203757
	if (typeof input !== "string") {
		throw new TypeError();
	}

	let iSize = lengthBytesUTF8(input)+1;
	let iBuff = _malloc(iSize);
	stringToUTF8(input, iBuff, iSize);

	return compress(iSize, iBuff, compressionLevel);
};

// https://github.com/facebook/zstd/blob/15c5e200235edc520c1bd678ed126a6dd05736e1/examples/simple_decompression.c#L16
function decompress(input) {
	if (!(input instanceof Uint8Array)) {
		throw new TypeError();
	}

	let cSize = input.byteLength;
	let cBuff = _malloc(cSize);
	HEAPU8.set(new Uint8Array(input), cBuff);

	let rSize = ZSTD_getFrameContentSize(cBuff, cSize);
	if (rSize < 0) {
		_free(cBuff);
		throw new Error(rSize);
	}

	let rBuff = _malloc(rSize);
	let dSize = ZSTD_decompress(rBuff, rSize, cBuff, cSize);
	if (ZSTD_isError(dSize)) {
		_free(cBuff);
		_free(rBuff);
		throw new Error(ZSTD_getErrorName(cSize));
	}
	_free(cBuff);

	return [rBuff, dSize];
};

Module.decompress = function(input) {
	let [rBuff, dSize] = decompress(input);

	let cData = new Uint8Array(HEAPU8.buffer, rBuff, dSize);
	cData = copy(cData);
	_free(rBuff);

	return cData;
};

Module.decompressString = function(input) {
	let [rBuff, dSize] = decompress(input);

	let s = UTF8ToString(rBuff, dSize);
	_free(rBuff);

	return s;
};
