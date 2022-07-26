import {strict as assert} from 'assert';
import * as dotenv from "dotenv";
// it's important, it must run before @huz-com/config
dotenv.config();
import {Config} from "../src/Config";
import {environmentEnum} from "@huz-com/types";
import {ns1} from "./temp.ns";

const config = Config.ins();

describe('config', () => {
    it('environment', () => {
        assert.strictEqual(config.environment, environmentEnum.Id.PROD);
    });
    it('project', () => {
        assert.strictEqual(config.project, process.env.PROJECT_ID);
    });
    it('code', () => {
        assert.strictEqual(config.code, process.env.PROJECT_CODE);
    });
    it('language', () => {
        assert.strictEqual(config.language, process.env.LANGUAGE);
    });
    it('application', () => {
        assert.strictEqual(config.country, process.env.COUNTRY);
    });
    it('application', () => {
        assert.strictEqual(config.application, process.env.APPLICATION);
    });
    it('timezone', () => {
        assert.strictEqual(config.timezone, process.env.TIMEZONE);
    });
    it('isLocal', () => {
        assert.strictEqual(config.isLocal, process.env.IS_LOCAL === 'true');
    });
    it('isolated', () => {
        assert.strictEqual(config.isolated, process.env.ISOLATED === 'true');
    });
    it('debug', () => {
        assert.strictEqual(config.debug, process.env.DEBUG === 'true');
    });
    it('all', () => {
        assert.doesNotThrow(() => config.all());
    });
});