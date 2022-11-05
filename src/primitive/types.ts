import {EnumAlteration, EnumMap} from "../enum";
import {ArraySome, FuncLike, ObjectLike, OneOrMore, RecKey, RecLike, TypeOfLike} from "../common";

export type PrimitiveCastLambda<T = unknown> = (...a: ArraySome) => T;

export type PrimitiveIsLambda = PrimitiveCastLambda<boolean>;
export interface PrimitiveCheck {
    is?: RecLike<PrimitiveIsLambda>;
    args?: ArraySome;
    params?: RecLike;
}
export interface CorePrimitiveLike {
    // region properties
    BOOL_TRUE: Array<string>;
    BOOL_FALSE: Array<string>;

    // endregion properties

    // region utility
    check<T = unknown>(target: FuncLike | ObjectLike, field: string, value: unknown, fn: PrimitiveCastLambda<T>, params?: RecLike, args?: ArraySome): T;
    checkRealNumber(value: number): number;

    runFn<T = unknown>(fn: FuncLike, value: FuncLike): T;

    raiseInvalidValue<T = unknown>(value: unknown, expected: OneOrMore<string>, params?: RecLike): T;
    raiseEmptyValue<T = unknown>(typeOf: string): T;

    // endregion utility

    // region types
    any(value: unknown): unknown | undefined;
    anyFilled(value: unknown): unknown | undefined;

    array<T = unknown>(value: unknown | Array<T>, fn?: PrimitiveCastLambda<T>, ...a: ArraySome): Array<T> | undefined;
    arrayFilled<T = unknown>(value: unknown | Array<T>, fn?: PrimitiveCastLambda<T>, ...a: ArraySome): Array<T> | undefined;

    boolean(value: unknown): boolean | undefined;
    booleanFilled(value: unknown): boolean | undefined;

    clazz(value: unknown): string | undefined;
    cccFilled(value: unknown): string | undefined;

    date(value: unknown): Date | undefined;
    dateFilled(value: unknown): Date | undefined;

    enum<E extends RecKey = RecKey>(value: unknown | E, map: EnumMap<E>, alt?: EnumAlteration<E>): E | undefined;
    enumFilled<E extends RecKey = RecKey>(value: unknown | E, map: EnumMap<E>, alt?: EnumAlteration<E>): E | undefined;

    float(value: unknown): number | undefined;
    floatFilled(value: unknown): number | undefined;

    func<F extends FuncLike = FuncLike>(value: unknown | F): F | undefined;
    funcFilled<F extends FuncLike = FuncLike>(value: unknown | F): F | undefined;

    integer(value: unknown): number | undefined;
    integerFilled(value: unknown): number | undefined;
    value(value: unknown): unknown;
    valueFilled(value: unknown): unknown;

    object<V = unknown>(value: unknown | RecLike, fn?: PrimitiveCastLambda<V>, ...a: ArraySome): RecLike<V> | undefined;
    objectFilled<V = unknown>(value: unknown | RecLike, fn?: PrimitiveCastLambda<V>, ...a: ArraySome): RecLike<V> | undefined;

    string(value: unknown): string | undefined;
    stringFilled(value: unknown): string | undefined;

    text(value: unknown): string | undefined;
    textFilled(value: unknown): string | undefined;

    literal<T = string>(value: unknown, keys: Array<T>, alt?: RecLike<T>): T | undefined;
    literalFilled<T = string>(value: unknown, keys: Array<T>, alt?: RecLike<T>): T | undefined;

    // endregion types

    // region is
    isEmpty(value: unknown): boolean;

    isPrimitive(value: unknown): boolean;

    isValue(value: unknown): boolean;

    isKey(value: unknown): boolean;

    typeOf(value: unknown, ...types: Array<TypeOfLike>): boolean;

    instanceOf(value: unknown, ...classes: Array<FuncLike>): boolean;
    isIterable(value: unknown): boolean;

    isObject(value: unknown): boolean;
    isObjectFilled(value: unknown): boolean;

    isArray(value: unknown): boolean;
    isArrayFilled(value: unknown): boolean;

    isLiteral<T = string>(value: unknown, ...keys: Array<T>): boolean;


    isFunc(value: unknown): boolean;

    isFloat(value: unknown): boolean;
    isFloatStrict(value: unknown): boolean;

    isNumber(value: unknown): boolean;
    isNumberAny(value: unknown): boolean;

    isInteger(value: unknown): boolean;
    isIntegerStrict(value: unknown): boolean;

    isString(value: unknown): boolean;

    isText(value: unknown): boolean;

    canBeClass(value: unknown): boolean;

    isBoolean(value: unknown): boolean;
    isBooleanStrict(value: unknown): boolean;

    isTrue(value: unknown): boolean;

    isFalse(value: unknown): boolean;
    isPromise<T = any>(value: any): value is Promise<T>;
    // endregion is

}