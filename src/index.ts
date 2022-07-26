import dotenv from 'dotenv';
import {leyyo} from './core';

if (global?.leyyo_is_testing) {
    dotenv.config({path: __dirname + '/../test/.env'});
    ['log', 'warn', 'info', 'debug', 'trace', 'error', 'native']. forEach(name => {global.console[name] = (): void => {};});
} else {
    dotenv.config();
}
export * from './index-aliases';
export * from './index-annotations';
export * from './index-constants';
export * from './index-errors';
export * from './index-enums';
export * from './index-functions';
export * from './index-types';
export * from './instance';

const {logger, hook, system} = leyyo;
export {dotenv, leyyo, logger, hook, system};
