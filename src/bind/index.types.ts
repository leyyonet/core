import {ClassLike, Func, Obj} from "@leyyo/common";

/**
 * Bind handler
 * */
export interface BindHandlerLike {
    /**
     * Binds all instance properties
     * */
    forInstances(target: Obj): number;

    /**
     * Binds all static properties
     * */
    forStatics(fn: Func | ClassLike): number;

    /**
     * Binds all instance and static properties
     * */
    forAll(target: Func | Obj | ClassLike): number;

    /**
     * Binds all properties by type of target,
     * if you give prototype then it binds instance methods, else bind static methods
     * */
    byScope(target: Func | Obj | ClassLike): number;

    /**
     * Binds all properties by type
     * */
    run(target: Func | Obj | ClassLike, type: BindScopeType): number;

    /**
     * Is function bound?
     * */
    isBound(target: Func): boolean;
}

export type BindScopeType = 'all' | 'static' | 'instance' | 'by-scope';
