import {CoreError} from "./core-error";
import {DeveloperException, Exception, MultipleException, NotImplementedException} from "./errors";
import {ErrorAssign} from "./error-assign";

export const $mdl_error = [CoreError, Exception, DeveloperException, MultipleException, NotImplementedException,
    ErrorAssign];