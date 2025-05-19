import {ClassLike, Func, ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoInstanceLike} from "../../decorator";
import {NamedDepotItem} from "../../named";
import {ParameterReflectionLike} from "../../reflection";

export interface InjectionPoolLike extends ShiftSecure<InjectionPoolSecure> {
    instances(): Array<InjectionInstance>;

    get<T>(identifier: string, required?: boolean): InjectionInstance<T>;

    get<T>(clazz: ClassLike<T>, required?: boolean): InjectionInstance<T>;

    get<T>(fn: Func, required?: boolean): InjectionInstance<T>;

    exists(identifier: string): boolean;

    exists(clazz: ClassLike): boolean;

    exists(fn: Func): boolean;

    getInstance<T>(identifier: string, required?: boolean): T;

    getInstance<T>(clazz: ClassLike<T>, required?: boolean): T;

    getInstance<T>(fn: Func, required?: boolean): T;

    isBuilt(identifier: string): boolean;

    isBuilt(clazz: ClassLike): boolean;

    isBuilt(fn: Func): boolean;

    remove(identifier: string, raiseIfAbsent?: boolean): boolean;

    remove(clazz: ClassLike, raiseIfAbsent?: boolean): boolean;

    remove(fn: Func, raiseIfAbsent?: boolean): boolean;

    setInstance<T>(identifier: string, instance: T, raiseIfExists?: boolean): Promise<void>;

    setInstance<T>(clazz: ClassLike<T>, instance: T, raiseIfExists?: boolean): Promise<void>;

    setInstance<T>(fn: Func, instance: T, raiseIfExists?: boolean): Promise<void>;

    build(): Promise<void>;
}

export interface InjectionPoolSecure extends ShiftMain<InjectionPoolLike> {
}

export type InjectionBase = NamedDepotItem<InjectionInstance, ClassLike>;
export type InjectionOptionalState = 'wait-then-ignore' | 'ignore-then-undefined' | 'only-wait';

export type InjectionFetchClassLambda<T> = (base: InjectionBase, value: T) => void;

export interface InjectionInstance<T = any> {
    provider: ClassLike;
    decoIns?: DecoInstanceLike;
    isAsync?: boolean;
    isBulk?: boolean;
    member?: string; // method name for async
    data?: T;

    identifiers: Array<string>;
    parameters: Array<InjectionParamItem>;
    nameCallbacks: Array<string>;
    typeCallbacks: Array<ClassLike>;
}

export interface InjectionParamItem {
    instance?: any;
    logs: Array<string>;
    identifier?: string;
    optional?: boolean;
    ignored?: boolean;
    foundType?: ClassLike;
    ref: ParameterReflectionLike;
}
