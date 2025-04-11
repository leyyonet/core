import {ClassLike, Func, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {DecoInstanceLike, DecoLike} from "../../decorator";
import {CallbackLike} from "../../callback";

export interface InjectionPoolLike extends CallbackLike<InjectionInstance, ClassLike>, ShiftSecure<InjectionPoolSecure> {
}

export interface InjectionPoolSecure extends ShiftMain<InjectionPoolLike> {
    $addProvider(clazz: InjectionProviderGiven, opt: InjectionProviderOpt): void;
    $addInject(provider: InjectionProviderGiven, inject: ClassLike|Func, opt: InjectionInjectOpt): void;
    $getStatus(clazz: ClassLike|string|Func, createIfAbsent?: boolean): InjectionInstance;
}

export type InjectionBlocking = 'sync'|'async';
export type InjectionPlace = 'parameter'|'field'|'method';
export type InjectionProviderGiven = [ClassLike|Func, string];

export interface InjectionProviderOpt {
    blocking: InjectionBlocking;
    deco: DecoLike;
}
export interface InjectionInjectOpt {
    place: InjectionPlace;
    deco: DecoLike;
    isOptional?: boolean;
    isLazy?: boolean;
}

export interface InjectionInstance {
    clazz: ClassLike;
    blocking: InjectionBlocking;
    deco: DecoLike;
    instance: Obj;
    names: Array<string>;
    waitedByProviders: Map<ClassLike, InjectionInjectOpt>;
    waitingInjects: Map<ClassLike, InjectionInjectOpt>;
}
export interface InjectionDecoratorRun<O> {
    ins: DecoInstanceLike<O>;
    identifier: string;
}