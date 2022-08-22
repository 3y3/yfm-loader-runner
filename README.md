# YFM Loader Runner 

This is reimplemented webpack [loader-runner](https://www.npmjs.com/package/loader-runner).

It is required to be compatible with webpack build system and limits his usage.

YFM loaders can use only methods and fields described in this package, not in original webpack documentation.

- Webpack `runLoaders` interface changed to use `vfile` as input.
- Webpack `LoaderContext` is limited. Read [more](./src/core/README.md)
- VFile from [vfile](https://www.npmjs.com/package/vfile) taked as base context unit and extended. Read [more](./src/core/vfile/README.md).

## Usage

### Basic

```ts
import { runLoaders, VFile } from 'yfm-loader-runner';

const file = new VFile({
    request: './some-file?query=supported#and-fragment',
    contents: 'Hello, world',
    loaders: [
        [ 'some-loader', function(content) {
            return content + '!';
        } ]
    ]
});

const result = await runLoaders(file);

console.log(result); // Hello, world!
console.log(file.meta); // {}
console.log(file.assets); // []
```

### With complex loaders

```ts
import { runLoaders, VFile } from 'yfm-loader-runner';

const loaders = {
    get(this: VFile) {
        if (this.extmane === '.ts') {
            return [
                [ 'ts-loader', (content) => content + ' (ts)' ]
            ];
        } else if (this.stem === 'empty') {
            return [
                [ 'null-loader', (_content) => '' ]
            ];
        }

        return [
            [ 'ss-loader', (content) => content + ' (js)' ]
        ];
    }
};

const tsfile = new VFile({
    request: './some-file.ts',
    contents: 'Hello, world',
    loaders: loaders
});

const jsfile = new VFile({
    request: './some-file.js',
    contents: 'Hello, world',
    loaders: loaders
});

const results = Promise.all([
    runLoaders(tsfile),
    runLoaders(jsfile),
]);

console.log(results);
```