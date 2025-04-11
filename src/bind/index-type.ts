import {ClassLike, Func, Obj} from "@leyyo/common";

export interface CoreBindLike {
    forInstances(target: Obj): number;
    forStatics(fn: Func|ClassLike): number;
    forAll(target: Func|Obj|ClassLike): number;
    byScope(target: Func|Obj|ClassLike): number;
    run(target: Func|Obj|ClassLike, type: CoreBindType): number;
}
export type CoreBindType = 'all'|'static'|'instance'|'by-scope';