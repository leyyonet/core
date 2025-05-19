import {BasicType, Func, ShiftMain, ShiftSecure} from "@leyyo/common";

export interface FootprintLike extends ShiftSecure<FootprintSecure> {
    get(target: unknown, inspectWhenAbsent?: boolean): FootprintInspected;

    inspect(target: unknown, volatile?: boolean): FootprintInspected;
    copy(source: unknown, target: unknown): boolean;
    appendKeyword(target: unknown, keyword: symbol): void;
    hasKeyword(target: unknown, keyword: FootprintKeyword|symbol): boolean;

    isClass(target: unknown, volatile?: boolean): boolean;

    isAsync(target: unknown, volatile?: boolean): boolean;
}

export interface FootprintSecure extends ShiftMain<FootprintLike> {
    $save(target: unknown, value: FootprintInspected): boolean;
}

export type FootprintKeyword = 'anonymous' | 'inherited' | 'proxied' // class
    | 'arrow' | 'lambda' | 'generator' | 'async' | 'decorator' | 'system' | 'func' | 'method' | 'instance' | 'static' // function
    | 'enum' | 'literal' | 'possible' // enum
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
    keywords?: Array<FootprintKeyword|symbol>; // class, function
    params?: Array<FootprintParamName>; // function
}

export type FootprintType = BasicType | 'class';
export type FootprintParamExtension = 'default' | 'variadic';
export type FootprintParamNameExtended = [string, FootprintParamExtension]; // as [name, extension]
export type FootprintParamName = string | FootprintParamNameExtended;
