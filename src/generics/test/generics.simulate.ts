import {leyyo} from "../../index";
import {generics1ParserSimulate} from "./generics-1-parser.simulate";
import {generics2ArraySimulate} from "./generics-2-array.simulate";
import {generics3DecoratorSimulate} from "./generics-3-decorator.simulate";
import {generics4AliasSimulate} from "./generics-4-alias.simulate";


export function genericsSimulate() {
    leyyo.testing.describe('Generics', () => {
        generics1ParserSimulate(leyyo.testing.describe, leyyo.testing.it);
        generics2ArraySimulate(leyyo.testing.describe, leyyo.testing.it);
        generics3DecoratorSimulate(leyyo.testing.describe, leyyo.testing.it);
        generics4AliasSimulate(leyyo.testing.describe, leyyo.testing.it);
    });
}
