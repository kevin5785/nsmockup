'use strict';

var fs = require('fs'),
    should = require('should'),
    nsmockup = require('../../');

var base = __dirname + '/../_input-files/record-data';
/**
 * Test Suites
 */
describe('<Unit Test - Netsuite Search API>', function () {
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
        nsmockup.init({records, metadata}, (err) => {
            if (err) return done(err);
            else {
                let xmlPath = __dirname + '/../_input-files/files/help.xml',
                    xmlIn = fs.readFileSync(xmlPath, 'utf8'),
                    xml = nlapiCreateFile('help-tempalte.xml', 'PLAINTEXT', xmlIn);
                xml.setEncoding('utf8');
                nlapiSubmitFile(xml);
                return done();
            }
        });
    });
    describe('SuiteScript API - nlapiSearchGlobal:', () => {
        it('global search record', done => {
            let records = nlapiSearchGlobal('japo 242');
            should(records).be.length(1);
            let record = records[0];
            should(record).have.instanceOf(nlobjSearchResult);
            should(record.getId()).be.equal(242);
            return done();
        });

        it('global search file', done => {
            let records = nlapiSearchGlobal('help-tempalte.xml');
            should(records).be.length(1);
            let record = records[0];
            should(record).have.instanceOf(nlobjSearchResult);
            should(record.getId()).be.equal(1);
            return done();
        });
    });
    after(done => {
        nsmockup.destroy(done);
    });
});
