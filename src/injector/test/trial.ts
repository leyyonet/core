import {FuncLike, leyyo} from "../../index";
import {Sim1Module} from "./sim1/sim1-module";
import {Sim1Controller} from "./sim1/sim1-controller";
import {Sim1Service1} from "./sim1/sim1-service1";
import {Sim1Service2} from "./sim1/sim1-service2";
import {Sim1Service3} from "./sim1/sim1-service3";
import {Sim2Controller} from "./sim2/sim2-controller";
import {Sim2Service1} from "./sim2/sim2-service1";
import {Sim2Service2} from "./sim2/sim2-service2";
import {Sim2Service3} from "./sim2/sim2-service3";
import {Sim3Controller} from "./sim3/sim3-controller";
import {Sim3Service1} from "./sim3/sim3-service1";
import {Sim3Service2} from "./sim3/sim3-service2";
import {Sim3Service3} from "./sim3/sim3-service3";
import {Sim3Module} from "./sim3/sim3-module";
import {Sim2Module} from "./sim2/sim2-module";

function _print(clazz: FuncLike, method?: string): void {
    const ins = leyyo.injector.get(clazz);
    if (method) {
        const val = ins ? ins[method] : undefined;
        console.log(`>> ${clazz.name} > ${method}`, val ? leyyo.fqn.get(val) : undefined);
    } else {
        console.log(`## ${clazz.name}`, ins ? leyyo.fqn.get(ins) : undefined);

    }

}
export function trialInjector() {

    console.log(Sim1Module.name);
    leyyo.processor.$runAsync('injecting').then(() => {
        console.log('create');
        _print(Sim2Module);
        _print(Sim1Controller, 's1');
        _print(Sim1Controller, 's2');
        _print(Sim1Service1, 's2');
        _print(Sim1Service1, 's3');
        _print(Sim1Service2, 's3');
        _print(Sim1Service3, 's1');

        _print(Sim2Module);
        _print(Sim2Controller, 's1');
        _print(Sim2Controller, 's2');
        _print(Sim2Service1, 's2');
        _print(Sim2Service1, 's3');
        _print(Sim2Service2, 's3');
        _print(Sim2Service3, 's1');

        _print(Sim3Module);
        _print(Sim3Controller, 's1');
        _print(Sim3Controller, 's2');
        _print(Sim3Service1, 's2');
        _print(Sim3Service1, 's3');
        _print(Sim3Service2, 's3');
        _print(Sim3Service3, 's1');
        
    }).catch(e => {
        console.log('failed', e);
    })

}
