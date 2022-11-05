import {Exception} from "../error";
import {OneOrMore, RecLike} from "../common";


export class ValidationException extends Exception {
    constructor(message: string, field: string, params: RecLike) {
        if (field) {
            params = params ?? {};
            params['_field'] = field;
        }
        super(message, params);
    }
}

export class NotANumberException extends ValidationException {
    constructor(value: unknown) {
        super(`Value is not a number`, undefined, {value});
    }
}

export class InvalidBooleanException extends ValidationException {
    constructor(value: unknown) {
        super(`Value has not valid boolean value`, undefined, {value});
    }
}

export class InfiniteNumberException extends ValidationException {
    constructor(value: unknown) {
        super(`Value is not finite number`, undefined, {value});
    }
}

export class InvalidObjectKeyException extends ValidationException {
    constructor(field: string, key: unknown) {
        super(`${field ?? 'value'} has not invalid key`, field, {key});
    }
}

export class InvalidEnumValueException extends ValidationException {
    constructor(field: string, name: string, value: unknown, input: string) {
        super(`${field ?? 'value'} has not enum value`, field, {name, value, input});
    }
}
export class InvalidEnumMapException extends ValidationException {
    constructor(field: string, map: unknown, typeOf: string) {
        super(`${field ?? 'value'} has not enum map`, field, {typeOf, map});
    }
}

export class InvalidValueTypeException extends ValidationException {
    constructor(value: unknown, expected: OneOrMore<string>, params: RecLike) {
        super(`Value has not valid type`, undefined, {...params, value, expected});
    }
}
export class EmptyValueTypeException extends ValidationException {
    constructor(field: string, typeOf: string) {
        super(`${field ?? 'value'} is empty`, field, {typeOf});
    }
}

export class InvalidLiteralKeysException extends ValidationException {
    constructor(field: string, params: RecLike) {
        super(`There is no valid keys for ${field ?? 'value'}`, field, params);
    }
}