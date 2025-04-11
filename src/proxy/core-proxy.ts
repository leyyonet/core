import {ClassLike, Dict, Func} from "@leyyo/common";
import {CoreProxyLike} from "./index-types";
import {core} from "../core";
import {ProxySign} from "./internal";

export class CoreProxy implements CoreProxyLike {

    constructor() {
    }

    copyBasic(source: any, target: any): void {
        if (source?.name) {
            this.basicName(target, source.name);
        }
    }
    basicName(target: Func | ClassLike, name: string): void {
        core.footprint.saveDescriptor(target, 'name', name);
    }

    copyFootprint(source: any, target: any, basicName?: boolean): void {
        const inspected = core.footprint.inspect(source);
        if (!inspected.keywords.includes('proxied')) {
            inspected.keywords.push('proxied');
            core.footprint.$secure.$save(source, inspected);
        }
        core.footprint.inspect(target);
        this.copyFqn(source, target, basicName);
    }

    copyFqn(source: any, target: any, basicName?: boolean): void {
        if (core.fqn.exists(source)) {
            core.fqn.$secure.$set(target, core.fqn.get(source));
        }
        if (basicName) {
            this.copyBasic(source, target);
        }
    }

    get<S, T = S>(source: S, type: string): T {
        const sourceDesc = this.getAll(source);
        return sourceDesc[type] ?? null;
    }
    has<S>(source: S, type: string): boolean {
        const sourceDesc = this.getAll(source);
        return !!sourceDesc[type];
    }
    getAll<S>(source: S): Dict {
        const sourceDesc = core.footprint.getSign(source, ProxySign)?.value as Dict;
        return sourceDesc ? sourceDesc : {};
    }
    set<S, T = S>(source: S, target: T, type: string): boolean {
        const sourceDesc = this.getAll(source);
        const exists = !!sourceDesc[type];
        sourceDesc[type] = target;
        core.footprint.saveSign(source, ProxySign, sourceDesc);
        return exists;
    }
}