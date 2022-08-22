import { runLoaders } from './loader-runner';
import { ExtendedVFile } from './ExtendedVFile';
import { ExtendedContext } from './ExtendedContext';

export async function runLoaders(vfile: ExtendedVFile) {
    const context = new ExtendedContext(vfile);

    const [ error, result ] = await runLoaders({
        resource: vfile.path,

        loaders: vfile.loaders,

        context: context,

        readResource(_path, callback) {
            callback(null, vfile.contents as string | Buffer);
        }
    });

    vfile.meta.fileDependencies = result.fileDependencies;
    vfile.meta.missingDependencies = result.missingDependencies;

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