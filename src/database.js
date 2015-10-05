'use strict';
var srvconf = require('./server/server-config'),
    URI = srvconf.URI,
    fs = require('fs');

// Default nsmockup directory
const NS_DIR = '.nsmockup';

exports.load = (cb) => {
    let nsDir = NS_DIR,
        //baseDir = nsDir + '/temp-' + (new Date().toJSON().replace(/[-:Z]/g, '')),
        baseDir = nsDir + '/base',
        cabinetDir = baseDir + '/cabinet',
        dbDir = baseDir + '/db';

    // create directories
    [nsDir, baseDir, cabinetDir, dbDir].forEach(f => {
        !fs.existsSync(f) && fs.mkdirSync(f);
    });

    let dbFile = dbDir + '/db.json';

    // create JSON database
    !fs.existsSync(dbFile) && fs.writeFileSync(dbFile, '{}');

    let low = require('lowdb'),
        db = low(dbFile);

    let change = false;
    // create default collections
    ['__metadata', '__scripts'].forEach(c => {
        if (!db.object[c]) {
            db.object[c] = [];
            !change && (change = true);
        }
    });
    change && db.save();

    db.$path = baseDir;
    db.$pathDB = dbDir;
    db.$pathCabinet = cabinetDir;

    cb(global.$db = db);
};

/**
 *
 * @param data {{
 *    id: Number,
 *    type: String
 * }}
 */
exports.createScript = (data) => {
    let db = global.$db;

    if (!data || !data.type) {
        throw new Error('Not found type of SuiteScript');
    }
    if (!~['suitelet', 'restlet', 'schedule', 'user-event'].indexOf(data.type.toLowerCase())) {
        throw  new Error(`Invalid type of SuiteScript: ${data.type}`);
    } else {
        data.type = data.type.toLocaleLowerCase();
    }

    let scripts = db('__scripts');
    if (!data.id) data.id = (scripts.size() + 1);

    data.uri = URI[data.type];
    if (data.uri) {
        data.url = `http://localhost:${srvconf.port}${data.uri}?id=${data.id}`;
    }

    scripts.push(data);
};