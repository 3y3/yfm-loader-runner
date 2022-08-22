import { NodeCallback } from '../../../@types';

interface IStat {
    isFile(): boolean;

    isDirectory(): boolean;

    size: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
}

export class AbstractFS {
    readFile(_path: string, _callback: NodeCallback<Buffer | string>): any {
        throw new Error('Non implemented!');
    }

    stat(_path: string, _callback: NodeCallback<IStat | undefined>): any {
        throw new Error('Non implemented!');
    }
}