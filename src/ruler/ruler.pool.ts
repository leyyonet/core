import {RulerPoolLike, RulerPoolSecure} from "./index.types";
import {$$coreInternalOn} from "../internal";
import {core} from "../core";
import {FQN_PCK} from "./internal";


export class RulerPool implements RulerPoolLike, RulerPoolSecure {

    get $back(): RulerPoolLike {
        return this;
    }

    get $secure(): RulerPoolSecure {
        return this;
    }
}

$$coreInternalOn('class-pool-2', () => {
    core.$secure.$setRulerPool(new RulerPool());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(RulerPool, FQN_PCK);
});
