import type { Hash, SourceMap } from '../../../@types';
import type { LoaderData } from '../loader-runner';
import vfile, { VFile, VFileOptions } from 'vfile';
import { AbstractFS } from './AbstractFS';
import { parsePathQueryFragment } from '../loader-runner/utils';

interface VFileConstructor {
    new(...args: Parameters<VFile>): VFile
}

type ExtendedOptions = {
    request: string;
    issuer?: ExtendedVFile;
    fs?: AbstractFS;
    loaders?: LoaderData[] | PropertyDescriptor;
}

function isDescriptor(loaders: any): loaders is PropertyDescriptor {
    return loaders && 'get' in loaders;
}

export class ExtendedVFile extends (vfile as VFile & VFileConstructor) {

    public readonly issuer: ExtendedVFile | undefined;

    public readonly fs = new AbstractFS();

    public readonly module = new NormalModule();

    public readonly loaders: LoaderData[] = [];

    public readonly assets: Map<string, { name: string, content: string | Buffer }> = new Map();

    public readonly meta: Hash = {};

    // @ts-ignore
    public readonly path: string;

    public readonly query: string = '';

    public readonly fragment: string = '';

    public map: SourceMap | undefined;

    constructor(options: VFileOptions & ExtendedOptions) {
        super({ ...options, ...parsePathQueryFragment(options.request) });

        this.issuer = options.issuer;

        if ('request' in options) {
            this.request = options.request;
        }

        if (typeof options === 'object' && 'fs' in options) {
            this.fs = options.fs as AbstractFS || this.fs;
        }

        if (typeof options === 'object' && 'loaders' in options) {
            if (isDescriptor(options.loaders)) {
                Object.defineProperty(this, 'loaders', options.loaders as PropertyDescriptor);
            } else {
                this.loaders = (options.loaders as LoaderData[]) || this.loaders;
            }
        }
    }

    get request(): string {
        return (this.path as string).replace(/#/g, '\0#') + this.query.replace(/#/g, '\0#') + this.fragment;
    }

    set request(value: string) {
        const { path, query, fragment } = parsePathQueryFragment(value);

        Object.assign(this, { path, query, fragment });
    }

    from(options: VFileOptions & ExtendedOptions) {
        const file = new ExtendedVFile(options);

        if (!options.loaders) {
            const loaders = Object.getOwnPropertyDescriptor(this, 'loaders') as PropertyDescriptor;
            Object.defineProperty(file, 'loaders', loaders);
        }

        if (!options.fs) {
            const fs = Object.getOwnPropertyDescriptor(this, 'fs') as PropertyDescriptor;
            Object.defineProperty(file, 'fs', fs);
        }

        return file;
    }
}

export class NormalModule {
}