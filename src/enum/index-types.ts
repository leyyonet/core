import {KeyValue, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {CallbackLike} from "../callback";

export type EnumObject = Obj | Record<string, KeyValue> | Array<KeyValue>;

export interface EnumPoolLike extends CallbackLike<EnumItem, EnumObject>, ShiftSecure<EnumPoolSecure> {
    mapToArray<T>(enumeration: T): Array<EnumNonFunctional<T[keyof T]>>;

    enumeration(name: string, target: Obj | Record<string, KeyValue>): void;

    literal(name: string, target: unknown): void;
}

export interface EnumPoolSecure extends ShiftMain<EnumPoolLike> {
    $add(target: EnumObject): void;
}

export interface EnumItem<T extends KeyValue = KeyValue> {
    type: EnumType;
    pointer: EnumObject;
    items: Array<T>;
}

export type EnumType = 'enumeration' | 'literal';
export type EnumNonFunctional<T> = T extends Function ? never : T;