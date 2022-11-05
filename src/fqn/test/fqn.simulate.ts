import {leyyo} from "../../index";
import {testFqn1Class} from "./fqn-1-class.simulate";
import {testFqn2Decorator} from "./fqn-2-decorator.simulate";
import {testFqn3Enum} from "./fqn-3-enum.simulate";
import {testFqn4Function} from "./fqn-4-function.simulate";
import {testFqn5Module} from "./fqn-5-module.simulate";
import {testFqn6Namespace} from "./fqn-6-namespace.simulate";
import {testFqn7File} from "./fqn-7-file.simulate";

export function fqnSimulate() {
    leyyo.testing.describe('fqnSimulate', () => {
        testFqn1Class(leyyo.testing.describe, leyyo.testing.it);
        testFqn2Decorator(leyyo.testing.describe, leyyo.testing.it);
        testFqn3Enum(leyyo.testing.describe, leyyo.testing.it);
        testFqn4Function(leyyo.testing.describe, leyyo.testing.it);
        testFqn5Module(leyyo.testing.describe, leyyo.testing.it);
        testFqn6Namespace(leyyo.testing.describe, leyyo.testing.it);
        testFqn7File(leyyo.testing.describe, leyyo.testing.it);
    });
}
