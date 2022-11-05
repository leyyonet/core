import {FuncLike, RecLike} from "../common";

export interface TestingError {
    name: string;
    message: string;
    generatedMessage: boolean,
    code: string;
    expected?: unknown;
    actual?: unknown;
    operator: string;
}

export interface TestingItem {
    kind: 'describe' | 'it';
    ident: number;
    color: number;
    sign: string;
    title: string;
    success: number;
    error: number;
    params: RecLike;
    children: Array<TestingItem>;
}

export interface CoreTestingLike {
    start(): void;
    describe(title: string, fn: FuncLike): void;
    it(title: string, fn: FuncLike): void;
}