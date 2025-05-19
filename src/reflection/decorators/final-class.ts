import {$assert, $descriptor, $dev, Arr, ClassLike} from "@leyyo/common";
import {core} from "../../core";
import {FQN_PCK} from "../internal";
import {DecoIdLike} from "../../decorator";
import {$$coreInternalOn} from "../../internal";
import {FinalClassSign} from "../index.symbols";


interface O {
    throwing?: boolean;
}

export function FinalClass(throwing?: boolean): ClassDecorator {
    return clazz =>
        id.process([clazz], {throwing})
}

let id: DecoIdLike<O>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(FinalClass)
        .fqn(FQN_PCK)
        .targets('class')
        .rules('no-multiple', 'no-inherited', 'changes-structure')
        .processor<ClassLike>((ins, p) => {
            $assert.booleanOptional(p.throwing, () => $dev.desc(ins, {field: 'throwing'}));
            ins.set(p);

            const ref = ins.asClass;
            const newClass = class extends ref.creator {
                constructor(...args: Arr) {
                    super(...args);
                    if (![newClass, ref.creator].includes(this.constructor as ClassLike)) {
                        const val = id.valueByClass(ref.creator);
                        if (val.throwing) {
                            throw new Error(`FinalClass:${ins.description}`);
                        }
                    }
                }
            }
            // sign proxy (build relation between old and new)
            core.reflectionPool.addProxy(ref.creator, newClass);

            // set new and old class as final class
            $descriptor.save(newClass, FinalClassSign, true);
            $descriptor.save(ref.creator, FinalClassSign, true);

            return newClass;
        });
});
