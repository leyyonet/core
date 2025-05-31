import {$assert, $dev, $is, ClassLike, Dict, Func} from "@leyyo/common";
import {DecoIdLike, DecoIdSecure, DecoProcessorLambda} from "./index.types";
import {DecoInstance, DecoInstanceLike} from "../instance";
import {ClassReflectionLike, ParameterReflectionLike, PropertyReflectionLike} from "../../reflection";
import {DecoRule, DecoRuleItems, Target, TargetItems} from "../literals";
import {core} from "../../core";
import {DecoFilter, DecoLike} from "../abstract";
import {DecoClone, DecoCloneLike} from "../clone";
import {$$coreInternalOn} from "../../internal";
import {FQN_PCK} from "../internal";

export class DecoId<V = Dict, M = Dict, P = V> implements DecoIdLike<V, M, P>, DecoIdSecure<V, M, P> {
    private readonly _fn: Func;
    private _targets: Array<Target>;
    private _rules: Array<DecoRule>;
    private _name: string;
    private _rulesSet: boolean;
    private _targetSet: boolean;
    private _dirty: boolean;
    private _metadata: M;

    private _instances: Array<DecoInstanceLike>;
    private _keywords: Array<string|symbol>;
    private _clones: Array<DecoCloneLike<V, M, P>>;
    private _before: Array<DecoIdLike>;
    private _after: Array<DecoIdLike>;
    private _processor: DecoProcessorLambda<any, V, M, P>;

    constructor(fn: Func) {
        this._fn = fn;
        this._targets = ['class', 'method', 'field', 'parameter'];
        this._rules = [];
        if (!core.fqnHandler.exists(fn)) {
            core.fqnHandler.onReady(fn, (name: string) => {
                this._name = name;
            });
        }
    }

    protected _wrongKeyword(value: any): boolean {
        switch (typeof value) {
            case 'symbol':
                return false; // valid type
            case "string":
                return value.trim() === ''; // if empty then wrong value
            default:
                return true; // wrong type
        }
    }

    // region getter
    info(detailed?: boolean): Dict {
        const rec = {
            name: this.name,
        } as Dict;
        if (detailed) {
            rec.targets = [...this._targets];
            rec.rules = [...this._rules];
        }
        return rec;
    }

    get name(): string {
        if (!this._name) {
            this._name = core.fqnHandler.get(this._fn);
        }
        return this._name;
    }

    get fn(): Func {
        return this._fn;
    }

    get description(): string {
        return `<identifier>${this.name}`;
    }

    get instances(): Array<DecoInstanceLike> {
        return this._instances ? this._instances : [];
    }

    get clones(): Array<DecoCloneLike<V, M, P>> {
        return this._clones ? [...this._clones] : [];
    }
    addClone(clone: DecoCloneLike<V, M, P>): void {
        if (!this._clones) {
            this._clones = [];
        }
        this._clones.push(clone);
    }

    get isIdentifier(): boolean {
        return true;
    }

    get asIdentifier(): DecoIdLike<V, M, P> {
        return this;
    }

    get asClone(): DecoCloneLike<V, M, P> {
        throw $dev.developerError({
            issue: 'identifier.is.not.clone',
            desc: this.description,
            where: 'leyyo.decorator.DecoId',
            method: 'asClone'
        });
    }

    fqn(pack: string): this {
        core.fqnHandler.decorator(this._fn, pack);
        return this;
    }

    // endregion getter

    // region target
    getTargets(): Array<Target> {
        return [...this._targets];
    }

    hasTarget(...targets: Array<Target>): boolean {
        return targets.some(t => this._targets.includes(t));
    }

    targets(...target: Array<Target>): this {
        if (this._dirty) {
            throw $dev.developerError({
                issue: 'decorator.already.decorated.someone',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'targets'
            });
        }
        if (this._targetSet) {
            throw $dev.developerError({
                issue: 'already.target.set',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'targets'
            });
        }
        $assert.literalArray(target, TargetItems, () => $dev.desc(this, {field: 'target'}));
        this._targets = target;
        this._targetSet = true;
        return this;
    }

    // endregion target

    // region rule
    getRules(): Array<DecoRule> {
        return [...this._rules];
    }

    hasRule(rule: DecoRule): boolean {
        return rule && this._rules.includes(rule);
    }

    rules(...rules: Array<DecoRule>): this {
        if (this._dirty) {
            throw $dev.developerError({
                issue: 'decorator.already.decorated.someone',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'rules'
            });
        }
        if (this._rulesSet) {
            throw $dev.developerError({
                issue: 'already.rule.set',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'rules'
            });
        }
        $assert.literalArray(rules, DecoRuleItems, () => $dev.desc(this, {field: 'rules'}));
        this._rules = rules;
        this._rulesSet = true;
        return this;
    }

    // endregion rule

    // region keyword
    getKeywords(): Array<string|symbol> {
        return this._keywords ? [...this._keywords] : [];
    }

    keywords(...keyword: Array<string|symbol>): this {
        const wrong = keyword.filter(value => this._wrongKeyword(value));
        if (wrong.length > 0) {
            throw $dev.invalidError({
                issue: 'invalid.keyword', desc: this.description, field: 'metadata',
                where: 'leyyo.decorator.DecoId',
                method: 'keywords', wrong
            });
        }
        if (keyword.length > 0) {
            if (!this._keywords) {
                this._keywords = [];
            }
            keyword.forEach(item => {
                if (!this._keywords.includes(item)) {
                    this._keywords.push(item);
                }
            });

        }
        return this;
    }

    hasKeyword(keyword: string): boolean {
        return this._keywords ? this._keywords.includes(keyword) : false;
    }

    // endregion keyword

    // region metadata
    getMetadata<M2 = M>(): M2 {
        return this._metadata ? {...this._metadata} as unknown as M2 : {} as M2;
    }

    $setMetadata(metadata: M): this {
        $assert.bareObject(metadata, () => $dev.desc(this, {
            field: 'metadata',
            where: 'leyyo.decorator.DecoId',
            method: '$setMetadata'
        }));
        this._metadata = metadata;
        return this;
    }

    metadata(metadata: M): this {
        if (this._dirty) {
            throw $dev.developerError({
                issue: 'decorator.already.decorated.someone',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'metadata'
            });
        }
        return this.$setMetadata(metadata);
    }
    deleteMetaKey(key: keyof M): this {
        if (!$is.text(key) && typeof key !== 'symbol') {
            return this;
        }
        if (!this._metadata) {
            return this;
        }
        if (this._metadata[key] !== undefined) {
            delete this._metadata[key];
        }
        return this;
    }
    setMetaKey(key: keyof M, value: M[keyof M]): this {
        if (!$is.text(key) && typeof key !== 'symbol') {
            return this;
        }
        if (this._dirty) {
            throw $dev.developerError({
                issue: 'decorator.already.decorated.someone',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'metadata'
            });
        }
        if (!this._metadata) {
            this._metadata = {} as M;
        }
        this._metadata[key] = value;
        return this;
    }

    // endregion metadata

    // region processor
    addInstance(ins: DecoInstanceLike): void {
        if (!this._instances) {
            this._instances = [];
        }
        this._instances.push(ins);
    }
    processor<R = any>(fn: DecoProcessorLambda<R, V, M, P>): this {
        if (this._dirty) {
            throw $dev.developerError({
                issue: 'decorator.already.decorated.someone',
                desc: this.description,
                where: 'leyyo.decorator.DecoId',
                method: 'processor'
            });
        }
        if (this._processor) {
            throw $dev.developerError({
                issue: 'processor.already.defined',
                where: 'leyyo.decorator.DecoId',
                method: 'processor'
            });
        }
        return this.$setProcessor(fn);
    }

    $setProcessor<R = any>(fn: DecoProcessorLambda<R, V, M, P>): this {
        $assert.func(fn, () => $dev.desc(this, {
            field: 'processor',
            where: 'leyyo.decorator.DecoId',
            method: '$setProcessor'
        }));
        this._processor = fn;
        return this;
    }

    get hasProcessor(): boolean {
        return typeof this._processor === 'function';
    }

    process<R = void>(fork: Array<any> | DecoInstanceLike<V, M, P>, parameters?: P): R {
        let ins: DecoInstanceLike<V, M, P>;
        if (Array.isArray(fork)) {
            ins = this.fork(...fork);
        } else if (fork instanceof DecoInstance) {
            ins = fork;
        } else {
            throw $dev.invalidError({
                issue: 'invalid.instance.defined',
                where: 'leyyo.decorator.DecoId',
                method: 'process',
                value: fork,
                type: typeof fork,
            });
        }
        if (typeof this._processor !== 'function') {
            throw $dev.invalidError({
                issue: 'processor.not.defined', field: 'receiver',
                where: 'leyyo.decorator.DecoId',
                method: 'process'
            });
        }
        if (!$is.bareObject(parameters)) {
            parameters = {} as P;
        }
        return this._processor(ins, parameters);
    }

    // endregion processor

    // region dirty
    get isDirty(): boolean {
        return this._dirty;
    }

    dirty(): void {
        this._dirty = true;
    }

    // endregion dirty

    // region public
    fork(...args: Array<unknown>): DecoInstanceLike<V, M, P> {
        return new DecoInstance<V, M, P>(this, null, args);
    }

    // endregion public

    protected _afterAdd(deco: DecoLike, next: boolean): void {
        const id = deco.isIdentifier ? deco as DecoIdLike : deco.asIdentifier;
        if (id !== this) {
            return;
        }
        if (!this._after) {
            this._after = [];
        }
        if (this._after.includes(id)) {
            return;
        }
        this._after.push(id);
        if (next) {
            this._beforeAdd(deco, false);
        }
    }

    protected _beforeAdd(deco: DecoLike, next: boolean): void {
        const id = deco.isIdentifier ? deco as DecoIdLike : deco.asIdentifier;
        if (id !== this) {
            return;
        }
        if (!this._before) {
            this._before = [];
        }
        if (this._before.includes(id)) {
            return;
        }
        this._before.push(id);
        if (next) {
            this._afterAdd(deco, false);
        }
    }

    private _findId(given: Func | string | DecoLike): DecoIdLike {
        if (given instanceof DecoId) {
            return given;
        } else if (given instanceof DecoClone) {
            return given.id;
        }
        const found = core.decoratorPool.get(given as DecoLike, true);
        if (found instanceof DecoId) {
            return found;
        }
        return (found as DecoCloneLike).id;
    }

    isAfter(deco: DecoLike | Func | string): boolean {
        return this._after ? this._after.includes(this._findId(deco)) : false;
    }

    isBefore(deco: DecoLike | Func | string): boolean {
        return this._before ? this._before.includes(this._findId(deco)) : false;
    }

    before(...functions: Array<Func|string>): this {
        functions.forEach(fn => this._beforeAdd(this._findId(fn), true));
        return this;
    }
    after(...functions: Array<Func|string>): this {
        functions.forEach(fn => this._afterAdd(this._findId(fn), true));
        return this;
    }

    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectionLike> {
        return this._instances ? this._instances.map(ins => ins.assigned as ClassReflectionLike)
            .filter(item => item.filterByTarget('class'))
            .filter(item => item.filterByBelongs(this._fn, filter)) : [];
    }

    valueByClass(fn: ClassLike | Func | string, filter?: DecoFilter): V {
        const ref = core.reflectionPool.get(fn);
        if (!ref) {
            return undefined;
        }
        return ref.getValueByDeco<V>(this._fn, filter);
    }

    valuesByClass(fn: ClassLike | Func | string, filter?: DecoFilter): Array<V> {
        const ref = core.reflectionPool.get(fn);
        if (!ref) {
            return [];
        }
        return ref.listValuesByDeco<V>(this._fn, filter);
    }

    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectionLike> {
        return this._instances ? this._instances
            .map(ins => ins.assigned as PropertyReflectionLike)
            .filter(item => item.filterByTarget('method', 'field'))
            .filter(item => item.filterByKind(filter))
            .filter(item => item.filterByBelongs(this._fn, filter)) : []
            ;
    }

    valueByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): V {
        const ref = core.reflectionPool.get(fn);
        if (!ref) {
            return undefined;
        }
        const prop = ref.getAnyProperty(propName, filter);
        return prop?.getValueByDeco<V>(this._fn, filter);
    }

    valuesByProperty(fn: Func | string, propName: PropertyKey, filter?: DecoFilter): Array<V> {
        const ref = core.reflectionPool.get(fn);
        if (!ref) {
            return [];
        }
        const prop = ref.getAnyProperty(propName, filter);
        return prop?.listValuesByDeco<V>(this._fn, filter) ?? [];
    }

    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectionLike> {
        return this._instances ? this._instances
            .map(ins => ins.assigned as ParameterReflectionLike)
            .filter(item => item.filterByTarget('parameter'))
            .filter(item => item.filterByBelongs(this._fn, filter)) : []
            ;
    }

    valueByParameter(fn: Func | string, name: PropertyKey, index: number, filter?: DecoFilter): V {
        const ref = core.reflectionPool.get(fn);
        if (!ref) {
            return undefined;
        }
        filter = filter ?? {};
        filter.kind = 'method';
        const prop = ref.getAnyProperty(name, filter);
        if (!prop || !prop.hasParameter(index)) {
            return undefined;
        }
        const param = prop.getParameter(index);
        return param?.getValueByDeco<V>(this._fn);
    }

    valuesByParameter(fn: Func | string, name: PropertyKey, index: number, filter?: DecoFilter): Array<V> {
        const ref = core.reflectionPool.get(fn);
        if (!ref) {
            return [];
        }
        filter = filter ?? {};
        filter.kind = 'method';
        const prop = ref.getAnyProperty(name, filter);
        if (!prop || !prop.hasParameter(index)) {
            return [];
        }
        const param = prop.getParameter(index);
        return param?.listValuesByDeco<V>(this._fn) ?? [];
    }

    // endregion parameter

    // region secure
    get $back(): DecoIdLike<V, M, P> {
        return this;
    }


    get $secure(): DecoIdSecure<V, M, P> {
        return this;
    }

    // endregion secure

    clearInstances(): void {
        if (this._instances) {
            this._instances.forEach(ins => ins.delete());
            delete this._instances;
        }
    }
    toJSON(simple?: boolean): any {
        if (simple) {
            return {
                name: this._name,
                fn: this._fn?.name,
                targets: this._targets,
                rules: this._rules,
                keywords: this._keywords ? this._keywords.map(key => typeof key === 'symbol' ? `[${key.description}]` : key) : [],
            };
        }
        return {
            __: DecoId.name,
            name: this._name,
            fn: this._fn?.name,
            targets: this._targets,
            rules: this._rules,
            keywords: this._keywords ? this._keywords.map(key => typeof key === 'symbol' ? `[${key.description}]` : key) : [],
            clones: this._clones ? this._clones.map(c => c.toJSON(true)) : [],
            instances: this._instances ? this._instances.map(c => c.toJSON(true)) : [],
        };
    }
}

$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(DecoId, FQN_PCK);
});
