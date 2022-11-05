import {
    EmptyValueTypeException,
    InfiniteNumberException,
    InvalidBooleanException,
    InvalidEnumMapException,
    InvalidEnumValueException,
    InvalidLiteralKeysException,
    InvalidValueTypeException,
    NotANumberException
} from "./errors";
import {CorePrimitiveLike, PrimitiveCastLambda} from "./types";

import {$ly} from "../core";
import {ArraySome, FuncLike, ObjectLike, OneOrMore, RecKey, RecLike, TypeOfLike} from "../common";
import {EnumAlteration, EnumMap} from "../enum";
import {ExceptionLike, MultipleException} from "../error";


/**
 * @core
 * */
export class CorePrimitive implements CorePrimitiveLike {
    // region properties
    readonly BOOL_TRUE = ['1', 'true', 't', 'yes', 'y', 'on'];
    readonly BOOL_FALSE = ['0', '-1', 'false', 'f', 'no', 'n', 'off'];
    protected readonly _EXPECTED_ANY = ['string', 'boolean', 'bigint', 'object', 'number', 'array'];
    protected readonly _EXPECTED_ARRAY = ['array'];
    protected readonly _EXPECTED_BOOL = ['boolean', 'string', 'number'];
    protected readonly _EXPECTED_CLASS = ['string', 'function', 'object'];
    protected readonly _EXPECTED_DATE = ['string', 'number', 'date', 'moment'];
    protected readonly _EXPECTED_ENUM = ['string', 'number'];
    protected readonly _EXPECTED_NUMBER = ['string', 'number', 'bigint'];
    protected readonly _EXPECTED_STRING = ['boolean', 'string', 'number'];
    protected readonly _INTEGER_PATTERN = /^\d+$/;
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {

        $ly.addFqn(this);
        // $ly.addTrigger('binder', () => {$ly.binder.bindAll(this)});
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.$bindInstance(this);
    }
    static {
        $ly.addDependency('primitive', () => new CorePrimitive());
    }

    // region utility
    check<T = unknown>(target: FuncLike | ObjectLike, field: string, given: unknown, fn: PrimitiveCastLambda<T>, params?: RecLike, args?: ArraySome): T {
        args = Array.isArray(args) ? args : [];
        let value: T;
        try {
            value = fn(given, ...args);
        } catch (e) {
            if ($ly.error) {
                throw $ly.error.build(e)
                    .with(target ?? this)
                    .field(field)
                    .patch({...(params ?? {}), value: given});
            } else {
                throw e;
            }
        }
        return value;
    }
    checkRealNumber(value: number): number {
        if (isNaN(value)) {
            throw new NotANumberException(value).with(this);
        }
        if (!isFinite(value)) {
            throw new InfiniteNumberException(value).with(this);
        }
        return value;
    }

    runFn<T = unknown>(fn: FuncLike, value: FuncLike): T {
        return fn(value()) as T;
    }

    raiseInvalidValue<T = unknown>(value: unknown, expected: OneOrMore<string>, params?: RecLike): T {
        throw new InvalidValueTypeException(value, expected, params).with(this);
    }
    raiseEmptyValue<T = unknown>(typeOf: string): T {
        throw new EmptyValueTypeException(undefined, typeOf).with(this);
    }

    // endregion utility
    // region private
    protected _enumInMap<T extends RecKey = RecKey>(value: unknown, map: EnumMap<T>): T {
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
            if ($ly.filled(v)) {
                return v;
            }
            // regular, in upper-case
            str = str.toUpperCase();
            v = this._enumInMap(str, map);
            if ($ly.filled(v)) {
                return v;
            }
            if (this._INTEGER_PATTERN.test(value)) {
                try {
                    return this._enumInMap(parseInt(value, 10), map);
                } catch (e) {
                }
            }
            return undefined;
        }
        return undefined;
    }

    protected _enumInArray<E extends RecKey = RecKey>(value: unknown, arr: Array<E>): E {
        // regular, in values
        if (arr.includes(value as E)) {
            return value as E;
        }
        if (typeof value === 'string') {
            // regular, in lower-case
            let str = value.toLowerCase();
            let v = this._enumInArray(str, arr);
            if ($ly.filled(v)) {
                return v;
            }
            // regular, in upper-case
            str = str.toUpperCase();
            v = this._enumInArray(str, arr);
            if ($ly.filled(v)) {
                return v;
            }
            if (this._INTEGER_PATTERN.test(value)) {
                try {
                    return this._enumInArray(parseInt(value, 10), arr);
                } catch (e) {
                }
            }
            return undefined;
        }
        return undefined;
    }

    // noinspection JSMethodCanBeStatic
    protected _enumInAlteration<E extends RecKey = RecKey>(value: unknown, alt: EnumAlteration<E>): E {
        // ir-regular, in keys
        if (Object.keys(alt).includes(value as string)) {
            return alt[value as string];
        }
        if (typeof value === 'string') {
            // regular, in lower-case
            let str = value.toLowerCase();
            let v = this._enumInAlteration(str, alt);
            if ($ly.filled(v)) {
                return v;
            }
            // regular, in upper-case
            str = str.toUpperCase();
            v = this._enumInAlteration(str, alt);
            if ($ly.filled(v)) {
                return v;
            }
            if (this._INTEGER_PATTERN.test(value)) {
                try {
                    return this._enumInAlteration(parseInt(value, 10), alt);
                } catch (e) {
                }
            }
            return undefined;
        }
        return undefined;
    }
    protected _literal<T = string>(value: unknown, keys: Array<T>): T | undefined {
        if ($ly.not(value)) {
            return undefined;
        }
        switch (typeof value) {
            case "number":
                if (keys.includes(value as unknown as T)) {
                    return value as unknown as T;
                }
                break;
            case "string":
                let str = value as unknown as T;
                if (keys.includes(str as T)) {
                    return str;
                }
                str = value.toLowerCase() as unknown as T;
                if (keys.includes(str as T)) {
                    return str;
                }
                str = value.toUpperCase() as unknown as T;
                if (keys.includes(str as T)) {
                    return str;
                }
                break;
            case "function":
                return this.literal(value(), keys);
        }
        return undefined;
    }

    // endregion private
    // region types
    any(value: unknown): unknown | undefined {
        if ($ly.not(value)) {
            return value;
        }
        switch (typeof value) {
            case 'string':
            case 'boolean':
            case 'bigint':
                break;
            case 'object':
                return this.value(value);
            case 'number':
                return this.checkRealNumber(value);
            case 'function':
                return this.any(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_ANY);
    }
    anyFilled(value: unknown): unknown | undefined {
        value = this.any(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('any');
        }
        return value;
    }

    array<V = unknown>(value: unknown | Array<V>, fn?: PrimitiveCastLambda<V>, ...a: ArraySome): Array<V> | undefined {
        if ($ly.not(value)) {
            return value as Array<V>;
        }
        switch (typeof value) {
            case "string":
            case "boolean":
            case "number":
            case "bigint":
                return this.array([value], fn, ...a);
            case 'object':
                if (value instanceof Set) {
                    value = Array.from(value.values());
                }
                if (Array.isArray(value)) {
                    if (typeof fn !== "function") {
                        return value as Array<V>;
                    }
                    const errors = [] as Array<ExceptionLike>;
                    const arr = [] as Array<V>;
                    (value as Array<V>).forEach((item, index) => {
                        try {
                            arr.push(fn(item, ...a));
                        } catch (e) {
                            MultipleException.append(errors, `#${index}`, e);
                        }
                    });
                    if (errors.length > 0) {
                        MultipleException.throwAll(errors);
                    }
                    return arr;
                }
                break;
            case 'function':
                return this.array(value(), fn, ...a);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_ARRAY);
    }
    arrayFilled<T = unknown>(value: unknown | Array<T>, fn?: PrimitiveCastLambda<T>, ...a: ArraySome): Array<T> | undefined {
        value = this.array(value, fn, ...a);
        if ($ly.not(value)) {
            this.raiseEmptyValue('array');
        }
        return value as Array<T>;
    }
    boolean(value: unknown): boolean | undefined {
        if ($ly.not(value)) {
            return value as boolean;
        }
        switch (typeof value) {
            case 'boolean':
                return value;
            case 'string':
                value = value.trim().toLowerCase();
                if (value === '') {
                    return undefined;
                }
                if (this.BOOL_TRUE.includes(value as string)) {
                    return true;
                }
                if (this.BOOL_FALSE.includes(value as string)) {
                    return false;
                }
                throw new InvalidBooleanException(value).with(this);
            case 'number':
                return value > 0;
            case 'function':
                return this.boolean(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_BOOL);
    }
    booleanFilled(value: unknown): boolean | undefined {
        value = this.boolean(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('boolean');
        }
        return value as boolean;
    }
    clazz(value: unknown): string | undefined {
        if ($ly.not(value)) {
            return value as string;
        }
        switch (typeof value) {
            case 'string':
                value = value.trim();
                if (value === '') {
                    return undefined;
                }
                return value as string;
            case 'object':
            case 'function':
                if ($ly.fqn?.is(value)) {
                    return $ly.fqn.get(value);
                }
                return (typeof value === 'function') ? value?.name : value?.constructor?.name;
        }
        return this.raiseInvalidValue(value, this._EXPECTED_CLASS);
    }
    cccFilled(value: unknown): string | undefined {
        value = this.clazz(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('clazz');
        }
        return value as string;
    }
    date(value: unknown): Date | undefined {
        if ($ly.not(value)) {
            return value as Date;
        }
        switch (typeof value) {
            case 'object':
                if (value instanceof Date) {
                    return value;
                } else if (typeof value['toDate'] === 'function') {
                    return this.date(value['toDate']());
                }
                if (Array.isArray(value)) {
                    const arr = value as Array<number>;
                    if (arr.length > 1 && arr.length < 8 && arr.every(item => typeof item === 'number')) {
                        return this.date(new Date(value[0], value[1], value[2], value[3], value[4], value[5], value[6]));
                    }
                }
                break;
            case 'string':
                if (value.trim() === '') {
                    return undefined;
                }
                return this.date(new Date(value));
            case 'bigint':
                return this.date(new Date(Number(value)));
            case 'number':
                return this.date(new Date(value));
            case 'function':
                return this.date(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_DATE);
    }
    dateFilled(value: unknown): Date | undefined {
        value = this.date(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('date');
        }
        return value as Date;
    }
    enum<E extends RecKey = RecKey>(value: unknown | E, map: EnumMap<E>, alt?: EnumAlteration<E>): E | undefined {
        if ($ly.not(value)) {
            return value as E;
        }
        let mapType: 'object' | 'array' = undefined;
        if (this.isObject(map)) {
            mapType = 'object';
        } else if (this.isArray(map)) {
            mapType = 'array';
        }
        if (!mapType) {
            throw new InvalidEnumMapException(undefined, map, typeof map);
        }
        let v: E;
        switch (typeof value) {
            case 'string':
                value = value.trim();
                if (value === '') {
                    return undefined;
                }
                if (mapType === 'object') {
                    v = this._enumInMap(value as E, map);
                } else {
                    v = this._enumInArray(value as E, map as unknown as Array<E>);
                }
                if ($ly.filled(v)) {
                    return v as E;
                }
                if (alt && this.isObject(alt)) {
                    v = this._enumInAlteration(value as E, alt);
                    if ($ly.filled(v)) {
                        return v as E;
                    }
                }
                throw new InvalidEnumValueException(undefined, $ly.fqn.get(map), value, 'string').with(this);
            case 'number':
                const num = this.checkRealNumber(value);
                if ($ly.not(num)) {
                    return num as E;
                }
                if (mapType === 'object') {
                    v = this._enumInMap(value as E, map);
                } else {
                    v = this._enumInArray(value as E, map as unknown as Array<E>);
                }
                if ($ly.filled(v)) {
                    return v as E;
                }
                if (map && this.isObject(alt)) {
                    v = this._enumInAlteration(value as E, alt);
                    if ($ly.filled(v)) {
                        return v as E;
                    }
                }
                throw new InvalidEnumValueException(undefined, $ly.fqn.get(map), value, 'number').with(this);
            case 'function':
                return this.enum(value(), map, alt);
        }
        return this.raiseInvalidValue(value, this._EXPECTED_ENUM);
    }
    enumFilled<E extends RecKey = RecKey>(value: unknown | E, map: EnumMap<E>, alt?: EnumAlteration<E>): E | undefined {
        value = this.enum(value, map, alt);
        if ($ly.not(value)) {
            this.raiseEmptyValue('enum');
        }
        return value as E;
    }

    float(value: unknown): number | undefined {
        if ($ly.not(value)) {
            return value as number;
        }
        switch (typeof value) {
            case 'string':
                return this.float(parseFloat(value.trim()));
            case 'number':
                return this.checkRealNumber(value);
            case 'bigint':
                return this.float(Number(value));
            case 'boolean':
                return value ? 1 : 0;
            case 'function':
                return this.float(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_NUMBER);
    }
    floatFilled(value: unknown): number | undefined {
        value = this.float(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('float');
        }
        return value as number;
    }
    func<F extends FuncLike = FuncLike>(value: unknown): F | undefined {
        if ($ly.not(value)) {
            return value as F;
        }
        if (typeof value === 'function') {
            return value as unknown as F;
        }
        return this.raiseInvalidValue(value, ['function']);
    }
    funcFilled<F extends FuncLike = FuncLike>(value: unknown | F): F | undefined {
        value = this.func(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('function');
        }
        return value as F;
    }
    integer(value: unknown): number | undefined {
        if ($ly.not(value)) {
            return value as number;
        }
        switch (typeof value) {
            case 'string':
                return this.integer(parseFloat(value.trim()));
            case 'number':
                let num = this.checkRealNumber(value);
                if ($ly.filled(num) && !Number.isInteger(num)) {
                    num = Math.floor(num);
                }
                return num;
            case 'bigint':
                return this.integer(Number(value));
            case 'boolean':
                return value ? 1 : 0;
            case 'function':
                return this.integer(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_NUMBER);
    }
    integerFilled(value: unknown): number | undefined {
        value = this.integer(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('integer');
        }
        return value as number;
    }
    value(value: unknown): unknown {
        return $ly.json.check(value, 100);
    }
    valueFilled(value: unknown): unknown {
        value = this.value(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('value');
        }
        return value;
    }
    object<V = unknown>(value: unknown | RecLike, fn?: PrimitiveCastLambda<V>, ...a: ArraySome): RecLike<V> | undefined {
        if ($ly.not(value)) {
            return value as RecLike<V>;
        }
        switch (typeof value) {
            case 'object':
                if (value instanceof Map) {
                    const obj = {};
                    for (const [k, v] of value.entries()) {
                        obj[k] = v;
                    }
                    value = obj;
                }
                if (!Array.isArray(value)) {
                    if (typeof fn !== "function" || value.constructor.name !== 'Object') {
                        return value as RecLike<V>;
                    }
                    const errors = [] as Array<ExceptionLike>;
                    const obj = {} as RecLike<V>;
                    for (const [k, v] of Object.entries(value)) {
                        try {
                            obj[k] = fn(v, ...a);
                        } catch (e) {
                            MultipleException.append(errors, k, e);
                        }
                    }
                    if (errors.length > 0) {
                        MultipleException.throwAll(errors);
                    }
                    return obj;
                }
                break;
            case 'function':
                return this.object(value(), fn, ...a);
        }
        return this.raiseInvalidValue(value, ['object']);
    }
    objectFilled<V = unknown>(value: unknown | RecLike, fn?: PrimitiveCastLambda<V>, ...a: ArraySome): RecLike<V> | undefined {
        value = this.object(value, fn, ...a);
        if ($ly.not(value)) {
            this.raiseEmptyValue('object');
        }
        return value as RecLike<V>;
    }
    string(value: unknown): string | undefined {
        if ($ly.not(value)) {
            return value as string;
        }
        switch (typeof value) {
            case 'string':
                return value;
            case 'number':
                const num = this.checkRealNumber(value);
                return $ly.filled(num) ? num.toString(10) : num as unknown as string;
            case 'bigint':
                return value.toString();
            case 'boolean':
                return value ? 'true' : 'false';
            case 'function':
                return this.string(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_STRING);
    }
    stringFilled(value: unknown): string | undefined {
        value = this.string(value);
        if ($ly.not(value) || (value as string).trim() === '') {
            this.raiseEmptyValue('string');
        }
        return value as string;
    }

    literal<T = string>(value: unknown, keys: Array<T>, alt?: RecLike<T>): T | undefined {
        if ($ly.not(value)) {
            return value as T;
        }
        if (!this.isArrayFilled(keys)) {
            throw new InvalidLiteralKeysException(undefined, {value});
        }
        const found = this._literal(value, keys);
        if (found !== undefined || !this.isObjectFilled(alt)) {
            return found;
        }
        const key = this._literal(value, Object.keys(alt));
        if (key) {
            return this.literal(alt[key], keys);
        }
        return this.raiseInvalidValue(value, keys as unknown as Array<string>);
    }
    literalFilled<T = string>(value: unknown, keys: Array<T>, alt?: RecLike<T>): T | undefined {
        value = this.literal(value, keys, alt);
        if ($ly.not(value)) {
            this.raiseEmptyValue('literal');
        }
        return value as T;
    }

    text(value: unknown): string | undefined {
        if ($ly.not(value)) {
            return value as string;
        }
        switch (typeof value) {
            case 'string':
                const str = value.trim();
                if (str === '') {
                    return undefined;
                }
                return str;
            case 'number':
                const num = this.checkRealNumber(value);
                return $ly.filled(num) ? num.toString(10) : num as unknown as string;
            case 'bigint':
                return value.toString();
            case 'boolean':
                return value ? 'true' : 'false';
            case 'function':
                return this.text(value());
        }
        return this.raiseInvalidValue(value, this._EXPECTED_STRING);
    }
    textFilled(value: unknown): string | undefined {
        value = this.text(value);
        if ($ly.not(value)) {
            this.raiseEmptyValue('text');
        }
        return value as string;
    }
    // endregion types

    // region is
    isEmpty(value: unknown): boolean {
        return $ly.not(value);
    }

    isPrimitive(value: unknown): boolean {
        return ['string', 'number', 'bigint', 'boolean'].includes(typeof value);
    }

    isValue(value: unknown): boolean {
        return $ly.filled(value) && ['string', 'number', 'bigint', 'boolean', 'object', 'function'].includes(typeof value);
    }

    isKey(value: unknown): boolean {
        return $ly.filled(value) && ['string', 'number'].includes(typeof value);
    }

    typeOf(value: unknown, ...types: Array<TypeOfLike>): boolean {
        if (types.length < 1) {
            types.push('undefined');
        }
        if ($ly.not(value) && types.includes('undefined')) {
            return true;
        }
        return types.includes(typeof value);
    }

    instanceOf(value: unknown, ...classes: Array<FuncLike>): boolean {
        if (!value || typeof value !== 'object') {
            return false;
        }
        return classes.some(clazz => (value instanceof clazz));
    }
    isIterable(value: unknown): boolean {
        return this.isObject(value) && (typeof value[Symbol.iterator] === 'function');
    }

    isObject(value: unknown): boolean {
        return value && typeof value === 'object' && !Array.isArray(value);
    }
    isObjectFilled(value: unknown): boolean {
        return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
    }

    isArray(value: unknown): boolean {
        return (value && typeof value === 'object' && Array.isArray(value));
    }
    isArrayFilled(value: unknown): boolean {
        return value && typeof value === 'object' && Array.isArray(value) && (value as ArraySome).length > 0;
    }
    isLiteral<T = string>(value: unknown, ...keys: Array<T>): boolean {
        if ($ly.not(value)) {
            return false;
        }
        return (['string', 'number'].includes(typeof value) && keys.includes(value as T));
    }

    isFunc(value: unknown): boolean {
        return typeof value === 'function';
    }

    isFloat(value: unknown): boolean {
        return this.isNumber(value);
    }
    isFloatStrict(value: unknown): boolean {
        return this.isNumber(value) && !Number.isInteger(value);
    }

    isNumber(value: unknown): boolean {
        return (typeof value === 'number') && !isNaN(value) && isFinite(value);
    }
    isNumberAny(value: unknown): boolean {
        return (typeof value === 'number');
    }

    isInteger(value: unknown): boolean {
        return this.isNumber(value);
    }
    isIntegerStrict(value: unknown): boolean {
        return this.isNumber(value) && Number.isInteger(value);
    }

    isString(value: unknown): boolean {
        return typeof value === 'string';
    }

    isText(value: unknown): boolean {
        return this.isString(value) && (value as string).trim() !== '';
    }

    canBeClass(value: unknown): boolean {
        return this.isText(value) || this.isFunc(value) || this.isObject(value);
    }

    isBoolean(value: unknown): boolean {
        return (typeof value === 'boolean') || this.isTrue(value);
    }
    isBooleanStrict(value: unknown): boolean {
        return (typeof value === 'boolean');
    }

    isTrue(value: unknown): boolean {
        return (value === true) || (this.isText(value) && $ly.primitive.BOOL_TRUE.includes((value as string).toLowerCase())) || (this.isNumber(value) && value > 0);
    }

    isFalse(value: unknown): boolean {
        return (value === false) || (this.isText(value) && $ly.primitive.BOOL_FALSE.includes((value as string).toLowerCase())) || (this.isNumber(value) && value <= 0);
    }
    isPromise<T = any>(value: any): value is Promise<T> {
        return this.isObject(value) && typeof value.then === 'function';
    }
    // endregion is
}
