import {leyyo} from "../../index";
import {dto2ExtendedSimulate} from "./dto-2-extended.simulate";


export function dtoSimulate() {
    leyyo.testing.describe('Dto', () => {
        dto2ExtendedSimulate(leyyo.testing.describe, leyyo.testing.it);
    });
}
