import {ClassOrName, RecLike} from "./index-aliases";
import {CoreLike, ExceptionLike, ExceptionParamsAppend, ExceptionStackLine, LogBasic} from "./index-types";
import {Severity} from "./index-enums";
import {E_LOGGER_ADD, F_INDICATOR, F_REQ} from "./index-constants";
import {FQN_NAME} from "./internal-component";
import {secureJson} from "./index-functions";

let lyy: CoreLike;

// noinspection JSUnusedGlobalSymbols
export class Exception extends Error implements ExceptionLike {
    protected _params: RecLike;
    protected _parsed: Array<ExceptionStackLine>;
    protected _holder?: ClassOrName;
    protected _cause?: ExceptionLike;
    protected _req?: unknown;

    constructor(message: string, params?: RecLike) {
        if (global?.leyyo_is_testing) {
            message += ` => ${JSON.stringify(secureJson(params))}`;
        }
        super(message);
        this.name = lyy.fqnPool.name(this);
        this._params = params ?? {};
        this._parsed = [];
        lyy.exception.initSign(this);
        lyy.exception.initOmit(this);
        lyy.exception.buildStack(this);

    }

    get params(): RecLike {
        return this._params;
    }

    setName(name: string): this {
        if (typeof name === 'string') {
            this.name = name;
        }
        return this;
    }

    // noinspection JSUnusedLocalSymbols
    causedBy(e: Error|string): this {
        this._cause = lyy.exception.build(e);
        this._cause.addSign('caused');
        return this;
    }

    with(classOrName: ClassOrName): this {
        this._holder = classOrName;
        return this;
    }
    appendParams(params: ExceptionParamsAppend, ignoreExisting?: boolean): this {
        this._params = this._params ?? {};
        try {
            for (const [k, v] of Object.entries(params)) {
                if (!(ignoreExisting && this._params[k] !== undefined)) {
                    this._params[k] = v;
                }
            }
        } catch (e) {
        }
        return this;
    }
    log(req?: unknown): this {
        if (req) {
            this._req = req;
        }
        const params = {};
        if (this._req) {
            params[F_REQ] = this._req;
        }
        const log = {severity: Severity.ERROR, message: this, params, holder: this._holder, time: new Date()} as LogBasic;
        if (lyy.exception.getSign(this).includes('warn')) {
            log.severity = Severity.WARN;
        }
        lyy.event.publish(E_LOGGER_ADD, log);
        return this;
    }
    raise(throwable = true, req?: unknown): this {
        if (!throwable) {
            if (req) {
                this._req = req;
            }
            this.log();
            return undefined;
        }
        throw this;
    }
    copyStack(e: Error): void {
        this.addSign('built');
        this._parsed = e ? e['_parsed'] ?? [] : [];
    }


    // region sign
    hasSign(key: string): boolean {
        return lyy.exception.hasSign(this, key);
    }
    getSign(): Array<string> {
        return lyy.exception.getSign(this);
    }
    protected omit(...properties: Array<string>): boolean {
        if (properties.length < 1) {return true;}
        return lyy.exception.addOmit(this, ...properties);
    }
    addSign(...keys: Array<string>): boolean {
        return lyy.exception.addSign(this, ...keys);
    }
    removeSign(...keys: Array<string>): boolean {
        return lyy.exception.removeSign(this, ...keys);
    }
    // endregion sign
    toObject(...omittedFields: Array<string>): RecLike {
        return lyy.exception.toObject(this, ...omittedFields);
    }
    toJSON() {
        try {
            return this.toObject();
        } catch (e) {
            return { name: this.name, message: this.message, params: this._params };
        }
    }
    static cast(e: string|Error): ExceptionLike {
        return lyy.exception.build(e);
    }
}
export class DeveloperException extends Exception {
    constructor(indicator: string, params?: RecLike) {
        super(indicator, {...params, [F_INDICATOR]: indicator});
    }
}
export class CausedException extends Exception {
    constructor(e: Error, indicator: string, params?: RecLike) {
        super(e.message, {...params, [F_INDICATOR]: indicator});
        this.causedBy(e);
    }
}
export class MultipleException extends Exception {
    protected _items: Array<ExceptionLike>;
    constructor(...errors: Array<Error>) {
        super("Multiple exceptions are occurred", {});
        this._items = [];
        this.push(...errors);
    }
    push(...errors: Array<Error>): this {
        errors.forEach(e => {
            const err = lyy.exception.build(e);
            if (err instanceof MultipleException) {
                this._items.push(...err._items);

            } else {
                this._items.push(err);
            }
        })
        return this;
    }
    // noinspection JSUnusedGlobalSymbols
    get items(): Array<ExceptionLike> {
        return this._items;
    }
}
export class HttpException extends Exception {

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(message: string, status: number, params?: RecLike) {
        super(message, params);
        this._params.status = lyy.exception.checkStatus(this, status, false);
    }
}
export function setForExceptions (ins: CoreLike) {
    lyy = ins;
    [Exception, DeveloperException, CausedException, MultipleException, HttpException].forEach(e => {
        lyy.fqnPool.clazz(e, ...FQN_NAME);
        lyy.exception.add(e);
    });
}
