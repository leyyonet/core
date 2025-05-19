/**
 * Proxy handler
 * */
export interface ProxyHandlerLike {
    /**
     * Returns proxied, if it's not proxied then returns self
     * */
    get<S, T = S>(source: S, type: symbol, ignoreIfAbsent?: boolean): T;

    /**
     * Source is proxied or not?
     * */
    has<S>(source: S, type: symbol): boolean;

    /**
     * Returns all types of proxies
     * */
    getAll<S>(source: S, ignoreIfAbsent?: boolean): Map<symbol, any>;

    /**
     * Sets proxy, it means that source -> target
     * */
    set<S, T = S>(source: S, target: T, type: symbol): boolean;
}
