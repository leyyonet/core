import {
    InjectionInjectOpt,
    InjectionInstance,
    InjectionPoolLike,
    InjectionPoolSecure,
    InjectionProviderGiven,
    InjectionProviderOpt
} from "./index-types";
import {ClassLike, Func} from "@leyyo/common";
import {AbstractCallback} from "../../callback";

// console.log(__filename);

export class InjectionPool extends AbstractCallback<InjectionInstance, ClassLike> implements InjectionPoolLike, InjectionPoolSecure {

    constructor() {
        super('injection', (ins) => ins.clazz, ins => ['sync','async'].includes(ins.blocking));
    }

    $addInject(given: InjectionProviderGiven, inject: ClassLike | Func, opt: InjectionInjectOpt): void {
        if (!opt) {
            opt = {
                place: 'parameter',
                isOptional: undefined,
                isLazy: undefined,
                deco: undefined,
            };
        } else if (!opt.place) {
            opt.place = 'parameter';
        }
        const [clazz, identifier] = given;
        const providerRec = this.$getStatus(clazz ?? identifier, true);
        const injectRec = this.$getStatus(inject, true);
        this.add(injectRec);
        injectRec.waitedByProviders.set(providerRec.clazz, opt);
        providerRec.waitingInjects.set(injectRec.clazz, opt);
    }

    $addProvider(given: InjectionProviderGiven, opt: InjectionProviderOpt): void {
        if (!opt) {
            opt = {
                blocking: 'sync',
                deco: undefined,
            };
        } else if (!opt.blocking) {
            opt.blocking = 'sync';
        }
        const [clazz, identifier] = given;
        const providerRec = this.$getStatus(clazz ?? identifier, true);
        providerRec.blocking = opt.blocking;
        providerRec.deco = opt.deco;

        this.add(providerRec);
    }

    $getStatus(given: ClassLike | string | Func, createIfAbsent?: boolean): InjectionInstance {
        const base = this.get(given);
        if (base.value) {
            return base.value;
        }
        if (!createIfAbsent) {
            return null;
        }
        const rec = {
            clazz: given,
            blocking: 'sync',
            deco: undefined,
            instance: undefined,
            names: [],
            waitedByProviders: new Map<ClassLike, InjectionInjectOpt>(),
            waitingInjects: new Map<ClassLike, InjectionInjectOpt>(),
        } as InjectionInstance;
        this.add(rec);
        return rec;
    }


    // region secure
    get $back(): InjectionPoolLike {
        return this;
    }

    get $secure(): InjectionPoolSecure {
        return this;
    }

    // endregion secure
}