'use strict';

var should = require('should'),
    nsmockup = require('../../');

var base = __dirname + '/../_input-files/record-data';
/**
 * Test Suites
 */
describe('<Unit Test - Netsuite Record API>', function () {
    this.timeout(5000);

    before(done => {
        let metadata = [
                base + '/meta/customrecord_codeg.json',
                base + '/meta/customrecord_codeg_ids.json'
            ],
            records = {
                'customrecord_codeg': base + '/data/customrecord_codeg.json',
                'customrecord_codeg_ids': base + '/data/customrecord_codeg_ids.json'
            };
        nsmockup.init({records, metadata}, done);
    });
    describe('SuiteScript API - nlapiDeleteRecord:', () => {
        let recType = 'customrecord_codeg';

        it('delete by id', done => {
            var filters = [
                ['custrecord_type_id', null, 'anyof', 241]
            ];

            let codes = nlapiSearchRecord(recType, null, filters);
            should(codes).have.length(14);
            for (let i = 0; i < codes.length; i++) {
                let code = codes[i];
                should(code).have.instanceOf(nlobjSearchResult);
                should(code).have.property('id');
                should(code).have.property('type', recType);

                let cols = code.getAllColumns();
                should(cols).have.length(1);
                for (let j = 0; j < cols.length; j++) {
                    let col = cols[j];
                    should(col).have.instanceOf(nlobjSearchColumn);
                    should(col).have.property('name').have.equalOneOf(['custrecord_type_id']);
                }

                nlapiDeleteRecord(recType, code.id);

                let emptyCode = nlapiSearchRecord(recType, code.id);
                should(emptyCode).not.be.ok();
            }

            return done();
        });

        it('delete missing record type', done => {
            try {
                nlapiDeleteRecord();
                return done('missing record type');
            } catch (e) {
                should(e).have.property('code', 'SSS_TYPE_ARG_REQD');
                return done();
            }
        });

        it('delete missing id', done => {
            try {
                nlapiDeleteRecord(recType);
                return done('missing id');
            } catch (e) {
                should(e).have.property('code', 'SSS_ID_ARG_REQD');
                return done();
            }
        });

        it('delete invalid record type', done => {
            try {
                let invalidRecType = recType + 'japois';
                nlapiDeleteRecord(invalidRecType, 1);
                return done('invalid record type: ' + invalidRecType);
            } catch (e) {
                should(e).have.property('code', 'SSS_INVALID_RECORD_TYPE');
                return done();
            }
        });
    });
    after(done => {
        nsmockup.destroy(done);
    });
});
