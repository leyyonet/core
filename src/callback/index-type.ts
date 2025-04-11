import {ClassLike, Dict, Func, Obj} from "@leyyo/common";
import {FqnName} from "../fqn";

export type CallbackValue = Func | ClassLike | Obj;
export type CallbackName = CallbackValue | string;

export interface CallbackLookup extends FqnName {
    value?: CallbackValue;
    any: string;
    found?: boolean;
}
export interface CallbackBase<V extends CallbackValue, W extends CallbackValue> extends FqnName {
    value: V;
    pointers: Array<W|CallbackValue>;
    aliases: Array<string>;
}
export interface CallbackBaseName<V extends CallbackValue, W extends CallbackValue> extends CallbackBase<V, W> {
    nameType: CallbackNameType;
}

export type CallbackNameType = 'basic'|'full'|'alias';
export interface CallbackLike<V extends CallbackValue, W extends CallbackValue> {
    get bucket(): string;
    get info(): Array<CallbackInfo>;
    get bases(): Array<CallbackBase<V, W>>;
    get aliases(): Map<string, CallbackBaseName<V, W>>;
    get values(): Array<V>;
    equals(base: CallbackBase<V, W>, ...pointers: Array<CallbackValue>): boolean;
    addProxy(source: V|W, target: V|W, recursive?: boolean): void;
    getProxy(source: V|W): CallbackBase<V, W>;
    appendPointer(value: CallbackName, pointer: W|CallbackValue): void;
    add(value: V, ...aliases: Array<string>): CallbackBase<V, W>;
    remove(value: CallbackName): void;
    has(value: CallbackName): boolean;
    get(value: CallbackName, required?: boolean): CallbackBase<V, W>;
    fetchValue(value: CallbackName, required?: boolean): V;
    fetchPointer(value: CallbackName, required?: boolean): W;
    findByAlias(alias: string): CallbackBase<V, W>;
    isAlias(name: string): boolean;
    isSource(name: string): boolean;
}
export interface CallbackAssignResponse<V extends CallbackValue, W extends CallbackValue> {
    bucket: string;
    bases: Array<CallbackBase<V, W>>;
    aliases: Map<string, CallbackBaseName<V, W>>;
}
export interface CallbackPoolLike {
    get info(): Dict<Array<CallbackBase<CallbackValue, CallbackValue>>>;
    assign<V extends CallbackValue, W extends CallbackValue>(bucket: string, pointer: CallbackFinder<V, W>): CallbackAssignResponse<V, W>;
}
export type CallbackFinder<V extends CallbackValue, W extends CallbackValue> = (value: V) => W;
export type CallbackIs<V extends CallbackValue> = (value: V) => boolean;
export interface CallbackInfo {
    type: string;
    basic: string;
    full: string;
    aliases: Array<string>;
}