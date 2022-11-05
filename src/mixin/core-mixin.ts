import {CoreMixinLike} from "./types";
import {$ly} from "../core";


/**
 * @core
 * */
export class CoreMixin implements CoreMixinLike {
    constructor() {
        $ly.addFqn(this);
    }
    static {
        $ly.addDependency('mixin', () => new CoreMixin());
    }
    none(): unknown {
        return null;
    }

}