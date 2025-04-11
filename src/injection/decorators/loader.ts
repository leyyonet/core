import {DeveloperException, Func, is, Obj} from "@leyyo/common";
import {core} from "../../core";
import {DecoCloneLike, DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";

// console.log(__filename);

interface Opt {
    resources: Array<Func | Obj>;
}

const _run = (ins: DecoInstanceLike<Opt>, resources: Array<Func | Obj>): void => {
    const invalid = resources.filter(r => !(is.func(r) || is.object(r) || is.array(r)));
    if (invalid.length > 0) {
        throw new DeveloperException('deco:is.not.func', {
            deco: ins.description,
            resources: invalid.map(f => core.fqn.get(f)).join(', ')
        });
    }
    ins.set({resources});
}

const _init = () => {
    if (!decoLoader) {
        core.fqn.decorator(Loader, FQN_PCK);
        decoLoader = core.decorator.addIdentifier<Opt>(Loader, ['class', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(Module, FQN_PCK);
        decoModule = core.decorator.addClone<Opt>(Module, Loader);
    }
}

export function Loader(...resources: Array<Func | Obj>): ClassDecorator {
    _init();
    return (clazz: Func) => {
        _run(decoLoader.fork(clazz), resources);
    };
}

let decoLoader: DecoIdLike<Opt>;

export function Module(...resources: Array<Func | Obj>): ClassDecorator {
    _init();
    return (clazz: Func) => {
        _run(decoModule.fork(clazz), resources);
    };
}

let decoModule: DecoCloneLike<Opt>;
