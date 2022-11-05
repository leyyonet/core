import {FuncLike, NewableClass, ObjectLike, RecLike} from "../common";
import {ClassReflectLike, ParameterReflectLike, PropertyReflectLike, ReflectDescribed, ReflectLike} from "../reflect";
import {DecoAliasLike, DecoLike} from "../deco";

export type InjectorStagingKind = 'lazy' | 'post';
export type InjectorCallback = (instance: ObjectLike) => boolean;
export interface InjectorItem {
    target: ObjectLike;
    ref: ReflectLike;
    callback: InjectorCallback;
}

type V = ObjectLike;
export interface CoreInjectorLike {

    // region internal
    $setAutowired(fn: FuncLike): void;
    $setPostWired(fn: FuncLike): void;
    $setLazyWired(fn: FuncLike): void;
    $setRootModule(ref: ClassReflectLike): void;

    $addToStagingClass(deco: DecoLike, ref: ReflectLike): void;
    $addToStagingMember(deco: DecoLike, ref: ReflectLike): void;
    // endregion internal

    // region pointer
    listNames(): Map<string, FuncLike>;
    listInstances(): Array<FuncLike>;
    add(clazz: FuncLike, instance: V, ...nicknames: Array<string>): void;
    add(name: string, instance: V, ...nicknames: Array<string>): void;

    get<T = V>(clazz: FuncLike): T;
    get<T = V>(name: string): T;

    find<T = V>(clazz: FuncLike, throwable?: boolean): T;
    find<T = V>(name: string, throwable?: boolean): T;
    find<T = V>(instance: V, throwable?: boolean): T;

    has(clazz: FuncLike): boolean;
    has(name: string): boolean;
    // endregion pointer

    // region public
    $newInstance<T = ObjectLike>(clazz: FuncLike, origin?: FuncLike): T;
    // endregion public

}

// --------

export interface InjectorWireOption {
    kind?: InjectorStagingKind;
}
export interface InjectorStagingItem {
    deco: DecoLike;
    ref: ReflectLike;
}