import {Autowired, Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim3Service2} from "./sim3-service2";
import {Sim3Service3} from "./sim3-service3";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim3Service1 {

    constructor(private service2: Sim3Service2) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim3Service1.name}`);
    }
    @Autowired()
    service3: Sim3Service3;

    get s2(): unknown {
        return leyyo.fqn.get(this.service2);
    }
    get s3(): unknown {
        return leyyo.fqn.get(this.service3);
    }
}