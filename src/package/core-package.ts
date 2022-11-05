// x_console.log(`## ${__filename}`, {i: 'loading'});

import {DeveloperException} from "../error";
import {CorePackageLike} from "./types";
import {$ly} from "../core";

/**
 * @core
 * */
export class CorePackage implements CorePackageLike {
    // region properties
    protected _items: Array<string>;
    protected LOG = $ly.preLog;

    // endregion properties
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {this.LOG = $ly.logger.assign(this);})
        $ly.addTrigger('repo', () => {this._items = $ly.repo.newArray<string>(this, '_items');})
    }
    static {
        $ly.addDependency('package', () => new CorePackage());
    }

    // region public
    add(name: string): void {
        name = $ly.primitive.check(this, 'name', name, $ly.primitive.textFilled);
        if (this._items.includes(name)) {
            throw new DeveloperException('package:duplicated.name', {name}).with(this);
        }
        this._items.push(name);
        this.LOG.info('Package added', {name});
    }

    getItems(): Array<string> {
        return this._items;
    }

    // endregion public
}