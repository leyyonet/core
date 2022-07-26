// noinspection JSUnusedGlobalSymbols

import {FuncLike} from "./index-aliases";
import {CoreLike} from "./index-types";
import {FQN_NAME} from "./internal-component";

let lyy: CoreLike;

export function AssignException(): ClassDecorator {
    return (target: unknown) => {
        lyy.exception.add(target as FuncLike);
        lyy.decoPool.add(AssignException, {target, options: {clazz: true}, value: {}});
    };
}
export function setForAnnotations (ins: CoreLike) {
    lyy = ins;
    lyy.fqnPool.func(AssignException, ...FQN_NAME);
}
