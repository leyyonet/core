import {ArraySome, ClassOrName, FuncLike, ObjectLike, RecLike} from "../common";

export type Severity = 'error' | 'warn' | 'log' | 'info' | 'trace' | 'debug';

export type LoggerErrorLambda = (error: Error, params?: unknown) => void;
export type LoggerMixLambda = (messageOrError: string | Error, params?: unknown) => void;
export type LoggerLogLambda = (message: string, params?: unknown) => void;

export type LoggerBuildCustomLambda = (ctx: RecLike, params: RecLike) => RecLike;
export type LoggerPrintLambda = (severity: Severity, subjects: ArraySome, params: RecLike) => void;
// this._print(log.severity, [log.time, log.holder, ...subjects, log.message], log.params);

export type LoggerHolderConfig = RecLike<Array<Severity>>;
export interface LoggerValueColor {
    sign: string;
    key: string;
    value: string;
}

export interface LoggerSubjectColor {
    severity: string;
    time: string;
    holder: string;
    message: string;
    custom0: string;
    custom1: string;
}

export interface LoggerItem {
    severity: Severity;
    message: string | Error;
    params?: RecLike;
    time?: Date;
    count?: number;
    holder?: string;
}

export interface LoggerLike {
    native(error: Error, indicator: string, params?: RecLike): void;

    error(message: Error | string, params?: RecLike): void;
    warn(message: string | Error, params?: RecLike): void;
    info(message: string, params?: RecLike): void;
    log(message: string, params?: RecLike): void;
    trace(message: string, params?: RecLike): void;
    debug(message: string, params?: RecLike): void;
}

export interface LoggerInstanceLike extends LoggerLike {
    clear(): void;
    refresh(severities: Array<Severity>): void;
}

export interface CoreLoggerLike {
    getInstances(): Array<LoggerInstanceLike>;
    setBuildCustomLambda(lambda: LoggerBuildCustomLambda): CoreLoggerLike;
    setPrintLambda(lambda: LoggerPrintLambda): CoreLoggerLike;

    get logLevel(): Severity;
    get isLogging(): boolean;
    isEnabledLevel(severity: Severity): boolean;
    checkHolder(holder: unknown): ClassOrName;
    add(log: LoggerItem): void;

    get buildCustomLambda(): LoggerBuildCustomLambda;
    get printLambda(): LoggerPrintLambda;

    assign(fn: FuncLike): LoggerLike;
    assign(instance: ObjectLike): LoggerLike;
    assign(name: string): LoggerLike;
    native(message: string, indicator: string, params?: RecLike, holder?: unknown): void;
}