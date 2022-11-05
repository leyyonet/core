import {Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim1Service1} from "./sim1-service1";
import {Sim1Service2} from "./sim1-service2";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim1Controller {
    constructor(private service1: Sim1Service1, private service2: Sim1Service2) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim1Controller.name}`);
    }
    get s1(): unknown {
        return leyyo.fqn.get(this.service1);
    }
    get s2(): unknown {
        return leyyo.fqn.get(this.service2);
    }
}