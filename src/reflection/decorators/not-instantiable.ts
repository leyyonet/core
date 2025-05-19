import {$assert, $dev, Arr, ClassLike} from "@leyyo/common";
import {core} from "../../core";
import {FQN_PCK} from "../internal";
import {DecoIdLike} from "../../decorator";
import {$$coreInternalOn} from "../../internal";


interface O {
    throwing?: boolean;
}

export function NotInstantiable(throwing?: boolean): ClassDecorator {
    return clazz =>
        id.process([clazz], {throwing});
}

let id: DecoIdLike<O>;

$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(NotInstantiable)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited', 'changes-structure')
        .processor<ClassLike>((ins, p: O) => {
            $assert.booleanOptional(p.throwing, () => $dev.desc(ins, {field: 'throwing'}));

            ins.set(p);
            const ref = ins.asClass;
            const newClass = class extends ref.creator {
                constructor(...args: Arr) {
                    super(...args);
                    const val = id.valueByClass(ref.name);
                    if (val.throwing) {
                        throw new Error(`NotInstantiable:${ins.description}`);
                    }
                    return null;
                }
            }
            // sign proxy (build relation between old and new)
            core.reflectionPool.addProxy(ref.creator, newClass);
            return newClass;
        });
});

/*
*     return new Proxy(clazz.creator, {
        construct(clz, args) {
            const val = id.valueByClass(clz.name);
            if (val.throwing) {
                throw new Error(`NotInstantiable:${description}`);
            }
            return null;
        }
    });

* */
