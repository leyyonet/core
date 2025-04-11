import {core} from "../../core";
import {Arr, ClassLike, Func, to} from "@leyyo/common";
import {FQN_PCK, ReflectionFinalClass} from "../internal";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";

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
            if (![newClass, reflection.creator].includes(this.constructor as ClassLike)) {
                const val = decoFinalClass.valueByClass(reflection.creator);
                if (val.throwing) {
                    throw new Error(`NotInstantiable:${ins.description}`);
                }
            }
        }
    }
    // sign proxy (build relation between old and new)
    core.reflection.addProxy(reflection.creator, newClass);

    // set new and old class as final class
    core.footprint.saveSign(newClass, ReflectionFinalClass, true);
    core.footprint.saveSign(reflection.creator, ReflectionFinalClass, true);

    return newClass;
}

const _init = () => {
    if (!decoFinalClass) {
        core.fqn.decorator(FinalClass, FQN_PCK);
        decoFinalClass = core.decorator.addIdentifier<Opt>(FinalClass, ['class', 'no-multiple', 'no-inherited']);
    }
}

export function FinalClass(throwing?: boolean): ClassDecorator {
    _init();
    return <ClassDecorator>((trg: Func) => {
        return _run(decoFinalClass.fork(trg), throwing);
    });
}

let decoFinalClass: DecoIdLike<Opt>;
