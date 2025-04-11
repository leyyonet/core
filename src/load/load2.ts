import {is} from "@leyyo/common";
import {core, CoreResourceItems} from "../core";
import {decoratorResources} from "../decorator/resources";
import {footprintResources} from "../footprint/resources";
import {fqnResources} from "../fqn/resources";
import {injectionResources} from "../injection/resources";
import {reflectionResources} from "../reflection/resources";
import {rulerResources} from "../ruler/resources";
import {callbackResources} from "../callback/resources";
import {proxyResources} from "../proxy/resources";
import {enumResources} from "../enum/resources";
import {bindResources} from "../bind/resources";

// console.log(__filename);

const resources = (resourceItems: CoreResourceItems) => {
    const fqn = core.fqn;
    const path = resourceItems.path;
    if (is.array(resourceItems.classes)) {
        resourceItems.classes.forEach(c => fqn.clazz(c, path));
    }
    if (is.array(resourceItems.functions)) {
        resourceItems.functions.forEach(f => fqn.func(f, path));
    }
    if (is.array(resourceItems.enums)) {
        resourceItems.enums.forEach(e => fqn.enumeration(e[0], e[1], path));
    }
    if (is.array(resourceItems.literals)) {
        resourceItems.literals.forEach(l => fqn.literal(l[0], l[1], path));
    }
}

resources(decoratorResources);
resources(footprintResources);
resources(fqnResources);
resources(injectionResources);
resources(reflectionResources);
resources(rulerResources);
resources(callbackResources);
resources(enumResources);
resources(proxyResources);
resources(bindResources);

export const load2 = 2;