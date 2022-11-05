// noinspection JSUnusedGlobalSymbols

export type OneOrMore<T> = T | Array<T>;
export type RecLike<T = unknown> = Record<RecKey, T>;
export type ArraySome = Array<unknown>;
export type MapSome = Map<unknown, unknown>;
export type SetSome = Set<unknown>;
export type Primitive = string | number | boolean;
export type IdLike = string | number;
export type Unknown = unknown;
export type Integer = number;
export type Float = number;
export type RecKey = string | number;
export type Timestamp = number;
export type TimeLike = string | number | Date;


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


export interface NewableClass {
    new(...args: any[]): {};
}
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
export type ObjectLike = Object | RecLike;
export type ClassOrFunction = ClassLike | FuncLike;
export type ObjectOrFunction = ObjectLike | ClassLike | FuncLike;
export interface ToJsonLike {
    toJSON:() => unknown;
}