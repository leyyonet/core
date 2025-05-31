import {$descriptor, $to, ClassLike, Func} from "@leyyo/common";
import {NameHandlerLike} from "./index.types";
import {core} from "../core";
import {FQN_PCK} from "./internal";
import {$$coreInternalOn} from "../internal";

export class NameHandler implements NameHandlerLike {
    private counter = 0;
    constructor() {
    }
    copy(source: Func | ClassLike, target: Func | ClassLike): void {
        if (source?.name) {
            this.set(target, source.name);
        }
    }
    set(target: Func | ClassLike, name: string): void {
        $descriptor.save(target, 'name', name);
    }
    anonymous(type?: string, counter?: number): string {
        type = $to.text(type, {silent: true});
        if (!type) {
            type = 'Leyyo';
        }
        if (!Number.isSafeInteger(counter) || counter < 0) {
            this.counter++;
            counter = this.counter;
        }
        return `${type}$$${counter}`;
    }
}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setNameHandler(new NameHandler());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(NameHandler, FQN_PCK);
});
