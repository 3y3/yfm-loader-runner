import { resolve } from 'path';
import { runLoaders as innerRunLoaders } from './loader-runner';
import { VFile } from './vfile';
import { ExtendedContext } from './ExtendedContext';

export async function runLoaders(vfile: VFile) {
    const context = new ExtendedContext(vfile);

    const [ error, result ] = await innerRunLoaders({
        resource: resolve(vfile.cwd, vfile.request),

        loaders: vfile.loaders,

        context: context,

        readResource(_path, callback) {
            callback(null, vfile.contents as string | Buffer);
        }
    });

    vfile.meta.fileDependencies = [...new Set(result.fileDependencies)];
    vfile.meta.missingDependencies = [...new Set(result.missingDependencies)];

    if (result.result) {
        const [ source, map, meta ] = result.result;

        if (typeof meta === 'object') {
            Object.keys(meta).forEach(key => {
                vfile.meta[key] = meta[key];
            });
        }

        vfile.map = map;

        return source;
    } else {
        throw error;
    }
}