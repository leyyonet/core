import {Fqn, LeyyoCoreModule, LY_TESTING_FQN, Module} from "../../../index";
import {Sim1Controller} from "./sim1-controller";
import {Sim1Service1} from "./sim1-service1";
import {Sim1Service2} from "./sim1-service2";
import {Sim1Service3} from "./sim1-service3";
import {Sim2Module} from "../sim2/sim2-module";

@Module(true, LeyyoCoreModule, Sim1Controller, Sim1Service1, Sim1Service2, Sim1Service3, Sim2Module)
@Fqn(...LY_TESTING_FQN)
export class Sim1Module {
    constructor() {
        console.log(`${Sim1Module.name} is constructor`)
    }
}