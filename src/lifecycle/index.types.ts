import {AsyncFnc, DevOpt, Func, List, ShiftMain, ShiftSecure} from "@leyyo/common";

export type LifecycleStage = 'initialize' | 'validate' | 'process' | 'clear' | 'manage' | 'kill';
export type LifecycleKillType = 'normal' | 'foo' | 'bar';

export interface LifecycleManageItem {

}
export type LifecycleManageLambda = (item: LifecycleManageItem) => Promise<void>;
export type LifecycleKillLambda = (type: LifecycleKillType) => Promise<void>;

export interface LifecycleLike {
    onAll(pck: string): LifecycleBuilder;

    onInitialize(pck: string, fn: Func): LifecycleBuilder;
    onInitialize(pck: string, ext: string, fn: Func): LifecycleBuilder;
    initialize(): Promise<void>;

    onValidate(pck: string, fn: Func): LifecycleBuilder;
    onValidate(pck: string, ext: string, fn: Func): LifecycleBuilder;
    validate(): Promise<void>;

    onProcess(pck: string, fn: Func): LifecycleBuilder;
    onProcess(pck: string, ext: string, fn: Func): LifecycleBuilder;
    process(): Promise<void>;

    onClear(pck: string, fn: Func): LifecycleBuilder;
    onClear(pck: string, ext: string, fn: Func): LifecycleBuilder;
    clear(): Promise<void>;

    onManage(pck: string, fn: LifecycleManageLambda): LifecycleBuilder;
    onManage(pck: string, ext: string, fn: LifecycleManageLambda): LifecycleBuilder;
    manage(item: LifecycleManageItem): Promise<void>;

    onKill(pck: string, fn: LifecycleKillLambda): LifecycleBuilder;
    onKill(pck: string, ext: string, fn: LifecycleKillLambda): LifecycleBuilder;
    kill(type: LifecycleKillType): Promise<void>;
}

export interface LifecycleItem<F = Func|AsyncFnc> {
    name: string;
    fn: F;
    isAsync?: boolean;
    before: Array<string>;
    after: Array<string>;
}
export interface LifecycleAllItem {
    before: Array<string>;
    after: Array<string>;
}
export interface LifecycleBuilder {
    after(pck: string, ext?: string): LifecycleBuilder;
    before(pck: string, ext?: string): LifecycleBuilder;
}
