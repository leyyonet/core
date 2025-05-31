import {ClassLike, Dict, Func, Obj} from "@leyyo/common";
import {DecoArguments, DecoInstanceLike} from "../instance";
import {ClassReflectionLike, ParameterReflectionLike, PropertyReflectionLike, ReflectionTag} from "../../reflection";
import {DecoRule, Target} from "../literals";
import {DecoIdLike} from "../identifier";
import {DecoCloneLike} from "../clone";

/**
 * Decorator keyword type, it's used during filter
 * */
export type DecoKeyword =
/** Static property */
    'static'
    /** Instance property */
    | 'instance';
/**
 * DecoratorPool property type
 * - field: field property so type is not a function
 * - method: method property so type is a function
 * */
export type DecoKind = 'field' | 'method';

/**
 * DecoratorPool belongs type
 * - self: filter for only self values of any-reflection
 * - parent: filter for only parent values of any-reflection
 * - all or any value
 * */
export type DecoBelongs = 'self' | 'parent';

export interface DecoFilterBelongs {
    /**
     * - self, it searches in self values
     * - parent, it searches in parent values
     * @see {@link DecoBelongs}
     * */
    /**
     * If true, it returns only owned values[decorators], else with inherited values
     * */
    belongs?: DecoBelongs;
}

export interface DecoFilterKeyword {
    /**
     * - static, it searches in only static properties
     * - instance, it searches in only instance properties
     * @see {@link DecoKeyword}
     * */
    keyword?: DecoKeyword;
}

export interface DecoFilterKind {
    /**
     * - field, it searches in only field properties
     * - method, it searches in only method properties
     * @see {@link DecoKind}
     * */
    kind?: DecoKind;
}

/**
 * DecoratorPool and reflection filter options
 * */
export type DecoFilter = DecoFilterBelongs & DecoFilterKeyword & DecoFilterKind;

export interface DecoLike<V = Dict, M = Dict, P = V> {
    /**
     * Description of decorator
     * */
    get description(): string;

    /**
     * Function of decorator
     * */
    get fn(): Func;

    /**
     * Name of decorator
     * - if fqn is used then fqn
     * - else function name
     * */
    get name(): string;

    /**
     * Is decorator identifier, otherwise it's clone
     * */
    get isIdentifier(): boolean;

    /**
     * Casts it as an identifier if it's
     * */
    get asIdentifier(): DecoIdLike<V, M, P>;

    /**
     * Casts it as an identifier if it's
     * */
    get asClone(): DecoCloneLike<V, M, P>;

    /**
     * Forks a new instance for a class
     *
     * @param {ClassLike} clazz - Class
     * */
    fork(clazz: Obj | Func): DecoInstanceLike<V, M, P>; // class

    /**
     * @override
     * Forks a new instance for a field
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - field name
     * */
    fork(clazz: Obj | Func, property: PropertyKey): DecoInstanceLike<V, M, P>; // field
    /**
     * @override
     * Forks a new instance for a method
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - method name
     * @param {number} descriptor - method function
     *
     * */
    fork(clazz: Obj | Func, property: PropertyKey, descriptor: TypedPropertyDescriptor<unknown>): DecoInstanceLike<V, M, P>; // method
    /**
     * @override
     * Forks a new instance for a parameter
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - method name
     * @param {number} index - parameter index
     * */
    fork(clazz: Obj | Func, property: PropertyKey, index: number): DecoInstanceLike<V, M, P>; // parameter
    /**
     * @inheritDoc
     * @override
     *
     * Descriptors options
     * - for class : [class]
     * - for field : [class, property]
     * - for method: [class, property, descriptor]
     * - for param : [class, property, index]
     * */
    fork(descriptors: DecoArguments): DecoInstanceLike<V, M, P>;

    // endregion public

    // region target
    /**
     * Return allowed targets
     * */
    getTargets(): Array<Target>;

    /**
     * Sets allowed targets
     *
     * @param {Array<Target>} targets
     * */
    targets(...targets: Array<Target>): this;

    /**
     * Does decorator allow given targets
     *
     * @param {Array<Target>} targets
     * */
    hasTarget(...targets: Array<Target>): boolean;

    // endregion target

    // region fqn
    /**
     * Sets fqn name as shortcut, it uses {@link FqnHandler#decorator}
     *
     * @param {string} pack - package name
     * */
    fqn(pack: string): this;

    // endregion fqn

    // region dirty
    /**
     * Is any rule is changed?
     * */
    get isDirty(): boolean;

    // endregion dirty

    // region rule
    /**
     * Returns rules or constraints
     * */
    getRules(): Array<DecoRule>;

    /**
     * Have decorator given rules?
     *
     * @param {DecoRule} rule
     * */
    hasRule(rule: DecoRule): boolean;

    // endregion rule

    // region keyword
    /**
     * Returns keywords
     * */
    getKeywords(): Array<string|symbol>;

    /**
     * Have decorator given keywords?
     *
     * @param {string} keyword
     * */
    hasKeyword(keyword: string|symbol): boolean;

    // endregion keyword

    // region metadata
    /**
     * Returns metadata
     * */
    getMetadata<M2 = M>(): M2;

    // endregion metadata

    // region processor
    /**
     * Have decorator owned processor
     * */
    get hasProcessor(): boolean;

    /**
     * Process decorator
     *
     * @param {Array<any>} descriptors
     * @param {Object} parameters - decorator arguments
     *
     * Descriptors options
     * - for class : [class]
     * - for field : [class, property]
     * - for method: [class, property, descriptor]
     * - for param : [class, property, index]
     * */
    process<R = void>(descriptors: Array<any>, parameters?: P): R;

    /**
     * @inheritDoc
     *
     * @param {DecoInstanceLike} ins
     * @param {Object} parameters - decorator arguments
     * */
    process<R = void>(ins: DecoInstanceLike<V, M, P>, parameters?: P): R;

    // endregion processor

    // endregion getter

    // region sort
    isBefore(deco: DecoLike): boolean;
    isBefore(fn: Func): boolean;
    isBefore(name: string): boolean;
    before(...functions: Array<Func|string>): this;

    isAfter(deco: DecoLike): boolean;
    isAfter(fn: Func): boolean;
    isAfter(name: string): boolean;
    after(...functions: Array<Func|string>): this;
    // endregion sort

    // region class
    /**
     * Returns classes which use this decorator
     *
     * @param {DecoFilter} filter - optional filter
     * */
    assignedClasses(filter?: DecoFilter): Array<ClassReflectionLike>;

    /**
     * Returns latest value of given class
     *
     * @param {ClassLike} clazz - Class
     * @param {DecoFilter} filter - optional filter
     * */
    valueByClass(clazz: ClassLike | Func | string, filter?: DecoFilter): V;

    /**
     * Returns values of given class
     *
     * @param {ClassLike} clazz - Class
     * @param {DecoFilter} filter - optional filter
     * */
    valuesByClass(clazz: ClassLike | Func | string, filter?: DecoFilter): Array<V>;

    // endregion class
    // region property
    /**
     * Returns properties which use this decorator
     *
     * @param {DecoFilter} filter - optional filter
     * */
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectionLike>;

    /**
     * Returns latest value of given class' property
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - property name [field or method]
     * @param {DecoFilter} filter - optional filter
     * */
    valueByProperty(clazz: Func | string, property: PropertyKey, filter?: DecoFilter): V;

    /**
     * Returns values of given class' property
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - property name [field or method]
     * @param {DecoFilter} filter - optional filter
     * */
    valuesByProperty(clazz: Func | string, property: PropertyKey, filter?: DecoFilter): Array<V>;

    // endregion property
    // region parameter
    /**
     * Returns parameters which use this decorator
     *
     * @param {DecoFilter} filter - optional filter
     * */
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectionLike>;

    /**
     * Returns latest value of given parameter
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - method name
     * @param {number} index - parameter index
     * @param {DecoFilter} filter - optional filter
     * */
    valueByParameter(clazz: Func | string, property: PropertyKey, index: number, filter?: DecoFilter): V;

    /**
     * Returns values of given parameter
     *
     * @param {ClassLike} clazz - Class
     * @param {string} property - method name
     * @param {number} index - parameter index
     * @param {DecoFilter} filter - optional filter
     * */
    valuesByParameter(clazz: Func | string, property: PropertyKey, index: number, filter?: DecoFilter): Array<V>;

    // endregion parameter
    toJSON(simple?: boolean): any;
    clearInstances(): void;
}

export type DecoCLearType = 'inherited-selected' | 'inherited-all' | 'both-selected' | 'both-all';
