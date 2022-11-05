import {FuncLike, OneOrMore, RecLike} from "../common";
import {ApiSchemaLike} from "../api";
import {PropertyReflectLike, ReflectDescribed, ReflectKeyword} from "../reflect";
import {DecoLike} from "../deco";

type V = CastLike;

export type CastCheckResult = 'self' | 'proto';

export type CastIdentifier = CastLike2|FuncLike|string;

export type CastAnyIdentifier = V|FuncLike|string; // todo
export type CastOption = RecLike;
export type CastLambda<V = unknown> = (value: unknown | V, opt?: CastOption) => V;

export type CastGraphQLIn = RecLike;
export type CastGraphQLOut = RecLike;
export type CastFilterIn = RecLike;
export type CastFilterOut = RecLike;
export type CastDocIn = RecLike;
export type CastDocOut = ApiSchemaLike;

export interface CastLikeInner {
    cast<T = unknown>(value: unknown): T;
    $validate?<T = unknown>(value: T): T;
    $castDoc?(ref: PropertyReflectLike, openApi: CastDocIn): unknown;
    $castGraphQL?(ref: PropertyReflectLike, gql: CastGraphQLIn): unknown;
    $castFilter?(ref: PropertyReflectLike, filter: CastFilterIn): unknown;
}
export type CastLike2 = CastLikeInner & FuncLike;

export interface CastLike<T = unknown, O extends CastOption = CastOption> { // todo
    cast(value: unknown | T, opt?: O): T;

    $validate?(value: V): V;
    $castDoc?(ref: PropertyReflectLike, openApi: CastDocIn): unknown;
    $castGraphQL?(ref: PropertyReflectLike, gql: CastGraphQLIn): unknown;
    $castFilter?(ref: PropertyReflectLike, filter: CastFilterIn): unknown;
}

export interface CoreCastLike {
    $addFromDeco(deco: DecoLike, described: ReflectDescribed, keyword: ReflectKeyword): void;
    // region pointer
    getNameMap(): Map<string, FuncLike>;
    getList(): Array<FuncLike>;
    getAliasList(): Array<FuncLike>;

    add(clazz: FuncLike, instance: V): void;
    addAlias(alias: FuncLike, clazz: FuncLike): void;

    $getInstance(clazz: FuncLike): V;
    listValues(): Array<V>;

    findInstance(instance: V, throwable?: boolean): V;
    findInstance(clazz: FuncLike, throwable?: boolean): V;
    findInstance(name: string, throwable?: boolean): V;
    isInstance(instance: V): boolean;

    findClass(instance: V, throwable?: boolean): FuncLike;
    findClass(clazz: FuncLike, throwable?: boolean): FuncLike;
    findClass(name: string, throwable?: boolean): FuncLike;

    isAny(clazz: FuncLike): boolean;
    isAny(instance: V): boolean;
    isAny(name: string): boolean;

    isAlias(alias: FuncLike): boolean;

    isClass(clazz: FuncLike): boolean;
    isClass(name: string): boolean;

    // endregion pointer

    // region internal
    $stagingMap(): Map<string, Array<CastStagingLike>>;
    $one(described: ReflectDescribed, identifier: CastOneClass, opt?: CastOption): void;
    $typeof(described: ReflectDescribed, classMap: CastTypeofClassMap, opt?: CastOption): void;
    $keyof(described: ReflectDescribed, key: string, classMap: CastKeyofClassMap, opt?: CastOption): void;
    $checkInstance(instance: V, throwable?: boolean): CastCheckResult;
    $setLambda(setLambda: CastSetLambda): void;
    $refactor(described: ReflectDescribed, command: CastAnyCommand, opt?: CastOption): void;
    // endregion internal

    // region custom
    run<T>(clazz: FuncLike, input: unknown, opt?: CastOption): T;
    run<T>(instance: V, input: unknown, opt?: CastOption): T;
    run<T>(name: string, input: unknown, opt?: CastOption): T;
    // endregion custom
}

export interface CastStagingLike {
    described: ReflectDescribed;
    style: CastStyleLike;
    typeOf?: CastTypeofLike;
    propValue?: CastKeyofLike;
}
export interface CastSetLambda extends CastStagingLike {
    fn: CastLambda;
}
export interface CastTransfer<I extends CastAnyIdentifier = CastAnyIdentifier> extends CastStagingLike {
    identifier: CastOneClass<I>;
}

export type CastAnyCommand<I extends CastAnyIdentifier = CastAnyIdentifier> = CastOneCommand<I> | CastTypeofCommand<I> | CastKeyofCommand<I>;
export type CastStyleLike = 'one' | 'typeof' | 'keyof';

export interface CastOneCommand<I extends CastAnyIdentifier = CastAnyIdentifier> {
    style: 'one';
    identifier: CastOneClass<I>;
    fn?: CastLambda;
}
export type CastOneClass<I extends CastAnyIdentifier = CastAnyIdentifier> = OneOrMore<I>;

export type CastTypeofLike = 'string' | 'object' | 'number' | 'boolean' | 'bigint' | '*';
export type CastTypeofClassMap<I extends CastAnyIdentifier = CastAnyIdentifier> = Record<CastTypeofLike, OneOrMore<I>>
export type CastTypeofLambda = Record<CastTypeofLike, CastLambda>;
export interface CastTypeofCommand<I extends CastAnyIdentifier = CastAnyIdentifier> {
    style: 'typeof';
    classMap: CastTypeofClassMap<I>;
    fnMap?: CastTypeofLambda;
}

export type CastKeyofLike = string | '*';
export type CastKeyofClassMap<I extends CastAnyIdentifier = CastAnyIdentifier> = Record<CastKeyofLike, OneOrMore<I>>
export type CastKeyofLambda = Record<CastKeyofLike, CastLambda>;
export interface CastKeyofCommand<I extends CastAnyIdentifier = CastAnyIdentifier> {
    style: 'keyof';
    key: string;
    classMap: CastKeyofClassMap<I>;
    fnMap?: CastKeyofLambda;
}

