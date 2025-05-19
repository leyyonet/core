import {$assert, $dev, ClassLike, Dict, Func} from "@leyyo/common";
import {DecoClonedDetail, DecoCloneLike} from "./index.types";
import {DecoIdLike} from "../identifier";
import {ClassReflectionLike, ParameterReflectionLike, PropertyReflectionLike} from "../../reflection";
import {DecoFilter} from "../abstract";
import {DecoRule, Target, TargetItems} from "../literals";
import {DecoInstance, DecoInstanceLike} from "../instance";
import {core} from "../../core";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";


export class DecoClone<V = Dict, M = Dict, P = V> implements DecoCloneLike<V, M, P> {
    private readonly _fn: Func;
    private readonly _id: DecoIdLike<V, M, P>;
    private _targets: Array<Target>;
    private _targetSet: boolean;
    private _name: string;
    private _dirty: boolean;

    constructor(fn: Func, id: DecoIdLike<V, M, P>) {
        this._fn = fn;
        this._id = id;
        this._targets = [...id.getTargets()];
        if (!core.fqnHandler.exists(fn)) {
            core.fqnHandler.onReady(fn, (name: string) => {
                this._name = name;
            });
        }
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
        if (!this._name) {
            this._name = core.fqnHandler.get(this._fn);
        }
        return this._name;
    }

    get isIdentifier(): boolean {
        return false;
    }

    get asIdentifier(): DecoIdLike<V, M, P> {
        throw $dev.developerError({
            issue: 'clone.is.not.identifier',
            desc: this.description,
            where: 'leyyo.decorator.DecoClone',
            method: 'asIdentifier'
        });
    }

    get asClone(): DecoCloneLike<V, M, P> {
        return this;
    }

    get fn(): Func {
        return this._fn;
    }

    get id(): DecoIdLike<V, M, P> {
        return this._id;
    }

    fqn(pack: string): this {
        core.fqnHandler.decorator(this._fn, pack);
        return this;
    }

    // region target
    targets(...target: Array<Target>): this {
        if (this._dirty) {
            throw $dev.developerError({
                issue: 'decorator.already.decorated.someone',
                desc: this.description,
                where: 'leyyo.decorator.DecoClone',
                method: 'targets'
            });
        }
        if (this._targetSet) {
            throw $dev.developerError({
                issue: 'already.target.set',
                desc: this.description,
                where: 'leyyo.decorator.DecoClone',
                method: 'targets'
            });
        }
        $assert.literalArray(target, TargetItems, () => $dev.desc(this, {field: 'target'}));
        this._targets = target;
        this._targetSet = true;
        return this;
    }

    hasTarget(...targets: Array<Target>): boolean {
        return targets.some(t => this._targets.includes(t));
    }

    getTargets(): Array<Target> {
        return this._targets;
    }

    // endregion target

    // region dirty
    get isDirty(): boolean {
        return this._dirty;
    }

    // endregion dirty

    // region rule
    getRules(): Array<DecoRule> {
        return this._id.getRules();
    }

    hasRule(rule: DecoRule): boolean {
        return this._id.hasRule(rule);
    }

    // endregion rule

    // region keyword
    getKeywords(): Array<string|symbol> {
        return this._id.getKeywords();
    }

    hasKeyword(keyword: string|symbol): boolean {
        return this._id.hasKeyword(keyword);
    }

    // endregion keyword

    // region metadata
    getMetadata<M2 = M>(): M2 {
        return this._id.getMetadata<M2>();
    }

    // endregion metadata

    // region processor
    get hasProcessor(): boolean {
        return this._id.hasProcessor;
    }

    process<R = void>(fork: Array<any> | DecoInstanceLike<V, M, P>, parameters?: P): R {
        let ins: DecoInstanceLike<V, M, P>;
        if (Array.isArray(fork)) {
            ins = this.fork(...fork);
        } else if (fork instanceof DecoInstance) {
            ins = fork;
        } else {
            throw $dev.invalidError({
                issue: 'invalid.instance.defined',
                where: 'leyyo.decorator.DecoClone',
                method: 'process',
                value: fork,
                type: typeof fork,
            });
        }
        return this._id.process(ins, parameters);
    }

    // endregion processor

    assignedClasses(filter?: DecoFilter): Array<ClassReflectionLike> {
        return this._id.assignedClasses(filter);
    }

    assignedParameters(filter?: DecoFilter): Array<ParameterReflectionLike> {
        return this._id.assignedParameters(filter);
    }

    assignedProperties(filter?: DecoFilter): Array<PropertyReflectionLike> {
        return this._id.assignedProperties(filter);
    }

    fork(...args: Array<unknown>): DecoInstanceLike<V, M, P> {
        this._dirty = true;
        this._id.dirty();
        return new DecoInstance<V, M, P>(this._id, this, args);
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
    clearInstances(): void {
        this._id.clearInstances();
    }

    toJSON(simple?: boolean): any {
        if (simple) {
            return {
                name: this._name,
                fn: this._fn?.name,
                targets: this._targets,
            };
        }
        return {
            __: DecoClone.name,
            name: this._name,
            fn: this._fn?.name,
            id: this._id?.name,
            targets: this._targets,
        };
    }
}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(DecoClone, FQN_PCK);
});
