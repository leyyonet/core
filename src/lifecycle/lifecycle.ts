import {$log, $repo, $test, DevOpt, Func, List} from "@leyyo/common";
import {LifecycleLike, LifecycleSecure, LifecycleStage} from "./index.types";
import {$$coreInternalOn} from "../internal";
import {core} from "../core";
import {FQN_PCK} from "./internal";

export class Lifecycle implements LifecycleLike, LifecycleSecure {
    private readonly logger = $log.create(Lifecycle);
    readonly infoMessages: List<DevOpt>;
    readonly redundantMessages: List<DevOpt>;
    readonly warningMessages: List<DevOpt>

    constructor() {
        this.infoMessages = $repo.newList(FQN_PCK, 'infoMessages');
        this.redundantMessages = $repo.newList(FQN_PCK, 'redundantMessages');
        this.warningMessages = $repo.newList(FQN_PCK, 'warningMessages');
    }
    get $back(): LifecycleLike {
        return undefined;
    }

    get $secure(): LifecycleSecure {
        return undefined;
    }

    register(stage: LifecycleStage, order: number, name: string, fn: Func): void {
    }

    onClear(order: number, name: string, fn: Func): void {
    }

    onInitialize(order: number, name: string, fn: Func): void {
    }

    onKill(order: number, name: string, fn: Func): void {
    }

    onRedundant(order: number, name: string, fn: Func): void {
    }

    onRun(order: number, name: string, fn: Func): void {
    }

    onValidate(order: number, name: string, fn: Func): void {
    }

    // region log
    protected _has(list: List<DevOpt>, pck: string, testCase: number|string): boolean {
        const code = $test.code(pck, testCase);
        return list.filter(d => d.case === code).length > 0;
    }
    protected _add(list: List<DevOpt>, pck: string, testCase: number|string, opt: DevOpt): void {
        list.push({case: $test.code(pck, testCase), ...opt});
    }
    protected _get(list: List<DevOpt>, pck: string): Array<DevOpt> {
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
        return this._has(this.infoMessages, pck, testCase);
    }
    hasWarning(pck: string, testCase: number|string): boolean {
        return this._has(this.warningMessages, pck, testCase);
    }
    hasRedundant(pck: string, testCase: number|string): boolean {
        return this._has(this.redundantMessages, pck, testCase);
    }
    addInfo(pck: string, testCase: number|string, opt: DevOpt): void {
        this._add(this.infoMessages, pck, testCase, opt);
    }
    addWarning(pck: string, testCase: number|string, opt: DevOpt): void {
        this._add(this.warningMessages, pck, testCase, opt);
    }
    addRedundant(pck: string, testCase: number|string, opt: DevOpt): void {
        this._add(this.redundantMessages, pck, testCase, opt);
    }
    getInfo(pck: string): Array<DevOpt> {
        return this._get(this.infoMessages, pck);
    }
    getWarning(pck: string): Array<DevOpt> {
        return this._get(this.warningMessages, pck);
    }
    getRedundant(pck: string): Array<DevOpt> {
        return this._get(this.redundantMessages, pck);
    }

    // endregion log

}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setLifecycle(new Lifecycle());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(Lifecycle, FQN_PCK);
});
