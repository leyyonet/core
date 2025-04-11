import {ClassLike, Dict, Func} from "@leyyo/common";

export interface CoreProxyLike {
    copyFootprint(source: any, target: any, basicName?: boolean): void;

    copyFqn(source: any, target: any, basicName?: boolean): void;

    copyBasic(source: any, target: any): void;

    basicName(target: Func | ClassLike, name: string): void;

    get<S, T = S>(source: S, type: string): T;

    has<S>(source: S, type: string): boolean;

    getAll<S>(source: S): Dict;

    set<S, T = S>(source: S, target: T, type: string): boolean;
}