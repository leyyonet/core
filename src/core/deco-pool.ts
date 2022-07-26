import {CoreDecoIdentifier, CoreDecoItem, CoreDecoLike, CoreLike, LoggerLike} from "../index-types";
import {FuncLike} from "../index-aliases";
import {DeveloperException, Exception} from "../index-errors";

export class CoreDecoPool implements CoreDecoLike {
    // region global
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    // endregion global
    // region properties
    protected _pool: Array<CoreDecoItem>;
    protected LOG: LoggerLike;
    protected _ins: CoreDecoIdentifier;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._pool = this._lyy.repo.newArray<CoreDecoItem>(this, '_pool');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    protected _identify(opt: CoreDecoItem) {
        const id = this._ins.identify(opt.fn, {...opt.options, single: opt.single});
        id.fork(opt.target, opt.propertyKey, opt.index).set(opt.value);
    }
    add(fn: FuncLike, opt: CoreDecoItem): void {
        fn = opt.fn ?? fn;
        try {
            opt.fn = this._lyy.primitive.func(fn);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'decorator.invalid-function'});
        }
        if (!opt.fn) {
            throw new DeveloperException('decorator.empty-function', {fn}).with(this);
        }
        if (this._ins) {
            this._identify(opt);
            return;
        }
        this._pool.push(opt);
    }
    protected _afterSet() {
        this._pool.forEach(opt => {
            this._identify(opt);
        });
        this._lyy.repo.clearArray(this, '_pool');
    }
    set(ins: CoreDecoIdentifier): void {
        if (!this._ins) {
            this._ins = ins;
            this._afterSet();
        }
    }
}