import {AsyncFnc, DevOpt, Func, List, ShiftMain, ShiftSecure} from "@leyyo/common";

export type LifecycleStage = 'initialize' | 'validate' | 'process' | 'clear' | 'manage' | 'kill';
export type LifecycleKillType = 'normal' | 'foo' | 'bar';

export interface LifecycleManageItem {

}
export type LifecycleManageLambda = (item: LifecycleManageItem) => Promise<void>;
export type LifecycleKillLambda = (type: LifecycleKillType) => Promise<void>;

export interface LifecycleLike extends ShiftSecure<LifecycleSecure> {
    // region stage
    onInitialize(name: string, fn: Func): LifecycleBuilder;
    initialize(): Promise<void>;
    onValidate(name: string, fn: Func): LifecycleBuilder;
    validate(): Promise<void>;
    onProcess(name: string, fn: Func): LifecycleBuilder;
    process(): Promise<void>;
    onClear(name: string, fn: Func): LifecycleBuilder;
    clear(): Promise<void>;
    onManage(name: string, fn: LifecycleManageLambda): LifecycleBuilder;
    manage(item: LifecycleManageItem): Promise<void>;
    onKill(name: string, fn: LifecycleKillLambda): LifecycleBuilder;
    kill(type: LifecycleKillType): Promise<void>;
    // endregion stage


    // region logging
    clearMessages(): void;
    hasInfo(pck: string, testCase: number|string): boolean;
    hasWarning(pck: string, testCase: number|string): boolean;
    hasRedundant(pck: string, testCase: number|string): boolean;

    addInfo(pck: string, testCase: number|string, opt: DevOpt): void;
    addWarning(pck: string, testCase: number|string, opt: DevOpt): void;
    addRedundant(pck: string, testCase: number|string, opt: DevOpt): void;

    getInfo(pck: string): Array<DevOpt>;
    getWarning(pck: string): Array<DevOpt>;
    getRedundant(pck: string): Array<DevOpt>;


    infoMessages: List<DevOpt>;
    redundantMessages: List<DevOpt>;
    warningMessages: List<DevOpt>;
    // endregion logging
}

export interface LifecycleSecure extends ShiftMain<LifecycleLike> {

}

export interface LifecycleItem<F = Func|AsyncFnc> {
    name: string;
    fn: F;
    isAsync?: boolean;
    before: Array<string>;
    after: Array<string>;
}
export interface LifecycleBuilder {
    after(name: string): LifecycleBuilder;
    before(name: string): LifecycleBuilder;
}
