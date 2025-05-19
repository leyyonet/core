import {$assert, $dev, Arr, ClassLike, Obj} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {$$coreInternalOn} from "../../internal";


interface O {
    throwing?: boolean;
}

const _cache: Map<ClassLike, Obj> = new Map<ClassLike, Obj>();

export function Singleton(throwing: boolean = true): ClassDecorator {
    return (target =>
        id.process([target], {throwing}));
}

let id: DecoIdLike<O>;

$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(Singleton)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited', 'no-cloneable')
        .processor<ClassLike>((ins: DecoInstanceLike<O>, p: O) => {
            $assert.booleanOptional(p.throwing, () => $dev.desc(ins, {field: 'throwing'}));

            ins.set(p);
            const ref = ins.asClass;
            if (ref.creator['ins'] === undefined) {
                ref.creator['ins'] = () => {
                    if (!_cache.has(ref.creator)) {
                        _cache.set(ref.creator, new newClass());
                    }
                    return _cache.get(ref.creator);
                }
            }

            const newClass = class extends ref.creator {
                constructor(...args: Arr) {
                    super(...args);
                    const opt = id.valueByClass(ref.name);
                    if (_cache.has(newClass)) {
                        if (opt.throwing) {
                            throw new Error(`Singleton:${ins.description}`);
                        }
                        return _cache.get(newClass);
                    } else if (_cache.has(ref.creator)) {
                        if (opt.throwing) {
                            throw new Error(`Singleton:${ins.description}`);
                        }
                        return _cache.get(ref.creator);
                    }
                    const ref2 = core.reflectionPool.get(newClass);
                    if (ref2) {
                        const instance = ref2.create(...args);
                        _cache.set(newClass, instance);
                        _cache.set(ref.creator, instance);
                        return instance;
                    }
                    throw new Error('Not known');
                }
            }
            // sign proxy (build relation between old and new)
            core.reflectionPool.addProxy(ref.creator, newClass);
            return newClass;
        });
});
