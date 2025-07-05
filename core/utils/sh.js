import { exec } from 'child_process';
import { promisify } from 'util';

export const sh = promisify(exec);

/*
export const sh = (...params) => new Promise((resolve) => {
    console.log(params)
    resolve({
        stdout: ''
    })
});
*/