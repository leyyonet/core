import {KeyValue, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";
import {NamedDepotItem, NamedDepotName} from "../named";

export type EnumValue = Obj | Record<string, KeyValue> | Array<KeyValue>;

export interface EnumPoolLike extends ShiftSecure<EnumPoolSecure> {

    getBase(value: NamedDepotName, required?: boolean): NamedDepotItem<EnumItem, EnumValue>;

    get(value: NamedDepotName, required?: boolean): EnumItem;

    enums(): Array<EnumItem>;

    itemsOf<E extends KeyValue = KeyValue>(value: NamedDepotName, required?: boolean): Array<E>;

    mapToArray<E>(enumeration: E): Array<EnumNonFunctional<E[keyof E]>>;

    addEnumeration(name: string, target: Obj | Record<string, KeyValue>): void;

    addLiteral(name: string, target: unknown): void;

    hasSign(value: EnumValue): boolean;

    getSign(value: EnumValue): string;
}

export interface EnumPoolSecure extends ShiftMain<EnumPoolLike> {
    $add(target: EnumValue): void;
}

export interface EnumItem<E extends KeyValue = KeyValue> {
    type: EnumType;
    pointer: EnumValue;
    items: Array<E>;
}

export type EnumType = 'enumeration' | 'literal';
export type EnumNonFunctional<T> = T extends Function ? never : T;
