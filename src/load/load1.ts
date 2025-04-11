import {Core, core} from "../core";
import {DecoratorPool} from "../decorator";
import {RulerPool} from "../ruler";
import {Footprint} from "../footprint";
import {FqnPool} from "../fqn";
import {ReflectionPool} from "../reflection";
import {InjectionPool} from "../injection";
import {FQN_PCK} from "../core/internal";
import {CallbackPool} from "../callback";
import {EnumPool} from "../enum";
import {CoreProxy} from "../proxy";
import {CoreBind} from "../bind";

// console.log(__filename);

if (global?.leyyo_is_testing) {
    ['log', 'warn', 'info', 'debug', 'trace', 'error', 'native'].forEach(name => {
        global.console[name] = (): void => {
        };
    });
}
core.$secure
    .$setCallback(new CallbackPool())
    .$setDecorator(new DecoratorPool())
    .$setRuler(new RulerPool())
    .$setFootprint(new Footprint())
    .$setFqn(new FqnPool())
    .$setReflection(new ReflectionPool())
    .$setInjection(new InjectionPool())
    .$setEnumeration(new EnumPool())
    .$setProxy(new CoreProxy())
    .$setBind(new CoreBind())
    ;
core.fqn.clazz(Core, FQN_PCK);
export const load1 = 1;
