### About this directory

There are stored parts of extended webpack context. 

Methods like `emitFile`, `loadModule` are implemented directly in webpack, not in `loader-runner`.
But we use this methods in `yfm` architecture.

So `ExtendedContext` is webpack loader context compatible with `yfm` loaders.

We also change interface of `runLoaders` func. Now it expects extendsd [VFile](https://www.npmjs.com/package/vfile) as input, instead of loader options.
This is required to limit `runLoaders` inner interface use cases.