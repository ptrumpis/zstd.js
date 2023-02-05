CC := emcc
CFLAGS = -O3 \
	-s WASM=1 \
	-s SINGLE_FILE \
	-s EXPORTED_FUNCTIONS="['_ZSTD_compress','_ZSTD_compressBound','_ZSTD_getFrameContentSize','_ZSTD_decompress','_ZSTD_isError','_ZSTD_getErrorName','_malloc','_free']" \
	-s EXPORTED_RUNTIME_METHODS="['cwrap','stringToUTF8','UTF8ToString','lengthBytesUTF8']" \
	-s ALLOW_MEMORY_GROWTH=1 \
	-s MODULARIZE=1 \
	-s EXPORT_NAME="'ZSTD'" \
	--pre-js pre.js

build:
	cd zstd && CC=gcc emmake make lib-release
	exit
	mkdir -p dist
	$(CC) $(CFLAGS) "zstd/lib/libzstd.so" -o "dist/zstd.js"

clean:
	rm -rf dist/
