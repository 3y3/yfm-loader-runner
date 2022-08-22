import type { LoaderOptions, LoaderData } from '../transform';
import { runLoaders, ExtendedVFile } from '../transform';
import { include } from './include';

type Options = {
    path?: string;
    loaders: (string | LoaderOptions)[]
};

export { include };

export async function transformer(source: string, options: Options) {
    const loaders = await Promise.all((options.loaders)
        .map(async (options) => {
            if (typeof options === 'string') {
                options = { loader: options };
            }

            const module = await include(options.loader);

            return [ options, module ] as LoaderData;
        }));

    const file = new ExtendedVFile({
        request: options.path || 'file.ext',
        contents: source,
        loaders: loaders
    });

    file.value = await runLoaders(file);

    return file;
}