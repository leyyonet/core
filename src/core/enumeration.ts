import {RecLike} from "../index-aliases";
import {DeveloperException, Exception} from "../index-errors";
import {CoreEnumerationLike, CoreLike, LoggerLike} from "../index-types";

export class CoreEnumeration implements CoreEnumerationLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected _items: Array<RecLike>;
    protected LOG: LoggerLike;
    // endregion properties

    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._items = this._lyy.repo.newArray<RecLike>(this, '_items');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    get items(): Array<RecLike> {
        return this._items;
    }
    get names(): Array<string> {
        const names = [];
        this._items.forEach(item => {
            names.push(this._lyy.fqnPool.name(item));
        })
        return names;
    }
    add(given: string, obj: RecLike, ...prefixes: Array<string>): void {
        let name: string;
        try {
            name = this._lyy.primitive.text(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'enumeration.invalid-name'});
        }
        if (!name) {
            throw new DeveloperException('enumeration.empty-name', {name: given}).with(this);
        }
        if (!obj || Object.keys(obj).length < 1) {
            throw new DeveloperException('enumeration.empty-items', {name}).with(this);
        }
        if (this._items.includes(obj)) {
            throw new DeveloperException('enumeration.duplicated-object', {name}).with(this);
        }
        this._lyy.fqnPool.enumeration(name, obj, ...prefixes);
        this.LOG.debug(`Added`, {name});
    }

}