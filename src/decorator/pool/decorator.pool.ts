import {$assert, $dev, $log, Dict, Func} from "@leyyo/common";
import {DecoId, DecoIdLike} from "../identifier";
import {DecoratorPoolLike, DecoratorPoolSecure} from "./index.types";
import {DecoClone, DecoCloneLike} from "../clone";
import {DecoLike} from "../abstract";
import {NamedDepotLike, NamedDepotSecure} from "../../named";
import {core} from "../../core";
import {FQN_PCK} from "../internal";
import {$$coreInternalOn} from "../../internal";


export class DecoratorPool implements DecoratorPoolLike, DecoratorPoolSecure {
    protected readonly _depot: NamedDepotLike<DecoLike, Func>;
    protected readonly _secure: NamedDepotSecure<DecoLike, Func>;
    private readonly logger = $log.create(DecoratorPool);

    constructor() {
        this._depot = core.namedPool.assign<DecoLike, Func>(
            FQN_PCK, 'pool.classes',
            ins => ins.fn,
            ins => ins instanceof DecoId || ins instanceof DecoClone
        );
        this._secure = this._depot.$secure;
    }

    decorators(): Array<DecoLike> {
        return this._depot.bases.map(base => base.value);
    }

    get<V = Dict, M = Dict, P = V>(target: Func | string, required?: boolean): DecoLike<V, M, P> {
        if (target instanceof DecoId || target instanceof DecoClone) {
            return target;
        }
        const deco = this._depot.fetchValue(target);
        if (deco) {
            return deco as DecoLike<V, M, P>;
        }
        if (required) {
            throw $dev.invalidError({
                issue: 'decorator.not.found',
                where: 'leyyo.decorator.DecoratorPool',
                method: 'get',
                target: core.fqnHandler.get(target)
            });
        }
        return undefined;
    }

    exists(target: Func | string | DecoLike): boolean {
        if (target instanceof DecoId || target instanceof DecoClone) {
            return true;
        }
        return !!this._depot.fetchValue(target);
    }

    // region identifier
    newId<V = Dict, M = Dict, P = V>(fn: Func): DecoIdLike<V, M, P> {
        return this.newIdentifier(fn)
    }

    newIdentifier<V = Dict, M = Dict, P = V>(fn: Func): DecoIdLike<V, M, P> {
        $assert.func(fn, () => $dev.opt({
            field: 'identifier',
            where: 'leyyo.decorator.DecoratorPool',
            method: 'newIdentifier'
        }));
        const decoId = new DecoId<V, M, P>(fn);
        const [, lookup] = this._secure.$add(decoId as DecoIdLike);
        this.logger.debug(`${lookup.basic} is sealed as an identifier`);
        return decoId as DecoIdLike<V, M, P>;
    }

    isIdentifier(target: Func | string): boolean {
        return this.get(target, false)?.isIdentifier;
    }

    getIdentifier<V = Dict, M = Dict, P = V>(target: Func | string): DecoIdLike<V, M, P> {
        const deco = this.get(target, true);
        if (deco.asIdentifier) {
            return deco.asIdentifier as DecoIdLike<V, M, P>;
        }
        throw $dev.developerError({
            issue: 'decorator.not.found',
            where: 'leyyo.decorator.DecoratorPool',
            method: 'getIdentifier',
            desc: deco.description
        });
    }

    identifiers(): Array<DecoIdLike> {
        return this._secure.$bases
            .filter(base => !base.value.isIdentifier)
            .map(base => base.value.asIdentifier);
    }

    // endregion identifier
    // region clone
    newClone<V = Dict, M = Dict, P = V>(clone: Func, identifier: Func): DecoCloneLike<V, M, P> {
        $assert.func(clone, () => $dev.opt({
            field: 'clone',
            where: 'leyyo.decorator.DecoratorPool',
            method: 'newClone'
        }));
        $assert.func(identifier, () => $dev.opt({
            field: 'identifier',
            where: 'leyyo.decorator.DecoratorPool',
            method: 'newClone'
        }));
        const decoId = this.getIdentifier<V, M, P>(identifier);
        if (!decoId.hasProcessor) {
            throw $dev.developerError({
                issue: 'identifier.does.not.have.processor',
                desc: decoId.description,
                where: 'leyyo.decorator.DecoratorPool',
                method: 'newClone'
            });
        }
        if (decoId.hasRule('no-cloneable')) {
            throw $dev.developerError({
                issue: 'identifier.is.not.cloneable',
                desc: decoId.description,
                where: 'leyyo.decorator.DecoratorPool',
                method: 'newClone'
            });
        }
        const decoClone = new DecoClone<V, M, P>(clone, decoId);
        const [, lookup] = this._secure.$add(decoClone as DecoCloneLike);
        this.logger.debug(`${lookup.basic} is sealed as a clone`);
        return decoClone as DecoCloneLike<V, M, P>;
    }

    clones(): Array<DecoCloneLike> {
        return this._secure.$bases
            .filter(base => base.value.isIdentifier)
            .map(base => base.value.asClone);
    }

    getClone<V = Dict, M = Dict, P = V>(target: Func | string): DecoCloneLike<V, M, P> {
        const deco = this.get(target, true);
        if (!deco.asIdentifier) {
            return deco.asClone as DecoCloneLike<V, M, P>;
        }
        throw $dev.developerError({
            issue: 'decorator.is.not.clone',
            where: 'leyyo.decorator.DecoratorPool',
            method: 'getClone',
            desc: deco.description
        });
    }

    isClone(target: Func | string): boolean {
        const deco = this.get(target, false);
        return deco && !deco.isIdentifier;
    }

    // endregion clone

    // region secure
    get $back(): DecoratorPoolLike {
        return this;
    }

    get $secure(): DecoratorPoolSecure {
        return this;
    }

    // endregion secure

    toJSON(): any {
        return {
            __: DecoratorPool.name,
            bases: this._secure.$bases,
        };
    }
}

$$coreInternalOn('class-pool-3', () => {
    core.$secure.$setDecoratorPool(new DecoratorPool());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(DecoratorPool, FQN_PCK);
});
