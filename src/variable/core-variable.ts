// x_console.log(`## ${__filename}`, {i: 'loading'});

import {CoreVariableLike, VariableItem} from "./types";
import {$ly} from "../core";
import {DeveloperException} from "../error";

/**
 * @core
 * */
export class CoreVariable implements CoreVariableLike {
    // region properties
    protected _items: Map<string, VariableItem>;
    protected _DEF_VARIABLE: VariableItem;
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        this.$init();
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('repo', () => {this._items = $ly.repo.newMap<string, VariableItem>(this, '_items')});
    }
    static {
        $ly.addDependency('variable', () => new CoreVariable());
    }
    private $init() {
        this._DEF_VARIABLE = {
            target: undefined,
            parser: (v) => v,
            required: false,
            log: true,
            def: undefined,
        };
    }

    // region public
    getNames(): Array<string> {
        return Array.from(this._items.keys());
    }

    get(name: string): VariableItem {
        name = $ly.primitive.check(this, 'name', name, $ly.primitive.textFilled);
        return this._items.get(name);
    }

    // noinspection JSUnusedGlobalSymbols
    read<T>(name: string, variable: VariableItem<T>): T {
        name = $ly.primitive.check(this, 'name', name, $ly.primitive.textFilled);
        if (!variable) {
            variable = {...this._DEF_VARIABLE} as VariableItem<T>;
        }
        if (this._items.has(name)) {
            new DeveloperException('variable.duplicated.name', {name}).with(this).log();
        }
        if (typeof variable.parser !== 'function') {
            variable.parser = (v) => v as T;
        }
        this._items.set(name, variable);
        const defExists = $ly.filled(variable.def);
        if (defExists) {
            variable.required = false;
        }
        let defUsed: boolean;
        let value: T;
        if (process.env[name] === undefined) {
            const err = new DeveloperException('variable.absent.name', {name}).with(this);
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
            if ($ly.not(value)) {
                const err = new DeveloperException('variable.empty.value', {name, value: process.env[name]}).with(this);
                if (variable.required) {
                    throw err;
                } else if (variable.log && !defExists) {
                    err.log();
                }
            } else {
                this.LOG.debug('Variable read', {name, value});
            }
        }
        return value;
    }

    // endregion public
}
