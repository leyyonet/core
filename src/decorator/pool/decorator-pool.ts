import {assertion, DeveloperException, Dict, Func} from "@leyyo/common";
import {DecoId, DecoIdLike} from "../identifier";
import {DecoratorPoolLike, DecoratorSecure} from "./index-types";
import {DecoClone, DecoCloneLike} from "../clone";
import {Forbidden, ForbiddenItems, Target, TargetItems} from "../literals";
import {DecoLike} from "../abstract";
import {AbstractCallback} from "../../callback";
import {core} from "../../core";

// console.log(__filename);

export class DecoratorPool extends AbstractCallback<DecoLike, Func> implements DecoratorPoolLike, DecoratorSecure {

    constructor() {
        super('decorator', ins => ins.fn, ins => ins instanceof DecoId || ins instanceof DecoClone);
    }

    // region identifier
    addIdentifier<V extends Dict = Dict>(fn: Func, keywords: Array<Target|Forbidden>): DecoIdLike<V> {
        assertion.func(fn, () => {return {name: 'identifier', where: DecoratorPool.name}});
        assertion.array(keywords, () => {return {name: 'keywords', where: DecoratorPool.name}});
        const target = [] as Array<Target>;
        const forbidden = [] as Array<Forbidden>;
        keywords.forEach(keyword => {
            const t = keyword as Target;
            const f = keyword as Forbidden;
            if (TargetItems.includes(t)) {
                if (!target.includes(t)) {
                    target.push(t);
                }
            }
            else if (ForbiddenItems.includes(f)) {
                if (!forbidden.includes(f)) {
                    forbidden.push(f);
                }
            }
            else {
                throw new DeveloperException('unknown.identifier.keyword', {decorator: core.fqn.get(fn), keyword}).with(this);
            }
        })
        const decoId = new DecoId<V>(fn, target, forbidden);
        this.add(decoId);
        return decoId;
    }

    isIdentifier(target: Func | string): boolean {
        return this.fetchValue(target)?.isIdentifier;
    }

    getIdentifier<V extends Dict = Dict>(target: Func | string): DecoIdLike<V> {
        const decorator = this.fetchValue(target);
        if (decorator) {
            if (decorator.asIdentifier) {
                return decorator.asIdentifier as DecoIdLike<V>;
            }
            throw new DeveloperException('decorator.is.not.identifier', {decorator: decorator.description}).with(this);
        }
        throw new DeveloperException('identifier.not.found', {target: typeof target === 'function' ? core.fqn.get(target) : target}).with(this);
    }

    identifiers(): Array<DecoIdLike> {
        return this.bases
            .filter(base => !base.value.isIdentifier)
            .map(base => base.value.asIdentifier);
    }

    // endregion identifier
    // region clone
    addClone<V extends Dict = Dict>(clone: Func, identifier: Func, target?: Array<Target>): DecoCloneLike<V> {
        assertion.func(clone, {name: 'clone', where: DecoratorPool.name});
        assertion.func(identifier, {name: 'identifier', where: DecoratorPool.name});
        const decoId = this.getIdentifier(identifier);
        const decoClone = new DecoClone(clone, decoId, target);
        this.add(decoClone);
        return decoClone as DecoCloneLike<V>;
    }

    clones(): Array<DecoCloneLike> {
        return this.bases
            .filter(base => base.value.isIdentifier)
            .map(base => base.value.asClone);
    }

    getClone<V extends Dict = Dict>(target: Func | string): DecoCloneLike<V> {
        const decorator = this.fetchValue(target);
        if (decorator) {
            if (!decorator.asIdentifier) {
                return decorator.asClone as DecoCloneLike<V>;
            }
            throw new DeveloperException('decorator.is.not.clone', {decorator: decorator.description}).with(this);
        }
        throw new DeveloperException('clone.not.found', {target: typeof target === 'function' ? core.fqn.get(target) : target}).with(this);
    }

    isClone(target: Func | string): boolean {
        const identifier = this.fetchValue(target);
        return identifier && !identifier.asIdentifier;
    }

    // endregion clone

    // region secure
    get $back(): DecoratorPoolLike {
        return this;
    }

    get $secure(): DecoratorSecure {
        return this;
    }

    // endregion secure

}