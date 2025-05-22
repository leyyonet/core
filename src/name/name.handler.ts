import {$descriptor, ClassLike, Func} from "@leyyo/common";
import {NameHandlerLike} from "./index.types";
import {core} from "../core";
import {FQN_PCK} from "./internal";
import {$$coreInternalOn} from "../internal";

export class NameHandler implements NameHandlerLike {

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
    anonymous(type: string, counter: number): string {
        return `${type}$$${counter}`;
    }
}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setNameHandler(new NameHandler());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(NameHandler, FQN_PCK);
});
