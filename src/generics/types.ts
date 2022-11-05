import {
    CastAnyIdentifier,
    CastCheckResult,
    CastDocIn,
    CastDocOut,
    CastFilterIn,
    CastFilterOut,
    CastGraphQLIn,
    CastGraphQLOut, CastIdentifier,
    CastLike, CastLike2,
    CastOption,
    CastStagingLike,
    CastTransfer
} from "../cast";
import {ArraySome, FuncLike, OneOrMore, RecLike} from "../common";
import {PropertyReflectLike} from "../reflect";

type V = GenericsLike;

export type GenericsAnyIdentifier = CastAnyIdentifier | GenericsTreeLike; // todo
export type GenericsIdentifier = CastIdentifier | GenericsTreeLike | [CastAnyIdentifier];
export type GenericsOption = CastOption;

export interface GenericsTreeLike {
    base?: string;
    children?: Array<GenericsTreeLike>;
    toJSON?(): RecLike;
}

export interface GenericsLike<T = unknown, O extends GenericsOption = GenericsOption> extends CastLike<T, O> {
    gen(identifier: GenericsAnyIdentifier, value: unknown|T, opt?: GenericsOption): T;

    $genDoc?(tree: GenericsTreeLike, ref: PropertyReflectLike, openApi: CastDocIn): unknown;
    $genGraphQL?(tree: GenericsTreeLike, ref: PropertyReflectLike, gql: CastGraphQLIn): unknown;
    $genFilter?(tree: GenericsTreeLike, ref: PropertyReflectLike, filter: CastFilterIn): unknown;
    $genBuild?(...children: Array<GenericsAnyIdentifier>): GenericsTreeLike;
    genMin?: number;
    genMax?: number;
}

export interface GenericsLike2 extends CastLike2 {
    gen<T = unknown>(identifier: GenericsIdentifier, value: unknown): T;

    $genDoc?(tree: GenericsTreeLike, ref: PropertyReflectLike, openApi: CastDocIn): unknown;
    $genGraphQL?(tree: GenericsTreeLike, ref: PropertyReflectLike, gql: CastGraphQLIn): unknown;
    $genFilter?(tree: GenericsTreeLike, ref: PropertyReflectLike, filter: CastFilterIn): unknown;
    $genBuild?(...children: Array<GenericsAnyIdentifier>): GenericsTreeLike;
    genMin?: number;
    genMax?: number;
}

export interface GenericsStagingLike extends CastStagingLike {
    tree: GenericsTreeLike;
}



export interface CoreGenericsLike {
    // region pointer
    getNameMap(): Map<string, FuncLike>;
    getList(): Array<FuncLike>;
    getAliasList(): Array<FuncLike>;

    add(clazz: FuncLike, instance: V): void;
    addAlias(aliasFn: FuncLike, genericsFn: FuncLike): void;

    getInstance(clazz: FuncLike): V;
    listValues(): Array<V>;

    findInstance(instance: V, throwable?: boolean): V;
    findInstance(clazz: FuncLike, throwable?: boolean): V;
    findInstance(name: string, throwable?: boolean): V;

    findClass(instance: V, throwable?: boolean): FuncLike;
    findClass(clazz: FuncLike, throwable?: boolean): FuncLike;
    findClass(name: string, throwable?: boolean): FuncLike;

    isAny(clazz: FuncLike): boolean;
    isAny(instance: V): boolean;
    isAny(name: string): boolean;

    isAlias(alias: FuncLike): boolean;
    isAlias(name: string): boolean;

    isPrimary(clazz: FuncLike): boolean;
    isPrimary(name: string): boolean;

    isValue(instance: V): boolean;
    // endregion pointer

    // region internal
    $stagingMap(): Map<string, Array<GenericsStagingLike>>;
    $checkInstance(instance: V, isChild?: boolean, throwable?: boolean): CastCheckResult;
    $fromCast(transfer: CastTransfer): void;
    // endregion internal

    // region custom
    run<T>(xxx: GenericsAnyIdentifier, value: unknown, opt?: GenericsOption): T;
    buildTree(parent: string, ...children: Array<GenericsAnyIdentifier>): GenericsTreeLike;

    toTree(xxx: OneOrMore<CastAnyIdentifier>|GenericsTreeLike): GenericsTreeLike;
    $toTreeAsChild(xxx: OneOrMore<CastAnyIdentifier>|GenericsTreeLike): GenericsTreeLike;

    parse(given: unknown): GenericsTreeLike;

    stringify(tree: GenericsTreeLike): string;

    fromArray(arr: ArraySome): GenericsTreeLike;

    toArray(tree: GenericsTreeLike): ArraySome;

    fromObject(obj: RecLike): GenericsTreeLike;

    toObject(tree: GenericsTreeLike): RecLike;
    // endregion custom
}