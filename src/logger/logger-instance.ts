import {LoggerInstanceLike, LoggerItem, Severity} from "./types";
import {ClassOrName, RecLike} from "../common";
import {$ly} from "../core";
import {LY_LOGGER_H_ADD} from "./constants";

/**
 * @instance
 * */
export class LoggerInstance implements LoggerInstanceLike {
    protected _holder: ClassOrName;
    private _severities: Map<Severity, boolean>;

    constructor(classOrName: ClassOrName, fromPool: Record<Severity, boolean>) {
        this._holder = $ly.logger.checkHolder(classOrName);
        this._severities = new Map();
        this._severities.set("error", fromPool.error);
        this._severities.set("warn", fromPool.warn);
        this._severities.set("log", fromPool.log);
        this._severities.set("info", fromPool.info);
        this._severities.set("trace", fromPool.trace);
        this._severities.set("debug", fromPool.debug);
        if (typeof this._holder !== 'string') {
            setTimeout(() => {this._holder = $ly.logger.checkHolder(this._holder) as string}, 5000);
        }
    }
    static {
        $ly.addFqn(this);
    }
    refresh(severities: Array<Severity>): void {
        const holder = this._holder;
        let nextEnabled;
        for (const [severity, prevEnabled] of this._severities.entries()) {
            nextEnabled = severities.includes(severity);
            if (nextEnabled !== prevEnabled) {
                if (nextEnabled) {
                    this[severity] = (message: string | Error, params?: RecLike) => {
                        $ly.event.emit(LY_LOGGER_H_ADD, {severity, message, params, time: new Date(), holder} as LoggerItem);
                    }
                    this[severity] = this[severity].bind(this);
                } else {
                    this[severity] = (message: string | Error, params?: RecLike) => {
                        $ly.emptyFn(message, params);
                    }
                }
            }
        }
    }

    clear(): void {
        for (const [severity, prevEnabled] of this._severities.entries()) {
            if (prevEnabled) {
                this[severity] = (message: string | Error, params?: RecLike) => {
                    $ly.emptyFn(message, params);
                }
            }
        }
    }

    native(error: Error, indicator: string, params?: RecLike): void {
        if (!params) {
            params = {};
        }
        if (indicator !== undefined) {
            params['_indicator'] = indicator;
        }
        this.error(error, params);
    }

    private static _time(params: RecLike): Date {
        let time: Date;
        if (params?.$$time !== undefined) {
            time = params.$$time as Date;
            delete params.$$time;
        } else {
            time = new Date();
        }
        return time;
    }
    error(message: Error | string, params?: RecLike): void {
        const time = LoggerInstance._time(params);
        $ly.event.emit(LY_LOGGER_H_ADD, {severity: 'error', message, params, time, holder: this._holder} as LoggerItem);
    }
    warn(message: string | Error, params?: RecLike): void {
        const time = LoggerInstance._time(params);
        $ly.event.emit(LY_LOGGER_H_ADD, {severity: 'warn', message, params, time, holder: this._holder} as LoggerItem);
    }
    info(message: string, params?: RecLike): void {
        const time = LoggerInstance._time(params);
        $ly.event.emit(LY_LOGGER_H_ADD, {severity: 'info', message, params, time, holder: this._holder} as LoggerItem);
    }
    log(message: string, params?: RecLike): void {
        const time = LoggerInstance._time(params);
        $ly.event.emit(LY_LOGGER_H_ADD, {severity: 'log', message, params, time, holder: this._holder} as LoggerItem);
    }
    trace(message: string, params?: RecLike): void {
        const time = LoggerInstance._time(params);
        $ly.event.emit(LY_LOGGER_H_ADD, {severity: 'trace', message, params, time, holder: this._holder} as LoggerItem);
    }
    debug(message: string, params?: RecLike): void {
        const time = LoggerInstance._time(params);
        $ly.event.emit(LY_LOGGER_H_ADD, {severity: 'debug', message, params, time, holder: this._holder} as LoggerItem);
    }
}