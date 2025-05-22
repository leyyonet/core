import {$assert, $dev, $log, $repo, $test, AsyncFnc, DevOpt, Func, List} from "@leyyo/common";
import {
    LifecycleBuilder,
    LifecycleItem,
    LifecycleKillLambda, LifecycleKillType,
    LifecycleLike,
    LifecycleManageItem,
    LifecycleManageLambda,
    LifecycleSecure, LifecycleStage
} from "./index.types";
import {$$coreInternalOn} from "../internal";
import {core} from "../core";
import {FQN_PCK} from "./internal";

export class Lifecycle implements LifecycleLike, LifecycleSecure {
    private readonly logger = $log.create(Lifecycle);
    readonly infoMessages: List<DevOpt>;
    readonly redundantMessages: List<DevOpt>;
    readonly warningMessages: List<DevOpt>;

    protected readonly items: Map<LifecycleStage, Array<LifecycleItem>>;
    protected readonly sorted: Array<LifecycleStage>;

    constructor() {
        this.infoMessages = $repo.newList(FQN_PCK, 'infoMessages');
        this.redundantMessages = $repo.newList(FQN_PCK, 'redundantMessages');
        this.warningMessages = $repo.newList(FQN_PCK, 'warningMessages');

        this.items = $repo.newMap(FQN_PCK, 'items');
        this.sorted = $repo.newArray(FQN_PCK, 'sorted');
        this.items.set('initialize', []);
        this.items.set('validate', []);
        this.items.set('process', []);
        this.items.set('clear', []);
        this.items.set('manage', []);
        this.items.set('kill', []);
    }
    get $back(): LifecycleLike {
        return this;
    }

    get $secure(): LifecycleSecure {
        return this;
    }

    // region stage
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
    private _checkName(stage: LifecycleStage, name: string): void {
        $assert.text(name, () => $dev.opt({issue: 'Lifecycle item name is invalid', value: name, stage}));
        if (!this.items.has(stage)) {
            throw $dev.developerError2(FQN_PCK, 100, {message: 'Invalid Lifecycle stage', stage, name});
        }
        if (this.items.get(stage).filter(item => item.name === name).length > 0) {
            throw $dev.developerError2(FQN_PCK, 100, {message: 'Lifecycle item is duplicated', stage, name});
        }
    }
    private _checkLambda(stage: LifecycleStage, name: string, fn: Func): void {
        $assert.func(fn, () => $dev.opt({issue: 'Lifecycle item lambda is invalid', name, stage}));
    }
    private _addItem(stage: LifecycleStage, name: string, fn: Func): LifecycleBuilder {
        this._checkName(stage, name);
        this._checkLambda(stage, name, fn);
        const isAsync = core.footprint.isAsync(fn);
        const item = {name, fn, isAsync, before: [], after: []};
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
                }
                else {
                    (item.fn as Func)(...args);
                }
            }
            catch (e) {
                if (raise) {
                    throw $dev.developerError2(FQN_PCK, 100, {message: e.message, error: e, name: item.name});
                }
                this.logger.error(e.message, {error: e, stage, name: item.name});
            }
        }
    }
    onInitialize(name: string, fn: Func): LifecycleBuilder {
        return this._addItem('initialize', name, fn);
    }
    async initialize(): Promise<void> {
        await this._runItems('initialize', true);
        this._clearItems('initialize');
    }

    onValidate(name: string, fn: Func): LifecycleBuilder {
        return this._addItem('validate', name, fn);
    }
    async validate(): Promise<void> {
        await this._runItems('validate', true);
        this._clearItems('validate');
    }

    onProcess(name: string, fn: Func): LifecycleBuilder {
        return this._addItem('process', name, fn);
    }
    async process(): Promise<void> {
        await this._runItems('process', true);
        this._clearItems('process');
    }

    onClear(name: string, fn: Func): LifecycleBuilder {
        return this._addItem('clear', name, fn);
    }
    async clear(): Promise<void> {
        await this._runItems('clear', false);
        this._clearItems('clear');
    }

    onManage(name: string, fn: LifecycleManageLambda): LifecycleBuilder {
        return this._addItem('manage', name, fn);
    }
    async manage(item: LifecycleManageItem): Promise<void> {
        await this._runItems('manage', false, item);
        // dont clear
    }

    onKill(name: string, fn: LifecycleKillLambda): LifecycleBuilder {
        return this._addItem('kill', name, fn);
    }
    async kill(type: LifecycleKillType): Promise<void> {
        await this._runItems('kill', false, type);
        this._clearItems('kill');
    }
    // endregion stage

    // region log
    protected _hasLog(list: List<DevOpt>, pck: string, testCase: number|string): boolean {
        const code = $test.code(pck, testCase);
        return list.filter(d => d.case === code).length > 0;
    }
    protected _addLog(list: List<DevOpt>, pck: string, testCase: number|string, opt: DevOpt): void {
        list.push({case: $test.code(pck, testCase), ...opt});
    }
    protected _getLog(list: List<DevOpt>, pck: string): Array<DevOpt> {
        const lines = list.filter(d => d.case === $test.code(pck, ''));
        this.redundantMessages.forEach(opt => list.delete(opt));
        return lines;
    }

    clearMessages(): void {
        this.infoMessages.clear();
        this.warningMessages.clear();
        this.redundantMessages.clear();
    }
    hasInfo(pck: string, testCase: number|string): boolean {
        return this._hasLog(this.infoMessages, pck, testCase);
    }
    hasWarning(pck: string, testCase: number|string): boolean {
        return this._hasLog(this.warningMessages, pck, testCase);
    }
    hasRedundant(pck: string, testCase: number|string): boolean {
        return this._hasLog(this.redundantMessages, pck, testCase);
    }
    addInfo(pck: string, testCase: number|string, opt: DevOpt): void {
        this._addLog(this.infoMessages, pck, testCase, opt);
    }
    addWarning(pck: string, testCase: number|string, opt: DevOpt): void {
        this._addLog(this.warningMessages, pck, testCase, opt);
    }
    addRedundant(pck: string, testCase: number|string, opt: DevOpt): void {
        this._addLog(this.redundantMessages, pck, testCase, opt);
    }
    getInfo(pck: string): Array<DevOpt> {
        return this._getLog(this.infoMessages, pck);
    }
    getWarning(pck: string): Array<DevOpt> {
        return this._getLog(this.warningMessages, pck);
    }
    getRedundant(pck: string): Array<DevOpt> {
        return this._getLog(this.redundantMessages, pck);
    }

    // endregion log

}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setLifecycle(new Lifecycle());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(Lifecycle, FQN_PCK);
});
