import { runLoaders, VFile } from 'yfm-loader-runner';

const file = new VFile({
    request: './some-file?query=supported#and-fragment',
    contents: 'Hello, world',
    loaders: [
        [ 'some-loader', function(content: string) {
            return content + '!';
        } ]
    ]
});

const result = await runLoaders(file);

console.log(result); // Hello, world!
console.log(file.meta); // {}
console.log(file.assets); // []