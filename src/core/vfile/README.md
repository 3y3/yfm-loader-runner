### About this directory

There are stored parts of extended [VFile](https://www.npmjs.com/package/vfile). 

Added:
- `query`, `fragment`, `map` - to be more compatible with webpack runtime
- `fs` - transparently passed to loader context.
- `assets` - to accumulate file output deps
- `meta` - to accumulate build statements and dependencies. Dependencies automatically copies from loader context. 
- `loaders` - required for loader context. Can be simple array, or complex [resolver](../../../examples/complex-loaders)