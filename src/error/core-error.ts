// x_console.log(`## ${__filename}`, {i: 'loading'});
import * as stackTraceParser from "stacktrace-parser";
import {DeveloperException, Exception} from "./errors";

import {
    CoreErrorLike,
    ExceptionActionLambda,
    ExceptionDictionaryLambda,
    ExceptionExportLambda,
    ExceptionLike,
    ExceptionSendLambda,
    ExceptionStackLine,
    ExceptionToObjectLambda
} from "./types";
import {
    LY_ERROR_H_ACTION,
    LY_ERROR_H_DICTIONARY,
    LY_ERROR_H_EXPORT,
    LY_ERROR_H_SENDER,
    LY_ERROR_H_TO_OBJECT
} from "./constants";
import {ClassLike, Func1, FuncLike, RecLike} from "../common";
import {$ly} from "../core";


/**
 * Qcore
 * */
export class CoreError implements CoreErrorLike {
    // region properties
    protected _IGNORED_FOLDERS = ['ts-node'];
    protected _status = 400;
    protected _items: Array<FuncLike> = [];
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            this.LOG = $ly.logger.assign(this)
        });
        $ly.addTrigger('repo', () => {
            this._items = $ly.repo.newArray<FuncLike>(this, '_items')
        });
        $ly.addTrigger('hook', () => {
            $ly.hook.addTrigger(LY_ERROR_H_SENDER, (fn: ExceptionSendLambda) => this.setSendLambda(fn));
            $ly.hook.addTrigger(LY_ERROR_H_DICTIONARY, (fn: ExceptionDictionaryLambda) => this.setDictionaryLambda(fn));
            $ly.hook.addTrigger(LY_ERROR_H_TO_OBJECT, (fn: ExceptionToObjectLambda) => this.setToObjectLambda(fn));
            $ly.hook.addTrigger(LY_ERROR_H_EXPORT, (fn: ExceptionExportLambda) => this.setExportLambda(fn));
            $ly.hook.addTrigger(LY_ERROR_H_ACTION, (fn: ExceptionActionLambda) => this.setActionLambda(fn));
        });
    }
    static {
        $ly.addDependency('error', () => new CoreError());
    }

    // region protected
    protected _objectItem(key: string, e: Error, omits: Array<string>, json: RecLike, fn: Func1) {
        if (!omits.includes(key) && e[key] !== undefined) {
            json[key] = fn(e[key]);
            omits.push(key);
        }
        if (!omits.includes(`_${key}`) && e[`_${key}`] !== undefined) {
            if (json[key] === undefined) {
                json[key] = fn(e[`_${key}`]);
            }
            omits.push(`_${key}`);
        }
    }

    protected _toObject(e: Error, ...omittedFields: Array<string>): RecLike {
        const json = {name: e.name, message: e.message};
        const omits = [...omittedFields, ...this.getOmit(e)];
        this._objectItem('holder', e, omits, json, (v) => $ly.fqn.get(v));
        this._objectItem('stackTrace', e, omits, json, (v) => $ly.json.check(v));
        this._objectItem('ctx', e, omits, json, (v) => v);
        Object.getOwnPropertyNames(e).forEach(key => {
            const val = e[key];
            if ($ly.not(val) || json[key] !== undefined || omits.includes(key)) {
                return;
            }
            // todo look getters
            const k2 = key.startsWith('_') ? key.substring(1) : key;
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
                    json[k2] = $ly.json.check(val);
                    break;
            }
        });
        omits.forEach(k => {
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

    // noinspection JSUnusedLocalSymbols
    protected _sendLambda(err: ExceptionLike): boolean {
        return false;
    }

    // noinspection JSUnusedLocalSymbols
    protected async _dictionaryLambda(err: ExceptionLike): Promise<boolean> {
        return undefined;
    }

    protected _toObjectLambda(err: ExceptionLike, ...omittedFields: Array<string>): RecLike {
        return this._toObject(err, ...omittedFields);
    }

    // noinspection JSUnusedLocalSymbols
    protected _exportLambda(err: ExceptionLike): RecLike {
        return undefined;
    }

    // noinspection JSUnusedLocalSymbols
    protected _actonLambda(err: ExceptionLike): void {
        // nothing
    }

    // endregion protected

    // region getter
    get sendLambda(): ExceptionSendLambda {
        return this._sendLambda;
    }

    get dictionaryLambda(): ExceptionDictionaryLambda {
        return this._dictionaryLambda;
    }

    get toObjectLambda(): ExceptionToObjectLambda {
        return this._toObjectLambda;
    }

    get exportLambda(): ExceptionExportLambda {
        return this._exportLambda;
    }

    get actonLambda(): ExceptionActionLambda {
        return this._actonLambda;
    }

    // endregion getter

    // region internal
    setSendLambda(fn: ExceptionSendLambda): this {
        this._sendLambda = fn;
        return this;
    }

    setDictionaryLambda(fn: ExceptionDictionaryLambda): this {
        this._dictionaryLambda = fn;
        return this;
    }

    setToObjectLambda(fn: ExceptionToObjectLambda): this {
        this._toObjectLambda = fn;
        return this;
    }

    setExportLambda(fn: ExceptionExportLambda): this {
        this._exportLambda = fn;
        return this;
    }

    setActionLambda(fn: ExceptionActionLambda): this {
        this._actonLambda = fn;
        return this;
    }

    buildStack(e: Error): void {
        if (this.hasSign(e, 'built')) {
            return e['_stackTrace'] ?? [];
        }
        if (!e?.stack) {
            this.addSign(e, 'built');
            e['_stackTrace'] = [];
            return e['_stackTrace'] ?? [];
        }
        const arr: Array<ExceptionStackLine> = [];
        try {
            const stack = stackTraceParser.parse(e.stack);
            if (Array.isArray(stack)) {
                stack.forEach(frame => {
                    try {
                        // noinspection HtmlUnknownTag
                        if (['<unknown>', 'Object.<anonymous>'].includes(frame.methodName)) {
                            frame.methodName = undefined;
                        }
                        if (frame.file && !frame.file.startsWith('node:')) {
                            frame.file = $ly.system?.clearFileName(frame.file) ?? frame.file;
                            if (!this._IGNORED_FOLDERS.some(folder => frame.file.startsWith(`# ${folder}`))) {
                                arr.push({
                                    file: frame.file,
                                    method: frame.methodName,
                                    line: frame.lineNumber,
                                    column: frame.column,
                                });
                            }
                        }
                    } catch (e1) {
                        this.LOG.error(e1, {pos: 'each', indication: 'error.stack.line'});
                    }
                });
            }
        } catch (e2) {
            this.LOG.error(e2, {pos: 'outer', indication: 'error.stack.line'});
        }
        this.addSign(e, 'built');
        e['_stackTrace'] = arr;
    }

    // endregion internal


    // region list
    getNames(): Array<string> {
        return this._items.map(item => $ly.fqn.get(item));
    }

    getItems(): Array<FuncLike> {
        return this._items;
    }

    add(err: FuncLike, ...prefixes: Array<string>): void {
        const name = $ly.primitive.clazz(err);
        if (!name) {
            throw new DeveloperException('error.empty.name', {err}).with(this);
        }
        this._items.push(err);
        $ly.fqn.clazz(err as ClassLike, ...prefixes);
        this.LOG.debug('Exception defined', {name: $ly.fqn.get(err)});
    }

    addMultiple(classes: Array<FuncLike>, ...prefixes: Array<string>): void {
        if ($ly.primitive.isArrayFilled(classes)) {
            classes.forEach(c => this.add(c, ...prefixes));
        }
    }

    // endregion list
    // region omit
    addOmit(err: Error, ...properties: Array<string>): boolean {
        return $ly.symbol.push(err, 'err_sign', ...properties);
    }

    getOmit(err: Error): Array<string> {
        return $ly.symbol.get<Array<string>>(err, 'err_omit', []) ?? [];
    }

    // endregion omit
    // region sign
    addSign(err: Error, ...keys: Array<string>): boolean {
        return $ly.symbol.push(err, 'err_sign', ...keys);
    }

    getSign(err: Error): Array<string> {
        return $ly.symbol.get<Array<string>>(err, 'err_sign', []) ?? [];
    }

    removeSign(err: Error, ...keys: Array<string>): number {
        return $ly.symbol.splice<string>(err, 'err_sign', ...keys) ?? 0;
    }

    hasSign(err: Error, key: string): boolean {
        const signs = $ly.symbol.get<Array<string>>(err, 'err_sign', []);
        return signs && signs.includes(key);
    }

    // endregion sign

    // region public
    build(e: Error | string): ExceptionLike {
        if ($ly.primitive.instanceOf(e, Exception)) {
            return e as ExceptionLike;
        }
        if (typeof e === 'string') {
            return new Exception(e);
        } else if (e instanceof Error) {
            const err = new Exception(e.message, this.toObject(e, 'message', 'stack'));
            this.buildStack(e);
            err.copyStack(e);
            return err;
        } else { // err instanceof Error
            return new Exception(`Unknown error`, {...this.toObject(e), typeOf: typeof e});
        }
    }


    toObject(e: Error, ...omittedFields: Array<string>): RecLike {
        return this._toObject(e, ...omittedFields);
    }


    // endregion public
}
