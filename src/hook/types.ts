import {FuncLike} from "../common";

export type HookTrigger = (fn: FuncLike) => void;
export type HookKind = 'function' | 'trigger';

export interface CoreHookLike {
    get(name: string, silent?: boolean): FuncLike;

    has(name: string): boolean;

    add(name: string, fn: FuncLike);

    update(name: string, fn: FuncLike): boolean;

    remove(name: string): boolean;

    addTrigger(name: string, fn: HookTrigger, tag?: string): void;

    clearTriggers(name: string): boolean;

    clearTrigger(name: string, tag: string): boolean;

    run<T = unknown>(name: string, ...a: Array<unknown>): T;

    runOrIgnore<T = unknown>(name: string, ...a: Array<unknown>): T;

    runAsync<T = unknown>(name: string, ...a: Array<unknown>): Promise<T>;

    runOrIgnoreAsync<T = unknown>(name: string, ...a: Array<unknown>): Promise<T>;
}