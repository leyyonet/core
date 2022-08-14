// noinspection JSUnusedGlobalSymbols

import {
    ArraySome,
    ClassLike,
    ClassOrName,
    Func0,
    FuncLike,
    FuncN,
    FuncOrName,
    Key,
    ObjectLike,
    OneOrMore,
    RecLike
} from "./index-aliases";
import {Environment, ProcessorKey, Severity} from "./index-enums";


// region component
export interface CoreComponentLike extends CoreBaseLike {
    add(given: string): void;
    get items(): Array<string>;
}
// endregion component
// region core
export interface CoreBaseLike {
    ly_init(): void;
}
export interface CoreLike {
    ly_log(clazz: ClassOrName): LoggerLike;
    ly_array<V = unknown>(ins: RepoClassKey, member: string): Array<V>;
    ly_map<K = unknown, V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Map<K, V>;
    ly_repoLoaded(): void;
    initialize();
    get LOG(): LoggerLike;
    opt(opt?: RecLike): CoreOptionLike;
    get logger(): LoggerRepoLike;
    get repo(): CoreRepoLike;
    get component(): CoreComponentLike;
    get enumeration(): CoreEnumerationLike;
    get event(): CoreEventLike;
    get exception(): ExceptionImplLike;
    get fqnPool(): FqnPoolLike;
    get hook(): HookLike;
    get processor(): CoreProcessorLike;
    get system(): CoreSystemLike;
    get variable(): CoreVariableLike;
    get is(): CoreIsLike;
    get primitive(): CorePrimitiveLike;
    get decoPool(): CoreDecoLike;
}
// endregion core
// region deco
export interface CoreDecoSetValue {
    set(value: RecLike): unknown;
}
export interface CoreDecoResponse {
    fork(...descriptors: Array<unknown>): CoreDecoSetValue;
}
export interface CoreDecoIdentifier {
    identify(fn: FuncLike, config: RecLike): CoreDecoResponse;
}
export interface CoreDecoItem {
    fn?: FuncLike;
    single?: string;
    options: RecLike;
    target: unknown
    propertyKey?: string;
    index?: number;
    value: RecLike;
}
export interface CoreDecoLike extends CoreBaseLike {
    add(fn: FuncLike, opt: CoreDecoItem): void;
    set(identifier: CoreDecoIdentifier): void;
}
// endregion deco
// region enumeration
export interface CoreEnumerationLike extends CoreBaseLike {
    get items(): Array<RecLike>;
    get names(): Array<string>;
    add(name: string, obj: RecLike, ...prefixes: Array<string>): void;
}
// endregion enumeration
// region exception
export type ExceptionSignature = RecLike;
export type ExceptionSenderLambda = (err: ExceptionLike) => boolean;
export type ExceptionI18nLambda = (err: ExceptionLike) => boolean;
export type ExceptionToObjectLambda = (err: ExceptionLike, ...omittedFields: Array<string>) => RecLike;
export type ExceptionExportLambda = (err: ExceptionLike, data: RecLike) => RecLike;
export type ExceptionActionLambda = (err: ExceptionLike) => void;
export interface ExceptionStackLine {
    file?: string;
    method?: string;
    line?: number;
    column?: number;
    // arguments?: Array<unknown>;
}
export interface ExceptionParamsAppend extends RecLike {
    indicator?: string;
}
export interface ExceptionLike extends Error {
    get params(): RecLike;
    setName(name: string): this;
    causedBy(e: Error|string): this;
    with(classOrName: ClassOrName): this;
    appendParams(params: ExceptionParamsAppend, ignoreExisting?: boolean): this;
    log(req?: unknown): this;
    raise(throwable?: boolean, req?: unknown): this;
    copyStack(e: Error): void;
    hasSign(key: string): boolean;
    getSign(): Array<string>;
    addSign(...keys: Array<string>): boolean;
    removeSign(...keys: Array<string>): boolean;
    toObject(...omittedFields: Array<string>): RecLike;
    toJSON(): RecLike;
}
export interface ExceptionImplLike extends CoreBaseLike {
    get name(): Array<string>;
    get items(): Array<FuncLike>;
    add(err: FuncLike): void;
    build(e: Error | string): ExceptionLike;
    initSign(err: Error): boolean;
    addSign(err: Error, ...keys: Array<string>): boolean;
    getSign(err: Error): Array<string>;
    removeSign(err: Error, ...keys: Array<string>): boolean;
    hasSign(err: Error, key: string): boolean;
    toObject(e: Error, ...omittedFields: Array<string>): RecLike;
    buildStack(e: Error): void;
    checkStatus(clazz: ClassLike|ObjectLike, value: unknown, throwable?: boolean): number;

    initOmit(err: Error): boolean;
    addOmit(err: Error, ...properties: Array<string>): boolean;
    getOmit(err: Error): Array<string>;
}
// endregion exception
// region event
export interface CoreEventLike extends NodeJS.EventEmitter, CoreBaseLike {
    publish(event: string, ...params: Array<unknown>): void;
    subscribe(event: string, fn: FuncN): void;
    subscribeOnce(event: string, fn: FuncN): void;
    unsubscribe(event: string, fn: FuncN): void;
    unsubscribeAll(event: string): void;
}
// endregion event
// region hook
export type HookTrigger = (fn: FuncLike) => void;
export interface HookLike extends CoreBaseLike {
    get(name: string, silent?: boolean): FuncLike;
    has(name: string): boolean;
    add(name: string, fn: FuncLike);
    update(name: string, fn: FuncLike): boolean;
    remove(name: string): boolean;
    addTrigger(name: string, trigger: HookTrigger, tag?: string): void;
    clearTriggers(name: string): boolean;
    clearTrigger(name: string, tag: string): boolean;

    run<T = unknown>(name: string, ...args: Array<unknown>): T;
    runOrIgnore<T = unknown>(name: string, ...args: Array<unknown>): T;
    runAsync<T = unknown>(name: string, ...args: Array<unknown>): Promise<T>;
    runOrIgnoreAsync<T = unknown>(name: string, ...args: Array<unknown>): Promise<T>;
}
// endregion hook
// region logger
export interface LogBasic {
    severity: Severity;
    message: string|Error;
    params?: RecLike;
    holder?: ClassOrName;
    time?: Date;
    count?: number;
    id?: number;
}
export interface LoggerColor {
    enabled?: boolean;
    sign?: string;
    holders?: Array<string>;
    ID?: Array<number>|string; // id color
    SC?: Array<number>|string; // sign color
    HC?: Array<number>|string; // holder color
    MC?: Array<number>|string; // message color
    EC?: Array<number>|string; // extension color
    KC?: Array<number>|string; // key color
    VC?: Array<number>|string; // value color
}
export type LoggerAnyColor = string | Array<number> | LoggerRgb;
export interface LoggerLike {
    native(error: Error, indicator: string, params?: unknown): void;
    error: LoggerErrorLambda; // Instance._log(Severity.ERROR, error, params, this._holder);
    warn: LoggerMixLambda; // Instance._log(Severity.WARN, message, params, this._holder);
    info: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
    log: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
    trace: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
    debug: LoggerLogLambda; // Instance._log(Severity.INFO, message, params, this._holder);
}
export interface LoggerRepoLike extends CoreBaseLike {
    ly_post(): void;
    assign(classOrName: ClassOrName): LoggerLike;
    listenAdd(log: LogBasic): void;
    clearHolders(): void;
    addHolder(severities: OneOrMore<Severity>, ...holders: Array<ClassOrName>): void;
}

export type LoggerErrorLambda = (error: Error, params?: unknown) => void;
export type LoggerMixLambda = (messageOrError: string|Error, params?: unknown) => void;
export type LoggerLogLambda = (message: string, params?: unknown) => void;

export interface LoggerRgb {
    red: number;
    green: number;
    blue: number;
}
export type LoggerSenderLambda = (line: LogBasic, req: unknown) => boolean;
export type LoggerGrabberLambda = (req: unknown, custom: RecLike) => RecLike;
export type LoggerRequestLambda = (req: unknown) => RecLike;
export type LoggerPrintLambda = (info: RecLike, data: RecLike) => void;
// endregion logger
// region option
export interface CoreOptionLike {
    add(key: string, value: unknown): this;
    holder(classOrName: ClassOrName): this;
    indicator(value: string): this;
    file(file: string): this;
    key(key: ClassOrName): this;
    req(req: unknown): this;
    severity(severity: Severity): this;
    type(type: string): this;
    typeOf(value: unknown): this;
    fn(fn: FuncOrName): this;
    val(value: unknown): this;
    merge(opt: RecLike): this;
    get ok(): RecLike;
}
// endregion option
// region is
export interface CoreIsLike extends CoreBaseLike {
    empty(value: unknown): boolean;
    primitive(value: unknown): boolean;
    value(value: unknown): boolean;
    key(value: unknown): boolean;
    object(value: unknown, filled?: boolean): boolean;
    array(value: unknown, filled?: boolean): boolean;
    func(value: unknown): boolean;
    float(value: unknown): boolean;
    number(value: unknown): boolean;
    integer(value: unknown): boolean;
    string(value: unknown): boolean;
    text(value: unknown): boolean;
    clazz(value: unknown): boolean;
    boolean(value: unknown, strict?: boolean): boolean;
    boolTrue(value: unknown): boolean;
    boolFalse(value: unknown): boolean;
}
// endregion is
// region primitive
export interface CorePrimitiveLike extends CoreBaseLike {
    // region properties
    BOOL_TRUE: Array<string>;
    BOOL_FALSE: Array<string>;
    // endregion properties
    // region utility
    checkRealNumber(value: number, opt?: TypeOpt): number;
    runFn<T = unknown>(fn: FuncLike, value: FuncLike, opt?: TypeOpt): T;
    runSave<T = unknown>(fn: FuncLike, value: unknown, opt?: TypeOpt): T;
    raiseInvalidValue<T = unknown>(value: unknown, expected: OneOrMore<string>, opt?: TypeOpt, params?: RecLike): T;
    // endregion utility

    // region types
    any(value: unknown, opt?: TypeOpt): unknown;
    array<T = ArraySome>(value: unknown|T, opt?: ArrayTypeOpt): T;
    boolean(value: unknown, opt?: TypeOpt): boolean;
    clazz(value: unknown, opt?: TypeOpt): string;
    date(value: unknown, opt?: TypeOpt): Date;
    enumeration<T extends Key = Key>(value: unknown, opt?: TypeEnumOpt<T>): T;
    float(value: unknown, opt?: TypeOpt): number|null;
    func<T = FuncLike>(value: unknown, opt?: TypeOpt): T|null;
    integer(value: unknown, opt?: TypeOpt): number|null;
    object<T = ObjectLike>(value: unknown|T, opt?: ObjectTypeOpt): T;
    string(value: unknown, opt?: TypeOpt): string;
    text(value: unknown, opt?: TypeOpt): string;
    // endregion types

}
// endregion primitive

// region processor
export interface ProcessResult {
    success: number;
    error: number;
}
export interface ProcessorItem {
    fn: FuncLike;
    descriptions: Array<string>;
}
export interface CoreProcessorLike extends CoreBaseLike {
    get items(): Map<ProcessorKey, Array<ProcessorItem>>;
    add(level: ProcessorKey, fn: FuncLike, ...descriptions: Array<string>): void;
    run(level: ProcessorKey, breakError?: boolean): ProcessResult;
}
// endregion processor
// region repo
export interface RepoValuePool {
    ins: RepoClassKey;
    member: string;
    type: RepoValueType;
    values: Array<unknown>|Map<unknown, unknown>|Set<unknown>;
}
export type RepoValueType = 'map'|'array'|'set';
export type RepoCreatorLambda<R> = Func0<R>;
export interface RepoValueItem<T> {
    type: RepoValueType,
    value: T;
}
export type RepoMemberMap<T = unknown> = Map<string, RepoValueItem<T>>;
export type RepoClassKey = ObjectLike|FuncLike;
export type RepoClassMap = Map<RepoClassKey, RepoMemberMap>;

export interface CoreRepoLike extends CoreBaseLike {
    whichType(ins: RepoClassKey, member: string): RepoValueType;
    get sizes(): RecLike<RecLike<number>>;
    get keysOfMap(): RecLike<Array<string>>;
    get sizeOfMap(): RecLike<RecLike<number>>;
    newMap<K = unknown, V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Map<K, V>;
    getMap<K = unknown, V = unknown>(ins: RepoClassKey, member: string, required?: boolean): Map<K, V>;
    clearMap(ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean;
    get keysOfArray(): RecLike<Array<string>>;
    get sizeOfArray(): RecLike<RecLike<number>>;
    newArray<V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Array<V>;
    getArray<V = unknown>(ins: RepoClassKey, member: string, required?: boolean): Array<V>;
    clearArray(ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean;
    get keysOfSet(): RecLike<Array<string>>;
    get sizeOfSet(): RecLike<RecLike<number>>;
    newSet<V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Set<V>;
    getSet<V = unknown>(ins: RepoClassKey, member: string, required?: boolean): Set<V>;
    clearSet(ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean;
}
// endregion repo
// region system
export type CoreSystemStatusLambda<T = RecLike> = (status: CoreSystemStatus<T>) => RecLike;
export type CoreSystemStatus<T = RecLike> = RecLike;
export type IpMap = RecLike<Array<string>>;
export interface CoreSystemLike extends CoreBaseLike {
    get id(): number;
    get inc(): number;
    get startTime(): Date;
    get timeDiff(): RecLike<number>;
    get uptime(): number;
    get offset(): number;
    get ipMap(): IpMap;
    get ipAddress(): string;
    get host(): string;
    get pwd(): string;
    get npmPackage(): string;
    get npmPackageVersion(): string;
    get environment(): Environment;
    get isProd(): boolean;
    get isStaging(): boolean;
    get isAutomation(): boolean;
    get isTest(): boolean;
    get isDev(): boolean;
    get isLocal(): boolean;
    get status(): RecLike;
    isSysFunction(name: string): boolean;
    isSysClass(name: string): boolean;
    propertyDescriptor(target: FuncLike|ObjectLike, key: string, isInstance: boolean): PropertyDescriptor;
    clearFileName(value: string): string | null;
}
// endregion system
// region variable
export interface CoreVariableItem<T = unknown> {
    owner: string;
    parser(v: unknown): T;
    required?: boolean;
    log?: boolean;
    def?: T;
}
export interface CoreVariableLike extends CoreBaseLike {
    get names(): Array<string>;
    get(name: string): CoreVariableItem;
    read<T>(nameGiven: string, variable: CoreVariableItem<T>): T;
}
// endregion variable

// region fqn
export interface FqnBasic {
    // region sign
    is(value: unknown): boolean;
    name(value: unknown): string;
    // endregion sign
    // region dimension
    refresh(target: ObjectLike|FuncLike): void;
    clazz(target: ClassLike, ...prefixes: Array<string>): void;
    func(target: FuncLike, ...prefixes: Array<string>): void;
    enumeration(name: string, target: ObjectLike, ...prefixes: Array<string>): void;
    // endregion dimension
}

export interface FqnPoolLike extends FqnBasic, CoreBaseLike {
    set(ins: FqnBasic): void;
}
export interface FqnArgument {
    _f: 'refresh'|'clazz'|'func'|'enumeration';
    target?: unknown;
    prefixes?: Array<string>;
    name?: string;
}
// endregion fqn


export interface TypeOpt extends RecLike {
    field?: string;
    silent?: boolean;
    required?: boolean;
}
export type TypeFnLambda<V = unknown, O = TypeOpt> = (value: unknown|V, opt?: O) => V;

interface TypeItemOpt<T = unknown, O = TypeOpt> extends TypeOpt {
    fn?: TypeFnLambda<T, O>;
}

export interface ArrayTypeOpt<V extends TypeOpt = TypeOpt> extends TypeOpt {
    ignoreNullValues?: boolean;
    onDuplicated?: 'allow'|'reject'|'unique';
    delimited?: boolean|string;
    minValues?: number;
    maxValues?: number;
    onMaxValues?: 'allow'|'reject'|'strip';
    values?: TypeItemOpt<unknown, V>;
}
export interface ObjectTypeOpt<V extends TypeOpt = TypeOpt, K extends TypeOpt = TypeOpt> extends TypeOpt {
    ignoreNullValues?: boolean;
    keysOrdered?: boolean;
    minItems?: number;
    maxItems?: number;
    onMaxItems?: 'allow'|'reject'|'strip';
    values?: TypeItemOpt<unknown, V>;
    keys?: TypeItemOpt<unknown, K>;
}



export type TypeEnumAlt<T extends Key = Key> = RecLike<T>;
export type TypeEnumMap<T extends Key = Key> = TypeEnumAlt<T>|Array<T>;
export interface TypeEnumOpt<T extends Key = Key> extends TypeOpt {
    map: TypeEnumMap<T>;
    alt?: TypeEnumAlt<T>;
}




