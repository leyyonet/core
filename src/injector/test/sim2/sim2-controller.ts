import {Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim2Service1} from "./sim2-service1";
import {Sim2Service2} from "./sim2-service2";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim2Controller {
    constructor(private service1: Sim2Service1, private service2: Sim2Service2) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim2Controller.name}`);
    }
    get s1(): unknown {
        return leyyo.fqn.get(this.service1);
    }
    get s2(): unknown {
        return leyyo.fqn.get(this.service2);
    }
}