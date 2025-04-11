import {Func} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {CoreBindType} from "../index-type";

// console.log(__filename);

interface Opt {
    type: CoreBindType;
}

const _run = (ins: DecoInstanceLike<Opt>, target: unknown, type: CoreBindType) => {
    core.bind.run(target as Func, type);
    ins.set({type});
}

const _init = () => {
    if (!decoBind) {
        core.fqn.decorator(Bind, FQN_PCK);
        decoBind = core.decorator.addIdentifier<Opt>(Bind, ['class', 'no-multiple', 'no-inherited']);
    }
}

/**
 * Decorates class for bind all properties
 */
export function Bind(type?: CoreBindType): ClassDecorator {
    _init();
    return (target: unknown) => {
        _run(decoBind.fork(target), target, type);
    };
}

let decoBind: DecoIdLike<Opt>;
