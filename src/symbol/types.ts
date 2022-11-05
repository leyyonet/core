import {FuncLike, ObjectOrFunction, RecLike} from "../common";

export interface CoreSymbolLike {
    findReferenced(target: ObjectOrFunction): ObjectOrFunction;
    setReferenced(target: FuncLike, referenced: FuncLike): void;
    getReferenced(target: FuncLike): FuncLike;

    all(target: ObjectOrFunction): RecLike;
    set<T = unknown>(target: ObjectOrFunction, name: string, value: T): boolean;
    setSome<T = RecLike>(target: ObjectOrFunction, map: T): number;
    get<T = unknown>(target: ObjectOrFunction, name: string, def?: T): T;
    getSome<T = RecLike>(target: ObjectOrFunction, ...names: Array<string>): T;
    exist(target: ObjectOrFunction, name: string): boolean;
    remove(target: ObjectOrFunction, name: string): boolean;

    push<T = unknown>(target: ObjectOrFunction, name: string, ...values: Array<T>): boolean; // to array
    splice<T = unknown>(target: ObjectOrFunction, name: string, ...values: Array<T>): number; // to array
    patch<T = unknown>(target: ObjectOrFunction, name: string, key: string, value: T): boolean; // to object


    getDirect<T = unknown>(target: ObjectOrFunction, name: string, def?: T): T;
    deleteDirect(target: ObjectOrFunction, name: string): boolean;
    setDirect(target: ObjectOrFunction, name: string, value: unknown): boolean;
}