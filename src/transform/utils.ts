import { NodeCallback, Action } from '../../@types';

type ActionWithCallback<Args extends any[]> = (...args: [ ...Args, NodeCallback ]) => any;

type ActionCallback<Args extends any[], Fn extends (...args: [ ...Args, NodeCallback ]) => any> =
    Fn extends (...args: [ ...any, infer Cb ]) => any ?
        Cb extends NodeCallback ? Last<Parameters<Cb>> : never : never;

type Last<T extends any[]> = T extends [ ...any, infer Last ] ? Last : never;

type LastParam<A extends Action> = Last<Parameters<A>>;

export function promisify<Args extends any[]>(fn: ActionWithCallback<Args>, ...rest: any[]) {
    return function(this: any, ...args: any[]): Promise<LastParam<ActionCallback<Args, typeof fn>>> {
        return new Promise((resolve, reject) => {
            const context = rest.length > 0 ? rest[0] : this;

            fn.call(context, ...args as Args, function(error?: Error | null, result?: any) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}
