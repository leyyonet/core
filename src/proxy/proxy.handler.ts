import {$descriptor} from "@leyyo/common";
import {ProxyHandlerLike} from "./index.types";
import {core} from "../core";
import {FQN_PCK} from "./internal";
import {$$coreInternalOn} from "../internal";
import {ProxySign} from "./index.symbols";

export class ProxyHandler implements ProxyHandlerLike {

    get<S, T = S>(source: S, type: symbol, ignoreIfAbsent?: boolean): T {
        const map = this.getAll(source, ignoreIfAbsent);
        return map ? map.get(type) : undefined;
    }

    has<S>(source: S, type: symbol): boolean {
        return this.getAll(source).has(type);
    }

    getAll<S>(source: S, ignoreIfAbsent?: boolean): Map<symbol, any> {
        let map = $descriptor.getValue<Map<symbol, any>>(source, ProxySign);
        if (!map) {
            if (ignoreIfAbsent) {
                return undefined;
            }
            map = new Map();
            $descriptor.save(source, ProxySign, map);
        }
        return map;
    }

    set<S, T = S>(source: S, target: T, type: symbol): boolean {
        const map = this.getAll(source);
        const exists = map.has(type);
        map.set(type, target);
        $descriptor.save(source, ProxySign, map);
        return exists;
    }
}

$$coreInternalOn('class-pool-1', () => {
    core.$secure.$setProxyHandler(new ProxyHandler());
});
$$coreInternalOn('class-instance', () => {
    core.fqnHandler.clazz(ProxyHandler, FQN_PCK);
});
