// noinspection JSUnusedGlobalSymbols

import assert from "assert";
import {FuncLike, leyyo, LY_TESTING_FQN, LY_TESTING_NS} from "../../index";
import {checkFootprint} from "./fqn-helper.simulate";

enum Fqn3Enum1 {
    KEY1 = 'key-1',
    KEY2 = 'key-2',
    KEY3 = 'key-3',
}

export const testFqn3Enum = (describe: FuncLike, it: FuncLike) => {
    describe('FQN#3 - enum', () => {
        it('Fqn3Enum1 should be marked ', () => {
            assert.doesNotThrow(() => {
                leyyo.fqn.enum('Fqn3Enum1', Fqn3Enum1, ...LY_TESTING_FQN);
            });
        });
        checkFootprint(describe, it, 'enum1', Fqn3Enum1, `${LY_TESTING_NS}.Fqn3Enum1`, 'enum', 'enum-regular');
    });
}