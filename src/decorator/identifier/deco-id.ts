import {ClassLike, Dict, Func, is} from "@leyyo/common";
import {DecoIdLike, DecoIdSecure} from "./index-types";
import {DecoInstance, DecoInstanceLike} from "../instance";
import {
    ClassReflectionLike,
    CoreReflectionLike,
    ParameterReflectionLike,
    PropertyReflectionLike
} from "../../reflection";
import {Forbidden, Target} from "../literals";
import {core} from "../../core";
import {DecoFilter} from "../abstract";
import {DecoCloneLike} from "../clone";

// console.log(__filename);

export class DecoId<V extends Dict = Dict> implements DecoIdLike<V>, DecoIdSecure<V> {
    private readonly _fn: Func;
    private readonly _instances: Array<DecoInstanceLike>;
    private readonly _target: Array<Target>;
    private readonly _forbidden: Array<Forbidden>;
    private readonly _keywords: Array<string>;
    private readonly _clones: Array<DecoCloneLike>;

    constructor(fn: Func, target: Array<Target>, forbidden: Array<Forbidden>) {
        this._fn = fn;
        this._clones = [];
        if (!is.array(target)) {
            target = [];
        }
        if (!is.array(forbidden)) {
            forbidden = [];
        }
        if (target.length < 1) {
            target.push('class', 'method', 'field', 'parameter');
        }
        this._target = target;
        this._forbidden = forbidden;
        this._keywords = [];
        this._instances = [];
    }

    // region getter
    info(detailed?: boolean): Dict {
        const rec = {
            name: this.name,
        } as Dict;
        if (detailed) {
            rec.target = [...this._target];
            rec.forbidden = [...this._forbidden];
        }
        return rec;
    }

    get name(): string {
        return core.fqn.get(this._fn);
    }
    get isIdentifier(): boolean {
        return true;
    }
    get asIdentifier(): DecoIdLike {
        return this;
    }
    get asClone(): DecoCloneLike {
        return null;
    }

    get fn(): Func {
        return this._fn;
    }

    get description(): string {
        return `<identifier>${this.name}`;
    }

    get forbidden(): Array<Forbidden> {
        return [...this._forbidden];
    }
    get keywords(): Array<string> {
        return [...this._keywords];
    }
    addKeyword(...keywords: Array<string>): number {
        let count = 0;
        keywords.forEach(keyword => {
            if (!this._keywords.includes(keyword)) {
                this._keywords.push(keyword);
                count++;
            }
        });
        return count;
    }
    hasKeyword(keyword: string): boolean {
        return this._keywords.includes(keyword);
    }

    get target(): Array<Target> {
        return [...this._target];
    }

    hasTarget(...targets: Array<Target>): boolean {
        return targets.some(t => this._target.includes(t));
    }

    isForbidden(forbidden: Forbidden): boolean {
        return forbidden && this._forbidden.includes(forbidden);
    }

    get instances(): Array<DecoInstanceLike> {
        return this._instances;
    }

    // endregion getter

    // region public
    fork(...descriptors: Array<unknown>): DecoInstanceLike<V> {
        return new DecoInstance(this, null, descriptors);
    }

    assign(coreReflect: CoreReflectionLike, value: V): void {
        coreReflect.setValue(this._fn, value);
    }

    // endregion public


    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectionLike> {
        return this._instances.map(ins => ins.assigned as ClassReflectionLike)
            .filter(item => item.filterByTarget('class'))
            .filter(item => item.filterByBelongs(this._fn, filter));
    }

    valueByClass(fn: ClassLike | Func | string, filter?: DecoFilter): V {
        const reflection = core.reflection.fetchValue(fn);
        if (!reflection) {
            return null;
        }
        return reflection.getValue(this._fn, filter) as V;
    }

    valuesByClass(fn: ClassLike | Func | string, filter?: DecoFilter): Array<V> {
        const reflection = core.reflection.fetchValue(fn);
        if (!reflection) {
            return [];
        }
        return reflection.listValues(this._fn, filter) as Array<V>;
    }

    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectionLike> {
        return this._instances
            .map(ins => ins.assigned as PropertyReflectionLike)
            .filter(item => item.filterByTarget('method', 'field'))
            .filter(item => item.filterByKind(filter))
            .filter(item => item.filterByBelongs(this._fn, filter))
            ;
    }

    valueByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): V {
        const reflection = core.reflection.fetchValue(fn);
        if (!reflection) {
            return null;
        }
        const prop = reflection.getAnyProperty(propName, filter);
        return prop?.getValue(this._fn, filter) as V ?? null;
    }

    valuesByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): Array<V> {
        const reflection = core.reflection.fetchValue(fn);
        if (!reflection) {
            return [];
        }
        const prop = reflection.getAnyProperty(propName, filter);
        return prop?.listValues(this._fn, filter) as Array<V> ?? [];
    }

    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectionLike> {
        return this._instances
            .map(ins => ins.assigned as ParameterReflectionLike)
            .filter(item => item.filterByTarget('parameter'))
            .filter(item => item.filterByBelongs(this._fn, filter))
            ;
    }

    valueByParameter(fn: Func | string, name: PropertyKey, index: number, filter?: DecoFilter): V {
        const reflection = core.reflection.fetchValue(fn);
        if (!reflection) {
            return null;
        }
        filter = filter ?? {};
        filter.kind = 'method';
        const prop = reflection.getAnyProperty(name, filter);
        if (!prop || !prop.hasParameter(index)) {
            return null;
        }
        const param = prop.getParameter(index);
        return param.getValue(this._fn) as V;
    }

    valuesByParameter(fn: Func | string, name: PropertyKey, index: number, filter?: DecoFilter): Array<V> {
        const reflection = core.reflection.fetchValue(fn);
        if (!reflection) {
            return [];
        }
        filter = filter ?? {};
        filter.kind = 'method';
        const prop = reflection.getAnyProperty(name, filter);
        if (!prop || !prop.hasParameter(index)) {
            return [];
        }
        const param = prop.getParameter(index);
        return param.listValues(this._fn) as Array<V>;
    }

    // endregion parameter

    get $back(): DecoIdLike<V> {
        return this;
    }


    get $secure(): DecoIdSecure<V> {
        return this;
    }

    get clones(): Array<DecoCloneLike> {
        return [...this._clones];
    }


}