import {ObjectOrFunction, RecLike} from "../common";

export type RepoClassKey = ObjectOrFunction;
export type RepoSizeLambda<T = unknown> = (item: T) => number;

export interface CoreRepoLike {
    getSizes(): RecLike<RecLike<number>>;

    getSizeOfMap(): RecLike<RecLike<number>>;

    clearMap(instance: RepoClassKey, member?: string): boolean;

    newMap<K = unknown, V = unknown>(instance: RepoClassKey, member?: string): Map<K, V>;

    getSizeOfArray(): RecLike<RecLike<number>>;

    clearArray(instance: RepoClassKey, member?: string): boolean;

    newArray<V = unknown>(instance: RepoClassKey, member?: string): Array<V>;

    getSizeOfSet(): RecLike<RecLike<number>>;

    clearSet(instance: RepoClassKey, member?: string): boolean;

    newSet<V = unknown>(instance: RepoClassKey, member?: string): Set<V>;
}