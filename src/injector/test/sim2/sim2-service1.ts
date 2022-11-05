import {Autowired, Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim2Service2} from "./sim2-service2";
import {Sim2Service3} from "./sim2-service3";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim2Service1 {

    constructor(private service2: Sim2Service2) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim2Service1.name}`);
    }
    @Autowired()
    service3: Sim2Service3;

    get s2(): unknown {
        return leyyo.fqn.get(this.service2);
    }
    get s3(): unknown {
        return leyyo.fqn.get(this.service3);
    }
}