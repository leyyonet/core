import {Async0, Func0, FuncLike} from "../common";

export type ProcessorStage =
    'loading' | 'loaded'
    | 'injecting' | 'beforeInjected' | 'injected' | 'afterInjected'
    | 'scheduling' | 'beforeScheduled' | 'scheduled' | 'afterScheduled'
    | 'routing' | 'beforeRouted' | 'routed' | 'afterRouted'
    | 'starting' | 'beforeStarted' | 'started' | 'afterStarted'
    | 'refreshing' | 'beforeRefreshed' | 'refreshed' | 'afterRefreshed'
    | 'running'
    | 'killing' | 'beforeKilled' | 'killed';

export type ProcessorStageAllowed =
    'beforeInjected' | 'afterInjected'
    | 'beforeScheduled' | 'afterScheduled'
    | 'beforeRouted' | 'afterRouted'
    | 'beforeStarted' | 'afterStarted'
    | 'beforeRefreshed' | 'afterRefreshed'
    | 'beforeKilled';

export interface ProcessorItem {
    fn: Func0 | Async0;
    subject: string;
}
export interface ProcessorWrapper {
    isAsync: boolean;
    items: Array<ProcessorItem>;
}
export interface ProcessorFind {
    stage: ProcessorStage;
    wrapper: ProcessorWrapper;
}

export interface CoreProcessorLike {
    get stage(): ProcessorStage;
    get pendingStage(): ProcessorStage;
    get counts(): Record<ProcessorStage, number>;

    $add(stage: ProcessorStage, fn: Func0 | Async0, subject?: string): void;
    add(stage: ProcessorStageAllowed, fn: Func0 | Async0, subject?: string): void;

    $run(stage: ProcessorStage): void;
    $runAsync(stage: ProcessorStage): Promise<void>;
}
