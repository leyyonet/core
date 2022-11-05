import assert from "assert";
import {FuncLike, leyyo} from "../../index";
import {gen1text, gen1TextFormatted, gen1Tree} from "./generics-1-parser.inner";

export const generics1ParserSimulate = (describe: FuncLike, it: FuncLike) => {
    describe('generics1ParserSimulate', () => {
        it('text to tree', () => {
            assert.deepEqual(gen1Tree, leyyo.generics.parse(gen1text));
        })
        it('tree to text', () => {
            assert.deepEqual(gen1TextFormatted, leyyo.generics.stringify(gen1Tree));
        })
    });
}