# Zstd.js
Small Web Browser compatible zstd library with WebAssembly in a single file.

- Pre-build
- No Node.js
- No Webpack
- No Bullshit

Perfect for CDN Usage.

## Installation
Use this repo as public CDN 
```
https://cdn.jsdelivr.net/gh/ptrumpis/zstd.js/dist/zstd.js
```

Or copy and include the file *dist/zstd.js* in your web project.

See also: [example.html](./example.html)

## Usage
```javascript
const zstd = await ZSTD();

zstd.compress(<Uint8Array>, <compressionLevel>) <Uint8Array>
zstd.decompress(<Uint8Array>) <Uint8Array>
zstd.compressString(<string>, <compressionLevel>) <Uint8Array>
zstd.decompressString(<Uint8Array>) <string>
```

## Build
```
$ git clone --recurse-submodules https://github.com/ptrumpis/zstd.js.git
$ cd zstd.js
$ make
```
