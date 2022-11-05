import {leyyo} from "../../index";
import {cast3AliasSimulate} from "./cast-3-alias.simulate";


export function castSimulate() {
    leyyo.testing.describe('Cast', () => {
        // cast1StringSimulate(leyyo.testing.describe, leyyo.testing.it);
        // cast2DecoratorSimulate(leyyo.testing.describe, leyyo.testing.it);
        cast3AliasSimulate(leyyo.testing.describe, leyyo.testing.it)
    });
}
