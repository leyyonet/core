import {Autowired, Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim1Service2} from "./sim1-service2";
import {Sim1Service3} from "./sim1-service3";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim1Service1 {

    constructor(private service2: Sim1Service2) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim1Service1.name}`);
    }
    @Autowired()
    service3: Sim1Service3;

    get s2(): unknown {
        return leyyo.fqn.get(this.service2);
    }
    get s3(): unknown {
        return leyyo.fqn.get(this.service3);
    }
}