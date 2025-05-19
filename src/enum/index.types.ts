import {KeyValue, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {NamedDepotItem, NamedDepotName} from "../named";

export type EnumObject = Obj | Record<string, KeyValue> | Array<KeyValue>;

export interface EnumPoolLike extends ShiftSecure<EnumPoolSecure> {

    getBase(value: NamedDepotName, required?: boolean): NamedDepotItem<EnumItem, EnumObject>;

    get(value: NamedDepotName, required?: boolean): EnumItem;

    enums(): Array<EnumItem>;

    itemsOf<E extends KeyValue = KeyValue>(value: NamedDepotName, required?: boolean): Array<E>;

    mapToArray<E>(enumeration: E): Array<EnumNonFunctional<E[keyof E]>>;

    addEnumeration(name: string, target: Obj | Record<string, KeyValue>): void;

    addLiteral(name: string, target: unknown): void;

    hasSign(value: EnumObject): boolean;

    getSign(value: EnumObject): string;
}

export interface EnumPoolSecure extends ShiftMain<EnumPoolLike> {
    $add(target: EnumObject): void;
}

export interface EnumItem<E extends KeyValue = KeyValue> {
    type: EnumType;
    pointer: EnumObject;
    items: Array<E>;
}

export type EnumType = 'enumeration' | 'literal';
export type EnumNonFunctional<T> = T extends Function ? never : T;