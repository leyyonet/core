import {Fqn, LY_TESTING_FQN, Module} from "../../../index";
import {Sim3Controller} from "./sim3-controller";
import {Sim3Service1} from "./sim3-service1";
import {Sim3Service2} from "./sim3-service2";
import {Sim3Service3} from "./sim3-service3";

@Module(Sim3Controller, Sim3Service1, Sim3Service2, Sim3Service3)
@Fqn(...LY_TESTING_FQN)
export class Sim3Module {
    constructor() {
        console.log(`${Sim3Module.name} is constructor`)
    }
}