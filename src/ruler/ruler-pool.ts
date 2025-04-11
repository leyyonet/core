import {RulerPoolLike, RulerPoolSecure} from "./index-types";

// console.log(__filename);

export class RulerPool implements RulerPoolLike, RulerPoolSecure {

    get $back(): RulerPoolLike {
        return this;
    }

    get $secure(): RulerPoolSecure {
        return this;
    }
}