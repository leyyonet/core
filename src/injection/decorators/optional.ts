import {Func, to} from "@leyyo/common";
import {core} from "../../core";
import {DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {InjectionDecoratorRun} from "../pool";

// console.log(__filename);

interface Opt {
    identifier?: string;
}

const _run = (ins: DecoInstanceLike<Opt>, identifier: string): InjectionDecoratorRun<Opt> => {
    identifier = to.text(identifier, {deco: ins.description, identifier});
    ins.set({identifier});
    return {ins, identifier};
}
const _init = () => {
    if (!decoOptional) {
        core.fqn.decorator(Optional, FQN_PCK);
        decoOptional = core.decorator.addIdentifier<Opt>(Optional, ['method', 'field', 'parameter', 'no-multiple', 'no-inherited']);
    }
}

export function Optional(identifier?: string): MethodDecorator;
export function Optional(identifier?: string): PropertyDecorator;
export function Optional(identifier?: string): ParameterDecorator;
export function Optional(identifier?: string): MethodDecorator | PropertyDecorator | ParameterDecorator {
    _init();
    return (clazz: Func, propertyKey: string, v3?: TypedPropertyDescriptor<any> | number) => {
        const rec = _run(decoOptional.fork(clazz, propertyKey, v3), identifier);
        if (v3 === undefined) {
            const field = rec.ins.asField();
            core.injection.$secure.$addInject([field.type, rec.identifier], field.clazz.creator, {place: 'field', deco: rec.ins.identifier, isOptional: true});
        }
        else if (typeof v3 === "number") {
            const param = rec.ins.asParameter();
            core.injection.$secure.$addInject([param.type, rec.identifier], param.property.clazz.creator, {place: 'parameter', deco: rec.ins.identifier, isOptional: true});
        }
        else {
            const method = rec.ins.asMethod();
            core.injection.$secure.$addInject([method.type, rec.identifier], method.clazz.creator, {place: 'method', deco: rec.ins.identifier, isOptional: true});
        }
    };
}

let decoOptional: DecoIdLike<Opt>;

