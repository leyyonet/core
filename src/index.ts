// noinspection JSUnusedGlobalSymbols

import {$$coreInternalResult} from "./internal/loader";
import {core} from "./core";

export const coreInternalResult = $$coreInternalResult;
export const decoratorPool = core.decoratorPool;
export const footprint = core.footprint;
export const fqnHandler = core.fqnHandler;
export const injectionPool = core.injectionPool;
export const reflectionPool = core.reflectionPool;
export const rulerPool = core.rulerPool;
export const namedPool = core.namedPool;
export const enumPool = core.enumPool;
export const proxyHandler = core.proxyHandler;
export const nameHandler = core.nameHandler;
export const bindHandler = core.bindHandler;
export const lifecycle = core.lifecycle;
export const $core = core;

export * from './bind';
export * from './decorator';
export * from './enum';
export * from './footprint';
export * from './fqn';
export * from './injection';
export * from './lifecycle';
export * from './named';
export * from './proxy';
export * from './name';
export * from './reflection';
export * from './ruler';
