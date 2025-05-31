import {ClassLike, CommonFqnHook, Func, KeyValue, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {FootprintInspected} from "../footprint";

export interface FqnHandlerLike extends ShiftSecure<FqnHandlerSecure> {
    get(target: any): string;

    remove(target: any): boolean;

    exists(target: any): boolean;

    detail(target: any): FqnDetail;

    onReady(fn: Func | ClassLike | Obj, callback: CommonFqnHook): void;

    normalizeName(name: string): string;

    toNaming(name: string): FqnNaming;

    copy(source: any, target: any): void;

    // region dimension
    // ClassLike
    clazz(target: Func, path: string): void;

    clazz(target: ClassLike, path: string): void;

    func(target: Func, path: string): void;

    decorator(target: Func, path: string): void;

    enumeration(name: string, target: Obj | Record<string, KeyValue>, path: string): void;

    literal(name: string, target: unknown, path: string): void;

    object(name: string, target: Obj, path: string): void;

    namespace(target: Obj, path: string): void;

    module(target: Obj, path: string): void;

    file(name: string, target: Obj, path: string): void;

    // endregion dimension
}

export interface FqnHandlerSecure extends ShiftMain<FqnHandlerLike> {
    $set(target: any, naming: FqnNaming): boolean;
    $get(target: any): FqnNaming;
}

export type FqnGroupType = 'namespace' | 'module' | 'file';

export interface FqnDetail extends FootprintInspected {
    full: string;
}

export interface FqnNaming {
    basic: string;
    full?: string;
    pck?: string;
}
