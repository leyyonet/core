import {$assert, $dev, $log, $repo, AsyncFnc, Func} from "@leyyo/common";
import {
    LifecycleAllItem,
    LifecycleBuilder,
    LifecycleItem,
    LifecycleKillLambda,
    LifecycleKillType,
    LifecycleLike,
    LifecycleManageItem,
    LifecycleManageLambda,
    LifecycleStage
} from "./index.types";
import {$$coreInternalOn} from "../internal";
import {core} from "../core";
import {FQN_PCK} from "./internal";

export class Lifecycle implements LifecycleLike {
    private readonly logger = $log.create(Lifecycle);

    protected readonly items = $repo.newMap<LifecycleStage, Array<LifecycleItem>>(FQN_PCK, 'items');
    protected readonly allItems = $repo.newMap<string, LifecycleAllItem>(FQN_PCK, 'allItems');
    protected readonly sorted = $repo.newArray<LifecycleStage>(FQN_PCK, 'sorted');

    constructor() {
        this.items.set('initialize', []);
        this.items.set('validate', []);
        this.items.set('process', []);
        this.items.set('clear', []);
        this.items.set('manage', []);
        this.items.set('kill', []);
    }

    private _sortItems(stage: LifecycleStage): boolean {
        if (!this.items.has(stage)) {
            return false;
        }
        const unsorted = this.items.get(stage);
        if (unsorted.length < 1) {
            return false;
        }
        if (this.sorted.includes(stage)) {
            return true;
        }
        const sorted = unsorted.slice().sort((a, b) => {
            if (b.before.includes(a.name) || a.after.includes(b.name)) {
                return -1;
            }
            if (b.after.includes(a.name) || a.before.includes(b.name)) {
                return 1;
            }
            return 0;
        });
        this.items.set(stage, sorted);
        this.sorted.push(stage);
        return true;
    }

    private _clearItems(stage: LifecycleStage): void {
        if (!this.items.has(stage)) {
            return;
        }
        this.items.set(stage, []);
    }

    private _checkText(stage: LifecycleStage, pck: string, field: string): void {
        $assert.text(pck, () => $dev.opt({issue: `Lifecycle item ${field} is invalid`, value: pck, field, stage}));
    }

    private _checkStage(stage: LifecycleStage, pck: string): void {
        if (!stage || !this.items.has(stage)) {
            throw $dev.developerError2(FQN_PCK, 100, {message: 'Invalid lifecycle stage', stage, pck});
        }
    }
    private _checkLambda(stage: LifecycleStage, name: string, fn: Func): void {
        $assert.func(fn, () => $dev.opt({issue: 'Lifecycle item lambda is invalid', name, stage}));
    }

    private _addItem(stage: LifecycleStage, pck: string, v1:Func|string, v2: Func): LifecycleBuilder {
        this._checkStage(stage, pck);
        this._checkText(stage, pck, 'package');
        let name: string;
        let fn: Func;
        if (typeof v1 === 'function') {
            name = pck;
            fn = v1;
        }
        else {
            this._checkText(stage, v1, 'extension');
            name = `${pck}#${v1}`;
            this._checkLambda(stage, name, v2);
            fn = v2;
        }
        const isAsync = core.footprint.isAsync(fn);
        const item = {name, fn, isAsync, before: [], after: []};
        if (this.allItems.has(pck)) {
            const all = this.allItems.get(pck);
            item.before.push(...all.before);
            item.after.push(...all.after);
        }
        this.items.get(stage).push(item);
        const result = {
            before: (n: string) => {
                $assert.text(n, () => $dev.opt({issue: 'Before name is invalid', name, stage, dir: 'before'}));
                if (!item.before.includes(n)) {
                    item.before.push(n);
                }
                return result;
            },
            after: (n: string) => {
                $assert.text(n, () => $dev.opt({issue: 'After name is invalid', name, stage, dir: 'after'}));
                if (!item.after.includes(n)) {
                    item.after.push(n);
                }
                return result;

            }
        } as LifecycleBuilder;
        return result;
    }

    private async _runItems(stage: LifecycleStage, raise: boolean, ...args: Array<any>): Promise<void> {
        if (!this._sortItems(stage)) {
            return;
        }
        for (const item of this.items.get(stage)) {
            try {
                if (item.isAsync) {
                    await (item.fn as AsyncFnc)(...args);
                } else {
                    (item.fn as Func)(...args);
                }
            } catch (e) {
                if (raise) {
                    throw $dev.developerError2(FQN_PCK, 100, {message: e.message, error: e, name: item.name});
                }
                this.logger.error(e.message, {error: e, stage, name: item.name});
            }
        }
    }

    onInitialize(pck: string, ext: Func|string, fn?: Func): LifecycleBuilder {
        return this._addItem('initialize', pck, ext, fn);
    }

    async initialize(): Promise<void> {
        await this._runItems('initialize', true);
        this._clearItems('initialize');
    }

    onValidate(pck: string, ext: Func|string, fn?: Func): LifecycleBuilder {
        return this._addItem('validate', pck, ext, fn);
    }

    async validate(): Promise<void> {
        await this._runItems('validate', true);
        this._clearItems('validate');
    }

    onProcess(pck: string, ext: Func|string, fn?: Func): LifecycleBuilder {
        return this._addItem('process', pck, ext, fn);
    }

    async process(): Promise<void> {
        await this._runItems('process', true);
        this._clearItems('process');
    }

    onClear(pck: string, ext: Func|string, fn?: Func): LifecycleBuilder {
        return this._addItem('clear', pck, ext, fn);
    }

    async clear(): Promise<void> {
        await this._runItems('clear', false);
        this._clearItems('clear');
    }

    onManage(pck: string, ext: LifecycleManageLambda|string, fn?: LifecycleManageLambda): LifecycleBuilder {
        return this._addItem('manage', pck, ext, fn);
    }

    async manage(item: LifecycleManageItem): Promise<void> {
        await this._runItems('manage', false, item);
        // dont clear
    }

    onKill(pck: string, ext: LifecycleKillLambda|string, fn?: LifecycleKillLambda): LifecycleBuilder {
        return this._addItem('kill', pck, ext, fn);
    }

    async kill(type: LifecycleKillType): Promise<void> {
        await this._runItems('kill', false, type);
        this._clearItems('kill');
    }

    onAll(pck: string): LifecycleBuilder {
        $assert.text(pck, () => $dev.opt({issue: `Lifecycle item package is invalid`, value: pck, field: 'package'}));
        if (this.allItems.has(pck)) {
            throw $dev.developerError2(FQN_PCK, 100, {message: 'Lifecycle all item is duplicated', pck});
        }
        const item = {
            before: [],
            after: [],
        } as LifecycleAllItem;
        this.allItems.set(pck, item);

        const result = {
            before: (n: string) => {
                $assert.text(n, () => $dev.opt({issue: 'Before name is invalid', pck, dir: 'before'}));
                if (!item.before.includes(n)) {
                    item.before.push(n);
                }
                return result;
            },
            after: (n: string) => {
                $assert.text(n, () => $dev.opt({issue: 'After name is invalid', pck, dir: 'after'}));
                if (!item.after.includes(n)) {
                    item.after.push(n);
                }
                return result;
            }
        } as LifecycleBuilder;
        return result;
    }
    toJSON(): any {
        const rec = {};
        this.items.forEach((items, stage) => {
            if (Array.isArray(items) && items.length > 0) {
                rec[stage] = [];
                items.forEach(item => {
                    const recItem = {name: item.name};
                    if (item.isAsync) {
                        recItem['isAsync'] = true;
                    }
                    if (Array.isArray(item.before) && item.before.length > 0) {
                        recItem['before'] = item.before;
                    }
                    if (Array.isArray(item.after) && item.after.length > 0) {
                        recItem['after'] = item.after;
                    }
                    (rec[stage] as Array<unknown>).push(recItem);
                })
            }
        });
        return rec;
    }
}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setLifecycle(new Lifecycle());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(Lifecycle, FQN_PCK);
});
