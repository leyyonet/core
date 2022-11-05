import {FuncLike, ObjectOrFunction} from "../common";
import {ReflectKeyword} from "../reflect";

export type BinderType = ReflectKeyword | 'both';
export interface CoreBinderLike {
    setName(fn: FuncLike, name: string): void;
    bindAll(clazz: ObjectOrFunction): void;
    refreshBoundNames(clazz: ObjectOrFunction): number;

    setClearBound(fn: FuncLike): boolean;
}