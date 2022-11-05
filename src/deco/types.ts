/**
 * Deco id option object
 * */
import {FuncLike, RecLike} from "../common";
import {
    ClassReflectLike,
    ParameterReflectLike,
    PropertyReflectLike,
    ReflectClassDescribed,
    ReflectDescribed,
    ReflectFieldDescribed,
    ReflectInheritanceFilter,
    ReflectKeywordFilter,
    ReflectLike,
    ReflectMethodDescribed,
    ReflectParameterDescribed,
    ReflectPropertyFilter,
    TargetLike
} from "../reflect";

export type DecoOnAssignedCb = (deco: DecoLike, target: ReflectLike) => void;
export type DecoOnChangedCb = (deco: DecoLike, target: ReflectLike) => void;
export interface DecoOption {
    /**
     * Decorator can be assigned to a class
     *
     * - {@link TargetLike}
     * - If any of them is not set, all targets will be selected {@link DecoOption.clazz} {@link DecoOption.method} {@link DecoOption.field} {@link DecoOption.parameter}
     * @default false
     * */
    clazz?: boolean;
    /**
     * Decorator can be assigned to a method
     *
     * - {@link TargetLike}
     * - Method means that a property with type is function
     * - You can forbid decorator for instance methods with {@link DecoOption.onlyForInstance}
     * - You can forbid decorator for static methods with {@link DecoOption.onlyForStatic}
     * - If any of them is not set, all targets will be selected {@link DecoOption.clazz} {@link DecoOption.method} {@link DecoOption.field} {@link DecoOption.parameter}
     * @default false
     * */
    method?: boolean;
    /**
     * Decorator can be assigned to a field
     *
     * - {@link TargetLike}
     * - Field means that a property with type is not function
     * - In JS, property is used for property and method, we used field to avoid ambiguity
     * - You can forbid decorator for instance fields with {@link DecoOption.onlyForInstance}
     * - You can forbid decorator for static fields with {@link DecoOption.onlyForStatic}
     * - If any of them is not set, all targets will be selected {@link DecoOption.clazz} {@link DecoOption.method} {@link DecoOption.field} {@link DecoOption.parameter}
     * @default false
     * */
    field?: boolean;
    /**
     * is parameter, so decorator can be assigned to a parameter
     *
     * - {@link TargetLike}
     * - You can forbid decorator for instance method parameters with {@link DecoOption.onlyForInstance}
     * - You can forbid decorator for static method parameters with {@link DecoOption.onlyForStatic}
     * - JS does not support to learn name of variable, so you need to pass parameter name to decorator
     * - If any of them is not set, all targets will be selected {@link DecoOption.clazz} {@link DecoOption.method} {@link DecoOption.field} {@link DecoOption.parameter}
     * @default false
     * */
    parameter?: boolean;

    /**
     * Decorator can not be assigned to instance properties and their parameters [if method]
     *
     * - {@link ReflectInheritance}
     * - If it's not set then decorator can be assigned to any property [static or instance]
     * @default false
     * */
    onlyForInstance?: boolean;
    /**
     * Decorator can not be assigned to static properties and their parameters [if method]
     *
     * - {@link ReflectInheritance}
     * - If it's not set then decorator can be assigned to any property [static or instance]
     * @default false
     * */
    onlyForStatic?: boolean;
    /**
     * Decorator values limited with one
     * - New appended values will overwrite existing values
     * - If it's not set then parent's multiple decorators stored as an array
     * @default false
     */
    multiple?: boolean;
    /**
     * Decorator will not inherit parent/inherited decorators
     * - If it's not set then parent's decorators will be inherited
     */
    isFinal?: boolean;

    /**
     * Decorator definition will be removed from memory after initialization
     * - If it's not set then decorator values will be persistent and stored in reflect repository
     * @default false
     */
    temporary?: boolean;
    /**
    * Purposes of decorator, ie: validator, api, ...
    */
    purposes?: Array<string>;
}

/**
 * Decorator Identifier
 * */
export interface DecoLike<V extends RecLike = RecLike> {
    $onChanged(assigned: ReflectLike): void;
    // region public
    info(detailed?: boolean): RecLike;
    get description(): string;

    assign(described: ReflectClassDescribed, value?: V): ClassReflectLike;
    assign(described: ReflectMethodDescribed, value?: V): PropertyReflectLike;
    assign(described: ReflectFieldDescribed, value?: V): PropertyReflectLike;
    assign(described: ReflectParameterDescribed, value?: V): ParameterReflectLike;
    assign<R extends ReflectLike = ReflectLike>(described: ReflectDescribed, value?: V): R;

    hasPurposes(...purposes: Array<string>): boolean;
    // endregion public

    // region getter
    get name(): string;
    get fn(): FuncLike;

    get options(): DecoOption;

    get targets(): Array<TargetLike>;
    get forClass(): boolean;

    get forMethod(): boolean;

    get forField(): boolean;

    get forParameter(): boolean;

    get onlyForInstance(): boolean;

    get onlyForStatic(): boolean;

    get temporary(): boolean;

    get multiple(): boolean;

    get isFinal(): boolean;
    get purposes(): Array<string>;
    get isPrimary(): boolean;

    // endregion getter

    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectLike>; // class-name
    valueByClass(clazz: FuncLike, filter?: DecoFilter): V;
    valueByClass(name: string, filter?: DecoFilter): V;

    valuesByClass(clazz: FuncLike, filter?: DecoFilter): Array<V>;
    valuesByClass(name: string, filter?: DecoFilter): Array<V>;
    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectLike>; // class-name, property-name

    valueByProperty(clazz: FuncLike, property: string, filter?: DecoFilter): V;
    valueByProperty(name: string, property: string, filter?: DecoFilter): V;

    valuesByProperty(clazz: FuncLike, property: string, filter?: DecoFilter): Array<V>;
    valuesByProperty(name: string, property: string, filter?: DecoFilter): Array<V>;
    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectLike>; // class-name, property-name, index

    valueByParameter(clazz: FuncLike, property: string, index: number, filter?: DecoFilter): V;
    valueByParameter(name: string, property: string, index: number, filter?: DecoFilter): V;

    valuesByParameter(clazz: FuncLike, property: string, index: number, filter?: DecoFilter): Array<V>;
    valuesByParameter(name: string, property: string, index: number, filter?: DecoFilter): Array<V>;
    // endregion parameter

    // region events
    /**
     * Triggers callback, when a decorator is assigned to a target
     * */
    onAssigned(cb: DecoOnAssignedCb): void;
    /**
     * Clear on-assigned callbacks
     * */
    clearOnAssigned(): number;
    /**
     * Triggers callback, when a decorator's value is changed
     * */
    onChanged(cb: DecoOnChangedCb): void;
    /**
     * Clear on-changed callbacks
     * */
    clearOnChanged(): number;
    // endregion events
}



/**
 * Decorator belongs type
 * - self: filter for only self values of any-reflection
 * - parent: filter for only parent values of any-reflection
 * - all or any value
 * @internal
 * */
export type DecoInheritance = 'self' | 'parent';

export interface DecoInheritanceFilter {
    /**
     * If true, it returns only owned values[decorators], else with inherited values
     * If it is self, it searches in self values
     * If it is parent, it searches in parent values
     * @see {@link DecoInheritance}
     * */
    belongs?: DecoInheritance;
}

/**
 * Decorator and reflection filter options
 * */
export interface DecoFilter extends DecoInheritanceFilter, ReflectInheritanceFilter, ReflectKeywordFilter, ReflectPropertyFilter {
    purposes?: Array<string>;
    tags?: RecLike;
    fromChild?: boolean;
}
export interface DecoAliasLike<V extends RecLike = RecLike> extends DecoLike<V> {
    get deco(): DecoLike<V>;
}

export interface CoreDecoLike {
    get description(): string;
    BOOL_FIELDS: Array<string>;
    info(detailed?: boolean): RecLike;

    // region deco
    buildFilter<T = DecoFilter>(filter: T, ...conditions: Array<'belongs'|'scope'|'keyword'|'kind'>): T;
    /**
     * Identifies a decorator with default options[targets: all, no constraint]
     * - Constraints: [] - NONE
     * */
    addDecorator<V extends RecLike = RecLike>(fn: FuncLike, options: DecoOption): DecoLike<V>;
    upsertDecorator<V extends RecLike = RecLike>(fn: FuncLike, options: DecoOption): DecoLike<V>;

    /**
     * Identifies an alias and binds it to a real decorator
     * with condition to differentiate aliases of decorator
     * */
    addAlias<V extends RecLike = RecLike>(aliasFn: FuncLike, decoFn: FuncLike, options?: DecoOption): DecoAliasLike<V>;
    upsertAlias<V extends RecLike = RecLike>(aliasFn: FuncLike, decoFn: FuncLike, options?: DecoOption): DecoAliasLike<V>;

    /**
     * Checks existence for a decorator with given function or function name [and also FQN name]
     * - Found item can be decorator or alias
     * */
    is(fn: FuncLike): boolean;
    is(name: string): boolean;

    /**
     * Gets a decorator with given function or function name [and also FQN name]
     * - It searches in only identifiers, even if found item is alias, it ignores the found item
     * - If decorator could not be found, it raises an error
     * - If you want to find it whatever, please use {@link get}
     * */
    getDecorator<V extends RecLike = RecLike>(deco: DecoLike, throwable?: boolean): DecoLike<V>;
    getDecorator<V extends RecLike = RecLike>(alias: DecoAliasLike, throwable?: boolean): DecoLike<V>;
    getDecorator<V extends RecLike = RecLike>(fn: FuncLike, throwable?: boolean): DecoLike<V>;
    getDecorator<V extends RecLike = RecLike>(name: string, throwable?: boolean): DecoLike<V>;


    /**
     * Checks existence for a decorator with given function or function name [and also FQN name]
     * - It returns false if found item is alias
     * - If you want to check it whatever, please use {@link is}
     * */
    isDecorator(fn: FuncLike): boolean;
    isDecorator(name: string): boolean;

    /**
     * Lists all identifiers as an object
     * */
    decorators(): Array<DecoLike>;

    /**
     * Gets a decorator with given function or function name [and also FQN name]
     * - It searches in only aliases, even if found item is decorator, it ignores the found item
     * - If alias could not be found, it raises an error
     * - If you want to find it whatever, please use {@link get}
     * */
    getAlias<V extends RecLike = RecLike>(alias: DecoAliasLike, throwable?: boolean): DecoAliasLike<V>;
    getAlias<V extends RecLike = RecLike>(fn: FuncLike, throwable?: boolean): DecoAliasLike<V>;
    getAlias<V extends RecLike = RecLike>(name: string, throwable?: boolean): DecoAliasLike<V>;

    /**
     * Checks existence for an alias with given function or function name [and also FQN name]
     * - It returns false if found item is decorator
     * - If you want to check it whatever, please use {@link is}
     * */
    isAlias(fn: FuncLike): boolean;

    /**
     * Lists all aliases as an object
     * */
    aliases(): Array<DecoAliasLike>;
    // endregion deco
}