import {ArraySome, FuncLike, Key, OneOrMore, PairLike, RecLike} from "../index-aliases";
import {DeveloperException, Exception} from "../index-errors";
import {
    CoreLike,
    CorePrimitiveLike,
    LoggerLike,
    TypeArrayOpt,
    TypeChildOpt,
    TypeEnumOpt,
    TypeFnLambda,
    TypeObjectOpt,
    TypeOpt
} from "../index-types";

// noinspection JSUnusedGlobalSymbols
export class CorePrimitive implements CorePrimitiveLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    readonly BOOL_TRUE = ['1', 'true', 't', 'yes', 'y', 'on'];
    readonly BOOL_FALSE = ['0', '-1', 'false', 'f', 'no', 'n', 'off'];
    private readonly _EXPECTED_ANY = ['string', 'boolean', 'bigint', 'object', 'number', 'array'];
    private readonly _EXPECTED_ARRAY = ['array'];
    private readonly _EXPECTED_BOOL = ['boolean', 'string', 'number'];
    private readonly _EXPECTED_CLASS = ['string', 'function', 'object'];
    private readonly _EXPECTED_DATE = ['string', 'number', 'date', 'moment'];
    private readonly _EXPECTED_ENUM = ['string', 'number'];
    private readonly _EXPECTED_NUMBER = ['string', 'number', 'bigint'];
    private readonly _EXPECTED_STRING = ['boolean', 'string', 'number'];

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
    // region utility
    checkRealNumber(value: number, opt?: TypeOpt): number {
        if (isNaN(value) || !isFinite(value)) {
            new DeveloperException('type.notReal-number', {range: isNaN(value) ? 'NaN' : 'Infinite', field: opt?.field}).with(this).raise(!opt?.silent);
            return null;
        }
        return value;
    }
    runFn<T = unknown>(fn: FuncLike, value: FuncLike, opt?: TypeOpt): T {
        try {
            return fn(value()) as T;
        } catch (e) {
            Exception.cast(e).raise(!opt?.silent);
        }
        return null;
    }
    runSave<T = unknown>(fn: FuncLike, value: unknown, opt?: TypeOpt): T {
        try {
            return fn(value) as T;
        } catch (e) {
            Exception.cast(e).raise(!opt?.silent);
        }
        return null;
    }
    raiseInvalidValue<T = unknown>(value: unknown, expected: OneOrMore<string>, opt?: TypeOpt, params?: RecLike): T {
        new DeveloperException('type.invalid-value', {...params, expected, value}).with(this).raise(!opt?.silent);
        return null;
    }
    // endregion utility
    // region private
    private _enumInMap<T extends Key = Key>(value: unknown, map: RecLike<T>): T {
        // regular, in values
        if (Object.values(map).includes(value as T)) {
            return value as T;
        }
        // ir-regular, in keys
        if (Object.keys(map).includes(value as string)) {
            return map[value as string];
        }
        if (typeof value === 'string') {
            // regular, in lower-case
            let str = value.toLowerCase();
            let v = this._enumInMap(str, map);
            if (v !== null) {
                return v;
            }
            // regular, in upper-case
            str = str.toUpperCase();
            v = this._enumInMap(str, map);
            if (v !== null) {
                return v;
            }
            if (/^[0-9]+$/.test(value)) {
                try {
                    return this._enumInMap(parseInt(value, 10), map);
                } catch (e) {
                }
            }
            return null;
        }
        return null;
    }
    private _enumInArray<T extends Key = Key>(value: unknown, arr: Array<T>): T {
        // regular, in values
        if (arr.includes(value as T)) {
            return value as T;
        }
        if (typeof value === 'string') {
            // regular, in lower-case
            let str = value.toLowerCase();
            let v = this._enumInArray(str, arr);
            if (v !== null) {
                return v;
            }
            // regular, in upper-case
            str = str.toUpperCase();
            v = this._enumInArray(str, arr);
            if (v !== null) {
                return v;
            }
            if (/^[0-9]+$/.test(value)) {
                try {
                    return this._enumInArray(parseInt(value, 10), arr);
                } catch (e) {
                }
            }
            return null;
        }
        return null;
    }
    // noinspection JSMethodCanBeStatic
    private _enumInAlteration<T extends Key = Key>(value: unknown, alt: RecLike<T>): T {
        // ir-regular, in keys
        if (Object.keys(alt).includes(value as string)) {
            return alt[value as string];
        }
        if (typeof value === 'string') {
            // regular, in lower-case
            let str = value.toLowerCase();
            let v = this._enumInAlteration(str, alt);
            if (v !== null) {
                return v;
            }
            // regular, in upper-case
            str = str.toUpperCase();
            v = this._enumInAlteration(str, alt);
            if (v !== null) {
                return v;
            }
            if (/^[0-9]+$/.test(value)) {
                try {
                    return this._enumInAlteration(parseInt(value, 10), alt);
                } catch (e) {
                }
            }
            return null;
        }
        return null;
    }
    // endregion private
    // region types
    any(value: unknown, opt?: TypeOpt): unknown {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'string':
            case 'boolean':
            case 'bigint':
            case 'object':
                return value;
            case 'number':
                return this.checkRealNumber(value, opt);
            case 'function':
                return this.runFn(v => this.any(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_ANY, opt);
    }
    array<T = unknown>(value: unknown, opt?: TypeArrayOpt): Array<T> {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case "string":
            case "boolean":
            case "number":
            case "bigint":
                return this.array([value], opt);
            case 'object':
                if (Array.isArray(value)) {
                    opt = opt ?? {};
                    const result = [] as Array<T>;
                    const valueFn = opt?.children?.value?.fn as TypeFnLambda<T>;
                    if (typeof valueFn !== "function") {
                        result.push(...value);
                    } else {
                        const clonedOpt = {...opt};
                        (value as ArraySome).forEach((v, index) => {
                            clonedOpt.field = opt.field ? `${opt.field}#${index}` : `#${index}`;
                            try {
                                result.push(valueFn(v, clonedOpt));
                            } catch (e) {
                                Exception.cast(e).raise(!opt.silent);
                                result.push(null);
                            }
                        });
                    }
                    return result;
                }
                return this.array([value], opt);
            case 'function':
                return this.runFn<Array<T>>(v => this.array(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_ARRAY, opt);
    }
    boolean(value: unknown, opt?: TypeOpt): boolean {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'boolean':
                return value;
            case 'string':
                value = value.trim().toLowerCase();
                if (value === '') {
                    return null;
                }
                if (this.BOOL_TRUE.includes(value as string)) {
                    return true;
                }
                if (this.BOOL_FALSE.includes(value as string)) {
                    return false;
                }
                // todo
                return this.raiseInvalidValue(value, this._EXPECTED_BOOL, opt);
            case 'number':
                return value > 0;
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.boolean(value[0], opt);
                }
                break;
            case 'function':
                return this.runFn(v => this.boolean(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_BOOL, opt);
    }
    clazz(value: unknown, opt?: TypeOpt): string {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'string':
                value = value.trim();
                if (value === '') {
                    return null;
                }
                return value as string;
            case 'object':
            case 'function':
                return this._lyy.fqnPool.name(value);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_CLASS, opt);
    }
    date(value: unknown, opt?: TypeOpt): Date {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'object':
                if (value instanceof Date) {
                    return value;
                } else if (typeof value['toDate'] === 'function') {
                    return this.date(this.runSave(v => v.toDate(), value, opt), opt);
                }
                if (Array.isArray(value)) {
                    const arr = value as Array<number>;
                    if (arr.length === 1) {
                        return this.date(arr[0], opt);
                    }
                    if (arr.length > 1 && arr.length < 8) {
                        return this.date(this.runSave(v => new Date(v[0], v[1], v[2], v[3], v[4], v[5], v[6]), value, opt), opt);
                    }
                } else if ((value as PairLike).id !== undefined) {
                    return this.date((value as PairLike).id, opt);
                }
                break;
            case 'string':
                if (value.trim() === '') {
                    return null;
                }
                return this.date(this.runSave(v => new Date(v), value.trim(), opt), opt);
            case 'bigint':
                return this.date(this.runSave(v => new Date(Number(v)), value, opt), opt);
            case 'number':
                return this.date(this.runSave(v => new Date(v), value, opt), opt);
            case 'function':
                return this.runFn(v => this.date(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_DATE, opt);
    }
    enumeration<T extends Key = Key>(value: unknown, opt?: TypeEnumOpt<T>): T {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        opt = opt ?? {} as TypeEnumOpt<T>;
        let mapType: 'object'|'array' = null;
        if (this._lyy.is.object(opt.map)) {
            mapType = 'object';
        } else if (this._lyy.is.array(opt.map)) {
            mapType = 'array';
        }
        if (!mapType) {
            throw new DeveloperException('type.invalid-enum-items', {map: opt.map});
        }
        let v: T;
        switch (typeof value) {
            case 'string':
                value = value.trim();
                if (value === '') {
                    return null;
                }
                if (mapType === 'object') {
                    v = this._enumInMap(value as T, opt.map as RecLike<T>);
                } else {
                    v = this._enumInArray(value as T, opt.map as Array<T>);
                }
                if (v !== null) {
                    return v as T;
                }
                if (this._lyy.is.object(opt.alt)) {
                    v = this._enumInAlteration(value as T, opt.alt);
                    if (v !== null) {
                        return v as T;
                    }
                }
                // todo
                return this.raiseInvalidValue(value, this._EXPECTED_ENUM, opt);
            case 'number':
                const num = this.checkRealNumber(value, opt);
                if (num === null) {
                    return null;
                }
                if (mapType === 'object') {
                    v = this._enumInMap(value as T, opt.map as RecLike<T>);
                } else {
                    v = this._enumInArray(value as T, opt.map as Array<T>);
                }
                if (v !== null) {
                    return v as T;
                }
                if (this._lyy.is.object(opt.alt)) {
                    v = this._enumInAlteration(value as T, opt.alt);
                    if (v !== null) {
                        return v as T;
                    }
                }
                // todo
                return this.raiseInvalidValue(value, this._EXPECTED_ENUM, opt);
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.enumeration(value[0], opt);
                }
                return this.enumeration<T>((value as PairLike).id, opt);
            case 'function':
                return this.runFn(v => this.enumeration(v, opt), value, opt);
        }
        // todo
        return this.raiseInvalidValue(value, this._EXPECTED_ENUM, opt);
    }
    float(value: unknown, opt?: TypeOpt): number|null {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'string':
                return this.float(this.runSave(parseFloat, value.trim(), opt), opt);
            case 'number':
                return this.checkRealNumber(value, opt);
            case 'bigint':
                return this.float(this.runSave(Number, value, opt), opt);
            case 'boolean':
                return value ? 1 : 0;
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.float(value[0], opt);
                }
                return this.float((value as PairLike).id, opt);
            case 'function':
                return this.runFn(v => this.float(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_NUMBER, opt);
    }
    func<T = FuncLike>(value: unknown, opt?: TypeOpt): T|null {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case "function":
                return value as unknown as T;
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.func(value[0], opt);
                }
                break;
        }
        return this.raiseInvalidValue(value, ['function'], opt);
    }
    integer(value: unknown, opt?: TypeOpt): number|null {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'string':
                return this.integer(this.runSave(parseFloat, value.trim(), opt), opt);
            case 'number':
                let num = this.checkRealNumber(value, opt);
                if (num !== null && !Number.isInteger(num)) {
                    num = Math.floor(num);
                }
                return num;
            case 'bigint':
                return this.integer(this.runSave(Number, value, opt), opt);
            case 'boolean':
                return value ? 1 : 0;
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.integer(value[0], opt);
                }
                return this.integer((value as PairLike).id, opt);
            case 'function':
                return this.runFn(v => this.integer(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_NUMBER, opt);
    }
    object<T = unknown>(value: unknown, opt?: TypeObjectOpt): RecLike<T> {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'object':
                if (Array.isArray(value)) {
                    if (value.length === 1) {
                        return this.object(value[0], opt);
                    }
                } else {
                    opt = opt ?? {};
                    const keyOpt = {...(opt?.children?.key ?? {}), ...opt} as TypeChildOpt<Key>;
                    if (typeof keyOpt.fn !== 'function') {
                        keyOpt.fn = (k, o) => {
                            if (!this._lyy.is.key(k)) {
                                // todo
                                this.raiseInvalidValue(k, ['string', 'number'], o, {key: k});
                            }
                            return k as Key;
                        }
                    }
                    const valueOpt = {...(opt?.children?.value ?? {}), ...opt} as TypeChildOpt<T>;
                    if (typeof valueOpt.fn !== 'function') {
                        valueOpt.fn = (v) => {
                            return v as T;
                        }
                    }
                    const result = {} as RecLike<T>;
                    for (const [k, v] of Object.entries(value)) {
                        keyOpt.field = opt.field ? `${opt.field}.${k}` : `${k}`;
                        valueOpt.field = opt.field ? `${opt.field}.${k}` : `${k}`;
                        try {
                            result[keyOpt.fn(k, keyOpt)] = valueOpt.fn(v, valueOpt);
                        } catch (e) {
                            Exception.cast(e).raise(!opt.silent);
                            result[k] = null;
                        }
                    }
                    return result;
                }
                break;
            case 'function':
                return this.runFn<RecLike<T>>(v => this.object(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, ['object'], opt);
    }
    string(value: unknown, opt?: TypeOpt): string {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'string':
                return value;
            case 'number':
                const num = this.checkRealNumber(value, opt);
                return num !== null ? num.toString(10) : null;
            case 'bigint':
                return value.toString();
            case 'boolean':
                return value ? 'true' : 'false';
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.string(value[0], opt);
                }
                return this.string((value as PairLike).id, opt);
            case 'function':
                return this.runFn(v => this.string(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_STRING, opt);
    }
    text(value: unknown, opt?: TypeOpt): string {
        if (this._lyy.is.empty(value)) {
            return null;
        }
        switch (typeof value) {
            case 'string':
                const str = value.trim();
                if (str === '') {
                    return null;
                }
                return str;
            case 'number':
                const num = this.checkRealNumber(value, opt);
                return num !== null ? num.toString(10) : null;
            case 'bigint':
                return value.toString();
            case 'boolean':
                return value ? 'true' : 'false';
            case 'object':
                if (Array.isArray(value) && value.length === 1) {
                    return this.text(value[0], opt);
                }
                return this.text((value as PairLike).id, opt);
            case 'function':
                return this.runFn(v => this.text(v, opt), value, opt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_STRING, opt);
    }
    // endregion types
}