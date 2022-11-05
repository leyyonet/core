import {
    ClassReflectLike,
    ParameterReflectLike,
    PropertyReflectLike,
    ReflectDecoratorItem,
    ReflectDescribed,
    ReflectLike
} from "./types";
import {DecoAliasLike, DecoFilter, DecoInheritanceFilter, DecoLike} from "../deco";
import {FuncLike, RecLike} from "../common";
import {TargetLike} from "./enums";
import {$ly} from "../core";
import {DeveloperException} from "../error";

let _LOG = $ly.preLog;

/**
 * @abstract
 * */
export abstract class AbstractReflect implements ReflectLike {
    // region properties
    protected _target: TargetLike;
    protected _currentDeco: DecoLike;
    protected readonly _decoratorItems: Array<ReflectDecoratorItem>;
    // endregion properties

    static {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            _LOG = $ly.logger.assign(this);
        });
    }
    protected constructor() {
        this._decoratorItems = [];
    }

    // region private
    private static _castValue(data: unknown): RecLike {
        return $ly.primitive.object(data) ?? {};
    }
    // endregion private
    // region getters
    info(detailed?: boolean): RecLike {
        const result = {decorators: []};
        this._decoratorItems.forEach(item => {
            result.decorators.push({
                deco: item.deco.description,
                values: item.values,
                tags: item.tags,
            });
        })
        return result;
    }
    abstract get description(): string;
    abstract get shortDescription(): string;
    abstract getDescribed(): ReflectDescribed;
    get target(): TargetLike {
        return this._target;
    }
    get $currentDeco(): DecoLike {
        return this._currentDeco;
    }
    // endregion getters
    // region internal
    $setCurrentDeco(deco: DecoLike): this {
        this._currentDeco = deco;
        return this;
    }
    get asClass(): ClassReflectLike {
        if (this._target !== 'class') {
            throw new DeveloperException('reflect:not.class')
                .with(this)
                .patch({description: this.description});
        }
        return this as unknown as ClassReflectLike;
    }
    get asProperty(): PropertyReflectLike {
        if (!['method', 'field'].includes(this._target)) {
            throw new DeveloperException('reflect:not.property')
                .with(this)
                .patch({description: this.description});
        }
        return this as unknown as PropertyReflectLike;
    }
    get asParameter(): ParameterReflectLike {
        if (this._target !== 'parameter') {
            throw new DeveloperException('reflect:not.parameter')
                .with(this)
                .patch({description: this.description});
        }
        return this as unknown as ParameterReflectLike;
    }

    decoratorItems(filter?: DecoFilter): Array<ReflectDecoratorItem> {
        filter = filter ?? {};
        const result = [] as Array<ReflectDecoratorItem>;
        this._decoratorItems.forEach(item => {
            if (filter?.fromChild && !item.deco.isFinal) {
                result.push({
                    deco: item.deco,
                    values: item.values,
                    tags: item.tags,
                    target: this,
                });
            } else if (!filter?.fromChild) {
                result.push({
                    deco: item.deco,
                    values: item.values,
                    tags: item.tags,
                });
            }
        });
        return result;
    }
    decoratorItem(deco: DecoLike, filter?: DecoInheritanceFilter, isEmpty = false): ReflectDecoratorItem {
        filter = filter ?? {};
        const found = this.decoratorItems(filter).filter(item => item.deco === deco)[0];
        if (found) {
            return found;
        }
        if (isEmpty) {
            return {deco, values: [], tags: {}};
        }
        const item: ReflectDecoratorItem = {
            deco,
            values: [],
            tags: {},
        }
        this._decoratorItems.push(item);
        return item;
    }
    // endregion internal
    // region decorator
    $setValue(deco: DecoLike, value: RecLike, runOChanged: boolean): void {
        const item = this.decoratorItem(deco, {belongs: 'self'});
        if (deco.multiple) {
            item.values.push(AbstractReflect._castValue(value));
        } else {
            item.values = [AbstractReflect._castValue(value)];
        }
        if (runOChanged) {
            deco.$onChanged(this);
        }
    }
    setValue(identifier: DecoLike | DecoAliasLike | FuncLike | string, value: RecLike): this {
        const deco = $ly.deco.getDecorator(identifier as DecoLike, true);
        this.$setValue(deco, value, true);
        return this;
    }
    clearValues(identifier: DecoLike | DecoAliasLike | FuncLike | string): number {
        const deco = $ly.deco.getDecorator(identifier as DecoLike, true);
        const assignment = this.decoratorItem(deco, {belongs: 'self'});
        const count = assignment.values.length;
        assignment.values = [];
        deco.$onChanged(this);
        return count;
    }

    decorators(filter?: DecoFilter): Array<FuncLike> {
        return this.decoratorItems(filter).map(item => item.deco.fn);
    }
    hasDecorator(identifier: DecoLike | DecoAliasLike | FuncLike | string, filter?: DecoInheritanceFilter): boolean {
        const deco = $ly.deco.getDecorator(identifier as DecoLike, true);
        return this.decoratorItems(filter).map(item => item.deco).includes(deco);
    }
    listValues<V extends RecLike = RecLike>(identifier: DecoLike | DecoAliasLike | FuncLike | string, filter?: DecoInheritanceFilter): Array<V> {
        const deco = $ly.deco.getDecorator(identifier as DecoLike, true);
        return this.decoratorItem(deco, filter, true).values as Array<V>;
    }
    getValue<V extends RecLike = RecLike>(identifier: DecoLike | DecoAliasLike | FuncLike | string, filter?: DecoInheritanceFilter): V {
        const values = this.listValues<V>(identifier, filter);
        return values.length > 0 ? values[0] : undefined;
    }
    getTag(identifier: DecoLike | DecoAliasLike | FuncLike | string, filter?: DecoInheritanceFilter): RecLike {
        return undefined;
    }
    // endregion decorator
    // region filter-by
    filterByBelongs(identifier: DecoLike | DecoAliasLike | FuncLike | string, filter?: DecoInheritanceFilter): boolean {
        return this.hasDecorator(identifier, filter);
    }
    filterByTargetType(...targets: Array<TargetLike>): boolean {
        return targets.length < 1 || targets.includes(this._target);
    }
    // endregion filter-by
}