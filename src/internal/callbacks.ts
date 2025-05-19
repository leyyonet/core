import {InternalLevel} from "./index.types";
import {Func} from "@leyyo/common";

let completed = false;
const times = [] as Array<[string, string, number, string?]>; // package, stage, time, name
const onAfterCreated = new Map<InternalLevel, Array<Func>>();
times.push(['leyyo.core', null, Date.now(), 'started']);

export function $$coreInternalOn(level: InternalLevel, fn: Func): void {
    if (completed) {
        throw new Error('NotAllowed - leyyo.core - issue: internal.loading.completed');
    }
    if (!onAfterCreated.has(level)) {
        onAfterCreated.set(level, []);
    }
    // console.log(level + '.add:' + Function.prototype.toString.call(fn))
    onAfterCreated.get(level).push(fn);
}

export function $$coreInternalRun(level: InternalLevel): void {
    if (completed) {
        throw new Error('NotAllowed - leyyo.core - issue: internal.loading.completed');
    }
    if (onAfterCreated.has(level)) {
        onAfterCreated.get(level).forEach(fn => {
            // console.log(level + '.run:' + Function.prototype.toString.call(fn))
            fn();
        })
        onAfterCreated.delete(level);
    }
    times.push(['leyyo.core', level, Date.now(), 'finished']);
}

export function $$coreInternalComplete() {
    completed = true;
    times.push(['leyyo.core', null, Date.now(), 'finished']);
    return times;
}
