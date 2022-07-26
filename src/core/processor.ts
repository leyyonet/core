import {CoreLike, CoreProcessorLike, LoggerLike, ProcessorItem, ProcessResult} from "../index-types";
import {FuncLike} from "../index-aliases";
import {DeveloperException, Exception} from "../index-errors";
import {ProcessorKey} from "../index-enums";

export class CoreProcessor implements CoreProcessorLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected _items: Map<ProcessorKey, Array<ProcessorItem>>;
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._items = this._lyy.ly_map<ProcessorKey, Array<ProcessorItem>>(this, '_items');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    get items(): Map<ProcessorKey, Array<ProcessorItem>> {
        return this._items;
    }
    run(given: ProcessorKey, breakError?: boolean): ProcessResult {
        let level: ProcessorKey;
        try {
            level = this._lyy.primitive.enumeration<ProcessorKey>(given, {map: ProcessorKey, silent: false})
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({level: given, indicator: 'processor.invalid-level'});
        }
        if (!level) {
            throw new DeveloperException('processor.empty-level', {level: given}).with(this);
        }
        const result: ProcessResult = {success: 0, error: 0};
        if (!this._items.has(level)) {
            return result;
        }
        this._items.get(level).forEach(item => {
            try {
                item.fn();
                result.success++;
            } catch (e) {
                result.error++;
                new DeveloperException('processor.uncaught-run', {level, descriptions: item.descriptions}).causedBy(e).with(this).raise(breakError);
            }
        });
        return result;
    }
    add(givenLevel: ProcessorKey, givenFn: FuncLike, ...descriptions: Array<string>): void {
        let fn: FuncLike;
        try {
            fn = this._lyy.primitive.func(givenFn);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: `processor.invalid-lambda`, level: givenLevel});
        }
        if (!fn) {
            throw new DeveloperException(`processor.empty-lambda`, {fn: givenFn, level: givenLevel}).with(this);
        }
        let level: ProcessorKey;
        try {
            level = this._lyy.primitive.enumeration<ProcessorKey>(givenLevel, {map: ProcessorKey, silent: false})
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({level: givenLevel, indicator: 'processor.invalid-level'});
        }
        if (!level) {
            throw new DeveloperException('processor.empty-level', {level: givenLevel}).with(this);
        }
        if (!this._items.has(level)) {
            this._items.set(level, []);
        }
        this._items.get(level).push({fn, descriptions});
        this.LOG.debug(`processor.added`, {descriptions});
    }
}