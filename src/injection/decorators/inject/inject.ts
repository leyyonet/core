import {$assert, $dev, Func} from "@leyyo/common";
import {core} from "../../../core";
import {FQN_PCK} from "../../internal";
import {DecoIdLike} from "../../../decorator";
import {$$coreInternalOn} from "../../../internal";


export interface InjectOpt {
    identifier?: string;
}

export function Inject(identifier?: string): MethodDecorator;
export function Inject(identifier?: string): PropertyDecorator;
export function Inject(identifier?: string): ParameterDecorator;
export function Inject(identifier?: string): MethodDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: Func, property: PropertyKey, v3?: number | TypedPropertyDescriptor<any>) =>
        id.process([clazz, property, v3], {identifier});
}

let id: DecoIdLike<InjectOpt>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<InjectOpt>(Inject)
        .fqn(FQN_PCK)
        .targets('method', 'field', 'parameter')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p) => {
            $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

            ins.set(p);
        });
});
