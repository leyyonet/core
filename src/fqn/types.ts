import {FuncLike, ObjectLike, ObjectOrFunction} from "../common";

export type FqnType = 'class' | 'function' | 'method' | 'getter' | 'setter' | 'enum' | 'namespace' | 'module' | 'file' | 'object';
export type FqnSource = 'function' | 'getter' | 'setter';

export interface FqnFootprintInner {
    origin: string;
    name?: string;
    fqn?: string;
    stereotype?: FqnType;
}

export interface FqnFootprintDetail extends FqnFootprintInner {
    parent?: FqnFootprintInner;
    proto?: FqnFootprintInner;
    constructor?: FqnFootprintInner;
}

export interface FqnFootprint {
    name: string;
    stereotype: FqnType;
    origin: string;
}
export interface FqnSymbol {
    fqn: string;
    fqt: FqnType;
    fqo: string;
}
export interface FqnGetSet {
    n: string;
    o: string;
}

export interface FqnFootprintTree extends FqnFootprint {
    children?: Record<string, FqnFootprintTree>;
}

export interface CoreFqnLike {
    // region footprint
    getFootprint(target: ObjectOrFunction): FqnFootprint;
    setFootprint(target: ObjectOrFunction, name: string, stereotype: FqnType): boolean;
    setFootprint(target: ObjectOrFunction, name: string, stereotype: FqnType, origin: string): boolean;
    getSource(target: ObjectOrFunction, key: string, isInstance: boolean): FqnSource;

    getterFootprint(clazz: ObjectOrFunction, property: string): FqnFootprint;
    setterFootprint(clazz: ObjectOrFunction, property: string): FqnFootprint;

    isGetter(clazz: ObjectOrFunction, key: string, isInstance: boolean): boolean;

    is(target: ObjectOrFunction): boolean;

    get(target: unknown): string;

    stereotype(target: unknown): FqnType;

    origin(target: unknown): string;

    // endregion footprint
    // region dimension
    clazz(clazz: ObjectOrFunction, ...prefixes: Array<string>): void;

    func(fn: FuncLike, ...prefixes: Array<string>): void;
    deco(fn: FuncLike, ...prefixes: Array<string>): void;

    enum(name: string, map: ObjectLike, ...prefixes: Array<string>): void;

    namespace(instance: ObjectLike, ...prefixes: Array<string>): void;

    module(instance: ObjectLike, ...prefixes: Array<string>): void;

    object(name: string, obj: ObjectLike, ...prefixes: Array<string>): void;

    file(instance: ObjectLike, ...prefixes: Array<string>): void;

    reports(...objects: Array<ObjectOrFunction>): Array<FqnFootprintTree>;

    report(obj: ObjectOrFunction): FqnFootprintTree;

    // endregion dimension
}