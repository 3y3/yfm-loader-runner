export type Action = (...args: any[]) => any;

export type Hash<V = unknown> = Record<string, V>;

export type NodeCallback<R = any> = (error?: Error | null, result?: R) => void;

export type SourceMap = {
    version: string;
};