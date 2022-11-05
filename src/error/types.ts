import {ClassLike, ClassOrName, FuncLike, ObjectLike, RecLike} from "../common";

export type ExceptionSendLambda = (err: ExceptionLike) => boolean;
export type ExceptionDictionaryLambda = (err: ExceptionLike) => Promise<boolean>;
export type ExceptionToObjectLambda = (err: ExceptionLike, ...omittedFields: Array<string>) => RecLike;
export type ExceptionExportLambda = (err: ExceptionLike) => RecLike;
export type ExceptionActionLambda = (err: ExceptionLike) => void;

export interface ExceptionStackLine {
    file?: string;
    method?: string;
    line?: number;
    column?: number;
    // arguments?: Array<unknown>;
}

export interface ExceptionLike extends Error {
    get params(): RecLike;
    get stackTrace(): Array<ExceptionStackLine>;
    get holder(): ClassOrName;

    get causes(): Array<Error>;

    setName(name: string): this;

    causedBy(e: Error): this;
    causedBy(message: string): this;

    with(clazz: ObjectLike): this;
    with(clazz: ClassLike): this;
    with(name: string): this;

    patch(params: RecLike, ignoreExisting?: boolean): this;
    field(field: string): this;
    field(index: number): this;
    indicator(value: string, ignoreExisting?: boolean): this;
    ctx(value: unknown, ignoreExisting?: boolean): this;

    log(ctx?: unknown): this;

    raise(throwable?: boolean, ctx?: unknown): this;

    copyStack(e: Error): void;

    toObject(...omittedFields: Array<string>): RecLike;

    toJSON(): RecLike;
}

export interface CoreErrorLike {
    //region getter
    get sendLambda(): ExceptionSendLambda;

    get dictionaryLambda(): ExceptionDictionaryLambda;

    get toObjectLambda(): ExceptionToObjectLambda;

    get exportLambda(): ExceptionExportLambda;

    get actonLambda(): ExceptionActionLambda;

    //endregion getter

    getNames(): Array<string>;

    getItems(): Array<FuncLike>;

    add(err: FuncLike, ...prefixes: Array<string>): void;

    addMultiple(classes: Array<FuncLike>, ...prefixes: Array<string>): void;

    build(e: Error | string): ExceptionLike;

    addSign(err: Error, ...keys: Array<string>): boolean;

    getSign(err: Error): Array<string>;

    removeSign(err: Error, ...keys: Array<string>): number;

    hasSign(err: Error, key: string): boolean;

    toObject(e: Error, ...omittedFields: Array<string>): RecLike;


    addOmit(err: Error, ...properties: Array<string>): boolean;

    getOmit(err: Error): Array<string>;


    buildStack(e: Error): void;

    setSendLambda(fn: ExceptionSendLambda): this;

    setDictionaryLambda(fn: ExceptionDictionaryLambda): this;

    setToObjectLambda(fn: ExceptionToObjectLambda): this;

    setExportLambda(fn: ExceptionExportLambda): this;

    setActionLambda(fn: ExceptionActionLambda): this;

}