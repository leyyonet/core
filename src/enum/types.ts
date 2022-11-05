import {RecKey, RecLike} from "../common";

export type EnumKey<E extends RecKey = RecKey> = E;
export type EnumMap<T extends EnumKey = EnumKey> = RecLike<T>;
export type EnumAlteration<T extends EnumKey = EnumKey> = EnumMap<T> | Array<T>;

export interface CoreEnumLike {
    getItems(): RecLike<EnumMap>;

    getNames(): Array<string>;

    add(name: string, map: EnumMap, ...prefixes: Array<string>): void;

    addMultiple(items: RecLike<EnumMap>, ...prefixes: Array<string>): void;
}
