import {ArraySome} from "../index-aliases";
import {CoreIsLike, CoreLike, LoggerLike} from "../index-types";

// noinspection JSUnusedGlobalSymbols
export class CoreIs implements CoreIsLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }


    // region is
    empty(value: unknown): boolean {
        return (value === undefined || value === null);
    }
    primitive(value: unknown): boolean {
        return ['string', 'number', 'bigint', 'boolean'].includes(typeof value);
    }
    value(value: unknown): boolean {
        return !this.empty(value) && ['string', 'number', 'bigint', 'boolean', 'object', 'function'].includes(typeof value);
    }
    key(value: unknown): boolean {
        return !this.empty(value) && ['string', 'number'].includes(typeof value);
    }
    object(value: unknown, filled = false): boolean {
        let flag = (value && typeof value === 'object' && !Array.isArray(value));
        if (filled && flag) {
            flag = flag && Object.keys(value).length > 0;
        }
        return flag;
    }
    array(value: unknown, filled = false): boolean {
        let flag = (value && typeof value === 'object' && Array.isArray(value));
        if (filled && flag) {
            flag = flag && (value as ArraySome).length > 0;
        }
        return flag;
    }
    func(value: unknown): boolean {
        return typeof value === 'function';
    }
    float(value: unknown): boolean {
        return this.number(value);
    }
    number(value: unknown): boolean {
        return (typeof value === 'number') && !isNaN(value) && isFinite(value);
    }
    integer(value: unknown): boolean {
        return this.number(value) && Number.isInteger(value);
    }
    string(value: unknown): boolean {
        return typeof value === 'string';
    }
    text(value: unknown): boolean {
        return this.string(value) && (value as string).trim() !== '';
    }
    clazz(value: unknown): boolean {
        return this.text(value) || this.func(value) || this.object(value);
    }
    boolean(value: unknown, strict?: boolean): boolean {
        if (strict) {
            return (typeof value === 'boolean');
        }
        return this.boolTrue(value);
    }
    boolTrue(value: unknown): boolean {
        return (value === true) || (this.text(value) && this._lyy.primitive.BOOL_TRUE.includes((value as string).toLowerCase())) || (this.number(value) && value > 0);
    }
    boolFalse(value: unknown): boolean {
        return (value === false) || (this.text(value) && this._lyy.primitive.BOOL_FALSE.includes((value as string).toLowerCase())) || (this.number(value) && value <= 0);
    }
    // endregion is
}