import {LEYYO_KEY, LEYYO_NAME} from "./index-constants";

export const SHORT_NAME = 'cre';
export const BASE_NAME = 'core';
export const COMPONENT_NAME = `@${LEYYO_NAME}/${BASE_NAME}`;
export const FQN_NAME = [LEYYO_NAME, BASE_NAME];
export const LEYYO_EXCEPTION = Symbol.for(`${LEYYO_KEY}${SHORT_NAME}/e`);
export const LEYYO_OMIT = Symbol.for(`${LEYYO_KEY}${SHORT_NAME}/o`);
