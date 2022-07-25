export const LEYYO_NAME = 'leyyo';
export const LEYYO_KEY = '#lyy/';
// region field
export const F_HOLDER = '$holder';
export const F_INDICATOR = '$indicator';
export const F_FIELD = '$field';
export const F_REQ = '$req';
export const F_SEVERITY = '$severity';
// endregion field

// region system
export const S_FUNCTIONS = ['constructor', '__defineGetter__', '__defineSetter__', 'hasOwnProperty',
    '__lookupGetter__', '__lookupSetter__', 'isPrototypeOf', 'propertyIsEnumerable',
    'toString', 'valueOf', '__proto__', 'toLocaleString', 'toJSON', '__esModule'];

export const S_CLASSES = [
    'Function', 'Object', 'Boolean', 'Symbol',
    'Error', 'AggregateError', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
    `Number`, `BigInt`, `Math`, `Date`,
    'String', 'RegExp',
    'Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
    'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array', 'BigUint64Array',
    'Map', 'Set', 'WeakMap', 'WeakSet',

    'ArrayBuffer', 'SharedArrayBuffer', 'Atomics', 'DataView', 'JSON',

    'Promise', 'Generator', 'GeneratorFunction', 'AsyncFunction', 'AsyncGenerator', 'AsyncGeneratorFunction',
    'Reflect', 'Proxy',

    'Intl', 'Intl.Collator', 'Intl.DateTimeFormat', 'Intl.ListFormat', 'Intl.NumberFormat',
    'Intl.PluralRules', 'Intl.RelativeTimeFormat', 'Intl.Locale',

    'WebAssembly', 'WebAssembly.Module', 'WebAssembly.Instance', 'WebAssembly.Memory', 'WebAssembly.Table',
    'WebAssembly.CompileError', 'WebAssembly.LinkError', 'WebAssembly.RuntimeError'
];
// endregion system

// region events
export const E_LOGGER_ADD = 'logger_add';
// endregion events

// region hooks
/**
 * Extracts request data (param, query, body, header, file, context)
 * */
export const H_REQUEST_EXTRACTOR = 'request_extractor';
/**
 * Extracts context data
 * */
export const H_CONTEXT_EXTRACTOR = 'context_extractor';
/**
 * Extracts which request/context data should be logged
 * */
export const H_LOGGER_GRABBER = 'logger_grabber';
/**
 * Sends data which should be logged
 * */
export const H_LOGGER_SENDER = 'logger_sender';
/**
 * Prints data which should be logged [!logger_sender]
 * */
export const H_LOGGER_PRINTER = 'logger_printer';

export const H_ERROR_SENDER = 'error_sender';
export const H_ERROR_DICTIONARY = 'error_dictionary';
export const H_ERROR_TO_OBJECT = 'error_to_object';
export const H_ERROR_EXPORT = 'error_export';
export const H_ERROR_ACTION = 'error_action';
// endregion hooks
