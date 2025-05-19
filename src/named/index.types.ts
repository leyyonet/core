import {ClassLike, Dict, Func, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {FqnName} from "../fqn";

export type NamedDepotValue = Func | ClassLike | Obj;
export type NamedDepotName = NamedDepotValue | string;

export interface NamedDepotLookup extends FqnName {
    value?: NamedDepotValue;
    any: string;
    found?: boolean;
}

export interface NamedDepotItem<V extends NamedDepotValue, P extends NamedDepotValue> extends FqnName {
    id: number;
    value: V;
    pointers: Array<P | NamedDepotValue>;
    aliases: Array<string>;
}

export interface NamedDepotAliasItem<V extends NamedDepotValue, P extends NamedDepotValue> extends NamedDepotItem<V, P> {
    nameType: NamedDepotNameType;
}

export type NamedDepotNameType = 'basic' | 'full' | 'alias' | 'custom';

/**
 * Named depot interface
 *
 * Generics:
 * - V: value of depot item
 * - P: pointer of depot item
 * */
export interface NamedDepotLike<V extends NamedDepotValue, P extends NamedDepotValue> extends ShiftSecure<NamedDepotSecure<V, P>> {
    get bucket(): string;

    get info(): Array<NamedDepotInfo>;

    get bases(): Array<NamedDepotItem<V, P>>;

    get aliases(): Map<string, NamedDepotAliasItem<V, P>>;

    get values(): Array<V>;

    equals(base: NamedDepotItem<V, P>, ...pointers: Array<NamedDepotValue>): boolean;

    addProxy(source: V | P, target: V | P, recursive?: boolean): void;

    getProxy(source: V | P): NamedDepotItem<V, P>;

    appendPointer(value: NamedDepotName, pointer: P | NamedDepotValue): void;

    add(value: V, ...aliases: Array<string>): NamedDepotItem<V, P>;

    remove(value: NamedDepotName, raiseIfAbsent?: boolean): boolean;

    has(value: NamedDepotName): boolean;

    get(value: NamedDepotName, required?: boolean): NamedDepotItem<V, P>;

    fetchValue(value: NamedDepotName, required?: boolean): V;

    fetchPointer(value: NamedDepotName, required?: boolean): P;

    findByAlias(alias: string): NamedDepotItem<V, P>;

    isAlias(name: string): boolean;

    isSource(name: string): boolean;
}

/**
 * Named depot secure interface
 *
 * Generics:
 * - V: value of depot item
 * - P: pointer of depot item
 * */
export interface NamedDepotSecure<V extends NamedDepotValue, P extends NamedDepotValue> extends ShiftMain<NamedDepotLike<V, P>> {
    readonly $proxyInherits: symbol;
    readonly $proxyInheritedBy: symbol;
    readonly $pointerFinderLambda: NamedDepotFinderLambda<V, P>;
    readonly $isLambda: NamedDepotEqualsLambda<V>;
    readonly $bases: Array<NamedDepotItem<V, P>>;
    readonly $aliases: Map<string, NamedDepotAliasItem<V, P>>;

    $toName(value: NamedDepotValue): string;

    $func(value: V, throwable?: boolean): V;

    $clearAliases(base: NamedDepotItem<V, P>, nameType?: NamedDepotNameType): void;

    $appendAliases(base: NamedDepotItem<V, P>): void;

    $getPointer(value: NamedDepotValue): P;

    $findByValue(value: V): NamedDepotItem<V, P>;

    $findByName(name: string): NamedDepotItem<V, P>;

    $find(value: NamedDepotName): NamedDepotItem<V, P>;

    $getLookup(value: NamedDepotName): NamedDepotLookup;

    $appendAlias(base: NamedDepotItem<V, P>, name: string, nameType: NamedDepotNameType): void;

    $add(value: V, ...aliases: Array<string>): [NamedDepotItem<V, P>, NamedDepotLookup];

    $remove(value: NamedDepotName, raiseIfAbsent?: boolean): [boolean, NamedDepotLookup];
}

export interface NamedPoolLike {
    get info(): Dict<Array<NamedDepotInfo>>;

    assign<V extends NamedDepotValue, P extends NamedDepotValue>(pack: string, name: string, pointerFinderLambda: NamedDepotFinderLambda<V, P>, equalsLambda?: NamedDepotEqualsLambda<V>): NamedDepotLike<V, P>;
}

export type NamedDepotFinderLambda<V extends NamedDepotValue, P extends NamedDepotValue> = (value: V) => P;
export type NamedDepotEqualsLambda<V extends NamedDepotValue> = (value: V) => boolean;

export interface NamedDepotInfo {
    type: string;
    basic: string;
    full: string;
    aliases: Array<string>;
}

export interface NamedPoolNewDoc<V extends NamedDepotValue, P extends NamedDepotValue> {
    pack: string;
    name: string;
    bucket: string;
    pointerFinderLambda: NamedDepotFinderLambda<V, P>;
    equalsLambda: NamedDepotEqualsLambda<V>;
}
