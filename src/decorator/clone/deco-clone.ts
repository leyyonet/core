import {ClassLike, Dict, Func} from "@leyyo/common";
import {DecoClonedDetail, DecoCloneLike} from "./index-types";
import {DecoIdLike} from "../identifier";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {DecoFilter} from "../abstract";
import {Forbidden, Target} from "../literals";
import {DecoInstance, DecoInstanceLike} from "../instance";
import {core} from "../../core";

// console.log(__filename);

export class DecoClone<V extends Dict = Dict> implements DecoCloneLike<V> {
    private readonly _fn: Func;
    private readonly _id: DecoIdLike<V>;
    private readonly _target: Array<Target>;

    constructor(fn: Func, id: DecoIdLike<V>, target: Array<Target>) {
        this._fn = fn;
        this._id = id;
        this._target = (target && target.length > 0) ? target : id.target;
    }

    // noinspection JSUnusedLocalSymbols
    info(detailed?: boolean): DecoClonedDetail {
        return {
            name: this.name,
            identifier: {'$ref': this._id.description},
        }
    }

    get description(): string {
        return `<clone>${this.name} for ${this._id.name}`;
    }

    get name(): string {
        return core.fqn.get(this._fn);
    }
    get isIdentifier(): boolean {
        return false;
    }
    get asIdentifier(): DecoIdLike {
        return null;
    }
    get asClone(): DecoCloneLike {
        return this;
    }

    get fn(): Func {
        return this._fn;
    }

    get id(): DecoIdLike<V> {
        return this._id;
    }
    get keywords(): Array<string> {
        return this._id.keywords;
    }
    addKeyword(...keywords: Array<string>): number {
        return this._id.addKeyword(...keywords);
    }
    hasKeyword(keyword: string): boolean {
        return this._id.hasKeyword(keyword);
    }

    assign(coreReflect: CoreReflectionLike, value: V): void {
        this._id.assign(coreReflect, value);
    }

    assignedClasses(filter?: DecoFilter): Array<ClassReflectionLike> {
        return this._id.assignedClasses(filter);
    }

    assignedParameters(filter?: DecoFilter): Array<ParameterReflectionLike> {
        return this._id.assignedParameters(filter);
    }

    assignedProperties(filter?: DecoFilter): Array<PropertyReflectionLike> {
        return this._id.assignedProperties(filter);
    }

    get forbidden(): Array<Forbidden> {
        return this._id.forbidden;
    }

    fork(...descriptors: Array<unknown>): DecoInstanceLike<V> {
        return new DecoInstance(this._id, this, descriptors);
    }

    hasTarget(...targets: Array<Target>): boolean {
        return targets.some(t => this._target.includes(t));
    }

    get instances(): Array<DecoInstanceLike> {
        return this._id.instances;
    }

    isForbidden(forbidden: Forbidden): boolean {
        return this._id.isForbidden(forbidden);
    }

    get target(): Array<Target> {
        return this._target;
    }

    valueByClass(fn: ClassLike | Func | string, filter?: DecoFilter): V {
        return this._id.valueByClass(fn, filter);
    }

    valueByParameter(fn: Func | string, propName: PropertyKey, index: number, filter?: DecoFilter): V {
        return this._id.valueByParameter(fn, propName, index, filter);
    }

    valueByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): V {
        return this._id.valueByProperty(fn, propName, filter);
    }

    valuesByClass(fn: ClassLike | Func | string, filter?: DecoFilter): Array<V> {
        return this._id.valuesByClass(fn, filter);
    }

    valuesByParameter(fn: Func | string, propName: PropertyKey, index: number, filter?: DecoFilter): Array<V> {
        return this._id.valuesByParameter(fn, propName, index, filter);
    }

    valuesByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): Array<V> {
        return this._id.valuesByProperty(fn, propName, filter);
    }
}