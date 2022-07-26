import {EventEmitter} from "events";
import {FuncLike, FuncN} from "../index-aliases";
import {CoreEventLike, CoreLike, LoggerLike} from "../index-types";

export class CoreEvent extends EventEmitter implements CoreEventLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected LOG: LoggerLike;
    // endregion properties
    constructor(ins: CoreLike) {
        super();
        this._lyy = ins;
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    publish(event: string, ...params: Array<unknown>): void {
        if (!this.emit(event, ...params)) {
            setTimeout(() => this.publish(event, ...params), 5);
        }
    }
    subscribe(event: string, fn: FuncN): void {
        this.on(event, fn);
        const listeners = this.listeners(event);
        this.LOG.info(`event.subscribe`, {event, name: fn.name, listeners: listeners.map(fn => fn.name)});
    }
    subscribeOnce(event: string, fn: FuncN): void {
        this.once(event, fn);
        const listeners = this.listeners(event);
        this.LOG.info(`event.once`, {event, name: fn.name, listeners: listeners.map(fn => fn.name)});
    }
    unsubscribe(event: string, fn: FuncN): void {
        this.removeListener(event, fn);
        const listeners = this.listeners(event);
        this.LOG.info(`event.unsubscribe`, {event, name: fn.name, listeners: listeners.map(fn => fn.name)});
    }
    unsubscribeAll(event: string): void {
        this.removeAllListeners(event);
        const listeners = this.listeners(event);
        this.LOG.info(`event.unsubscribeAll`, {event, listeners: listeners.map(fn => fn.name)});
    }
    // todo
    switchEvent(event: string, fnNew: FuncLike, fnOld?: FuncLike): void {
        this.unsubscribeAll(event);
        fnNew();
        const listeners = this.listeners(event);
        const migrate = (typeof fnOld === 'function') ? fnOld() : null;
        this.LOG.debug(`event.switch`, {event, listeners: listeners.map(fn => fn.name), migrate});
    }

}