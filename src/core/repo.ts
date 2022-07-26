import {RecLike} from "../index-aliases";
import {DeveloperException} from "../index-errors";
import {
    CoreLike,
    CoreRepoLike,
    RepoClassKey,
    RepoCreatorLambda,
    RepoMemberMap,
    RepoValueItem,
    RepoValueType
} from "../index-types";

// noinspection JSUnusedGlobalSymbols
export class CoreRepo implements CoreRepoLike {
    // region properties
    protected _init: boolean;
    protected readonly _lyy: CoreLike;
    protected _clusters: Map<RepoClassKey, RepoMemberMap>;
    protected _creator: Record<RepoValueType, RepoCreatorLambda<any>>;
    // endregion properties
    constructor(ins: CoreLike) {
        this._lyy = ins;
        this._clusters = new Map<RepoClassKey, RepoMemberMap>();
        this._creator = {
            map: () => new Map<unknown, unknown>(),
            array: () => [],
            set: () => new Set<unknown>(),
        };
        this._lyy.ly_repoLoaded();
    }
    ly_init(): void {
        if (this._init) {return;}
        this._init = true;
    }
    protected _keysByType(type: RepoValueType): RecLike<Array<string>> {
        const keys: RecLike<Array<string>> = {};
        for (const [ins, fieldMap] of this._clusters.entries()) {
            for (const [field, item] of fieldMap.entries()) {
                if (item.type === type) {
                    const name = this._lyy.fqnPool.name(ins);
                    if (keys[name] === undefined) {
                        keys[name] = [];
                    }
                    keys[name].push(field);
                }
            }
        }
        return keys;
    }
    protected _sizes(type: RepoValueType, property: string): RecLike<RecLike<number>> {
        const sizes: RecLike<RecLike<number>> = {};
        for (const [ins, fieldMap] of this._clusters.entries()) {
            for (const [field, item] of fieldMap.entries()) {
                if (item.type === type) {
                    const name = this._lyy.fqnPool.name(ins);
                    if (sizes[name] === undefined) {
                        sizes[name] = {};
                    }
                    sizes[name][field] = item.value[property];
                }
            }
        }
        return sizes;
    }
    protected _getCluster(ins: RepoClassKey): RepoMemberMap {
        if (!ins || !['object', 'function'].includes(typeof ins)) {
            throw new DeveloperException(`repo.invalid-cluster`, {type: typeof ins});
        }
        if (!this._clusters.has(ins)) {
            this._clusters.set(ins, new Map<string, RepoValueItem<any>>());
        }
        return this._clusters.get(ins);
    }
    protected _getItem<T>(type: RepoValueType, ins: RepoClassKey, cluster: RepoMemberMap, member: string): RepoValueItem<T> {
        if (typeof member !== 'string') {
            throw new DeveloperException(`repo.invalid-member`, {type: typeof member});
        }
        if (cluster.has(member)) {
            const item = cluster.get(member) as RepoValueItem<T>;
            if (item.type !== type) {
                throw new DeveloperException(`repo.invalid-type`, {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
            }
            return item;
        }
        return null;
    }
    protected _create<T>(type: RepoValueType, ins: RepoClassKey, member: string, overwrite?: boolean): T {
        const cluster = this._getCluster(ins);
        let item = this._getItem<T>(type, ins, cluster, member);
        if (item) {
            if (item.type !== type) {
                throw new DeveloperException(`repo.invalid-type`, {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
            }
            if (!overwrite) {
                throw new DeveloperException(`repo.duplicated-member`, {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
            }
            return item.value;
        } else {
            item = {type, value: this._creator[type]() as T};
            cluster.set(member, item);
        }
        return item.value;
    }
    protected _get<T>(type: RepoValueType, ins: RepoClassKey, member: string, required?: boolean): T {
        const cluster = this._getCluster(ins);
        const item = this._getItem<T>(type, ins, cluster, member);
        if (item) {
            if (item.type !== type) {
                throw new DeveloperException(`repo.invalid-type`, {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
            }
            return item.value;
        }
        if (required) {
            throw new DeveloperException(`repo.notFound-key`, {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
        }
        return null;
    }
    protected _clear<T>(type: RepoValueType, ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean {
        const cluster = this._getCluster(ins);
        const item = this._getItem<T>(type, ins, cluster, member);
        if (item) {
            if (item.type !== type) {
                throw new DeveloperException(`repo.invalid-type`, {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
            }
            if (alsoDelete) {
                cluster.delete(member);
            } else {
                try {
                    switch (type) {
                        case "map":
                            (item.value as unknown as Map<unknown, unknown>).clear();
                            break
                        case "set":
                            (item.value as unknown as Set<unknown>).clear();
                            break;
                        case "array":
                            (item.value as unknown as Array<unknown>) = [];
                            break;
                    }
                } catch (e) {
                    this._lyy.LOG.native(e, 'repo.delete.inner', {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
                }
            }
            if (ins[member] !== undefined) {
                try {
                    switch (type) {
                        case "map":
                            (ins[member] as unknown as Map<unknown, unknown>).clear();
                            break
                        case "set":
                            (ins[member] as unknown as Set<unknown>).clear();
                            break;
                        case "array":
                            ins[member] = [];
                            break;
                    }
                } catch (e) {
                    this._lyy.LOG.native(e, 'repo.delete.outer', {type, expected: item.type, cluster: this._lyy.fqnPool.name(ins), member});
                }
            }
            return true;
        }
        return false;
    }
    whichType(ins: RepoClassKey, member: string): RepoValueType {
        const cluster = this._getCluster(ins as RepoClassKey);
        return cluster.has(member) ? cluster.get(member).type : undefined;
    }
    get sizes(): RecLike<RecLike<number>> {
        return {...this.sizeOfMap, ...this.sizeOfArray, ...this.sizeOfSet};
    }
    get keysOfMap(): RecLike<Array<string>> {
        return this._keysByType('map');
    }
    get sizeOfMap(): RecLike<RecLike<number>> {
        return this._sizes('map', 'size');
    }
    newMap<K = unknown, V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Map<K, V> {
        return this._create<Map<K, V>>('map', ins, member, overwrite);
    }
    getMap<K = unknown, V = unknown>(ins: RepoClassKey, member: string, required?: boolean): Map<K, V> {
        return this._get<Map<K, V>>('map', ins, member, required);
    }
    clearMap(ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean {
        return this._clear('map', ins, member, alsoDelete);
    }
    get keysOfArray(): RecLike<Array<string>> {
        return this._keysByType('array');
    }
    get sizeOfArray(): RecLike<RecLike<number>> {
        return this._sizes('array', 'length');
    }
    newArray<V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Array<V> {
        return this._create<Array<V>>('array', ins, member, overwrite);
    }
    getArray<V = unknown>(ins: RepoClassKey, member: string, required?: boolean): Array<V> {
        return this._get<Array<V>>('array', ins, member, required);
    }
    clearArray(ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean {
        return this._clear('array', ins, member, alsoDelete);
    }
    get keysOfSet(): RecLike<Array<string>> {
        return this._keysByType('set');
    }
    get sizeOfSet(): RecLike<RecLike<number>> {
        return this._sizes('set', 'size');
    }
    newSet<V = unknown>(ins: RepoClassKey, member: string, overwrite?: boolean): Set<V> {
        return this._create<Set<V>>('set', ins, member, overwrite);
    }
    getSet<V = unknown>(ins: RepoClassKey, member: string, required?: boolean): Set<V> {
        return this._get<Set<V>>('set', ins, member, required);
    }
    clearSet(ins: RepoClassKey, member: string, alsoDelete?: boolean): boolean {
        return this._clear('set', ins, member, alsoDelete);
    }
}