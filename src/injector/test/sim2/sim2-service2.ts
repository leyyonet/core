import {Autowired, Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim2Service3} from "./sim2-service3";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim2Service2 {

    constructor(private service3: Sim2Service3) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim2Service2.name}`);
    }

    // service3: Sim2Service3;

    @Autowired()
    setService3(service3: Sim2Service3) {
        this.service3 = service3;
    }
    get s3(): unknown {
        return leyyo.fqn.get(this.service3);
    }
}