// noinspection JSUnusedGlobalSymbols

import {
    CoreLike,
    ExceptionLike,
    LogBasic,
    LoggerAnyColor,
    LoggerColor,
    LoggerGrabberLambda,
    LoggerLike,
    LoggerPrintLambda,
    LoggerRepoLike,
    LoggerSenderLambda
} from "../index-types";
import {CoreLoggerInstance} from "../instance";
import {ArraySome, ClassOrName, FuncLike, OneOrMore, RecLike} from "../index-aliases";
import {DeveloperException, Exception} from "../index-errors";
import {CoreLoggerRefresh} from "../internal-types";
import {Severity} from "../index-enums";
import {
    E_LOGGER_ADD,
    F_HOLDER,
    F_REQ,
    F_SEVERITY,
    H_LOGGER_GRABBER,
    H_LOGGER_PRINTER,
    H_LOGGER_SENDER,
    H_REQUEST_EXTRACTOR
} from "../index-constants";
import {COMPONENT_NAME} from "../internal-component";
import {secureJson} from "../index-functions";

export class CoreLogger implements LoggerRepoLike {
    // region properties
    protected _init: boolean;
    protected _post: boolean;
    protected readonly _lyy: CoreLike;
    protected readonly _RGB_MAP: Array<string> = ['red', 'green', 'blue'];
    protected _id: number;
    protected _instances: Array<LoggerLike>;
    protected _backup: Array<LogBasic>;
    protected _isIn = false;
    protected _logLevel: Severity = Severity.DEBUG;
    protected _isDark = true;
    protected _useHolder = true;
    protected _useSign = true;
    protected _useColor: boolean = undefined;
    protected _useId: boolean = undefined;
    protected _useTime: boolean = undefined;
    protected _stringify: boolean = undefined;
    protected _useGrabber = false;
    protected _senderLambda: LoggerSenderLambda;
    protected _printLambda: LoggerPrintLambda;
    protected _grabberLambda: LoggerGrabberLambda;
    protected _colorDef: LoggerColor = {
        sign: '�',
        enabled: true,
        holders: [],
        ID: [2    ], // dim
        SC: [5, 45], //blink+bg+magenta
        HC: [1, 35], //bright+magenta
        MC: [   35], //magenta
        EC: [4, 35], //underscore+magenta
        KC: [2, 35], //dim+magenta
        VC: [1, 35], //bright+magenta
    };
    protected _colorMap: Record<string, LoggerColor> = {
        [Severity.ERROR]: {
            sign: '⚠',
            enabled: true,
            holders: [],
            ID: [2    ], // dim
            SC: [5, 41], //blink+bg+red
            HC: [1, 31], //bright+red
            MC: [31], //red
            EC: [4, 31], //underscore+red
            KC: [2, 31], //dim+red
            VC: [1, 31], //bright+red
        },
        [Severity.WARN]: {
            sign: '⚡',
            enabled: true,
            holders: [],
            ID: [2    ], // dim
            SC: [5, 43], //blink+bg+yellow
            HC: [1, 33], //bright+yellow
            MC: [   33], //yellow
            EC: [4, 33], //underscore+yellow
            KC: [2, 33], //dim+yellow
            VC: [1, 33], //bright+yellow
        },
        [Severity.LOG]: {
            sign: '›',
            enabled: true,
            holders: [],
            ID: [2    ], // dim
            SC: [5, 42], //blink+bg+green
            HC: [1, 32], //bright+green
            MC: [   32], //green
            EC: [4, 32], //underscore+green
            KC: [2, 32], //dim+green
            VC: [1, 32], //bright+green
        },
        [Severity.INFO]: {
            sign: 'ⓘ',
            enabled: true,
            holders: [],
            ID: [2    ], // dim
            SC: [5, 47], //blink+bg+white
            HC: [1, 37], //bright+white
            MC: [   37], //white
            EC: [4, 37], //underscore+white
            KC: [2, 37], //dim+white
            VC: [1, 37], //bright+white
        },
        [Severity.TRACE]: {
            sign: '▱',
            enabled: true,
            holders: [],
            ID: [2    ], // dim
            SC: [5, 44], //blink+bg+blue
            HC: [1, 34], //bright+blue
            MC: [   34], //blue
            EC: [4, 34], //underscore+blue
            KC: [2, 34], //dim+blue
            VC: [1, 34], //bright+blue
        },
        [Severity.DEBUG]: {
            sign: '▾',
            enabled: true,
            holders: [],
            ID: [2    ], // dim
            SC: [5, 46], //blink+bg+cyan
            HC: [1, 36], //bright+cyan
            MC: [   36], //cyan
            EC: [4, 36], //underscore+cyan
            KC: [2, 36], //dim+cyan
            VC: [1, 36], //bright+cyan
        },

    };
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._id = 0;
        this._logLevel = process.env.LOG_LEVEL as Severity ?? this._logLevel;
        this._instances = this._lyy.ly_array<LoggerLike>(this, '_instances');
        this._backup = this._lyy.ly_array<LogBasic>(this, '_backup');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;

        this.listenAdd.bind(this);
        this._lyy.event.subscribe(E_LOGGER_ADD, (log: LogBasic) => this.listenAdd(log));
        this._lyy.hook.addTrigger(H_LOGGER_SENDER, (fn: LoggerSenderLambda) => this._senderLambda = fn);
        this._lyy.hook.addTrigger(H_LOGGER_GRABBER, (fn: LoggerGrabberLambda) => this._grabberLambda = fn);
        this._lyy.hook.addTrigger(H_LOGGER_PRINTER, (fn: LoggerPrintLambda) => this._printLambda = fn);

        this._lyy.hook.add(H_LOGGER_PRINTER, (severity: Severity, info: RecLike, data: RecLike) => {
            if (data) {
                console[severity](Object.values(info).join(' '), data);
            } else {
                console[severity](Object.values(info).join(' '));
            }
        });
    }
    ly_post(): void {
        if (this._post) {return;}
        this._post = true;

        this._logLevel = this._lyy.variable.read<Severity>('LOG_LEVEL', {
            owner: COMPONENT_NAME,
            parser: (v) => this._lyy.primitive.enumeration<Severity>(v, {map: Severity, silent: true}),
            required: false,
            log: true,
            def: this._logLevel
        });
        if (this._useColor === undefined) {
            this._useColor = this._lyy.system.isLocal;
        }
        if (this._useId === undefined) {
            this._useId = this._lyy.system.isLocal;
        }
        if (this._stringify === undefined) {
            this._stringify = !this._lyy.system.isLocal;
        }
        this._stringify = true;
        this._setColors();
        this._afterLogLevel();
        this._backup.forEach(log => this.listenAdd(log));
        this._lyy.repo.clearArray(this, '_backup');
        this.LOG.debug('log initialized', {length: this._backup.length, l2: this._lyy.repo.getArray(this, '_backup').length});
        for (const ins of CoreLoggerInstance.items) {
            this._instances.push(ins);
            this._refreshInstance(ins);
        }
        CoreLoggerInstance.clearItems();
    }
    // region listeners
    listenAdd(log: LogBasic): void {
        if (global?.leyyo_is_testing) {
            return;
        }
        if (log.count === undefined) {
            log.count = 0;
        }
        if (log.time === undefined) {
            log.time = new Date();
        }
        if (!this._init) {
            this._backup.push(log);
            return;
        }
        try {
            this._apply(log);
        } catch (e) {
            console.log('@@@@@@', e.message);
            this._schedule(e, log);
        }
    }
    clearHolders(): void {
        Object.keys(this._colorMap).forEach(k => {
            this._colorMap[k].holders = [];
        });
        this._instances.forEach(ins => {
            this._refreshInstance(ins);
        });
    }
    addHolder(severities: OneOrMore<Severity>, ...holders: Array<ClassOrName>): void {
        const arr = this._lyy.is.array(severities) ? severities as Array<Severity> : [severities as Severity];
        const allHolders: Array<string> = [];
        Object.keys(this._colorMap).forEach((k: Severity) => {
            if (arr.includes(k)) {
                holders.forEach(holder => {
                    const hld = this._lyy.fqnPool.name(holder);
                    if (!this._colorMap[k].holders.includes(hld)) {
                        this._colorMap[k].holders.push(hld);
                        if (!allHolders.includes(hld)) {
                            allHolders.push(hld);
                        }
                    }
                });
            }
        });
        if (allHolders.length > 0) {
            this._instances.forEach(ins => {
                if (allHolders.includes(this._lyy.fqnPool.name(ins))) {
                    this._refreshInstance(ins);
                }
            });
        }
    }
    // endregion listeners

    // region getter
    get current(): RecLike {
        return {
            id: this._id,
            useColor: this._useColor,
            useId: this._useId,
            useTime: this._useTime,
            useHolder: this._useHolder,
            useSign: this._useSign,
            stringify: this._stringify,
            useGrabber: this._useGrabber,
        };
    }
    get logLevel(): Severity {
        return this._logLevel;
    }
    get isIn(): boolean {return this._isIn;}
    get useColor(): boolean {return this._useColor;}
    get useId(): boolean {return this._useId;}
    get useTime(): boolean {return this._useTime;}
    get useHolder(): boolean {return this._useHolder;}
    get useSign(): boolean {return this._useSign;}
    get stringify(): boolean {return this._stringify;}
    get useGrabber(): boolean {return this._useGrabber;}
    severityItem(severity: string): LoggerColor {
        return this._colorMap[severity] ?? this._colorDef;
    }
    // endregion getter
    // region logging
    protected get _inc(): number {
        if (this._id === Number.MAX_SAFE_INTEGER) {
            this._id = 0;
        }
        this._id++;
        return this._id;
    }
    protected _setColor(obj: LoggerColor): void {
        obj.ID = (obj.ID as ArraySome).map(c => `\x1b[${c}m`).join('');
        obj.SC = (obj.SC as ArraySome).map(c => `\x1b[${c}m`).join('');
        obj.HC = (obj.HC as ArraySome).map(c => `\x1b[${c}m`).join('');
        obj.MC = (obj.MC as ArraySome).map(c => `\x1b[${c}m`).join('');
        obj.EC = (obj.EC as ArraySome).map(c => `\x1b[${c}m`).join('');
        obj.KC = (obj.KC as ArraySome).map(c => `\x1b[${c}m`).join('');
        obj.VC = (obj.VC as ArraySome).map(c => `\x1b[${c}m`).join('');
    }
    protected _setColors(): void {
        this._setColor(this._colorDef);
        for (const [, obj] of Object.entries(this._colorMap)) {
            this._setColor(obj);
        }
    }
    protected _apply(basic: LogBasic): void {
        if (global?.leyyo_is_testing) {
            return;
        }
        basic.params = basic.params ?? {};
        const log = {...basic};
        log.params = {...basic.params};
        try {
            if (typeof log.message !== 'string') {
                let err: ExceptionLike;
                if (log.message instanceof Exception) {
                    err = log.message;
                } else {
                    err = this._lyy.exception.build(log.message);
                }
                if (this._lyy.exception.hasSign(err, 'logged')) {
                    return;
                }
                this._lyy.exception.addSign(err, 'logged');
                const errObj = err.toObject('message') as { params: RecLike, [F_HOLDER]: unknown };
                if (errObj) {
                    if (errObj[F_HOLDER]) {
                        if (!log.holder) {
                            log.holder = errObj[F_HOLDER];
                        }
                        delete errObj[F_HOLDER];
                    }
                }
                log.message = err.message;
                log.params.error = errObj;
            }
            if (this._isAlreadyRunning(log)) {
                return;
            }
            let req: RecLike;
            log.params = log.params ?? {};
            if (log.params[F_HOLDER] !== undefined) {
                if (!log.holder) {
                    log.holder = this._lyy.fqnPool.name(log.params[F_HOLDER]);
                }
                delete log.params[F_HOLDER];
            }
            if (log.params[F_REQ] !== undefined) {
                // todo
                req = log.params[F_REQ] as RecLike;
                delete log.params[F_REQ];
            }
            for (const [k, v] of Object.entries(log.params)) {
                if (typeof v === 'function') {
                    log.params[k] = '#ref:fn ' + this._lyy.fqnPool.name(v);
                }
            }
            log.params = secureJson(log.params);
            for (const [k, v] of Object.entries(log.params)) {
                if (v === undefined) {
                    delete log.params[k];
                }
            }
            const custom = (req) ? this._lyy.hook.runOrIgnore(H_REQUEST_EXTRACTOR, req) : undefined;
            const grabbed = (custom) ? this._lyy.hook.runOrIgnore(H_LOGGER_GRABBER, req, custom) : undefined;
            const extensions: Array<string> = [];
            if (grabbed) {
                if (this.useGrabber) {
                    for (const [k, v] of Object.entries(grabbed)) {
                        if (v) {
                            extensions.push(`${k}:${v}`);
                        }
                    }
                } else {
                    for (const [k, v] of Object.entries(grabbed)) {
                        if (v) {
                            log.params[`${F_REQ}.${k}`] = v;
                        }
                    }
                }
            }
            if (log.id === undefined) {
                log.id = this._inc;
            }
            if (!this._lyy.hook.runOrIgnore(H_LOGGER_SENDER, log, req)) {
                const sev = this.severityItem(log.severity);
                const info: RecLike = {};
                if (this._useSign) {
                    info.sign = `${!this._useColor ? log.severity : this._colorize(` ${sev.sign} `, sev.SC)}`;
                } else {
                    log.params[F_SEVERITY] = log.severity;
                }
                if (this._useId) {
                    info.id = `^${!this._useColor ? log.id : this._colorize(log.id.toString(10), sev.ID)}`;
                } else if (this._useTime) {
                    const time = this._lyy.system.isLocal ? log.time.toISOString().substring(10) : log.time.toISOString();
                    info.time = `^${!this._useColor ? time : this._colorize(time, sev.ID)}`;
                }
                if (log.holder) {
                    const hld = this._lyy.fqnPool.name(log.holder);
                    if (this._useHolder) {
                        info.holder = `@${!this._useColor ? hld : this._colorize(hld, sev.HC)}`;
                    } else {
                        log.params[F_HOLDER] = hld;
                    }
                }
                info.message = `${!this._useColor ? log.message : this._colorize(log.message, sev.MC)}`;
                // todo
               //  if (Math.random() > 0.1) {extensions.push(Math.random().toString(36).replace(/[^a-z]+/g, '').substring(0, 5));}
                if (extensions.length > 0) {
                    info.extensions = extensions.map(ex => `#${!this._useColor ? ex : this._colorize(ex, sev.EC)}`).join(', ');
                }
                let json: RecLike | string;
                if (this._stringify) {
                    if (this._useColor) {
                        json = this._jsonColor(log.params, sev);
                    } else {
                        json = JSON.stringify(secureJson(log.params) ?? {});
                    }
                } else {
                    json = log.params;
                }
                this._lyy.hook.runOrIgnore(H_LOGGER_PRINTER, log.severity, info, json);
            }
        }
        catch (err) {
            this._schedule(err, log);
        }
        this._successCase();
    }
    protected _jsonColor(value: unknown, sev: LoggerColor): string {
        if (this._lyy.is.empty(value)) {
            return this._colorize((value === undefined) ? 'NULL' : 'null', sev.VC);
        }
        if (typeof value !== 'object') {
            return this._colorize(JSON.stringify(secureJson(value)), sev.VC);
        }
        const items = [];
        if (Array.isArray(value)) {
            if (value.length < 1) {
                return '[]';
            }
            value.forEach(val => {
                items.push(this._jsonColor(val, sev));
            });
            return `[${items.join(', ')}]`;
        }
        if (Object.keys(value).length < 1) {
            return '{}';
        }
        for (const [key, val] of Object.entries(value)) {
            items.push(this._colorize(`"${key}"`, sev.KC) + `: ` + this._jsonColor(val, sev));
        }
        return `{${items.join(', ')}}`;
    }
    protected _colorize(text: string, color: Array<number>|string): string {
        return `${color}${text}\x1b[0m`;
    }
    protected _isAlreadyRunning(log: LogBasic): boolean {
        if (this._isIn) {
            this._schedule(null, log);
            return true;
        }
        this._isIn = true;
        return false;
    }
    protected _schedule(e: Error, log: LogBasic): void {
        log.count++;
        if (log.count < 4) {
            setTimeout(() => this.listenAdd(log), 100);
        } else {
            console.log(`yelmer`, log);
            if (e) {
                console.log(`${e.name} => ${e.message}`, e.stack);
            }
        }
    }
    protected _successCase(): void {
        this._isIn = false;
    }
    protected _checkIntColor(value: unknown, code: unknown): number {
        let num: number;
        try {
            num = this._lyy.primitive.integer(value);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'logger.invalid-color-int'});
        }
        if (this._lyy.is.empty(num)) {
            throw new DeveloperException('logger.invalid-color-int', {color: value, code}).with(this);
        }
        if (num < 0 || num > 255) {
            throw new DeveloperException('logger.invalid-color-range', {color: value, code}).with(this);
        }
        return num;
    }
    protected _checkColor(value: LoggerAnyColor): Array<number> {
        let numbers: Array<number>;
        if (typeof value === 'string') {
            let str: string;
            try {
                str = this._lyy.primitive.text(value);
            } catch (e) {
                throw Exception.cast(e).with(this).appendParams({indicator: 'logger.invalid-color'});
            }
            if (!str) {
                throw new DeveloperException('logger.empty-color', {color: value}).with(this);
            }
            // check hex
            str = str.toLowerCase();
            switch (str.length) {
                case 3:
                case 4:
                    if (str.length === 4) {
                        str = str.substring(1);
                    }
                    if (!/[0-9a-f]{3}/g.test(str)) {
                        throw new DeveloperException('logger.invalid-color-hex3', {color: value, pattern: '[0-9a-f]{3}'}).with(this);
                    }
                    str = str[0] + str[0] + str[1] + str[1] + str[2] + str[2];
                    break;
                case 6:
                case 7:
                    if (str.length === 7) {
                        str = str.substring(1);
                    }
                    if (!/[0-9a-f]{6}/g.test(str)) {
                        throw new DeveloperException('logger.invalid-color-hex6', {color: value, pattern: '[0-9a-f]{6}'}).with(this);
                    }
                    break;
                default:
                    throw new DeveloperException('logger.invalid-color-length', {color: value, pattern: '[0-9a-f]{6}'}).with(this);
            }
            const parts: Array<string> = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str.toLowerCase()) as unknown as Array<string>;
            if (parts) {
                numbers = [parseInt(parts[1], 16), parseInt(parts[2], 16), parseInt(parts[3], 16)];
                return numbers;
            }
            throw new DeveloperException('logger.invalid-color', {color: value}).with(this);
        }
        if (this._lyy.is.object(value)) {
            numbers = [];
            this._RGB_MAP.forEach(code => {
                numbers.push(this._checkIntColor(value[code], code));
            });
            return numbers;
        }
        if (this._lyy.is.array(value)) {
            numbers = [];
            this._RGB_MAP.forEach((code, index) => {
                numbers.push(this._checkIntColor(value[index], code));
            });
            return numbers;
        }
        throw new DeveloperException('logger.invalid-color', {color: value}).with(this);
    }
    // endregion logging

    // region setters
    assign(classOrName: ClassOrName): LoggerLike {
        let ins: LoggerLike;
        if (this._init) {
            let clazz;
            try {
                clazz = this._lyy.primitive.clazz(classOrName);
            } catch (e) {
                throw Exception.cast(e).with(this).appendParams({indicator: `logger.invalid-holder`});
            }
            if (!clazz) {
                throw new DeveloperException(`logger.empty-holder`, {clazz: classOrName}).with(this);
            }
            ins = new CoreLoggerInstance(classOrName);
            this._instances.push(ins);
            this._refreshInstance(ins);
        } else {
            ins = new CoreLoggerInstance(classOrName);
            this._instances.push(ins);
        }
        return ins;
    }
    protected _refreshInstance(ins: LoggerLike): void {
        const refreshed = ins as unknown as CoreLoggerRefresh;
        if (typeof refreshed.refresh === 'function') {
            refreshed.refresh(this._colorMap);
        }
    }
    private _checkLambda<T = FuncLike>(given: T, name: string): T {
        let fn: T;
        try {
            fn = this._lyy.primitive.func<T>(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: `logger.invalid-lambda`, name});
        }
        if (!fn) {
            throw new DeveloperException(`logger.empty-lambda`, {fn: given, name}).with(this);
        }
        return fn;
    }
    setSenderLambda(value: LoggerSenderLambda): void {
        this._lyy.hook.add(H_LOGGER_SENDER, this._checkLambda(value, 'senderLambda'));
    }
    setGrabberLambda(value: LoggerGrabberLambda): void {
        this._lyy.hook.add(H_LOGGER_GRABBER, this._checkLambda(value, 'grabberLambda'));
    }
    setPrinterLambda(value: LoggerPrintLambda): void {
        this._lyy.hook.add(H_LOGGER_PRINTER, this._checkLambda(value, 'printerLambda'));
    }
    setUseColor(value: boolean): void {
        if (typeof value === 'boolean') {
            this._useColor = value;
        }
    }
    setUseId(value: boolean): void {
        if (typeof value === 'boolean') {
            this._useId = value;
        }
    }
    setUseHolder(value: boolean): void {
        if (typeof value === 'boolean') {
            this._useHolder = value;
        }
    }
    setUseSign(value: boolean): void {
        if (typeof value === 'boolean') {
            this._useSign = value;
        }
    }
    setStringify(value: boolean): void {
        if (typeof value === 'boolean') {
            this._stringify = value;
        }
    }
    setUseGrabber(value: boolean): void {
        if (typeof value === 'boolean') {
            this._useGrabber = value;
        }
    }
    // endregion setters
    protected _afterLogLevel() {
        this._colorMap.error.enabled = true;
        this._colorMap.warn.enabled = true;
        this._colorMap.log.enabled = true;
        this._colorMap.info.enabled = true;
        this._colorMap.trace.enabled = true;
        this._colorMap.debug.enabled = true;
        switch (this._logLevel) {
            case Severity.ERROR:
                this._colorMap.warn.enabled = false;
                this._colorMap.log.enabled = false;
                this._colorMap.info.enabled = false;
                this._colorMap.trace.enabled = false;
                this._colorMap.debug.enabled = false;
                break;
            case Severity.WARN:
                this._colorMap.log.enabled = false;
                this._colorMap.info.enabled = false;
                this._colorMap.trace.enabled = false;
                this._colorMap.debug.enabled = false;
                break;
            case Severity.LOG:
                this._colorMap.info.enabled = false;
                this._colorMap.trace.enabled = false;
                this._colorMap.debug.enabled = false;
                break;
            case Severity.INFO:
                this._colorMap.trace.enabled = false;
                this._colorMap.debug.enabled = false;
                break;
            case Severity.TRACE:
                this._colorMap.debug.enabled = false;
                break;
            case Severity.DEBUG:
                break;
        }
    }

}


