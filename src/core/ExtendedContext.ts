import type { NormalModule, AbstractFS } from './vfile';
import type { Hash, SourceMap } from '../../@types';
import { URLSearchParams } from 'url';
import { LoaderContext } from './loader-runner';
import { ExtendedVFile } from './vfile';
import { runLoaders } from './runLoaders';
import { promisify } from './utils';

export interface Position {
    /**
     * Place of the first character of the parsed source region.
     */
    start: Point;

    /**
     * Place of the first character after the parsed source region.
     */
    end: Point;

    /**
     * Start column at each index (plus start line) in the source region,
     * for elements that span multiple lines.
     */
    indent?: number[] | undefined;
}

/**
 * One place in a source file.
 */
export interface Point {
    /**
     * Line in a source file (1-indexed integer).
     */
    line: number;

    /**
     * Column in a source file (1-indexed integer).
     */
    column: number;
    /**
     * Character in a source file (0-indexed integer).
     */
    offset?: number | undefined;
}

function getCurrentLoader(loaderContext: LoaderContext, index = loaderContext.loaderIndex) {
    if (
        loaderContext.loaders &&
        loaderContext.loaders.length &&
        index < loaderContext.loaders.length &&
        index >= 0 &&
        loaderContext.loaders[index]
    ) {
        return loaderContext.loaders[index];
    }

    return null;
}

export class ExtendedContext extends LoaderContext {

    readonly fs: AbstractFS;

    readonly rootContext: string;

    readonly _module: NormalModule;

    constructor(
        private readonly file: ExtendedVFile
    ) {
        super(file.path, file.loaders);

        this.rootContext = file.cwd;
        this.fs = file.fs;

        this._module = file.module;
    }

    getOptions(): Hash {
        const loader = getCurrentLoader(this);

        if (!loader) {
            return {};
        }

        let options: Hash | string = loader.options as any;

        if (typeof options === 'string') {
            if (options.startsWith('{') && options.endsWith('}')) {
                try {
                    options = JSON.parse(options);
                } catch (e) {
                    // @ts-ignore
                    throw new Error(`Cannot parse string options: ${ e.message }`);
                }
            } else {
                const query = new URLSearchParams(options);

                options = {};
                for (const [ key, value ] of query) {
                    options[key] = value;
                }
            }
        }

        if (options === null || options === undefined) {
            options = {};
        }

        return options as Hash;
    }

    emitWarning(warning: string, place?: Position | Point, origin?: string) {
        this.file.info(warning, place, origin);
    }

    emitError(error: string, place?: Position | Point, origin?: string) {
        this.file.fail(error, place, origin);
    }

    emitFile(name: string, content: string | Buffer, _sourceMap: any, _assetInfo: any) {
        this.file.assets.set(name, { name, content });
    }

    async loadModule(
        request: string,
        callback: (error: Error | null, source?: string | Buffer, map?: SourceMap | undefined, module?: NormalModule) => void
    ) {
        const file = this.file.from({
            request,
            cwd: this.file.cwd
        });

        file.contents = await promisify(this.fs.readFile, this.fs)(file.path);

        try {
            const result = await runLoaders(file);
            const { fileDependencies, missingDependencies } =  file.meta;

            for (const dep of fileDependencies as string[]) {
                this.addDependency(dep);
            }

            for (const dep of missingDependencies as string[]) {
                this.addMissingDependency(dep);
            }

            callback(null, result, file.map, file.module);
        } catch (error) {
            return callback(error as Error);
        }
    }
}

