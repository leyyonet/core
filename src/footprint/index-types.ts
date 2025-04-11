import {BasicType, Func, Obj, ShiftMain, ShiftSecure} from "@leyyo/common";

export interface FootprintLike extends ShiftSecure<FootprintSecure> {
    get(target: unknown, inspectWhenAbsent?: boolean): FootprintInspected;

    inspect(target: unknown, volatile?: boolean): FootprintInspected;
    isClass(target: unknown, volatile?: boolean): boolean;
    isAsync(target: unknown, volatile?: boolean): boolean;

    getDescriptor<T>(target: Func | Obj, key: string): PropDescriptor<T>;

    saveDescriptor<T>(target: Func | Obj, key: string, value: T): boolean;

    getSign<T>(target: Func | Obj, key: symbol): PropDescriptor<T>;

    saveSign<T>(target: Func | Obj, key: symbol, value: T): boolean;
}

export interface PropDescriptor<T> extends PropertyDescriptor {
    value?: T;
}

export interface FootprintSecure extends ShiftMain<FootprintLike> {
    $save(target: unknown, value: FootprintInspected): boolean;

    $saveDescriptor<T>(target: Func | Obj, key: string | symbol, value: T): boolean;

    $getDescriptor<T>(target: Func | Obj, key: string | symbol): PropDescriptor<T>;
    $removeDescriptor(target: Func | Obj, key: string | symbol): boolean;
}

export type FootprintKeyword = 'anonymous' | 'inherited' | 'root' | 'proxied' // class
    | 'arrow' | 'lambda' | 'generator' | 'async' | 'decorator' | 'system' | 'func' | 'method' | 'instance' | 'static' // function
    | 'enum' | 'literal' | 'defined' | 'possible' // enum
    | 'module' | 'namespace' | 'file' | 'object' // group


export interface FootprintPrepared {
    type?: string;
    name?: string;
    object?: string;
    proto?: string;
    constructor?: Func;
    func?: string;
    parent?: Func;
    keywords?: Array<FootprintKeyword>,
    paramLine?: string,
}

export interface FootprintInspected {
    type: FootprintType;
    name: string;
    proto?: string; // function
    constructor?: Func; // object
    parent?: Func; // class
    keywords?: Array<FootprintKeyword>; // class, function
    params?: Array<FootprintParamName>; // function
}

export type FootprintType = BasicType | 'class';
export type FootprintParamExtension = 'default' | 'variadic';
export type FootprintParamNameExtended = [string, FootprintParamExtension]; // as [name, extension]
export type FootprintParamName = string | FootprintParamNameExtended;