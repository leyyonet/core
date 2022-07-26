import {
    CoreLike,
    LogBasic,
    LoggerColor,
    LoggerErrorLambda,
    LoggerLike,
    LoggerLogLambda,
    LoggerMixLambda
} from "../index-types";
import {ClassOrName, RecLike} from "../index-aliases";
import {emptyFn} from "../index-functions";
import {Severity} from "../index-enums";
import {E_LOGGER_ADD, F_INDICATOR} from "../index-constants";

let lyy: CoreLike;
export class CoreLoggerInstance implements LoggerLike {
    // region global
    static setLyy(ins: CoreLike): void {
        if (!lyy) {
            lyy = ins;
        }
    }
    protected static _items: Array<LoggerLike> = [];
    static fake(classOrName: ClassOrName): LoggerLike {
        const ins = new CoreLoggerInstance(classOrName);
        this._items.push(ins);
        return ins;
    }
    static get items(): Array<LoggerLike> {
        return this._items;
    }
    static clearItems(): void {
        this._items = [];
    }
    // endregion global
    protected readonly _holder: ClassOrName;

    constructor(classOrName: ClassOrName) {
        this._holder = classOrName;
        for (const severity of Object.values(Severity)) {
            this[severity] = (e: string|Error, p?: RecLike) => CoreLoggerInstance._log(severity, e, p, this._holder);
        }
    }
    refresh(map: Record<Severity, LoggerColor>): void {
        if (global?.leyyo_is_testing) {
            return
        }
        const h = this._holder;
        this.error = (e: Error, p?: RecLike) => CoreLoggerInstance._log(Severity.ERROR, e, p, h);
        const h2 = lyy.fqnPool.name(this._holder);
        for (const [severity, item] of Object.entries(map)) {
            if (severity === Severity.ERROR) {continue;}
            if (item.enabled || item.holders.includes(h2)) {
                this[severity] = (e: string|Error, p?: RecLike) => CoreLoggerInstance._log(severity as Severity, e, p, h);
            } else {
                this[severity] = emptyFn;
            }
        }
        lyy.fqnPool.refresh(this);
    }
    native(error: Error, indicator: string, params?: unknown): void {
        if (typeof params !== 'object') {params = {};}
        this.error(error, {...(params as RecLike), [F_INDICATOR]: indicator});
    }
    error: LoggerErrorLambda; // Instance._log(Severity.ERROR, error, params, this._holder);
    warn: LoggerMixLambda; // Instance._log(Severity.WARN, message, params, this._holder);
    info: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
    log: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
    trace: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
    debug: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);

    protected static _log(severity: Severity, message: string|Error, params: RecLike, holder: ClassOrName): void {
        if (typeof params !== 'object') {params = {};}
        const log = {severity, message, params, holder, time: new Date()} as LogBasic;
        lyy.event.publish(E_LOGGER_ADD, log);
    }
}