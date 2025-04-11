import {core} from "../../core";
import {Arr, ClassLike, Func, to} from "@leyyo/common";
import {FQN_PCK} from "../internal";
import {DecoCloneLike, DecoIdLike, DecoInstanceLike} from "../../decorator";

// console.log(__filename);

interface Opt {
    throwing?: boolean;
}

const _run = (ins: DecoInstanceLike<Opt>, throwing: boolean): ClassLike => {
    ins.set({throwing: to.boolean(throwing, {deco: ins.description, throwing})});
    const reflection = ins.asClass();
    const newClass = class extends reflection.creator {
        constructor(...args: Arr) {
            super(...args);
            const val = decoNotInstantiable.valueByClass(reflection.name);
            if (val.throwing) {
                throw new Error(`NotInstantiable:${ins.description}`);
            }
            return null;
        }
    }
    // sign proxy (build relation between old and new)
    core.reflection.addProxy(reflection.creator, newClass);
    return newClass;
}
const _init = () => {
    if (!decoNotInstantiable) {
        core.fqn.decorator(NotInstantiable, FQN_PCK);
        decoNotInstantiable = core.decorator.addIdentifier<Opt>(NotInstantiable, ['class', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(StaticClass, FQN_PCK);
        decoStaticClass = core.decorator.addClone<Opt>(StaticClass, NotInstantiable);
    }
}

export function NotInstantiable(throwing?: boolean): ClassDecorator {
    _init();
    return <ClassDecorator>((trg: Func) => {
        _run(decoNotInstantiable.fork(trg), throwing);
    });
}

let decoNotInstantiable: DecoIdLike<Opt>;

export function StaticClass(throwing?: boolean): ClassDecorator {
    _init();
    return <ClassDecorator>((trg: Func) => {
        _run(decoStaticClass.fork(trg), throwing);
    });
}

let decoStaticClass: DecoCloneLike<Opt>;


/*
*     return new Proxy(clazz.creator, {
        construct(clz, args) {
            const val = decoNotInstantiable.valueByClass(clz.name);
            if (val.throwing) {
                throw new Error(`NotInstantiable:${description}`);
            }
            return null;
        }
    });

* */