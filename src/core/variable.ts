import {CoreLike, CoreVariableItem, CoreVariableLike, LoggerLike} from "../index-types";
import {DeveloperException, Exception} from "../index-errors";

export class CoreVariable implements CoreVariableLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected _items: Map<string, CoreVariableItem>;
    protected readonly _DEF_VARIABLE: CoreVariableItem = {
        owner: undefined,
        parser: (v) => v,
        required: false,
        log: true,
        def: undefined,
    };
    protected LOG: LoggerLike;
    // endregion properties

    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._items = this._lyy.ly_map<string, CoreVariableItem>(this, '_items');
        this.LOG = this._lyy.ly_log(this);
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    // region variable
    get names(): Array<string> {
        return Array.from(this._items.keys());
    }
    get(name: string): CoreVariableItem {
        return this._items.get(name);
    }
    read<T>(given: string, variable: CoreVariableItem<T>): T {
        let name;
        try {
            name = this._lyy.primitive.text(given);
        } catch (e) {
            throw Exception.cast(e).with(this).appendParams({indicator: 'variable.invalid-name'});
        }
        if (!name) {
            throw new DeveloperException('variable.empty-name', {name: given}).with(this);
        }
        if (!variable) {
            variable = {...this._DEF_VARIABLE} as CoreVariableItem<T>;
        }
        if (this._items.has(name)) {
            this.LOG.warn(`variable.duplicated`, {name});
        }
        if (typeof variable.parser !== 'function') {
            variable.parser = (v) => v as T;
        }
        this._items.set(name, variable);
        const defExists = !this._lyy.is.empty(variable.def);
        if (defExists) {
            variable.required = false;
        }
        let defUsed: boolean;
        let value: T;
        let err;
        if (process.env[name] === undefined) {
            err = new DeveloperException('variable.empty-name', {name}).with(this);
            if (variable.required) {
                throw err;
            } else if (variable.log) {
                err.log();
            }
            defUsed = true;
            value = variable.parser(variable.def);
        } else {
            value = variable.parser(process.env[name]);
        }
        if (!defUsed) {
            if (this._lyy.is.empty(value)) {
                if (variable.required) {
                    throw new DeveloperException('variable.empty-name', {name}).with(this);
                } else if (variable.log && !defExists) {
                    this.LOG.warn(`variable.empty`, {name});
                }
            } else {
                this.LOG.debug(`variable.read`, {name, value});
            }
        }
        return value ?? null;
    }
    // endregion variable

}