/* @flow */
import fs from 'fs';

const promisify = (f: Function): Function =>{
    return function() {
        const args = Array.prototype.slice.call(arguments);
        return new Promise((resolve, reject) => {
            args.push(function (err, data) {
                if (err) reject(err); else resolve(data);
            });
            f.apply(fs, args);
        });
    };
};

export default {
    readFile:  promisify(fs.readFile),
    readdir:   promisify(fs.readdir),
    stat:      promisify(fs.stat),
    writeFile: promisify(fs.writeFile)
};
