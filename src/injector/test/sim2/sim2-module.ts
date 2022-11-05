import {Fqn, LY_TESTING_FQN, Module} from "../../../index";
import {Sim2Controller} from "./sim2-controller";
import {Sim2Service1} from "./sim2-service1";
import {Sim2Service2} from "./sim2-service2";
import {Sim2Service3} from "./sim2-service3";
import {Sim3Module} from "../sim3/sim3-module";

@Module(Sim2Controller, Sim2Service1, Sim2Service2, Sim2Service3, Sim3Module)
@Fqn(...LY_TESTING_FQN)
export class Sim2Module {
    constructor() {
        console.log(`${Sim2Module.name} is constructor`)
    }
}