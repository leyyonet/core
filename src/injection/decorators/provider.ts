import {Func, to} from "@leyyo/common";
import {core} from "../../core";
import {DecoCloneLike, DecoIdLike, DecoInstanceLike} from "../../decorator";
import {FQN_PCK} from "../internal";
import {InjectionDecoratorRun} from "../pool";

// console.log(__filename);

interface Opt {
    identifier: string;
}

const _run = (ins: DecoInstanceLike<Opt>, identifier: string): InjectionDecoratorRun<Opt> => {
    identifier = to.text(identifier, {deco: ins.description, identifier});
    ins.set({identifier});
    return {ins, identifier};
}

const _init = () => {
    if (!decoProvider) {
        core.fqn.decorator(Provider, FQN_PCK);
        decoProvider = core.decorator.addIdentifier<Opt>(Provider, ['class', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(Injectable, FQN_PCK);
        decoInjectable = core.decorator.addClone<Opt>(Injectable, Provider);

        core.fqn.decorator(Service, FQN_PCK);
        decoService = core.decorator.addClone<Opt>(Service, Provider);

        core.fqn.decorator(Configuration, FQN_PCK);
        decoConfiguration = core.decorator.addClone<Opt>(Configuration, Provider);
    }
}

export function Provider(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoProvider.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'sync', deco: rec.ins.identifier})
    };
}

let decoProvider: DecoIdLike<Opt>;

export function Injectable(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoInjectable.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'sync', deco: rec.ins.identifier})
    };
}

let decoInjectable: DecoCloneLike<Opt>;


export function Service(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoService.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'sync', deco: rec.ins.identifier})
    };
}

let decoService: DecoCloneLike<Opt>;

export function Configuration(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoConfiguration.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'sync', deco: rec.ins.identifier})
    };
}

let decoConfiguration: DecoCloneLike<Opt>;
