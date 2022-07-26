import {CoreComponentLike, CoreLike, LoggerLike} from "../index-types";
import {DeveloperException, Exception} from "../index-errors";

export class CoreComponent implements CoreComponentLike {
    // region global
    protected _init: boolean;
    protected _lyy: CoreLike;
    // endregion global
    // region properties
    protected _items: Array<string>;
    protected LOG: LoggerLike;
    // endregion properties

    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._items = this._lyy.repo.newArray<string>(this, '_items');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    add(given: string): void {
        let name: string;
        try {
            name = this._lyy.primitive.text(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'component.invalid-name'});
        }
        if (!name) {
            throw new DeveloperException('component.empty-name', {name: given}).with(this);
        }
        if (this._items.includes(name)) {
            this.LOG.warn(`package.duplicated`, {name});
        }
        this._items.push(name);
        this.LOG.debug(`package.added`, {name});
    }
    get items(): Array<string> {
        return this._items;
    }
}