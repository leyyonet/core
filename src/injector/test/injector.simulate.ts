import {leyyo} from "../../index";
import {injector1AutowiredSimulate} from "./injector-1-autowired.simulate";


export function injectorSimulate() {
    leyyo.testing.describe('Generics', () => {
        injector1AutowiredSimulate(leyyo.testing.describe, leyyo.testing.it);
    });
}
