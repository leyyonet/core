import {$assert, $descriptor, $dev, $is, $repo, Arr, Dict, Func, List} from "@leyyo/common";
import {CoreReflectionLike} from "./index-types";
import {
    DecoCLearType,
    DecoClone,
    DecoDoc,
    DecoDocExtended,
    DecoFilter,
    DecoFilterBelongs,
    DecoId,
    DecoIdLike,
    DecoInstanceLike,
    DecoLike,
    Target
} from "../../decorator";
import {core} from "../../core";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";


export abstract class AbstractReflection implements CoreReflectionLike {
    // region properties
    private static FILTER = {
        belongs: ['self', 'parent'],
        kind: ['field', 'method'],
        keyword: ['static', 'instance'],
    };
    protected readonly _code: string;
    protected _name: string;
    protected _target: Target;
    protected _type: Func;

    protected readonly _docs: List<DecoDoc>;
    protected readonly _decorators: Array<DecoLike>;
    protected _hasInherited: boolean;
    protected _hasSelf: boolean;

    // endregion properties
    protected constructor(...args: Array<any>) {
        this._code = args.join('.');
        this._docs = $repo.newList(FQN_PCK, this._code, 'docs');
        this._decorators = [];
    }

    // region private
    protected _filter<F = DecoFilter>(filter: F, ...conditions: Array<'belongs' | 'keyword' | 'kind'>): F {
        filter = $is.bareObject(filter) ? filter : ({} as F);
        conditions.forEach(condition => {
            if (filter[condition] !== undefined && AbstractReflection.FILTER[condition] !== undefined) {
                if (!AbstractReflection.FILTER[condition].includes(filter[condition])) {
                    delete filter[condition];
                }
            }
        });
        return filter;
    }

    // endregion private
    // region getters
    // noinspection JSUnusedLocalSymbols
    info(detailed?: boolean): Dict {
        const result = {identifiers: []};

        for (const doc of this._docs) {
            result.identifiers.push({
                identifier: doc.ins.identifier.name,
                inherited: doc.inherited,
                value: doc.value,
            });
        }
        return result;
    }

    abstract get description(): string;

    get target(): Target {
        return this._target;
    }

    get type(): Func {
        return this._type;
    }

    get name(): string {
        return this._name;
    }

    // endregion getters
    // region decorator

    clearValue(ins: DecoInstanceLike): this {
        const id = ins.identifier;
        this._docs
            .filter(doc => doc.ins.identifier === id)
            .forEach(doc => {
                this._docs.delete(doc);
            });
        return this;
    }
    setValue<V extends Dict>(ins: DecoInstanceLike, value: V): this {
        const id = ins.identifier;
        $assert.bareObject(value, () => $dev.desc(ins, {field: 'value'}));

        const inherited = (ins.assigned === this) ? undefined : true;
        // ignore if inherited value
        if (id.hasRule('no-inherited') && inherited) {
            return this;
        }

        const found = this._docs.filter(doc => doc.ins.identifier === id);
        let refreshDecorators = true;
        // more docs for one deco
        if (found.length > 0) {
            if (id.hasRule('ignore-if-exists') && !id.hasRule('iterable')) {
                return this;
            }
            if (id.hasRule('no-multiple') && ins !== found[0].ins) {
                throw $dev.developerError2(FQN_PCK, 121, {issue: 'Decorator does not allow multiple value for same target', desc: found[0].ins.description});
            }
            if (id.hasRule('override-if-exists') && !id.hasRule('iterable')) {
                // clear values
                const clone = this._docs.filter(doc => doc.ins.identifier !== id);
                this._docs.splice(0, this._docs.length);
                this._docs.push(...clone);
                clone.splice(0, clone.length);
                refreshDecorators = false;
            }
        }
        if (inherited) {
            this._hasInherited = true;
        } else {
            this._hasSelf = true;
        }
        const cloned = Array.isArray(value) ? [...value] : {...value};
        if (id.hasRule('iterable')) {
            const selected = this._docs.filter(doc => doc.ins.identifier === id);
            const arr = Array.isArray(cloned) ? cloned : [cloned];
            if (selected.length > 0) {
                (selected[0].value as Arr).push(...arr);
            } else {
                this._docs.push({ins, inherited, value: arr});
            }
        } else {
            this._docs.push({ins, inherited, value: cloned});
        }
        if (refreshDecorators) {
            this._refreshDecorators();
        }
        return this;
    }

    protected _refreshDecorators(): void {
        this._decorators.splice(0, this._decorators.length);
        this._docs
            .map(doc => doc.ins.identifier)
            .forEach(deco => {
                if (!this._decorators.includes(deco)) {
                    this._decorators.push(deco);
                }
            });
    }

    decorators(filter?: DecoFilterBelongs): Array<DecoLike> {
        if (!filter) {
            return [...this._decorators];
        }
        const arr = [] as Array<DecoLike>;
        this.docsByFilter(filter)
            .map(doc => doc.ins.identifier)
            .forEach(deco => {
                if (!arr.includes(deco)) {
                    arr.push(deco);
                }
            });
        return arr;
    }

    private _findId(given: Func | string | DecoLike): DecoIdLike {
        let deco: DecoIdLike;
        if (given instanceof DecoId) {
            deco = given;
        } else if (given instanceof DecoClone) {
            deco = given.id;
        } else {
            const found = core.decoratorPool.get(given as DecoLike, false);
            if (!found) {
                return undefined;
            }
            if (found instanceof DecoId) {
                deco = found;
            } else if (found instanceof DecoClone) {
                deco = found.id;
            } else {
                return undefined;
            }
        }
        return deco;
    }

    hasDecorator(given: Func | string | DecoLike, filter?: DecoFilterBelongs): boolean {
        return this.decorators(filter).includes(this._findId(given));
    }

    private _buildDoc<V = Dict, M = Dict>(inside: DecoDoc<V>, metadata: M): DecoDocExtended<V, M> {
        const doc = {ins: inside.ins, value: inside.value, metadata} as DecoDocExtended<V, M>;
        if (inside.inherited) {
            doc.inherited = true;
        }
        return doc;
    }

    listDocsByDeco<V = Dict, M = Dict>(given: Func | string | DecoLike, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<DecoDocExtended<V, M>> {
        const id = this._findId(given);
        if (!id) {
            return [];
        }
        const docs = this.docsByFilter<V>(filter)
            .filter(doc => doc.ins.identifier === id);
        if (docs.length < 1) {
            return [];
        }
        const metadata = id.getMetadata<M>();
        if (onlyOne) {
            return [this._buildDoc(docs[docs.length - 1], metadata)];
        }
        return docs.map(doc => this._buildDoc(doc, metadata));
    }

    getDocByDeco<V = Dict, M = Dict>(given: Func | string | DecoLike, filter?: DecoFilterBelongs): DecoDocExtended<V, M> {
        const list = this.listDocsByDeco<V, M>(given, filter, true);
        return list.length > 0 ? list[0] : undefined;
    }

    // endregion decorator

    // region value

    listValuesByDeco<V = Dict>(given: Func | string | DecoLike, filter?: DecoFilterBelongs, onlyOne?: boolean): Array<V> {
        const id = this._findId(given);
        if (!id) {
            return [];
        }
        const docs = this.docsByFilter<V>(filter)
            .filter(doc => doc.ins.identifier === id);
        if (docs.length < 1) {
            return [];
        }
        if (onlyOne) {
            return [docs[docs.length - 1].value];
        }
        return docs.map(doc => doc.value);
    }

    getValueByDeco<A = Dict>(given: Func | string | DecoLike, filter?: DecoFilterBelongs): A {
        const list = this.listValuesByDeco<A>(given, filter, true);
        return list.length > 0 ? list[0] : undefined;
    }

    // endregion value

    // region filter-by
    filterByBelongs(decorator: Func | string, filter?: DecoFilterBelongs): boolean {
        return this.hasDecorator(decorator, filter);
    }

    filterByTarget(...targets: Array<Target>): boolean {
        return targets.length < 1 || targets.includes(this._target);
    }

    docsAll<V = Dict>(): Array<DecoDoc<V>> {
        return [...this._docs] as Array<DecoDoc<V>>;
    }

    docsByFilter<V = Dict>(filter?: DecoFilterBelongs): Array<DecoDoc<V>> {
        switch (filter?.belongs) {
            case "self":
                // expected owned but there is not any owned
                if (!this._hasSelf) {
                    return [];
                }
                // expected owned and all of them are owned
                if (!this._hasInherited) {
                    return [...this._docs] as Array<DecoDoc<V>>;
                }
                // filter if it is owned
                return this._docs.filter(doc => !doc.inherited) as Array<DecoDoc<V>>;
            case "parent":
                // expected inherited but there is not any inherited
                if (!this._hasInherited) {
                    return [];
                }
                // expected inherited and all of them are inherited
                if (!this._hasSelf) {
                    return [...this._docs] as Array<DecoDoc<V>>;
                }
                // filter if it is inherited
                return this._docs.filter(doc => doc.inherited) as Array<DecoDoc<V>>;
            default:
                // all of them
                return [...this._docs] as Array<DecoDoc<V>>;
        }
    }

    // endregion filter-by

    // noinspection JSUnusedGlobalSymbols
    $clearValues(type: DecoCLearType, ...decorators: Array<Func | DecoLike | string>): this {
        const ids = [] as Array<DecoIdLike>;
        let onlyInherited: boolean;
        let onlySelected: boolean;
        switch (type) {
            case "both-all":
                break;
            case "both-selected":
                onlySelected = true;
                break;
            case "inherited-all":
                onlyInherited = true;
                break;
            case "inherited-selected":
                onlySelected = true;
                onlyInherited = true;
                break;
        }
        if (onlySelected) {
            decorators.forEach((deco, index) => {
                const id = this._findId(deco);
                if (!id) {
                    throw $dev.developerError({
                        issue: 'invalid.decorator',
                        where: 'leyyo.reflection.AbstractReflection',
                        value: deco,
                        type: typeof deco,
                        index,
                    });
                }
                ids.push(id);
            });
        }
        const remaining = [] as Array<DecoDoc>;
        if (onlyInherited || onlySelected) {
            for (const doc of this._docs) {
                if (onlySelected && !ids.includes(doc.ins.identifier)) {
                    remaining.push(doc);
                } else if (onlyInherited && !doc.inherited) {
                    remaining.push(doc);
                }
            }
        }
        // clear all
        this._docs.splice(0, this._docs.length);
        if (remaining.length) {
            this._docs.push(...remaining);
        }
        this._refreshDecorators();
        return this;
    }

    toJSON(_simple?: boolean): any {
        return {
            decorators: this._decorators?.map(d => d.name),
        }
    }
    get code(): string {
        return this._code;
    }

}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(AbstractReflection, FQN_PCK);
});
