import {leyyo} from "../core";
import {Exception} from "../index-errors";


class MyClass {
    protected LOG = leyyo.logger.assign(MyClass);
    constructor() {
        this.LOG.error(new Exception('test exception').with(this));
        this.LOG.warn('test warning', {foo: 'bar', age: 45});
        this.LOG.native(new Exception('my exception'), 'auto-generated', {packages: leyyo.component.items})
        this.LOG.error(new Exception('test exception').with(this));
    }
    f1() {
        this.LOG.log('sample log', {foo: 'bar', age: 45});
        this.LOG.info('sample info', {foo: 'bar', age: 45});
        this.LOG.trace('sample trace', {foo: 'bar', age: 45});
        this.LOG.debug('sample debug', {foo: 'bar', age: 45});
    }
}

export const sampleLogger1 = () => {
    const cl = new MyClass();
    cl.f1();
}