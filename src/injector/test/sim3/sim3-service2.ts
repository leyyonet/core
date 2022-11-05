import {Autowired, Component, Fqn, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim3Service3} from "./sim3-service3";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim3Service2 {

    constructor(private service3: Sim3Service3) {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim3Service2.name}`);
    }

    // service3: Sim2Service3;

    @Autowired()
    setService3(service3: Sim3Service3) {
        this.service3 = service3;
    }
    get s3(): unknown {
        return leyyo.fqn.get(this.service3);
    }
}