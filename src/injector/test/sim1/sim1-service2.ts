import {Autowired, Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim1Service3} from "./sim1-service3";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim1Service2 {

    constructor(private service3: Sim1Service3) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim1Service2.name}`);
    }

    // service3: Sim1Service3;

    @Autowired()
    setService3(service3: Sim1Service3) {
        this.service3 = service3;
    }
    get s3(): unknown {
        return leyyo.fqn.get(this.service3);
    }
}