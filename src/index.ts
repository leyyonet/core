import {load1, load2} from "./load";
import {is} from "@leyyo/common";
import {core} from "./core";

is.empty([load1, load2]);

export const decorator = core.decorator;
export const footprint = core.footprint;
export const fqn = core.fqn;
export const injection = core.injection;
export const reflection = core.reflection;
// noinspection JSUnusedGlobalSymbols
export const ruler = core.ruler;
export const callback = core.callback;
export const enumeration = core.enumeration;
export const proxy = core.proxy;
export const bind = core.bind;

export * from './callback';
export * from './decorator';
export * from './footprint';
export * from './fqn';
export * from './injection';
export * from './reflection';
export * from './ruler';
export * from './enum';
export * from './proxy';
export * from './bind';