import {Func, to} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";

// console.log(__filename);

interface Opt {
    path: string;
}

const _run = (ins: DecoInstanceLike<Opt>, target: unknown, path: string) => {
    core.fqn.clazz(target as Func, path);
    ins.set({path: to.text(path, {deco: ins.description})});
}

const _init = () => {
    if (!decoFqn) {
        core.fqn.decorator(Fqn, FQN_PCK);
        decoFqn = core.decorator.addIdentifier<Opt>(Fqn, ['class', 'no-multiple', 'no-inherited']);
    }
}

/**
 * Decorates class with optional prefixes
 *
 * Class fqn will be `{prefixes}.{class}`
 */
export function Fqn(path: string): ClassDecorator {
    _init();
    return (target: unknown) => {
        _run(decoFqn.fork(target), target, path);
    };
}

let decoFqn: DecoIdLike<Opt>;
