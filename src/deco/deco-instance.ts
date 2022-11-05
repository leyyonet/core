import {FuncLike, RecLike} from "../common";
import {DecoFilter, DecoLike, DecoOnAssignedCb, DecoOnChangedCb, DecoOption} from "./types";
import {
    ClassReflectLike,
    ParameterReflectLike,
    PropertyReflectLike,
    ReflectDescribed,
    ReflectLike,
    ReflectParameterDescribed,
    TargetLike
} from "../reflect";
import {DeveloperException} from "../error";
import {$ly} from "../core";


let _LOG = $ly.preLog;

/**
 * @instance
 * */
export class DecoInstance<V extends RecLike = RecLike> implements DecoLike<V> {
    // region properties
    private readonly _fn: FuncLike;
    private readonly _assignedList: Array<ReflectLike>;
    private _onAssignedList: Array<DecoOnAssignedCb>;
    private _onChangedList: Array<DecoOnChangedCb>;
    private readonly _options: DecoOption;
    // endregion properties

    // region global
    static {
        $ly.addFqn(this);
        $ly.addTrigger('logger', () => {
            _LOG = $ly.logger.assign(this);
        });
    }
    constructor(fn: FuncLike, opt?: DecoOption) {
        this._fn = fn;
        opt = $ly.primitive.object(opt) as DecoOption ?? {};
        $ly.deco.BOOL_FIELDS.forEach(f => {opt[f] = $ly.primitive.boolean(opt[f])});
        if (!opt.clazz && !opt.method && !opt.field && !opt.parameter) {
            opt.clazz = true;
            opt.method = true;
            opt.field = true;
            opt.parameter = true;
        }
        opt.purposes = $ly.primitive.array(opt.purposes, $ly.primitive.string) ?? [];
        this._options = opt;
        this._assignedList = [];
        // this._syncList = [];
    }
    // endregion global

    // region private
    _findAssigned(described: ReflectDescribed): ReflectLike {
        if (described.error) {
            throw described.error;
        }
        switch (described.target) {
            case 'class':
                if (!this.forClass) {
                    throw new DeveloperException('reflect:not.allowed.target')
                        .patch({target: described.target, expected: this.targets, clazz: described.description})
                        .with(this);
                }
                break;
            case 'method':
                if (!this.forMethod) {
                    throw new DeveloperException('reflect:not.allowed.target')
                        .patch({target: described.target, expected: this.targets, method: described.description})
                        .with(this);
                }
                break;
            case 'field':
                if (!this.forField) {
                    throw new DeveloperException('reflect:not.allowed.target')
                        .patch({target: described.target, expected: this.targets, field: described.description})
                        .with(this);
                }
                break;
            case 'parameter':
                if (!this.forParameter) {
                    throw new DeveloperException('reflect:not.allowed.target')
                        .patch({target: described.target, expected: this.targets, parameter: described.description})
                        .with(this);
                }
                break;
        }
        // todo system class
        if (['method', 'field'].includes(described.target)) {
            if (this.onlyForStatic && described.keyword !== 'static') {
                throw new DeveloperException('reflect:not.allowed.keyword')
                    .patch({keyword: described.keyword, expected: 'instance', property: described.description})
                    .with(this);
            } else if (this.onlyForInstance && described.keyword !== 'instance') {
                throw new DeveloperException('reflect:not.allowed.keyword')
                    .patch({keyword: described.keyword, expected: 'static', property: described.description})
                    .with(this);
            }
        }
        let assigned: ReflectLike;
        switch (described.target) {
            case 'class':
                assigned = $ly.reflect.$findClass(described.classFn, described.classProto);
                break;
            case 'method':
            case 'field':
                assigned = $ly.reflect
                    .$findClass(described.classFn, described.classProto)
                    .$registerProperty(described);
                break;
            case 'parameter':
                assigned = $ly.reflect
                    .$findClass(described.classFn, described.classProto)
                    .$registerProperty(described)
                    .getParameter((described as ReflectParameterDescribed).index, {});
                break;
        }
        if (this._assignedList.filter(item => item === assigned).length < 1) {
            this._assignedList.push(assigned);
        }
        assigned.$setCurrentDeco(this);
        return assigned;
    }
    // endregion private

    // region internal
    $onChanged(assigned: ReflectLike): void {
        if (this._onChangedList?.length > 0) {
            this._onChangedList.forEach(cb => cb(this, assigned));
        }
    }
    // endregion internal

    // region getter
    info(detailed?: boolean): RecLike {
        const rec = {
            name: this.name,
        } as RecLike;
        if (detailed) {
            rec.options = this._options;
        }
        return rec;
    }
    get isPrimary(): boolean {return true;}
    get name(): string {return $ly.fqn.get(this._fn);}
    get fn(): FuncLike {return this._fn;}
    get description(): string {
        return `<deco>${this.name}`;
    }
    get targets(): Array<TargetLike> {
        const result = [] as Array<TargetLike>;
        if (this._options.clazz) {
            result.push('class');
        }
        if (this._options.method) {
            result.push('method');
        }
        if (this._options.field) {
            result.push('field');
        }
        if (this._options.parameter) {
            result.push('parameter');
        }
        return result;
    }
    get forClass(): boolean {return this._options.clazz;}
    get forMethod(): boolean {return this._options.method;}
    get forField(): boolean {return this._options.field;}
    get forParameter(): boolean {return this._options.parameter;}
    get onlyForInstance(): boolean {return this._options.onlyForInstance;}
    get onlyForStatic(): boolean {return this._options.onlyForStatic;}
    get temporary(): boolean {return this._options.temporary;}
    get multiple(): boolean {return this._options.multiple;}
    get isFinal(): boolean {return this._options.isFinal;}
    get purposes(): Array<string> {return this._options.purposes;}
    get options(): DecoOption {return this._options;}
    // endregion getter


    // region public
    assign<R extends ReflectLike = ReflectLike>(described: ReflectDescribed, value?: V): R {
        const assigned = this._findAssigned(described) as R;
        assigned.$setValue(this, value, false);
        if (this._onAssignedList?.length > 0) {
            this._onAssignedList.forEach(cb => cb(this, assigned));
        }
        return assigned;
    }

    hasPurposes(...purposes: Array<string>): boolean {
        purposes = $ly.primitive.array(purposes, $ly.primitive.string);
        if (!purposes || purposes.length < 1) {
            return true;
        }
        return this._options.purposes.filter(purpose => purposes.includes(purpose)).length > 0
    }
    // endregion public



    // region class
    assignedClasses(filter?: DecoFilter): Array<ClassReflectLike> {
        return this._assignedList
            .filter(ref => ref.filterByTargetType('class'))
            .map(ref => ref as ClassReflectLike)
            .filter(ref => ref.filterByBelongs(this, filter));
    }
    valueByClass(identifier: FuncLike | string, filter?: DecoFilter): V {
        return $ly.reflect.getClass(identifier as FuncLike).getValue(this, filter) as V;
    }
    valuesByClass(identifier: FuncLike | string, filter?: DecoFilter): Array<V> {
        return $ly.reflect.getClass(identifier as FuncLike).listValues(this, filter) as Array<V>;
    }
    // endregion class
    // region property
    assignedProperties(filter?: DecoFilter): Array<PropertyReflectLike> {
        return this._assignedList
            .filter(ref => ref.filterByTargetType('method', 'field'))
            .map(ref => ref as PropertyReflectLike)
            .filter(ref => ref.filterByKind(filter))
            .filter(ref => ref.filterByBelongs(this, filter))
        ;
    }
    valueByProperty(identifier: FuncLike | string, property: string, filter?: DecoFilter): V {
        const ref = $ly.reflect.getClass(identifier as FuncLike).getAnyProperty(property, filter);
        return ref?.getValue(this, filter) as V;
    }
    valuesByProperty(identifier: FuncLike | string, property: string, filter?: DecoFilter): Array<V> {
        const ref = $ly.reflect.getClass(identifier as FuncLike).getAnyProperty(property, filter);
        return ref?.listValues(this, filter) as Array<V> ?? [];
    }
    // endregion property
    // region parameter
    assignedParameters(filter?: DecoFilter): Array<ParameterReflectLike> {
        return this._assignedList
            .filter(ref => ref.filterByTargetType('parameter'))
            .map(ref => ref as ParameterReflectLike)
            .filter(ref => ref.filterByBelongs(this, filter))
        ;
    }
    valueByParameter(identifier: FuncLike | string, property: string, index: number, filter?: DecoFilter): V {
        filter = filter ?? {};
        filter.kind = 'method';
        const mRef = $ly.reflect.getClass(identifier as FuncLike).getAnyProperty(property, filter);
        if (!mRef || !mRef.hasParameter(index, filter)) {
            return undefined;
        }
        return mRef.getParameter(index, filter).getValue(this) as V;
    }
    valuesByParameter(identifier: FuncLike | string, property: string, index: number, filter?: DecoFilter): Array<V> {
        filter = filter ?? {};
        filter.kind = 'method';
        const mRef = $ly.reflect.getClass(identifier as FuncLike).getAnyProperty(property, filter);
        if (!mRef || !mRef.hasParameter(index, filter)) {
            return [];
        }
        return mRef.getParameter(index, filter).listValues(this) as Array<V>;
    }
    // endregion parameter

    // region events
    onAssigned(cb: DecoOnAssignedCb): void {
        $ly.primitive.check(this, 'cb', cb, $ly.primitive.funcFilled, {deco: this.name, method: 'onAssigned'});
        if (!this._onAssignedList) {
            this._onAssignedList = [];
        }
        this._onAssignedList.push(cb);
    }
    clearOnAssigned(): number {
        const deleted = this._onAssignedList?.length ?? 0;
        if (typeof this._onAssignedList !== undefined) {
            delete this._onAssignedList;
        }
        return deleted;
    }
    onChanged(cb: DecoOnChangedCb): void {
        $ly.primitive.check(this, 'cb', cb, $ly.primitive.funcFilled, {deco: this.name, method: 'onChanged'});
        if (!this._onChangedList) {
            this._onChangedList = [];
        }
        this._onChangedList.push(cb);
    }
    clearOnChanged(): number {
        const deleted = this._onChangedList?.length ?? 0;
        if (typeof this._onChangedList !== undefined) {
            delete this._onChangedList;
        }
        return deleted;
    }
    // endregion events
}
