// x_console.log(`## ${__filename}`, {i: 'loading'});

import {
    CoreProcessorLike,
    ProcessorFind,
    ProcessorStage,
    ProcessorStageAllowed,
    ProcessorWrapper
} from "./types";
import {$ly} from "../core";
import {Async0, Func0} from "../common";
import {DeveloperException} from "../error";


/**
 * @core
 * */
export class CoreProcessor implements CoreProcessorLike {
    // region properties
    protected _stageMap: Map<ProcessorStage, ProcessorWrapper>;

    protected LOG = $ly.preLog;
    protected _stage: ProcessorStage;
    protected _pendingStage: ProcessorStage;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('repo', () => {
            this._stageMap = $ly.repo.newMap<ProcessorStage, ProcessorWrapper>(this, '_stageMap');
            this
                ._init('loading', false)
                ._init('loaded', false)

                ._init('injecting', true)
                ._init('beforeInjected', true)
                ._init('injected', false)
                ._init('afterInjected', true)

                ._init('scheduling', true)
                ._init('beforeScheduled', true)
                ._init('scheduled', false)
                ._init('afterScheduled', true)

                ._init('routing', false)
                ._init('beforeRouted', true)
                ._init('routed', false)
                ._init('afterRouted', true)

                ._init('starting', true)
                ._init('beforeStarted', true)
                ._init('started', false)
                ._init('afterStarted', true)

                ._init('refreshing', true)
                ._init('beforeRefreshed', true)
                ._init('refreshed', false)
                ._init('afterRefreshed', true)

                ._init('running', false)

                ._init('killing', true)
                ._init('beforeKilled', true)
                ._init('killed', false)
            ;
        });

    }
    static {
        $ly.addDependency('processor', () => new CoreProcessor());
    }
    // region private
    protected _init(stage: ProcessorStage, isAsync: boolean): this {
        this._stageMap.set(stage, {isAsync, items: []});
        return this;
    }
    protected _find(stage: ProcessorStage): ProcessorFind {
        stage = $ly.primitive.check(this, 'stage', stage, $ly.primitive.textFilled) as ProcessorStage;
        const wrapper = this._stageMap.get(stage);
        if (!wrapper) {
            throw new DeveloperException('processor:absent.stage', {stage}).with(this);
        }
        return {stage, wrapper};
    }
    // endregion private

    // region public
    get stage(): ProcessorStage {
        return this._stage;
    }
    get pendingStage(): ProcessorStage {
        return this._pendingStage;
    }
    get counts(): Record<ProcessorStage, number> {
        const result = {} as Record<ProcessorStage, number>;
        for (const [stage, wrapper] of this._stageMap.entries()) {
            if (wrapper.items.length > 0) {
                result[stage] = wrapper.items.length;
            }
        }
        return result;
    }
    $run(gStage: ProcessorStage): void {
        const {stage, wrapper} = this._find(gStage);
        this._pendingStage = stage;
        const subjects = [];
        for (const item of wrapper.items) {
            try {
                (item.fn as Func0)();
            } catch (e) {
                throw $ly.error.build(e).with(this)
                    .indicator('processor.uncaught-run')
                    .patch({stage, subject: item.subject});
            }
            if (item.subject) {
                subjects.push(item.subject);
            }
        }
        if (wrapper.items.length < 1) {
            this.LOG.warn('Stage executed without workload', {stage});
        } else {
            this.LOG.warn('Stage executed', {stage, size: wrapper.items.length, subjects});
        }
        wrapper.items = [];
        this._stage = stage;
    }
    async $runAsync(gStage: ProcessorStage): Promise<void> {
        const {stage, wrapper} = this._find(gStage);
        this._pendingStage = stage;
        const subjects = [];
        for (const item of wrapper.items) {
            try {
                await (item.fn as Async0)();
            } catch (e) {
                throw $ly.error.build(e).with(this)
                    .indicator('processor.uncaught-run')
                    .patch({stage, subject: item.subject});
            }
            if (item.subject) {
                subjects.push(item.subject);
            }
        }
        if (wrapper.items.length < 1) {
            this.LOG.warn('Stage executed without workload', {stage});
        } else {
            this.LOG.warn('Stage executed', {stage, size: wrapper.items.length, subjects});
        }
        wrapper.items = [];
        this._stage = stage;
    }

    $add(gStage: ProcessorStage, fn: Func0 | Async0, subject?: string): void {
        const {stage, wrapper} = this._find(gStage);
        fn = $ly.primitive.check(this, 'fn', fn, $ly.primitive.funcFilled) as Func0 | Async0;
        subject = $ly.primitive.check(this, 'subject', subject, $ly.primitive.text);
        wrapper.items.push({fn, subject: subject ?? `#${stage}.${wrapper.items.length}`});
        this.LOG.debug('Processor added', {stage, subject});
    }
    add(gStage: ProcessorStageAllowed, fn: Func0 | Async0, subject?: string): void {
        const {stage, wrapper} = this._find(gStage);
        if (!stage.startsWith('before') && !stage.startsWith('after')) {
            throw new DeveloperException('processor:not.allowed.stage', {stage, expected: ['before***', 'after***']}).with(this);
        }
        fn = $ly.primitive.check(this, 'fn', fn, $ly.primitive.funcFilled) as Func0 | Async0;
        subject = $ly.primitive.check(this, 'subject', subject, $ly.primitive.text);
        wrapper.items.push({fn, subject: subject ?? `#${stage}.${wrapper.items.length}`});
        this.LOG.debug('Processor added', {stage, subject});
    }

    // endregion public
}
