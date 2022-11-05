import {CoreApiLike} from "./types";
import {$ly} from "../core";
import {FieldType, HttpMethod} from "./enums";
import {LY_INT_FQN} from "../internal";

/**
 * @core
 * */
export class CoreApi implements CoreApiLike {
    constructor() {
        $ly.addFqn(this);
        $ly.addTrigger('enum', () => {
            $ly.enum.addMultiple({FieldType, HttpMethod}, ...LY_INT_FQN);
        });
    }
    static {
        $ly.addDependency('api', () => new CoreApi());
    }
    none(): void {
        // nothing
    }
}