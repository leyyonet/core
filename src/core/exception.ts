import * as stackTraceParser from "stacktrace-parser";
import {ArraySome, ClassLike, FuncLike, RecLike} from "../index-aliases";
import {
    CoreLike,
    ExceptionActionLambda,
    ExceptionExportLambda,
    ExceptionI18nLambda,
    ExceptionImplLike,
    ExceptionLike,
    ExceptionSenderLambda,
    ExceptionStackLine,
    ExceptionToObjectLambda,
    LoggerLike
} from "../index-types";
import {DeveloperException, Exception} from "../index-errors";
import {
    F_HOLDER,
    H_ERROR_ACTION,
    H_ERROR_DICTIONARY,
    H_ERROR_EXPORT,
    H_ERROR_SENDER,
    H_ERROR_TO_OBJECT
} from "../index-constants";
import {LEYYO_EXCEPTION, LEYYO_OMIT} from "../internal-component";
import {secureJson} from "../index-functions";

// noinspection JSUnusedGlobalSymbols
export class ExceptionImpl implements ExceptionImplLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected static _IGNORED_FOLDERS = ['ts-node'];
    protected _status: number;
    protected _senderLambda: ExceptionSenderLambda;
    protected _i18nLambda: ExceptionI18nLambda;
    protected _toObjectLambda: ExceptionToObjectLambda;
    protected _exportLambda: ExceptionExportLambda;
    protected _actonLambda: ExceptionActionLambda;
    protected _items: Array<FuncLike>;
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        this._status = 400;
        this._lyy = ins;
        this._items = this._lyy.repo.newArray<FuncLike>(this, '_items');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
        this._lyy.hook.add(H_ERROR_TO_OBJECT, (e: ExceptionLike, ...fl: Array<string>) => this._toObject(e, ...fl));
        this._lyy.hook.add(H_ERROR_EXPORT, (e: Error, data: RecLike) => {
            return data;
        });
        this._lyy.hook.addTrigger(H_ERROR_SENDER, (fn: ExceptionSenderLambda) => this._senderLambda = fn);
        this._lyy.hook.addTrigger(H_ERROR_DICTIONARY, (fn: ExceptionI18nLambda) => this._i18nLambda = fn);
        this._lyy.hook.addTrigger(H_ERROR_TO_OBJECT, (fn: ExceptionToObjectLambda) => this._toObjectLambda = fn);
        this._lyy.hook.addTrigger(H_ERROR_EXPORT, (fn: ExceptionExportLambda) => this._exportLambda = fn);
        this._lyy.hook.addTrigger(H_ERROR_ACTION, (fn: ExceptionActionLambda) => this._actonLambda = fn);
    }
    // region list
    get name(): Array<string> {
        return this._items.map(clazz => this._lyy.fqnPool.name(clazz));
    }
    get items(): Array<FuncLike> {
        return this._items;
    }
    add(err: FuncLike): void {
        let name: string;
        try {
            name = this._lyy.primitive.clazz(err);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'exception.invalid-name'});
        }
        if (!name) {
            throw new DeveloperException('exception.empty-name', {name: err}).with(this);
        }
        this._items.push(err);
        this.LOG.debug(`exception.add`, {name});
    }
    // endregion list
    // region omit
    initOmit(err: Error): boolean {
        if (Object.getOwnPropertyDescriptor(err, LEYYO_OMIT)) {
            return true;
        }
        try {
            Object.defineProperty(err, LEYYO_OMIT, {
                value: ['stack'],
                configurable: false,
                writable: false,
                enumerable: false
            });
            return true;
        } catch (e) {
            this.LOG.native(e, 'exception.init-omit', {pos: 'defineProperty', error: this.toObject(err)});
        }
        return false;
    }
    addOmit(err: Error, ...properties: Array<string>): boolean {
        if (!this.initOmit(err)) {
            return false;
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(err, LEYYO_OMIT);
            if (Array.isArray(desc?.value)) {
                properties.forEach(property => {
                    if (!(desc.value as ArraySome).includes(property)) {
                        (desc.value as ArraySome).push(property);
                    }
                });
                return true;
            }
        } catch (e) {
            this.LOG.native(e, 'exception.add-omit', {error: this.toObject(err), properties});
        }
        return false;
    }
    getOmit(err: Error): Array<string> {
        try {
            const desc = Object.getOwnPropertyDescriptor(err, LEYYO_OMIT);
            if (Array.isArray(desc?.value)) {
                return desc?.value;
            }
        } catch (e) {
            this.LOG.native(e, 'exception.get-omit', {error: this.toObject(err)});
        }
        return [];
    }
    // endregion omit
    // region sign
    initSign(err: Error): boolean {
        if (Object.getOwnPropertyDescriptor(err, LEYYO_EXCEPTION)) {
            return true;
        }
        try {
            Object.defineProperty(err, LEYYO_EXCEPTION, {
                value: [],
                configurable: false,
                writable: false,
                enumerable: false
            });
            return true;
        } catch (e) {
            this.LOG.native(e, 'exception.init-sign', {pos: 'defineProperty', error: this.toObject(err)});
        }
        return false;
    }
    addSign(err: Error, ...keys: Array<string>): boolean {
        if (!this.initSign(err)) {
            return false;
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(err, LEYYO_EXCEPTION);
            if (Array.isArray(desc?.value)) {
                keys.forEach(key => {
                    if (!(desc.value as ArraySome).includes(key)) {
                        (desc.value as ArraySome).push(key);
                    }
                });
                return true;
            }
        } catch (e) {
            this.LOG.native(e, 'exception.add-sign', {error: this.toObject(err), keys});
        }
        return false;
    }
    getSign(err: Error): Array<string> {
        if (!this.initSign(err)) {
            return [];
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(err, LEYYO_EXCEPTION);
            if (Array.isArray(desc?.value)) {
                return desc?.value;
            }
        } catch (e) {
            this.LOG.native(e, 'exception.get-sign', {error: this.toObject(err)});
        }
        return [];
    }
    removeSign(err: Error, ...keys: Array<string>): boolean {
        if (!this.initSign(err)) {
            return false;
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(err, LEYYO_EXCEPTION);
            if (Array.isArray(desc?.value)) {
                keys.forEach(key => {
                    const arr = (desc.value as ArraySome);
                    const index = arr.indexOf(key);
                    if (index >= 0) {
                        arr.splice(index, 1);
                    }
                });
                return true;
            }
        } catch (e) {
            this.LOG.native(e, 'exception.remove-sign', {error: this.toObject(err), keys});
        }
        return false;
    }
    hasSign(err: Error, key: string): boolean {
        if (!this.initSign(err)) {
            return false;
        }
        try {
            const desc = Object.getOwnPropertyDescriptor(err, LEYYO_EXCEPTION);
            if (Array.isArray(desc?.value)) {
                return (desc.value as ArraySome).includes(key);
            }
        } catch (e) {
            this.LOG.native(e, 'exception.has-sign', {key, error: this.toObject(err)});
        }
        return false;
    }
    // endregion sign
    // region public
    build(e: Error | string): ExceptionLike {
        if (typeof e === 'string') {
            return new Exception(e);
        } else if (e instanceof Exception) {
            return e;
        } else if (e instanceof Error) {
            const err = new Exception(e.message, this.toObject(e, 'message', 'stack'));
            this.buildStack(e);
            err.copyStack(e);
            return err;
        } else { // err instanceof Error
            return new Exception(`Unknown error`, {...this.toObject(e), type: typeof e});
        }
    }
    protected _toObject(e: Error, ...omittedFields: Array<string>): RecLike {
        const json = {name: e.name, message: e.message};
        const fields = [...omittedFields, ...this.getOmit(e)];
        Object.getOwnPropertyNames(e).forEach(key => {
            let val = e[key];
            if (this._lyy.is.empty(val) || json[key] !== undefined || fields.includes(key)) {
                return;
            }
            let k2 = key;
            switch (key) {
                case '_holder':
                    k2 = F_HOLDER;
                    val = this._lyy.fqnPool.name(val);
                    break;
                case '_parsed':
                    k2 = 'stackTrace';
                    break;
                default:
                    if (key.startsWith('_')) {
                        k2 = key.substring(1);
                    }
                    break;
            }
            switch (typeof val) {
                case "string":
                case "number":
                case "boolean":
                    json[k2] = val;
                    break;
                case "bigint":
                    json[k2] = val.toString(10);
                    break;
                case "object":
                    json[k2] = secureJson(val);
                    break;
            }
        });
        fields.forEach(k => {
            if (json[k] !== undefined) {
                delete json[k];
            }
        });
        for (const [k, v] of Object.entries(json)) {
            if (v === undefined) {
                delete json[k];
            }
        }
        return json;
    }
    toObject(e: Error, ...omittedFields: Array<string>): RecLike {
        return this._lyy.hook.runOrIgnore(H_ERROR_TO_OBJECT, e, ...omittedFields) ?? this._toObject(e, ...omittedFields);
    }
    buildStack(e: Error): void {
        if (this.hasSign(e, 'built')) {
            return e['_parsed'] ?? [];
        }
        if (!e?.stack) {
            this.addSign(e, 'built');
            e['_parsed'] = [];
            return e['_parsed'] ?? [];
        }
        const arr: Array<ExceptionStackLine> = [];
        try {
            const stack = stackTraceParser.parse(e.stack);
            if (Array.isArray(stack)) {
                stack.forEach(frame => {
                    try {
                        // noinspection HtmlUnknownTag
                        if (['<unknown>', 'Object.<anonymous>'].includes(frame.methodName)) {
                            frame.methodName = null;
                        }
                        if (frame.file && !frame.file.startsWith('node:')) {
                            frame.file = this._lyy.system.clearFileName(frame.file);
                            if (!ExceptionImpl._IGNORED_FOLDERS.some(folder => frame.file.startsWith(`# ${folder}`))) {
                                arr.push({
                                    file: this._lyy.system.clearFileName(frame.file),
                                    method: frame.methodName,
                                    line: frame.lineNumber,
                                    column: frame.column,
                                });
                            }
                        }
                    } catch (e1) {
                        this.LOG.native(e1, 'exception.stack.line', {pos: 'each'});
                    }
                });
            }
        } catch (e2) {
            this.LOG.native(e2, 'exception.stack.line', {pos: 'outer'});
        }
        this.addSign(e, 'built');
        e['_parsed'] = arr;
    }
    checkStatus(clazz: ClassLike, value: unknown, throwable?: boolean): number {
        let num;
        try {
            num = this._lyy.primitive.integer(value, {silent: !throwable});
        } catch (e) {
            Exception.cast(e).with(this).appendParams({indicator: 'exception.invalid-status'}).raise(throwable);
            return this._status;
        }
        if (this._lyy.is.empty(num)) {
            new DeveloperException('exception.empty-status', {clazz, status: value}).with(this).raise(throwable);
            return this._status;
        }
        if (num < 400 || num > 999) {
            new DeveloperException('exception.invalid-status', {clazz, status: num}).with(this).raise(throwable);
            return this._status;
        }
        return num;
    }
    // endregion public
    // region setter
    private _checkLambda<T = FuncLike>(given: T, name: string): T {
        let fn: T;
        try {
            fn = this._lyy.primitive.func<T>(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: `exception.invalid-lambda`, name});
        }
        if (!fn) {
            throw new DeveloperException(`exception.empty-lambda`, {fn: given, name}).with(this);
        }
        return fn;
    }
    setSenderLambda(value: ExceptionSenderLambda): void {
        this._lyy.hook.add(H_ERROR_SENDER, this._checkLambda(value, 'senderLambda'));
    }
    setI18nLambda(value: ExceptionI18nLambda): void {
        this._lyy.hook.add(H_ERROR_DICTIONARY, this._checkLambda(value, 'i18nLambda'));
    }
    setToObjectLambda(value: ExceptionToObjectLambda): void {
        this._lyy.hook.add(H_ERROR_TO_OBJECT, this._checkLambda(value, 'toObjectLambda'));
    }
    setExportLambda(value: ExceptionExportLambda): void {
        this._lyy.hook.add(H_ERROR_EXPORT, this._checkLambda(value, 'exportLambda'));
    }
    setActionLambda(value: ExceptionActionLambda): void {
        this._lyy.hook.add(H_ERROR_ACTION, this._checkLambda(value, 'actionLambda'));
    }
    setStatus(value: number): void {
        this._status = this.checkStatus(ExceptionImpl, value, true);
    }
    // endregion setter
}