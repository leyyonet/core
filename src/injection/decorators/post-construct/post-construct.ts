import {$assert, $dev, Func} from "@leyyo/common";
import {core} from "../../../core";
import {FQN_PCK} from "../../internal";
import {DecoIdLike} from "../../../decorator";
import {$$coreInternalOn} from "../../../internal";


export interface PostConstructOpt {
    identifier?: string;
}

export function PostConstruct(identifier?: string): MethodDecorator;
export function PostConstruct(identifier?: string): PropertyDecorator;
export function PostConstruct(identifier?: string): MethodDecorator | PropertyDecorator {
    return (clazz: Func, property: PropertyKey, descriptor?: TypedPropertyDescriptor<any> | number) =>
        id.process([clazz, property, descriptor], {identifier});
}

let id: DecoIdLike<PostConstructOpt>;
$$coreInternalOn('deco-id', () => {
    id = core.decoratorPool.newId<PostConstructOpt>(PostConstruct)
        .fqn(FQN_PCK)
        .targets('method', 'field')
        .rules('no-multiple', 'no-inherited')
        .processor((ins, p) => {
            $assert.textOptional(p.identifier, () => $dev.desc(ins, {field: 'identifier'}));

            ins.set(p);
        });
});
