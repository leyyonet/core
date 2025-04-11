import {Arr, ClassLike, Dict, Func, Obj} from "@leyyo/common";
import {DecoInstanceLike} from "../instance";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {Forbidden, Target} from "../literals";
import {DecoIdLike} from "../identifier";
import {DecoCloneLike} from "../clone";

/**
 * DecoratorPool property keyword type
 * - static: static property
 * - instance: instance property
 *
 * @internal
 * */
export type DecoKeyword = 'static' | 'instance';
/**
 * DecoratorPool property type
 * - field: field property so type is not a function
 * - method: method property so type is a function
 *
 * @internal
 * */
export type DecoKind = 'field' | 'method';

/**
 * DecoratorPool belongs type
 * - self: filter for only self values of any-reflection
 * - parent: filter for only parent values of any-reflection
 * - all or any value
 * @internal
 * */
export type DecoBelongs = 'self' | 'parent';

export interface DecoFilterBelongs {
    /**
     * If self, it searches in self values
     * If parent, it searches in parent values
     * @see {@link DecoBelongs}
     * */
    /**
     * If true, it returns only owned values[decorators], else with inherited values
     * */
    belongs?: DecoBelongs;
}

export interface DecoFilterKeyword {
    /**
     * If static, it searches in only static properties
     * If instance, it searches in only instance properties
     * @see {@link DecoKeyword}
     * */
    keyword?: DecoKeyword;
}

export interface DecoFilterKind {
    /**
     * If field, it searches in only field properties
     * If method, it searches in only method properties
     * @see {@link DecoKind}
     * */
    kind?: DecoKind;
}

/**
 * DecoratorPool and reflection filter options
 * */
export type DecoFilter = DecoFilterBelongs & DecoFilterKeyword & DecoFilterKind;

export interface DecoLike<V extends Dict = Dict> {
    get description(): string;

    get fn(): Func;

    get name(): string;
    get isIdentifier(): boolean;
    get asIdentifier(): DecoIdLike;
    get asClone(): DecoCloneLike;

    /**
     * Forks a new instance from identifier
     * */
    fork(clazz: Obj | Func): DecoInstanceLike<V>; // class
    fork(clazz: Obj | Func, propertyKey: PropertyKey): DecoInstanceLike<V>; // field
    fork(clazz: Obj | Func, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<unknown>): DecoInstanceLike<V>; // method
    fork(clazz: Obj | Func, propertyKey: PropertyKey, index: number): DecoInstanceLike<V>; // parameter
    fork(...descriptors: Arr): DecoInstanceLike<V>;

    assign(coreReflect: CoreReflectionLike, value: V): void;

    // endregion public

    // region getter
    get target(): Array<Target>;

    hasTarget(...targets: Array<Target>): boolean;

    get forbidden(): Array<Forbidden>;

    isForbidden(forbidden: Forbidden): boolean;

    get instances(): Array<DecoInstanceLike>;

    get keywords(): Array<string>;
    addKeyword(...keywords: Array<string>): number;
    hasKeyword(keyword: string): boolean;

    // endregion getter

    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectionLike>; // class-name
    valueByClass(fn: ClassLike | Func | string, filter?: DecoFilter): V;

    valuesByClass(fn: ClassLike | Func | string, filter?: DecoFilter): Array<V>;

    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectionLike>; // class-name, property-name
    valueByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): V;

    valuesByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): Array<V>;

    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectionLike>; // class-name, property-name, index
    valueByParameter(fn: Func | string, propName: PropertyKey, index: number, filter?: DecoFilter): V;

    valuesByParameter(fn: Func | string, propName: PropertyKey, index: number, filter?: DecoFilter): Array<V>;

    // endregion parameter
}