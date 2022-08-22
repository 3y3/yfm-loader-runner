import type { LoaderOptions } from '../transform';
import { pathToFileURL } from 'url';

export async function include(loader: LoaderOptions | string): Promise<Record<string, unknown>> {
    const loaderType = typeof loader === 'object' && loader.type || 'common';
    const loaderPath = typeof loader === 'object' ? loader.loader : loader;

    if (loaderType === 'module') {
        const loaderUrl = pathToFileURL(loaderPath).toString();

        return eval(`import(${ JSON.stringify(loaderUrl) })`);
    } else {
        try {
            return require(loaderPath);
        } catch (error) {
            // it is possible for node to choke on a require if the FD descriptor
            // limit has been reached. give it a chance to recover.
            // @ts-ignore
            if (error instanceof Error && error.code === 'EMFILE') {
                return await immediate(() => require(loaderPath));
            } else {
                throw error;
            }
        }
    }
}

function immediate(action: () => (any | Promise<any>)): Promise<ReturnType<typeof action>> {
    return new Promise((resolve, reject) => {
        setImmediate(async () => {
            try {
                resolve(await action());
            } catch (error) {
                reject(error);
            }
        });
    });
}