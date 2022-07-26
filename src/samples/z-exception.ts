import {HttpException} from "../index-errors";

class NotFoundException extends HttpException {
    constructor(entity: string, value: string|number, key?: string) {
        key = key ?? 'id'
        super(`Record[${entity}] could not be found with ${key}: ${value}`, 404, {entity, key, value});
    }
}
const err = new NotFoundException("User", 344).causedBy(new Error('none none')).with('Yelmer').log();
if (err.stack) {
    delete err.stack;
}
console.log(err);