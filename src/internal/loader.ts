import {Arr} from "@leyyo/common";
import {$$coreBindInternal} from "../bind/internal.loader";
import {$$coreInternal} from "../core/internal.loader";
import {$$coreDecoratorInternal} from "../decorator/internal.loader";
import {$$coreEnumInternal} from "../enum/internal.loader";
import {$$coreFootprintInternal} from "../footprint/internal.loader";
import {$$coreFqnInternal} from "../fqn/internal.loader";
import {$$coreInjectionInternal} from "../injection/internal.loader";
import {$$coreLifecycleInternal} from "../lifecycle/internal.loader";
import {$$coreNamedInternal} from "../named/internal.loader";
import {$$coreProxyInternal} from "../proxy/internal.loader";
import {$$coreReflectionInternal} from "../reflection/internal.loader";
import {$$coreRulerInternal} from "../ruler/internal.loader";
import {$$coreNameInternal} from "../name/internal.loader";
import {$$coreInternalComplete, $$coreInternalRun} from "./callbacks";

// noinspection JSUnusedGlobalSymbols
const items: Arr = [
    ...$$coreInternal,
    ...$$coreBindInternal,
    ...$$coreDecoratorInternal,
    ...$$coreEnumInternal,
    ...$$coreFootprintInternal,
    ...$$coreFqnInternal,
    ...$$coreInjectionInternal,
    ...$$coreLifecycleInternal,
    ...$$coreNamedInternal,
    ...$$coreProxyInternal,
    ...$$coreReflectionInternal,
    ...$$coreRulerInternal,
    ...$$coreNameInternal,
];
$$coreInternalRun('class-pool-1');
$$coreInternalRun('class-pool-2');
$$coreInternalRun('class-pool-3');
$$coreInternalRun('class-instance');
$$coreInternalRun('deco-id');
$$coreInternalRun('deco-clone');
$$coreInternalRun('enum-literal');
$$coreInternalRun('enum-map');
const times = $$coreInternalComplete();
export const $$coreInternalResult = {times, count: items.length};
