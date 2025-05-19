import {$assert, $dev} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {$$coreInternalOn} from "../../internal";


interface O {
    description: string;
}


/**
 * Decorates target with description
 */
export function Description(description: string): ClassDecorator;
export function Description(description: string): MethodDecorator;
export function Description(description: string): PropertyDecorator;
export function Description(description: string): ParameterDecorator;
export function Description(description: string): ClassDecorator | MethodDecorator | PropertyDecorator | ParameterDecorator {
    return (clazz: unknown, property: PropertyKey, v3: TypedPropertyDescriptor<any> | number) => {
        id.process([clazz, property, v3], {description});
    };
}

export let id: DecoIdLike<O>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<O>(Description)
        .fqn(FQN_PCK)
        .targets('class', 'field', 'method', 'parameter')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p) => {
            $assert.text(p.description, () => $dev.desc(ins, {field: 'description'}));
            ins.set({description: p.description});
        });
});
