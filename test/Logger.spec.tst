import { strict as assert } from 'assert';
import dotenv from 'dotenv';
dotenv.config();

import {loggerOptions} from "../src";
import {DeveloperException} from "@leyyo/core";



describe('namespace #plain', () => {
    it('setStringify - error', () => {
        assert.throws(() => {loggerOptions.setStringify('aaa' as unknown as boolean)}, DeveloperException);
    });
    it('setStringify - equals', () => {
        loggerOptions.setStringify(true);
        assert.equal(loggerOptions.stringify, true);
        loggerOptions.setStringify(false);
        assert.equal(loggerOptions.stringify, false);
    });
});