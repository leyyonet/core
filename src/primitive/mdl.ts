import {CorePrimitive} from "./core-primitive";
import {
    InfiniteNumberException,
    InvalidBooleanException,
    InvalidEnumMapException,
    InvalidEnumValueException,
    InvalidLiteralKeysException,
    InvalidObjectKeyException,
    InvalidValueTypeException,
    NotANumberException,
    ValidationException
} from "./errors";

export const $mdl_primitive = [CorePrimitive, ValidationException, NotANumberException, InvalidBooleanException,
    InfiniteNumberException, InvalidObjectKeyException, InvalidEnumValueException, InvalidEnumMapException,
    InvalidValueTypeException, InvalidLiteralKeysException];