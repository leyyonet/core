import {Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim3Service1} from "./sim3-service1";
import {Sim3Service2} from "./sim3-service2";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim3Controller {
    constructor(private service1: Sim3Service1, private service2: Sim3Service2) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim3Controller.name}`);
    }
    get s1(): unknown {
        return leyyo.fqn.get(this.service1);
    }
    get s2(): unknown {
        return leyyo.fqn.get(this.service2);
    }
}