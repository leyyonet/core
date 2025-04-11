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
    if (!decoPostConstruct) {
        core.fqn.decorator(PostConstruct, FQN_PCK);
        decoPostConstruct = core.decorator.addIdentifier<Opt>(PostConstruct, ['method', 'field', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(LazyInject, FQN_PCK);
        decoLazyInject = core.decorator.addClone<Opt>(LazyInject, PostConstruct);
    }
}

export function PostConstruct(identifier?: string): MethodDecorator;
export function PostConstruct(identifier?: string): PropertyDecorator;
export function PostConstruct(identifier?: string): MethodDecorator | PropertyDecorator {
    _init();
    return (clazz: Func, propertyKey: string, descriptor?: TypedPropertyDescriptor<any> | number) => {
        const rec = _run(decoPostConstruct.fork(clazz, propertyKey, descriptor), identifier);
        if (descriptor === undefined) {
            const field = rec.ins.asField();
            core.injection.$secure.$addInject([field.type, rec.identifier], field.clazz.creator, {place: 'field', deco: rec.ins.identifier, isLazy: true});
        }
        else {
            const method = rec.ins.asMethod();
            core.injection.$secure.$addInject([method.type, rec.identifier], method.clazz.creator, {place: 'method', deco: rec.ins.identifier, isLazy: true});
        }
    };
}

let decoPostConstruct: DecoIdLike<Opt>;

export function LazyInject(identifier?: string): MethodDecorator;
export function LazyInject(identifier?: string): PropertyDecorator;
export function LazyInject(identifier?: string): MethodDecorator | PropertyDecorator {
    _init();
    return (clazz: Func, propertyKey: string, descriptor?: TypedPropertyDescriptor<any> | number) => {
        const rec = _run(decoLazyInject.fork(clazz, propertyKey, descriptor), identifier);
        if (descriptor === undefined) {
            const field = rec.ins.asField();
            core.injection.$secure.$addInject([field.type, rec.identifier], field.clazz.creator, {place: 'field', deco: rec.ins.identifier, isLazy: true});
        }
        else {
            const method = rec.ins.asMethod();
            core.injection.$secure.$addInject([method.type, rec.identifier], method.clazz.creator, {place: 'method', deco: rec.ins.identifier, isLazy: true});
        }
    };
}

let decoLazyInject: DecoCloneLike<Opt>;
