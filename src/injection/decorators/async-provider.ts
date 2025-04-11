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
    if (!decoAsyncProvider) {
        core.fqn.decorator(AsyncProvider, FQN_PCK);
        decoAsyncProvider = core.decorator.addIdentifier<Opt>(AsyncProvider, ['class', 'no-multiple', 'no-inherited']);

        core.fqn.decorator(DataSource, FQN_PCK);
        decoDataSource = core.decorator.addClone<Opt>(DataSource, AsyncProvider);

        core.fqn.decorator(Resource, FQN_PCK);
        decoResource = core.decorator.addClone<Opt>(Resource, AsyncProvider);
    }
}

export function AsyncProvider(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoAsyncProvider.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'async', deco: rec.ins.identifier})
    };
}

let decoAsyncProvider: DecoIdLike;

export function DataSource(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoDataSource.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'async', deco: rec.ins.identifier})
    };
}

let decoDataSource: DecoCloneLike;

export function Resource(identifier?: string): ClassDecorator {
    _init();
    return (clazz: Func) => {
        const rec = _run(decoResource.fork(clazz), identifier);
        core.injection.$secure.$addProvider([clazz, rec.identifier], {blocking: 'async', deco: rec.ins.identifier})
    };
}

let decoResource: DecoCloneLike;
