// x_console.log(`## ${__filename}`, {i: 'loading'});

import {
    CoreLoggerLike,
    LoggerBuildCustomLambda,
    LoggerInstanceLike,
    LoggerItem,
    LoggerLike,
    LoggerPrintLambda,
    LoggerSubjectColor,
    LoggerValueColor,
    Severity
} from "./types";
import {LoggerInstance} from "./logger-instance";
import {Exception, ExceptionLike} from "../error";
import {LY_INT_PACKAGE} from "../internal";
import {LY_LOGGER_H_ADD, LY_LOGGER_H_BUILD_SUBJECT, LY_LOGGER_H_FORMAT} from "./constants";
import {ArraySome, ClassOrName, RecLike} from "../common";
import {$ly} from "../core";


/**
 * @core
 * */
export class CoreLogger implements CoreLoggerLike {
    // region properties
    private _maxHolder = 20;
    private _valueColors: LoggerValueColor;
    private _severityColors: Record<Severity, LoggerSubjectColor>;
    private _severities: Array<Severity>;
    private _holders: Array<string>;
    private _instances: Array<LoggerInstanceLike>;
    private _isLogging: boolean;
    private _severity: Severity;
    private _logEnabled: Record<Severity, boolean>;
    private _logMap: Record<Severity, Array<Severity>>;

    // endregion properties

    constructor() {
        this.$init();
        $ly.event.on(LY_LOGGER_H_ADD, log => this.add(log as LoggerItem));
        $ly.addFqn(this);
        $ly.addTrigger('repo', () => {
            this._instances = $ly.repo.newArray<LoggerInstanceLike>(this, '_instances');
            this._holders = $ly.repo.newArray<string>(this, '_holders');
        });
        $ly.addTrigger('hook', () => {
            $ly.hook.addTrigger(LY_LOGGER_H_FORMAT, (fn: LoggerPrintLambda) => this.setPrintLambda(fn));
            $ly.hook.addTrigger(LY_LOGGER_H_BUILD_SUBJECT, (fn: LoggerBuildCustomLambda) => this.setBuildCustomLambda(fn));
        });
        $ly.addTrigger('variable', () => {
            const value = $ly.variable.read<Severity>('LOG_LEVEL', {
                target: LY_INT_PACKAGE,
                parser: (v) => $ly.primitive.literal<Severity>(v, this._severities),
                required: false,
                log: true,
                def: this._severity
            });
            this._refreshSeverity(value);
        });
    }
    static {
        $ly.addDependency('logger', () => new CoreLogger());
    }

    private $init() {
        this._valueColors = {
            sign: `\x1b[${[38, 2, 77, 77, 77].join(';')}m`,
            key: `\x1b[${[38, 2, 107, 107, 107].join(';')}m`,
            value: `\x1b[${[38, 2, 145, 145, 145].join(';')}m`,
        };
        this._severityColors = {
            error: { // red
                severity: `\x1b[${[41].join(';')}m`, // bg
                message: `\x1b[${[38, 2, 255, 0, 0].join(';')}m`, // main
                time: `\x1b[${[38, 2, 254, 216, 216].join(';')}m`, // bright-1
                holder: `\x1b[${[38, 2, 252, 127, 127].join(';')}m`, // // bright-2
                custom0: `\x1b[${[38, 2, 186, 119, 119].join(';')}m`, // dark-1
                custom1: `\x1b[${[38, 2, 189, 86, 86].join(';')}m`, // dark-2
            },
            warn: { // yellow
                severity: `\x1b[${[43].join(';')}m`, // bg
                message: `\x1b[${[38, 2, 255, 180, 0].join(';')}m`, // main
                time: `\x1b[${[38, 2, 255, 245, 222].join(';')}m`, // bright-1
                holder: `\x1b[${[38, 2, 252, 217, 132].join(';')}m`, // // bright-2
                custom0: `\x1b[${[38, 2, 172, 156, 118].join(';')}m`, // dark-1
                custom1: `\x1b[${[38, 2, 155, 131, 75].join(';')}m`, // dark-2
            },
            log: { // green
                severity: `\x1b[${[42].join(';')}m`, // bg
                message: `\x1b[${[38, 2, 0, 255, 0].join(';')}m`, // main
                time: `\x1b[${[38, 2, 211, 255, 211].join(';')}m`, // bright-1
                holder: `\x1b[${[38, 2, 139, 253, 13].join(';')}m`, // // bright-2
                custom0: `\x1b[${[38, 2, 112, 157, 112].join(';')}m`, // dark-1
                custom1: `\x1b[${[38, 2, 70, 133, 70].join(';')}m`, // dark-2
            },
            info: { // blue
                severity: `\x1b[${[44].join(';')}m`, // bg
                message: `\x1b[${[38, 2, 0, 102, 255].join(';')}m`, // main
                time: `\x1b[${[38, 2, 223, 235, 253].join(';')}m`, // bright-1
                holder: `\x1b[${[38, 2, 112, 167, 250].join(';')}m`, // // bright-2
                custom0: `\x1b[${[38, 2, 113, 139, 176].join(';')}m`, // dark-1
                custom1: `\x1b[${[38, 2, 70, 109, 168].join(';')}m`, // dark-2
            },
            trace: { // purple
                severity: `\x1b[${[45].join(';')}m`, // bg
                message: `\x1b[${[38, 2, 172, 73, 249].join(';')}m`, // main
                time: `\x1b[${[38, 2, 242, 228, 253].join(';')}m`, // bright-1
                holder: `\x1b[${[38, 2, 217, 174, 251].join(';')}m`, // // bright-2
                custom0: `\x1b[${[38, 2, 149, 122, 171].join(';')}m`, // dark-1
                custom1: `\x1b[${[38, 2, 153, 96, 197].join(';')}m`, // dark-2
            },
            debug: { // gray
                severity: `\x1b[${[46].join(';')}m`, // bg
                message: `\x1b[${[38, 2, 135, 137, 89].join(';')}m`, // main
                time: `\x1b[${[38, 2, 145, 145, 145].join(';')}m`, // bright-1
                holder: `\x1b[${[38, 2, 146, 146, 125].join(';')}m`, // // bright-2
                custom0: `\x1b[${[38, 2, 106, 106, 102].join(';')}m`, // dark-1
                custom1: `\x1b[${[38, 2, 98, 98, 85].join(';')}m`, // dark-2
            },
        };
        this._severities = ['error', 'warn', 'log', 'info', 'trace', 'debug'];
        this._isLogging = false;
        this._severity = 'debug';
        this._logEnabled = {
            debug: true,
            info: true,
            log: true,
            trace: true,
            warn: true,
            error: true,
        };
        this._logMap = {
            debug: ['debug'],
            info: ['debug', 'info'],
            log: ['debug', 'info', 'log'],
            trace: ['debug', 'info', 'log', 'trace'],
            warn: ['debug', 'info', 'log', 'trace', 'warn'],
            error: ['debug', 'info', 'log', 'trace', 'warn', 'error'],
        };
        this._refreshSeverity(process.env.LOG_LEVEL as Severity);
    }

    // region internal
    getInstances(): Array<LoggerInstanceLike> {
        return this._instances;
    }
    setBuildCustomLambda(lambda: LoggerBuildCustomLambda): this {
        this._buildCustomLambda = lambda;
        return this;
    }

    setPrintLambda(lambda: LoggerPrintLambda): this {
        this._printLambda = lambda;
        return this;
    }

    get logLevel(): Severity {
        return this._severity;
    }

    get isLogging(): boolean {
        return this._isLogging;
    }

    isEnabledLevel(severity: Severity): boolean {
        return this._logEnabled[severity];
    }
    checkHolder(holder: unknown): ClassOrName {
        if (!holder) {
            return holder;
        }
        if (typeof holder !== 'string') {
            holder = $ly.fqn.get(holder);
            if (typeof holder !== 'string') {
                return holder;
            }
        }
        let str = holder as string;
        if (typeof str === 'string' && !this._holders.includes(str) && str.includes('.')) {
            const parts = str.split('.');
            const last = parts.pop();
            str = parts.map(item => item.substring(0, 1)).join('.') + '.' + last;
            if (str.length > this._maxHolder) {
                this._maxHolder = str.length;
            }
            this._holders.push(str);
        }
        return str;
    }

    add(log: LoggerItem): void {
        if (global.leyyo_is_testing) {
            return;
        }
        if (this._isLogging) {
            this._schedule(undefined, log);
            return;
        }
        this._isLogging = true;
        if (!log || typeof log !== 'object' || Array.isArray(log)) {
            this.native(`Invalid log data`, undefined, {typeOf: typeof log, log});
            return;
        }
        log.count = log.count ?? 0;
        log.time = log.time ?? new Date();
        if (!log.params || typeof log.params !== 'object' || Array.isArray(log.params)) {
            log.params = {};
        }

        try {
            if (typeof log.message !== 'string' && !this._checkError(log)) {
                return;
            }
            if (!log.holder) {
                ['holder', '_holder'].forEach(k => {
                    if (log.params[k] !== undefined && !log.holder) {
                        log.holder = log.params[k] as string;
                        delete log.params[k];
                    }
                });
            }
            if (log.holder) {
                if (typeof log.holder !== 'string') {
                    log.holder = $ly.fqn.get(log.holder);
                    if (log.holder !== 'string') {
                        log.holder = undefined;
                    }
                }
                if (!this._holders.includes(log.holder)) {
                    log.holder = this.checkHolder(log.holder) as string;
                }
            }
            for (const [k, v] of Object.entries(log.params)) {
                if (v === undefined) {
                    delete log.params[k];
                }
            }
            this._print(log);
            this._isLogging = false;
        } catch (err) {
            this._schedule(err, log);
        }
    }

    // endregion internal
    // region protected
    protected _print(log: LoggerItem): void {
        let ctx: RecLike;
        try {
            if (log.params['_ctx']) {
                ctx = $ly.context.get(log.params['_ctx']);
            }
        } catch (e) {
        }
        const custom = ctx ? this._buildCustomLambda(ctx, log.params) : undefined;
        let subjects = custom ? Object.values(custom) : [];
        if (log.holder) {
            subjects.unshift(log.holder.padEnd(this._maxHolder));
        } else {
            subjects.unshift('leyyo.logger'.padEnd(this._maxHolder));
        }
        subjects.unshift(log.time);
        subjects.push(log.message);
        subjects = subjects.filter(v => $ly.filled(v));
        this._printLambda(log.severity, subjects, log.params);

    }

    // noinspection JSUnusedLocalSymbols
    protected _buildCustomLambda(ctx: RecLike, params: RecLike): RecLike {
        return undefined;
    }

    protected _jsonColor(value: unknown): string {
        if ($ly.not(value)) {
            return this._colorize((value === undefined) ? 'undefined' : 'null', this._valueColors.sign);
        }
        if (typeof value !== 'object') {
            if (typeof value === 'function') {
                return this._colorize('#fn ' + $ly.fqn.get(value), this._valueColors.value);
            }
            return this._colorize(value, this._valueColors.value);
        }
        const items = [];
        if (Array.isArray(value)) {
            if (value.length < 1) {
                return this._colorize('[]', this._valueColors.sign);
            }
            value.forEach(v => items.push(this._jsonColor(v)));
            return this._colorize('[', this._valueColors.sign) + `${items.join(this._colorize(', ', this._valueColors.sign))}` + this._colorize(']', this._valueColors.sign);
        }
        if (Object.keys(value).length < 1) {
            return this._colorize('{}', this._valueColors.sign);
        }
        for (const [key, val] of Object.entries(value)) {
            items.push(this._colorize(`"${key}"`, this._valueColors.key) +
                this._colorize(': ', this._valueColors.sign) + this._jsonColor(val));
        }
        return this._colorize('{', this._valueColors.sign) + `${items.join(this._colorize(', ', this._valueColors.sign))}` + this._colorize('}', this._valueColors.sign);
    }

    protected _colorize(text: unknown, color: string): string {
        return color ? `${color}${text}\x1b[0m` : (text as string);
    }

    protected _printLambda(severity: Severity, custom: ArraySome, params?: RecLike): void {
        params = $ly.json.check(params);
        let date = custom.shift();
        if (date instanceof Date) {
            date = date.toISOString();
        }
        const message = custom.pop();
        let holder;
        if (custom.length > 0) {
            holder = custom.shift();
            if (typeof holder !== 'string') {
                holder = $ly.fqn.get(holder);
            }
        }
        if (global.leyyo_is_local) {
            const color = this._severityColors[severity];
            const subjects = [];
            subjects.push(this._colorize(date, color.time));
            subjects.push(this._colorize(` ${severity} `.padEnd(7, ' '), color.severity));
            if (holder) {
                subjects.push(this._colorize(holder, color.holder));
            }
            custom.forEach((item, index) => {
                subjects.push(this._colorize(item, (index % 2 === 0) ? color.custom0 : color.custom1));
            })
            subjects.push(this._colorize(message, color.message));
            if (!params) {
                console[severity](subjects.join(' '));
            } else {
                console[severity](subjects.join(' '), this._jsonColor(params));
            }
        } else {
            custom.unshift(date);
            if (holder) {
                custom.unshift(holder);
            }
            custom.push(message);
            if (!params) {
                console[severity](Object.values(custom).join(' '));
            } else {
                console[severity](Object.values(custom).join(' '), $ly.json.stringify(params));
            }
        }
    }

    protected _refreshSeverity(severity: Severity) {
        if (!severity || severity === this._severity) {
            return;
        }
        if (typeof severity !== 'string') {
            severity = 'debug';
        } else if (!this._severities.includes(severity)) {
            severity = 'debug';
        }
        this._severity = severity;
        this._severities.forEach(s => {
            this._logEnabled[s] = this._logMap[s].includes(severity);
        });
    }

    protected _schedule(e: Error, log: LoggerItem): void {
        log.count++;
        if (log.count < 4) {
            setTimeout(() => this.add(log), 100);
        } else {
            if (e) {
                this.native(e.message, 'log.timeout', {log});
            }
        }
    }

    protected _checkError(log: LoggerItem): boolean {
        let err: ExceptionLike;
        if (log.message instanceof Exception) {
            err = log.message as unknown as ExceptionLike;
        } else {
            err = $ly.error.build(log.message);
        }
        if ($ly.error.hasSign(err, 'logged')) {
            return false;
        }
        $ly.error.addSign(err, 'logged');
        const errObj = err.toObject('message') as { params: RecLike, _holder: unknown };
        if (errObj) {
            if (errObj['_holder']) {
                if (!log.params['_holder']) {
                    log.params['_holder'] = errObj['_holder'];
                }
                delete errObj['_holder'];
            }
        }
        log.message = err.message;
        log.params.error = errObj;
        return true;
    }


    // endregion protected


    // region public
    get buildCustomLambda(): LoggerBuildCustomLambda {
        return this._buildCustomLambda;
    }

    get printLambda(): LoggerPrintLambda {
        return this._printLambda;
    }

    assign(identifier: ClassOrName): LoggerLike {
        let instance: LoggerInstanceLike;
        switch (typeof identifier) {
            case "function":
            case "string":
                instance = new LoggerInstance(identifier, this._logEnabled);
                this._instances.push(instance);
                return instance;
            case "object":
                instance = new LoggerInstance(identifier.constructor, this._logEnabled);
                this._instances.push(instance);
                return instance;
        }
        instance = new LoggerInstance(typeof identifier, this._logEnabled);
        this._instances.push(instance);
        instance.debug('Logger defined', {identifier});
        return instance;
    }

    // endregion public

    // region defaults
    native(message: string, indicator: string, params?: RecLike, holder?: unknown): void {
        params = params ?? {};
        if (holder !== undefined) {
            params['_holder'] = holder;
        }
        if (indicator !== undefined) {
            params['_indicator'] = indicator;
        }
        this.add({severity: 'warn', message, params});
    }

    // end region defaults
}

