import {Func, to} from "@leyyo/common";
import {core} from "../../core";
import {DecoCloneLike, DecoIdLike, DecoInstanceLike} from "../../decorator";
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
    if (!decoInject) {
        core.fqn.decorator(Inject, FQN_PCK);
        decoInject = core.decorator.addIdentifier<Opt>(Inject, ['method', 'field', 'parameter', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(AutoWired, FQN_PCK);
        decoAutoWired = core.decorator.addClone<Opt>(AutoWired, Inject);
    }
}

export function Inject(identifier?: string): MethodDecorator;
export function Inject(identifier?: string): PropertyDecorator;
export function Inject(identifier?: string): ParameterDecorator;
export function Inject(identifier?: string): MethodDecorator | PropertyDecorator | ParameterDecorator {
    _init();
    return (clazz: Func, propertyKey: string, v3?: number | TypedPropertyDescriptor<any>) => {
        const rec = _run(decoInject.fork(clazz, propertyKey, v3), identifier);
        if (v3 === undefined) {
            const field = rec.ins.asField();
            core.injection.$secure.$addInject([field.type, rec.identifier], field.clazz.creator, {place: 'field', deco: rec.ins.identifier});
        }
        else if (typeof v3 === "number") {
            const param = rec.ins.asParameter();
            core.injection.$secure.$addInject([param.type, rec.identifier], param.property.clazz.creator, {place: 'parameter', deco: rec.ins.identifier});
        }
        else {
            const method = rec.ins.asMethod();
            core.injection.$secure.$addInject([method.type, rec.identifier], method.clazz.creator, {place: 'method', deco: rec.ins.identifier});
        }
    };
}

let decoInject: DecoIdLike<Opt>;


export function AutoWired(identifier?: string): MethodDecorator;
export function AutoWired(identifier?: string): PropertyDecorator;
export function AutoWired(identifier?: string): MethodDecorator | PropertyDecorator {
    _init();
    return (clazz: Func, propertyKey: string, descriptor?: TypedPropertyDescriptor<any>) => {
        const rec = _run(decoAutoWired.fork(clazz, propertyKey, descriptor), identifier);
        if (descriptor === undefined) {
            const field = rec.ins.asField();
            core.injection.$secure.$addInject([field.type, rec.identifier], field.clazz.creator, {place: 'field', deco: rec.ins.identifier});
        }
        else {
            const method = rec.ins.asMethod();
            core.injection.$secure.$addInject([method.type, rec.identifier], method.clazz.creator, {place: 'method', deco: rec.ins.identifier});
        }
    };
}

let decoAutoWired: DecoCloneLike<Opt>;
