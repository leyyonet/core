import {DevOpt, Func, List, ShiftMain, ShiftSecure} from "@leyyo/common";

export type LifecycleStage = 'initialize' | 'validate' | 'run' | 'redundant' | 'clear' | 'kill';

export interface LifecycleLike extends ShiftSecure<LifecycleSecure> {
    register(stage: LifecycleStage, order: number, name: string, fn: Func): void;

    onInitialize(order: number, name: string, fn: Func): void;

    onValidate(order: number, name: string, fn: Func): void;

    onRun(order: number, name: string, fn: Func): void;

    onRedundant(order: number, name: string, fn: Func): void;

    onClear(order: number, name: string, fn: Func): void;

    onKill(order: number, name: string, fn: Func): void;

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
}

export interface LifecycleSecure extends ShiftMain<LifecycleLike> {

}
