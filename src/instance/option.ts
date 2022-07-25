import {ClassOrName, FuncOrName, RecLike} from "../index-aliases";
import {CoreLike} from "../index-types";
import {Severity} from "../index-enums";
import {F_HOLDER, F_INDICATOR, F_REQ, F_SEVERITY} from "../index-constants";


let lyy: CoreLike;
// noinspection JSUnusedGlobalSymbols
export class CoreOptionBuilder {
    // region global
    static setLyy(ins: CoreLike): void {
        if (!lyy) {
            lyy = ins;
        }
    }
    // endregion global
    protected readonly _opt: RecLike;

    constructor(opt?: RecLike) {
        this._opt = !opt ? {} : opt;
    }
    protected static _cast(opt: RecLike): RecLike {
        if (opt && typeof opt === 'object' && !Array.isArray(opt)) {
            return opt;
        }
        return {};
    }
    protected static _add(opt: RecLike, key: string, value: unknown): RecLike {
        return (value !== undefined) ? {...this._cast(opt), [key]: value} : this._cast(opt);
    }
    add(key: string, value: unknown): this {
        this._opt[key] = value;
        return this;
    }
    static holder(classOrName: ClassOrName, opt?: RecLike): RecLike {
        return this._add(opt, F_HOLDER, classOrName);
    }
    holder(classOrName: ClassOrName): this {
        return this.add(F_HOLDER, classOrName);
    }
    static indicator(value: string, opt?: RecLike): RecLike {
        return this._add(opt, F_INDICATOR, value);
    }
    indicator(value: string): this {
        return this.add(F_INDICATOR, value);
    }

    static file(file: string, opt?: RecLike): RecLike {
        return this._add(opt, 'file', lyy.system.clearFileName(file));
    }
    file(file: string): this {
        return this.add('file', lyy.system.clearFileName(file));
    }
    static key(key: ClassOrName, opt?: RecLike): RecLike {
        return this._add(opt, 'key', key);
    }
    key(key: ClassOrName): this {
        return this.add('key', key);
    }


    static req(req: unknown, opt?: RecLike): RecLike {
        return this._add(opt, F_REQ, req);
    }
    req(req: unknown): this {
        return this.add(F_REQ, req);
    }
    static severity(severity: Severity, opt?: RecLike): RecLike {
        return this._add(opt, F_SEVERITY, severity);
    }
    severity(severity: Severity): this {
        return this.add(F_SEVERITY, severity);
    }
    static type(type: unknown, opt?: RecLike): RecLike {
        return this._add(opt, 'type', type);
    }
    type(type: string): this {
        return this.add('type', type);
    }
    static typeOf(value: unknown, opt?: RecLike): RecLike {
        return this.type(typeof value, opt);
    }
    typeOf(value: unknown): this {
        return this.type(typeof value);
    }
    static fn(fn: FuncOrName, opt?: RecLike): RecLike {
        return this._add(opt, 'fn', fn);
    }
    fn(fn: FuncOrName): this {
        return this.add('fn', fn);
    }
    static val(value: unknown, opt?: RecLike): RecLike {
        return this._add(opt, 'value', value);
    }
    val(value: unknown): this {
        return this.add('value', value);
    }
    merge(opt: RecLike): this {
        opt = CoreOptionBuilder._cast(opt);
        for (const [k, v] of Object.entries(opt)) {
            this._opt[k] = v;
        }
        return this;
    }
    get ok(): RecLike {
        return this._opt;
    }
}