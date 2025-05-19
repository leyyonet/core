import {$assert, $dev, Func} from "@leyyo/common";
import {core} from "../../../core";
import {FQN_PCK} from "../../internal";
import {DecoIdLike} from "../../../decorator";
import {InjectOpt} from "../inject";
import {$$coreInternalOn} from "../../../internal";


export function Optional(identifier?: string): MethodDecorator;
export function Optional(identifier?: string): PropertyDecorator;
export function Optional(identifier?: string): ParameterDecorator;
export function Optional(identifier?: string): MethodDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: Func, property: PropertyKey, v3?: TypedPropertyDescriptor<any> | number) =>
        id.process([clazz, property, v3], {identifier});
}

let id: DecoIdLike<InjectOpt>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId(Optional)
        .fqn(FQN_PCK)
        .targets('method', 'field', 'parameter')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p) => {
            $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

            ins.set(p);
        });
});
