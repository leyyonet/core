// noinspection JSUnusedGlobalSymbols

export type TypeOf = 'undefined'|'string'|'object'|'number'|'boolean'|'function'|'symbol'|'bigint';
export type OneOrMore<T> = T | Array<T>;
export type CoreEnumerationHash = RecLike<Key>;
export type CoreEnumerationAlt<E extends Key = Key> = RecLike<E>;
export type RecLike<T = unknown> = Record<Key, T>;
export type ArraySome = Array<unknown>;
export type Primitive = string | number | boolean;
export type IdLike = string | number;
export type Unknown = unknown;
export type Integer = number;
export type Float = number;
export type Boolean = boolean;
export type Enum = string; // enumeration
export type Alpha = string; // alphaType
export type String = string; // stringType
export type Digit = string; // digitType, 0-9
export type Title = string; //Single-line clear-text (no html)
export type Description = string; //Multi-line clear-text (no html)
export type RichText = string; // multi-line rich text with html tags
export type Uuid = string;
export type Host = string;
export type Url = string;
export type Email = string;
export type Folder = string;
export type Key = string|number;
export type Timestamp = number;
export type IsoDatetime = string; // yyyy-mm-ddThh:mm:ii.eeeZ
export type IsoDate = string; // yyyy-mm-dd
export type IsoTime = string; // hh:mm:ii.eeeZ
export type TimeLike = IsoDatetime | IsoDate | IsoTime | Timestamp;


type _U = unknown;
interface _FuncProp {
    readonly name?: string;
    readonly length?: number;
}

export interface Func0<R = _U> extends _FuncProp {
    (): R;
}
export interface Func1<R = _U, A1 = _U> extends _FuncProp {
    (a1: A1): R;
}
export interface Func2<R = _U, A1 = _U, A2 = _U> extends _FuncProp {
    (a1: A1, a2: A2): R;
}
export interface Func3<R = _U, A1 = _U, A2 = _U, A3 = _U> extends _FuncProp {
    (a1: A1, a2: A2, a3: A3): R;
}
export interface Func4<R = _U, A1 = _U, A2 = _U, A3 = _U, A4 = _U> extends _FuncProp {
    (a1: A1, a2: A2, a3: A3, a4: A4): R;
}
export interface Func5<R = _U, A1 = _U, A2 = _U, A3 = _U, A4 = _U, A5 = _U> extends _FuncProp {
    (a1: A1, a2: A2, a3: A3, a4: A4, a5: A5): R;
}
export interface FuncN<R = _U, A = _U> extends _FuncProp {
    (...a: Array<A>): R;
}

export type FuncLike = Function;

export type Async0<R = _U> = Func0<Promise<R>>;
export type Async1<R = _U, A1 = _U> = Func1<Promise<R>, A1>;
export type Async2<R = _U, A1 = _U, A2 = _U> = Func2<Promise<R>, A1, A2>;
export type Async3<R = _U, A1 = _U, A2 = _U, A3 = _U> = Func3<Promise<R>, A1, A2, A3>;
export type Async4<R = _U, A1 = _U, A2 = _U, A3 = _U, A4 = _U> = Func4<Promise<R>, A1, A2, A3, A4>;
export type Async5<R = _U, A1 = _U, A2 = _U, A3 = _U, A4 = _U, A5 = _U> = Func5<Promise<R>, A1, A2, A3, A4, A5>;
export type AsyncN<R = _U, A = _U> = FuncN<Promise<R>, A>;


export interface ClassLike<T = unknown> extends _FuncProp {
    new(...args: Array<unknown>): ObjectLike;
}
/**
 * Serialized version of another type
 */
export type Serialized<T> = {
    [P in keyof T]: T[P];
};
export type ClassOrName = ClassLike | string | unknown;
export type FuncOrName = FuncLike | string;


declare namespace Express {
    export interface Request {
        custom?: RecLike;
    }
    export interface Response {
        custom?: RecLike;
    }
}

/**
 * Referenced from Object
 * */
export type ObjectLike = Object;

export interface ModelLike<I extends IdLike = Uuid> {
    id?: I;
}

export interface PairLike<I extends IdLike = Uuid> extends ModelLike<I> {
    name?: string;
}




