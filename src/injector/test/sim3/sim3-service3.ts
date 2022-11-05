import {Component, Fqn, LazyWired, leyyo, LY_TESTING_FQN} from "../../../index";
import {Sim3Service1} from "./sim3-service1";

@Component()
@Fqn(...LY_TESTING_FQN)
export class Sim3Service3 {
    constructor() {
        console.log(`${leyyo.fqn.get(this)} created ==> ${Sim3Service3.name}`);
    }

    @LazyWired('Sim2Service1')
    service1: unknown;
    get s1(): unknown {
        return leyyo.fqn.get(this.service1);
    }
}