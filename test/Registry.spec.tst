import { strict as assert } from 'assert';
import {Registry} from "../src/Registry";

// noinspection JSUnusedLocalSymbols
const _getPair = async (id, opt = null, req = null) => {
    return {id, name: `Name-${id}`};
}
const _registry = Registry.ins();

describe('registry', function() {
    it('Class should not be empty', function() {
        // noinspection JSCheckFunctionSignatures
        assert.throws(() => _registry.addPairFinder(null, _getPair));
    });
    it('Function should be valid', function() {
        // noinspection JSCheckFunctionSignatures
        assert.throws(() => _registry.addPairFinder('Game', null));
    });
    it('Add should be success', function() {
        // noinspection JSCheckFunctionSignatures
        assert.doesNotThrow(() => _registry.addPairFinder('Game', _getPair));
    });
    it('Validate', function() {
        // noinspection JSCheckFunctionSignatures
        assert.strictEqual(_registry.hasPairFinder('Game'), true);
    });
    it('Prevent duplication', function() {
        // noinspection JSCheckFunctionSignatures
        assert.throws(() => _registry.addPairFinder('Game', _getPair));
    });
    it(`Validate result`, function (done) {
        _getPair(5).then(function (response) {
                if (response.id === 5) {
                    done();
                } else {
                    done(new Error('Result is different: ' + JSON.stringify(response)));
                }
            })
            .catch(function (err) {
                done(err);
            });
    });
});