import {FuncLike, ObjectLike, ObjectOrFunction} from "../common";

export type PointerNicknameLambda = (clazz: FuncLike, nicknames: Array<string>) => void;
export type PointerValue = ObjectOrFunction;
export interface PointerNameItem {
    source: PointerSource;
    primary: FuncLike;
    alias?: FuncLike;
}
export interface PointerFind<V extends PointerValue> {
    value: V;
    throwable: boolean;
    identifier: string;
}
export type PointerValueLambda<V extends PointerValue> = (value: V) => boolean;
export type PointerNameLambda = (name: string) => unknown;
export interface PointerOption {
    /**
     * Pointer support alias or not
     * */
    alias?: boolean;
    /**
     * Pointer and value can be same type
     * */
    same?: boolean;
}
export interface PointerLike<V extends PointerValue> {
    get option(): PointerOption;
    get bucket(): string;
    normalizeName(name: string): string;
    getNameMap(): Map<string, FuncLike>;
    getPrimaryList(): Array<FuncLike>;
    getAliasList(): Array<FuncLike>;

    addPrimary(primary: FuncLike, value: V): Array<string>;
    addAlias(alias: FuncLike, primary: FuncLike): Array<string>;
    appendNicknames(primary: FuncLike, nicknames: Array<string>): Array<string>;
    getNames(identifier: FuncLike|ObjectLike|string): Array<string>;

    $getValue(primary: FuncLike): V;
    listValues(): Array<V>;

    findValue(value: V, throwable?: boolean): V;
    findValue(fn: FuncLike, throwable?: boolean): V; // fn: alias or primary
    findValue(name: string, throwable?: boolean): V;

    findPrimary(value: V, throwable?: boolean): FuncLike;
    findPrimary(fn: FuncLike, throwable?: boolean): FuncLike; // fn: alias or primary
    findPrimary(name: string, throwable?: boolean): FuncLike;

    findAlias(alias: FuncLike, throwable?: boolean): FuncLike;

    isAny(fn: FuncLike): boolean; // fn: alias or primary
    isAny(value: V): boolean;
    isAny(name: string): boolean;

    isAlias(alias: FuncLike): boolean;

    isPrimary(primary: FuncLike): boolean;
    isPrimary(name: string): boolean;

    isValue(value: V): boolean;
}
export type PointerSource = 'primary' | 'alias';
export interface CorePointerLike {
    getBucketMap(): Map<string, PointerLike<PointerValue>>;

    getBucket<V extends PointerValue>(bucket: string, throwable?: boolean): PointerLike<V>;
    registerNickname(fn: PointerNicknameLambda): void;
    appendNicknames(clazz: FuncLike, nicknames: Array<string>): void;
}