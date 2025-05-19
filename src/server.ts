import {coreInternalResult} from "./index";
import {$log} from "@leyyo/common";

const logger = $log.create('Yelmer');
logger.debug('Mustafa', {where: 'ali'});
logger.info('Şevval', {issue: 'ali veli'});
logger.error('Ömer', {issue: 'ali veli'});
logger.log('Ömer', {issue: 'ali veli'});
logger.trace('Ömer', {issue: 'ali veli'});
logger.warn('Ömer', {issue: 'ali veli'});
console.log(coreInternalResult);
