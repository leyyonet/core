import {CoreReflectionLike} from "./index-types";
import {DecoFilter, DecoFilterBelongs, DecoInstanceLike, DecoLike, Target} from "../../decorator";
import {Dict, Func, to} from "@leyyo/common";
import {core} from "../../core";
import {decorator} from "../../index";

// console.log(__filename);

export abstract class AbstractReflection implements CoreReflectionLike {
    // region properties
    private static FILTER = {
        belongs: ['self', 'parent'],
        kind: ['field', 'method'],
        keyword: ['static', 'instance'],
    };
    protected _name: string;
    protected _target: Target;
    protected _type: Func;
    protected _currentInstance: DecoInstanceLike;
    protected readonly _decoratorMap: Map<DecoLike, Array<Dict>>;
    protected readonly _emptyDecoMap = new Map<DecoLike, Array<Dict>>();

    // endregion properties
    protected constructor(currentInstance?: DecoInstanceLike) {
        this._currentInstance = currentInstance;
        this._decoratorMap = new Map<DecoLike, Array<Dict>>();
    }

    // region private
    private _check(id: DecoLike): Array<Dict> {
        if (!this._decoratorMap.has(id)) {
            this._decoratorMap.set(id, []);
        }
        return this._decoratorMap.get(id);
    }

    private static _castValue(data: unknown): Dict {
        return to.object(data) ?? {};
    }

    protected _filter<F = DecoFilter>(filter: F, ...conditions: Array<'belongs' | 'keyword' | 'kind'>): F {
        filter = (to.object(filter) ?? {}) as F;
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
        for (const [id, item] of this._decoratorMap.entries()) {
            result.identifiers.push({
                identifier: {'$ref': id.description},
                values: item,
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

    get currentIdentifier(): DecoLike {
        return this._currentInstance?.identifier ?? null;
    }

    get currentInstance(): DecoInstanceLike {
        return this._currentInstance;
    }

    // endregion getters
    // region decorator
    setValue<V extends Dict>(decorator: Func | string, value: V): this {
        const id = core.decorator.get(decorator, true)?.value;
        if (!id?.isForbidden('no-multiple')) {
            this._check(id).push(AbstractReflection._castValue(value));
        } else {
            // overwrite the existing
            this._decoratorMap.set(id, [AbstractReflection._castValue(value)]);
        }
        return this;
    }

    decorators(filter?: DecoFilterBelongs): Array<DecoLike> {
        return Array.from(this.$filterDecorators(filter).keys());
    }
    decoMap(filter?: DecoFilterBelongs): Record<string, Array<Dict>> {
        const result: Record<string, Array<Dict>> = {};
        for (const [id, item] of this.$filterDecorators(filter).entries()) {
            result[id.name] = item;
        }
        return result;
    }

    hasDecorator(decorator: Func | string, filter?: DecoFilterBelongs): boolean {
        const id = core.decorator.get(decorator, false)?.value;
        return id && this.$filterDecorators(filter).has(id);
    }

    listValues<V extends Dict = Dict>(decorator: Func | string, filter?: DecoFilterBelongs): Array<V> {
        const id = core.decorator.get(decorator, false)?.value;
        const map = this.$filterDecorators(filter);
        if (id && map.has(id)) {
            return map.get(id) as Array<V>;
        }
        return [];
    }

    getValue<V extends Dict = Dict>(decorator: Func | string, filter?: DecoFilterBelongs): V {
        const list = this.listValues<V>(decorator, filter);
        return list.length > 0 ? list[0] : null;
    }

    // endregion decorator
    // region filter-by
    filterByBelongs(decorator: Func | string, filter?: DecoFilterBelongs): boolean {
        return this.hasDecorator(decorator, filter);
    }

    filterByTarget(...targets: Array<Target>): boolean {
        return targets.length < 1 || targets.includes(this._target);
    }

    // endregion filter-by

    // region secure
    // region secure
    abstract $filterDecorators(filter?: DecoFilterBelongs): Map<DecoLike, Array<Dict>>;

    // endregion secure
    // endregion secure
}