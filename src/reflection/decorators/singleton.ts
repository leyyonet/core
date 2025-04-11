import {core} from "../../core";
import {Arr, ClassLike, Obj, to} from "@leyyo/common";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";

// console.log(__filename);

interface Opt {
    throwing?: boolean;
}

const _cache: Map<ClassLike, Obj> = new Map<ClassLike, Obj>();

const _run = (ins: DecoInstanceLike<Opt>, throwing: boolean): ClassLike => {
    ins.set({throwing: to.boolean(throwing, {deco: ins.description, throwing})});
    const reflection = ins.asClass();
    if (reflection.creator['ins'] === undefined) {
        reflection.creator['ins'] = () => {
            if (!_cache.has(reflection.creator)) {
                _cache.set(reflection.creator, new newClass());
            }
            return _cache.get(reflection.creator);
        }
    }

    const newClass = class extends reflection.creator {
        constructor(...args: Arr) {
            super(...args);
            const opt = decoSingleton.valueByClass(reflection.name);
            if (_cache.has(newClass)) {
                if (opt.throwing) {
                    throw new Error(`Singleton:${ins.description}`);
                }
                return _cache.get(newClass);
            } else if (_cache.has(reflection.creator)) {
                if (opt.throwing) {
                    throw new Error(`Singleton:${ins.description}`);
                }
                return _cache.get(reflection.creator);
            }
            const ref = core.reflection.fetchValue(newClass);
            if (ref) {
                const instance = ref.create(...args);
                _cache.set(newClass, instance);
                _cache.set(reflection.creator, instance);
                return instance;
            }
            throw new Error('Not known');
        }
    }
    // sign proxy (build relation between old and new)
    core.reflection.addProxy(reflection.creator, newClass);
    return newClass;
}

const _init = () => {
    if (!decoSingleton) {
        core.fqn.decorator(Singleton, FQN_PCK);
        decoSingleton = core.decorator.addIdentifier<Opt>(Singleton, ['class', 'no-multiple', 'no-inherited'])
    }
}

export function Singleton(throwing: boolean = true): ClassDecorator {
    _init();
    return <ClassDecorator>((target) => {
        return _run(decoSingleton.fork(target), throwing);
    });
}

let decoSingleton: DecoIdLike<Opt>;

