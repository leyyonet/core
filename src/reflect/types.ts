import {FuncLike, ObjectLike, RecLike} from "../common";
import {TargetLike} from "./enums";
import {DecoAliasLike, DecoFilter, DecoInheritanceFilter, DecoLike} from "../deco";
import {ExceptionLike} from "../error";

export interface ReflectDecoratorItem {
    deco: DecoLike;
    values: Array<RecLike>;
    tags: RecLike;
    target?: ReflectLike;
}
export type ReflectFilterType = 'belongs'|'scope'|'keyword'|'kind';
/**
 * Property keyword type
 * - static: static property
 * - instance: instance property
 *
 * @internal
 * */
export type ReflectKeyword = 'static' | 'instance';
export interface ReflectKeywordFilter {
    /**
     * If it is static, it searches in only static properties
     * If it is instance, it searches in only instance properties
     * @see {@link ReflectKeyword}
     * */
    keyword?: ReflectKeyword;
}

/**
 * Decorator property type
 * - field: field property so type is not a function
 * - method: method property so type is a function
 *
 * @internal
 * */
export type ReflectPropertyType = 'field' | 'method';
export interface ReflectPropertyFilter {
    /**
     * If field, it searches in only field properties
     * If method, it searches in only method properties
     * @see {@link ReflectPropertyType}
     * */
    kind?: ReflectPropertyType;
}
/**
 * Decorator scope type
 * - owned: filter for only owned properties for class
 * - inherited: filter for only inherited properties for class
 * @internal
 * */
export type ReflectInheritance = 'owned' | 'inherited';
export interface ReflectInheritanceFilter {
    /**
     * - owned: filter for only owned properties for class
     * - inherited: filter for only inherited properties for class
     * */
    scope?: ReflectInheritance;
}

export interface ReflectClassDescribed {
    deco?: DecoLike;
    target: TargetLike;
    keyword: ReflectKeyword;
    classFn: FuncLike;
    classProto: ObjectLike;
    description: string;
    shortDescription: string;
    error?: ExceptionLike;
}
export interface ReflectFieldDescribed extends ReflectClassDescribed {
    property?: string;
}
export interface ReflectMethodDescribed extends ReflectClassDescribed {
    property?: string;
    methodFn?: FuncLike;
    methodDescriptor?: TypedPropertyDescriptor<FuncLike>;
}
export interface ReflectParameterDescribed extends ReflectClassDescribed {
    property?: string;
    index?: number;
}
export type ReflectDescribed = ReflectClassDescribed & ReflectFieldDescribed & ReflectMethodDescribed & ReflectParameterDescribed;
export type ReflectPropertyDescribed = ReflectFieldDescribed & ReflectMethodDescribed;

export interface CoreReflectLike {
    get description(): string;
    info(detailed?: boolean): RecLike;
    get option(): ReflectOptionLike;
    $findConstructorParams(clazz: FuncLike): Array<FuncLike>;
    $setFinalDeco(deco: DecoLike): void;
    get $finalDeco(): DecoLike;
    // region class
    classes(): Array<ClassReflectLike>;

    $findClass(clazz: FuncLike, body?: ObjectLike): ClassReflectLike;


    getClass(clazz: FuncLike, throwable?: boolean): ClassReflectLike;
    getClass(name: string, throwable?: boolean): ClassReflectLike;

    hasClass(clazz: FuncLike): boolean;
    hasClass(name: string): boolean;


    classesBy(deco: DecoLike, filter?: DecoFilter): Array<ClassReflectLike>;
    classesBy(fn: FuncLike, filter?: DecoFilter): Array<ClassReflectLike>;
    classesBy(name: string, filter?: DecoFilter): Array<ClassReflectLike>;

    classHasAnyDeco(clazz: FuncLike|string, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean;
    // endregion class

    // region property
    hasProperty(clazz: FuncLike, property: string, filter?: DecoFilter): boolean;
    hasProperty(name: string, property: string, filter?: DecoFilter): boolean;

    getProperty(clazz: FuncLike, property: string, filter?: DecoFilter): PropertyReflectLike;
    getProperty(name: string, property: string, filter?: DecoFilter): PropertyReflectLike;
    propertyHasAnyDeco(clazz: FuncLike|string, property: string, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean;
    // endregion property
    // region parameter
    hasParam(clazz: FuncLike, property: string, index: number, filter?: DecoFilter): boolean;
    hasParam(name: string, property: string, index: number, filter?: DecoFilter): boolean;

    getParam(clazz: FuncLike, property: string, index: number, filter?: DecoFilter): ParameterReflectLike;
    getParam(name: string, property: string, index: number, filter?: DecoFilter): ParameterReflectLike;
    paramHasAnyDeco(clazz: FuncLike|string, property: string, index: number, decoList: Array<DecoLike|FuncLike|string>, filter?: DecoFilter): boolean;
    // endregion parameter
    // region sync
    described(deco: DecoLike, target: FuncLike): ReflectClassDescribed;
    described(deco: DecoLike, target: ObjectLike|FuncLike, property: string): ReflectFieldDescribed;
    described(deco: DecoLike, target: ObjectLike|FuncLike, property: string, descriptor: TypedPropertyDescriptor<unknown>): ReflectMethodDescribed;
    described(deco: DecoLike, target: ObjectLike|FuncLike, property: string, index: number): ReflectParameterDescribed;
    described<D extends ReflectClassDescribed = ReflectDescribed>(deco: DecoLike, ...descriptors: Array<unknown>): D;
    // endregion sync
}
export interface ReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get target(): TargetLike;
    get description(): string;
    get shortDescription(): string;
    getDescribed(): ReflectDescribed;
    get $currentDeco(): DecoLike;
    $setCurrentDeco(deco: DecoLike): this;

    get asClass(): ClassReflectLike;
    get asProperty(): PropertyReflectLike;
    get asParameter(): ParameterReflectLike;
    // endregion getters
    // region decorator
    $setValue(deco: DecoLike, value: RecLike, runOChanged: boolean): void;
    setValue(alias: DecoAliasLike, value: RecLike): this;
    setValue(deco: DecoLike, value: RecLike): this;
    setValue(fn: FuncLike, value: RecLike): this;
    setValue(name: string, value: RecLike): this;

    clearValues(alias: DecoAliasLike): number;
    clearValues(deco: DecoLike): number;
    clearValues(fn: FuncLike): number;
    clearValues(name: string): number;

    getValue<V extends RecLike = RecLike>(alias: DecoLike, filter?: DecoInheritanceFilter): V;
    getValue<V extends RecLike = RecLike>(deco: DecoLike, filter?: DecoInheritanceFilter): V;
    getValue<V extends RecLike = RecLike>(fn: FuncLike, filter?: DecoInheritanceFilter): V;
    getValue<V extends RecLike = RecLike>(name: string, filter?: DecoInheritanceFilter): V;

    listValues<V extends RecLike = RecLike>(alias: DecoAliasLike, filter?: DecoInheritanceFilter): Array<V>;
    listValues<V extends RecLike = RecLike>(deco: DecoLike, filter?: DecoInheritanceFilter): Array<V>;
    listValues<V extends RecLike = RecLike>(fn: FuncLike, filter?: DecoInheritanceFilter): Array<V>;
    listValues<V extends RecLike = RecLike>(name: string, filter?: DecoInheritanceFilter): Array<V>;

    getTag(alias: DecoLike, filter?: DecoInheritanceFilter): RecLike;
    getTag(deco: DecoLike, filter?: DecoInheritanceFilter): RecLike;
    getTag(fn: FuncLike, filter?: DecoInheritanceFilter): RecLike;
    getTag(name: string, filter?: DecoInheritanceFilter): RecLike;

    decoratorItems(filter?: DecoFilter): Array<ReflectDecoratorItem>;
    decorators(filter?: DecoInheritanceFilter): Array<FuncLike>;


    decoratorItem(deco: DecoLike, filter?: DecoInheritanceFilter, isEmpty?: boolean): ReflectDecoratorItem;
    hasDecorator(alias: DecoAliasLike, filter?: DecoInheritanceFilter): boolean;
    hasDecorator(deco: DecoLike, filter?: DecoInheritanceFilter): boolean;
    hasDecorator(fn: FuncLike, filter?: DecoInheritanceFilter): boolean;
    hasDecorator(name: string, filter?: DecoInheritanceFilter): boolean;

    // endregion decorator
    // region filter-by
    filterByBelongs(alias: DecoAliasLike, filter?: DecoInheritanceFilter): boolean;
    filterByBelongs(deco: DecoLike, filter?: DecoInheritanceFilter): boolean;
    filterByBelongs(fn: FuncLike, filter?: DecoInheritanceFilter): boolean;
    filterByBelongs(name: string, filter?: DecoInheritanceFilter): boolean;

    filterByTargetType(...targets: Array<TargetLike>): boolean;
    // endregion filter-by
}
export interface ClassReflectLike extends ReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get name(): string;
    get baseName(): string;
    get description(): string;
    get shortDescription(): string;
    getDescribed(): ReflectClassDescribed;
    get parent(): ClassReflectLike;
    get parents(): Array<ClassReflectLike>;
    get classFn(): FuncLike;
    get body(): ObjectLike;
    // endregion getters
    // region methods
    $registerProperty(described: ReflectPropertyDescribed): PropertyReflectLike;
    create<T>(...a: Array<unknown>): T;
    // endregion methods
    // region instance-properties
    listInstancePropertyNames(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<string>;
    listInstanceProperties(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<PropertyReflectLike>;
    getInstanceProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): PropertyReflectLike;
    hasInstanceProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): boolean
    // endregion instance-properties
    // region static-properties
    listStaticPropertyNames(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<string>;
    listStaticProperties(filter?: ReflectInheritanceFilter & ReflectPropertyFilter): Array<PropertyReflectLike>;
    getStaticProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): PropertyReflectLike;
    hasStaticProperty(property: string, filter?: ReflectInheritanceFilter & ReflectPropertyFilter): boolean
    // endregion static-properties
    // region any-properties
    listAnyProperties(filter?: DecoFilter, alias?: DecoAliasLike): Array<PropertyReflectLike>;
    listAnyProperties(filter?: DecoFilter, deco?: DecoLike): Array<PropertyReflectLike>;
    listAnyProperties(filter?: DecoFilter, fn?: FuncLike): Array<PropertyReflectLike>;
    listAnyProperties(filter?: DecoFilter, name?: string): Array<PropertyReflectLike>;

    getAnyProperty(property: string, filter?: DecoFilter): PropertyReflectLike;
    hasAnyProperty(property: string, filter?: DecoFilter): boolean;
    // endregion any-properties
}
export interface PropertyReflectLike extends ReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get name(): string;
    get shortDescription(): string;
    get description(): string;
    get clazz(): ClassReflectLike;
    get proto(): PropertyReflectLike;
    get hasProto(): boolean;
    get typeFn(): FuncLike;
    $setTypeFn(fn: FuncLike): void;
    get namedType(): string;
    $setNamedType(namedType: string): void;
    get methodFn(): FuncLike;
    get keyword(): ReflectKeyword;
    get kind(): ReflectPropertyType;
    // endregion getters

    // region parameters
    listParameters(filter?: DecoFilter): Array<ParameterReflectLike>;
    hasParameter(index: number, filter?: DecoFilter): boolean;
    getParameter(index: number, filter?: DecoFilter): ParameterReflectLike;

    parametersBy(alias: DecoAliasLike): Array<ParameterReflectLike>;
    parametersBy(deco: DecoLike): Array<ParameterReflectLike>;
    parametersBy(fn: FuncLike): Array<ParameterReflectLike>;
    parametersBy(name: string): Array<ParameterReflectLike>;

    // endregion parameters

    // region filter-by
    filterByKeyword(filter?: ReflectKeywordFilter): boolean;
    filterByKind(filter?: ReflectPropertyFilter): boolean;
    // @todo delete
    filterByScope(cRef: ClassReflectLike, filter?: ReflectInheritanceFilter): boolean;
    // endregion filter-by
}
export interface ParameterReflectLike extends ReflectLike {
    // region getters
    info(detailed?: boolean): RecLike;
    get property(): PropertyReflectLike;
    get index(): number;
    get typeFn(): FuncLike;
    $setTypeFn(fn: FuncLike): void;
    get namedType(): string;
    $setNamedType(namedType: string): void;
    get description(): string;
    get name(): string;
    $setName(name: string): void;
    getDescribed(): ReflectParameterDescribed;
    // endregion getters

    // region decorator
    decorators(): Array<FuncLike>;

    hasDecorator(alias: DecoAliasLike): boolean;
    hasDecorator(deco: DecoLike): boolean;
    hasDecorator(fn: FuncLike): boolean;
    hasDecorator(name: string): boolean;

    listValues<V extends RecLike = RecLike>(alias: DecoAliasLike): Array<V>;
    listValues<V extends RecLike = RecLike>(deco: DecoLike): Array<V>;
    listValues<V extends RecLike = RecLike>(fn: FuncLike): Array<V>;
    listValues<V extends RecLike = RecLike>(name: string): Array<V>;

    getValue<V extends RecLike = RecLike>(alias: DecoAliasLike): V;
    getValue<V extends RecLike = RecLike>(deco: DecoLike): V;
    getValue<V extends RecLike = RecLike>(fn: FuncLike): V;
    getValue<V extends RecLike = RecLike>(name: string): V;
    // endregion decorator

}

export interface ReflectOptionLike {
    wrapReflectMetadata(): this;
}
