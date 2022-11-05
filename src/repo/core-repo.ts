// x_console.log(`## ${__filename}`, {i: 'loading'});

import {CoreRepoLike, RepoClassKey, RepoSizeLambda} from "./types";
import {$ly} from "../core";
import {RecLike} from "../common";


/**
 * @core
 * */
export class CoreRepo implements CoreRepoLike {
    // region properties
    protected readonly _maps: Map<RepoClassKey, Map<string, Map<unknown, unknown>>>;
    protected readonly _arrays: Map<RepoClassKey, Map<string, Array<unknown>>>;
    protected readonly _sets: Map<RepoClassKey, Map<string, Set<unknown>>>;

    // endregion properties

    constructor() {
        $ly.addFqn(this);
        this._maps = new Map<RepoClassKey, Map<string, Map<unknown, unknown>>>();
        this._arrays = new Map<RepoClassKey, Map<string, Array<unknown>>>();
        this._sets = new Map<RepoClassKey, Map<string, Set<unknown>>>();

    }

    static {
        $ly.addDependency('repo', () => new CoreRepo());
    }

    // endregion internal

    // region protected
    protected _sizeOf<T>(source: Map<RepoClassKey, Map<string, T>>, fn: RepoSizeLambda<T>): RecLike<RecLike<number>> {
        const sizes: RecLike<RecLike<number>> = {};
        for (const [instance, insMap] of source.entries()) {
            for (const [member, values] of insMap.entries()) {
                const name = $ly.fqn.get(instance);
                if (sizes[name] === undefined) {
                    sizes[name] = {};
                }
                sizes[name][member] = fn(values as T);
            }
        }
        return sizes;
    }

    protected _clear<T>(source: Map<RepoClassKey, Map<string, unknown>>, instance: RepoClassKey, member: string): boolean {
        if (source.has(instance)) {
            if (member == undefined) {
                source.delete(instance);
                return true;
            } else if (source.get(instance).has(member)) {
                source.get(instance).delete(member);
                return true;
            }
        }
        return false;
    }

    // endregion protected

    // region public
    getSizes(): RecLike<RecLike<number>> {
        return {...this.getSizeOfMap(), ...this.getSizeOfArray(), ...this.getSizeOfSet()};
    }

    getSizeOfMap(): RecLike<RecLike<number>> {
        return this._sizeOf(this._maps, (values) => values?.size ?? 0);
    }

    clearMap(instance: RepoClassKey, member?: string): boolean {
        return this._clear(this._maps, instance, member)
    }

    newMap<K = unknown, V = unknown>(instance: RepoClassKey, member?: string): Map<K, V> {
        let insMap: Map<string, Map<K, V>>;
        if (!this._maps.has(instance)) {
            insMap = new Map<string, Map<K, V>>();
            this._maps.set(instance, insMap);
        } else {
            insMap = this._maps.get(instance) as Map<string, Map<K, V>>;
        }
        if ($ly.not(member)) {
            member = '*';
        }
        if (!insMap.has(member)) {
            const values = new Map<K, V>();
            insMap.set(member, values);
            return values;
        } else {
            return insMap.get(member);
        }
    }

    getSizeOfArray(): RecLike<RecLike<number>> {
        return this._sizeOf(this._arrays, (values) => values?.length ?? 0);
    }

    newArray<V = unknown>(instance: RepoClassKey, member?: string): Array<V> {
        let insMap: Map<string, Array<V>>;
        if (!this._arrays.has(instance)) {
            insMap = new Map<string, Array<V>>();
            this._arrays.set(instance, insMap);
        } else {
            insMap = this._arrays.get(instance) as Map<string, Array<V>>;
        }
        if ($ly.not(member)) {
            member = '*';
        }
        if (!insMap.has(member)) {
            const values = [];
            insMap.set(member, values);
            return values;
        } else {
            return insMap.get(member);
        }
    }

    clearArray(instance: RepoClassKey, member?: string): boolean {
        return this._clear(this._arrays, instance, member);
    }

    getSizeOfSet(): RecLike<RecLike<number>> {
        return this._sizeOf(this._sets, (values) => values?.size ?? 0);
    }

    clearSet(instance: RepoClassKey, member?: string): boolean {
        return this._clear(this._sets, instance, member);
    }

    newSet<V = unknown>(instance: RepoClassKey, member?: string): Set<V> {
        let insMap: Map<string, Set<V>>;
        if (!this._sets.has(instance)) {
            insMap = new Map<string, Set<V>>();
            this._sets.set(instance, insMap);
        } else {
            insMap = this._sets.get(instance) as Map<string, Set<V>>;
        }
        if ($ly.not(member)) {
            member = '*';
        }
        if (!insMap.has(member)) {
            const values = new Set<V>();
            insMap.set(member, values);
            return values;
        } else {
            return insMap.get(member);
        }
    }

    // endregion public
}
