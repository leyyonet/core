// x_console.log(`## ${__filename}`, {i: 'loading'});

import {CoreEnumLike, EnumMap} from "./types";
import {RecLike} from "../common";
import {$ly} from "../core";
import {DeveloperException} from "../error";

/**
 * @core
 * */
export class CoreEnum implements CoreEnumLike {
    // region properties
    protected _items: Map<string, EnumMap>;
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this)});
        $ly.addTrigger('repo', () => {this._items = $ly.repo.newMap<string, EnumMap>(this, '_items');});
    }
    static {
        $ly.addDependency('enum', () => new CoreEnum());
    }

    // region public
    getItems(): RecLike<EnumMap> {
        return Object.fromEntries(this._items);
    }

    getNames(): Array<string> {
        return Array.from(this._items.keys());
    }

    add(name: string, map: EnumMap, ...prefixes: Array<string>): void {
        name = $ly.primitive.check(this, 'name', name, $ly.primitive.textFilled);
        map = $ly.primitive.check(this, 'map', map, $ly.primitive.objectFilled) as EnumMap;
        $ly.fqn.enum(name, map, ...prefixes);
        const full = $ly.fqn.get(map);
        if (full && this._items.has(full)) {
            throw new DeveloperException('enum.duplicated.name', {name, full}).with(this);
        }
        this._items.set(full, map);
        this.LOG.debug(`Enum defined`, {name: full});
    }

    addMultiple(items: RecLike<EnumMap>, ...prefixes: Array<string>): void {
        if ($ly.primitive.isObjectFilled(items)) {
            for (const [name, obj] of Object.entries(items)) {
                this.add(name, obj, ...prefixes);
            }
        }
    }

    // endregion public

}