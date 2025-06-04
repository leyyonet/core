import {$assert, $dev, $is, Arr, Dict, Func, List} from "@leyyo/common";
import {CoreReflectionLike, ReflectionMeta, ReflectionTag} from "./index-types";
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
    private static readonly EMPTY_TAGS = [] as Array<ReflectionTag>;
    private static readonly EMPTY_META = {} as ReflectionMeta;
    private static FILTER = {
        belongs: ['self', 'parent'],
        kind: ['field', 'method'],
        keyword: ['static', 'instance'],
    };
    protected _name: string;
    protected _target: Target;
    protected _type: Func;

    private _docs: List<DecoDoc>;
    private _decorators: Array<DecoIdLike>;
    private _keywords: List<ReflectionTag>;
    private _metadata: ReflectionMeta;
    private _hasInherited: boolean;
    private _hasSelf: boolean;

    // endregion properties
    protected constructor() {
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

    appendKeyword(tag: ReflectionTag): this {
        if (!tag) {
            return this;
        }
        if (!this._keywords) {
            this._keywords = new List();
        }
        if (!this._keywords.includes(tag)) {
            this._keywords.push(tag);
        }
        return this;
    }
    removeKeyword(tag: string|symbol): this {
        if (!tag || !this._keywords) {
            return this;
        }
        if (this._keywords.includes(tag)) {
            this._keywords.delete(tag);
        }
        return this;
    }
    listKeywords(): Array<string|symbol> {
        if (!this._keywords) {
            return AbstractReflection.EMPTY_TAGS;
        }
        return [...this._keywords];
    }
    deleteMetaKey(key: ReflectionTag): this {
        if (!$is.text(key) && typeof key !== 'symbol') {
            return this;
        }
        if (!this._metadata) {
            return this;
        }
        if (this._metadata[key as string] !== undefined) {
            delete this._metadata[key as string];
        }
        return this;

    }
    setMetaKey(key: ReflectionTag, value: any): this {
        if (!$is.text(key) && typeof key !== 'symbol') {
            return this;
        }
        if (!this._metadata) {
            this._metadata = {};
        }
        this._metadata[key as string] = value;
        return this;
    }
    hasMetaKey(key: ReflectionTag): boolean {
        if (!$is.text(key) && typeof key !== 'symbol') {
            return false;
        }
        if (!this._metadata) {
            return false;
        }
        return !!this._metadata[key];
    }
    getMetaKey<T = any>(key: ReflectionTag): T {
        if (!$is.text(key) && typeof key !== 'symbol') {
            return undefined;
        }
        if (!this._metadata) {
            return undefined;
        }
        return this._metadata[key];
    }
    getMetadata<R extends ReflectionMeta = ReflectionMeta>(): R {
        if (!this._metadata) {
            return AbstractReflection.EMPTY_META as R;
        }
        return {...this._metadata} as R;
    }

    // region decorator

    protected _copyDecorators(source: CoreReflectionLike, target: CoreReflectionLike): void {
        source.docsAll().forEach(doc => {
            try {
                target.copyValue(doc.ins, doc.value);
            } catch (_e) {
            }
        });
    }

    sortValues(): this {
        if (!this._docs) {
            return this;
        }
        const sorted = this._docs.slice().sort((a, b) => {
            const left = a.ins.identifier;
            const right = b.ins.identifier;
            if (left.isBefore(right) || right.isAfter(left)) {
                return -1;
            }
            if (left.isAfter(right) || right.isBefore(left)) {
                return 1;
            }
            return 0;
        });
        this._docs.clear();
        this._docs.push(...sorted);
        return this;
    }
    clearValue(ins: DecoInstanceLike): this {
        if (!this._docs) {
            return this;
        }
        const id = ins.identifier;
        this._docs
            .filter(doc => doc.ins.identifier === id)
            .forEach(doc => {
                this._docs.delete(doc);
            });
        return this;
    }
    private _createDocs(clear?: boolean): void {
        if (!this._docs) {
            this._docs = new List();
        }
        else if (clear) {
            this._docs.clear();
        }
    }
    private _appendValue<V extends Dict>(ins: DecoInstanceLike, value: V, inherited: boolean, copied: boolean): void {
        const id = ins.identifier;
        // ignore if inherited value
        if (id.hasRule('no-inherited') && inherited) {
            return;
        }
        if (id.hasRule('no-copy') && copied) {
            return;
        }

        $assert.bareObject(value, () => $dev.desc(ins, {field: 'value'}));
        const found = this._docs ? this._docs.filter(doc => doc.ins.identifier === id) : [];
        let refreshDecorators = true;
        // more docs for one deco
        if (found.length > 0) {
            if (id.hasRule('ignore-if-exists') && !id.hasRule('iterable')) {
                return;
            }
            if (id.hasRule('no-multiple') && ins !== found[0].ins) {
                throw $dev.developerError2(FQN_PCK, 121, {issue: 'Decorator does not allow multiple value for same target', desc: found[0].ins.description});
            }
            if (id.hasRule('override-if-exists') && !id.hasRule('iterable')) {
                // clear values
                const clone = this._docs ? this._docs.filter(doc => doc.ins.identifier !== id) : [];
                if (clone.length > 0) {
                    this._createDocs(true);
                    this._docs.push(...clone);
                    clone.splice(0, clone.length);
                }
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
            const selected = this._docs ? this._docs.filter(doc => doc.ins.identifier === id) : [];
            const arr = Array.isArray(cloned) ? cloned : [cloned];
            if (selected.length > 0) {
                (selected[0].value as Arr).push(...arr);
            } else {
                this._createDocs();
                const doc = {ins, value: arr} as DecoDoc;
                if (inherited) {
                    doc.inherited = true;
                }
                if (copied) {
                    doc.copied = true;
                }
                this._docs.push(doc);
            }
        } else {
            this._createDocs();
            const doc = {ins, value: cloned} as DecoDoc;
            if (inherited) {
                doc.inherited = true;
            }
            if (copied) {
                doc.copied = true;
            }
            this._docs.push(doc);
        }
        if (refreshDecorators) {
            this._refreshDecorators();
        }
    }
    copyValue<V extends Dict>(ins: DecoInstanceLike, value: V): this {
        this._appendValue(ins, value, true, true);
        return this;
    }
    setValue<V extends Dict>(ins: DecoInstanceLike, value: V): this {
        this._appendValue(ins, value, (ins.assigned !== this), false);
        return this;
    }

    protected _refreshDecorators(): void {
        if (!this._docs) {
            return;
        }
        this._decorators = [];
        this._docs
            .map(doc => doc.ins.identifier)
            .forEach(id => {
                if (!this._decorators.includes(id)) {
                    this._decorators.push(id);
                }
            });
    }

    decorators(filter?: DecoFilterBelongs): Array<DecoIdLike> {
        if (!this._decorators) {
            return [];
        }
        if (!filter) {
            return [...this._decorators];
        }
        const arr = [] as Array<DecoIdLike>;
        this.docsByFilter(filter)
            .map(doc => doc.ins.identifier)
            .forEach(id => {
                if (!arr.includes(id)) {
                    arr.push(id);
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
        return this._docs ? [...this._docs] as Array<DecoDoc<V>> : [];
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
                    return this._docs ? [...this._docs] as Array<DecoDoc<V>> : [];
                }
                // filter if it is owned
                return this._docs ? this._docs.filter(doc => !doc.inherited) as Array<DecoDoc<V>> : [];
            case "parent":
                // expected inherited but there is not any inherited
                if (!this._hasInherited) {
                    return [];
                }
                // expected inherited and all of them are inherited
                if (!this._hasSelf) {
                    return this._docs ? [...this._docs] as Array<DecoDoc<V>> : [];
                }
                // filter if it is inherited
                return this._docs ? this._docs.filter(doc => doc.inherited) as Array<DecoDoc<V>> : [];
            default:
                // all of them
                return this._docs ? [...this._docs] as Array<DecoDoc<V>> : [];
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
        if ((onlyInherited || onlySelected) && this._docs) {
            for (const doc of this._docs) {
                if (onlySelected && !ids.includes(doc.ins.identifier)) {
                    remaining.push(doc);
                } else if (onlyInherited && !doc.inherited) {
                    remaining.push(doc);
                }
            }
        }
        // clear all
        if (this._docs) {
            delete this._docs;
        }
        if (remaining.length) {
            this._createDocs();
            this._docs.push(...remaining);
        }
        this._refreshDecorators();
        return this;
    }

    toJSON(simple?: boolean): any {
        const rec = {};
        if (this._docs) {
            rec['decorators'] = this._docs.map(doc => {
                const rec = {};
                rec['deco'] = doc.ins.toJSON(true);
                if (doc.inherited) {
                    rec['inherited'] = true;
                }
                if (doc.copied) {
                    rec['copied'] = true;
                }
                rec['value'] = doc.value;
                return rec;
            });

        }
        if (simple) {
            return rec;
        }
        if (this._keywords) {
            rec['keywords'] = this._keywords;
        }
        if (this._metadata) {
            rec['metadata'] = this._metadata;
        }
        return rec;
    }
}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(AbstractReflection, FQN_PCK);
});
