import {$assert, $dev, Dict, Func} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike} from "../identifier";
import {FQN_PCK} from "../internal";
import {DecoCLearType, DecoLike} from "../abstract";
import {$$coreInternalOn} from "../../internal";


interface O {
    decorators: Array<Func | DecoLike | string>;
    all: boolean;
}

interface P {
    functions: Array<Func | DecoLike | string> | true;
}

/**
 * Clear inherited decorators
 *
 * For class: clears extended class's decorators
 * For Property: clears extended class's same property decorators
 */
export function ClearProto(all: true): MethodDecorator;
export function ClearProto(all: true): PropertyDecorator;
export function ClearProto(all: true): ClassDecorator;
export function ClearProto(functions: Array<Func> | true): MethodDecorator;
export function ClearProto(functions: Array<Func> | true): PropertyDecorator;
export function ClearProto(functions: Array<Func> | true): ClassDecorator;

export function ClearProto(functions: Array<Func> | true): ClassDecorator | MethodDecorator | PropertyDecorator {
    return (clazz: Func, property?: string, descriptor?: TypedPropertyDescriptor<any>) =>
        id.process([clazz, property, descriptor], {functions});
}

let id: DecoIdLike<O, Dict, P>;

$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O, Dict, P>(ClearProto)
        .fqn(FQN_PCK)
        .targets('class', 'method', 'field')
        .processor((ins, p: P) => {
            const opt = {decorators: [], all: false} as O;
            if (p.functions === true) {
                opt.all = true;
            } else {
                $assert.array(p.functions, () => $dev.desc(ins, {field: 'functions'}));
            }
            ins.set(opt);

            const kind: DecoCLearType = opt.all ? 'inherited-all' : 'inherited-selected';
            if (ins.isClass) {
                ins.asClass.$secure.$clearValues(kind, ...opt.decorators);
            } else if (ins.isProperty) {
                ins.asProperty.$secure.$clearValues(kind, ...opt.decorators);
            }
        });
})

