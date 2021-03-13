import { spawn } from 'child_process';
import { chmod, mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { createInterface } from 'readline';
export const parseHosts = (input) => {
    const regex = /(?<=(\n|^))([\w.:]*)\s*([\w- ]*)/g;
    const matches = [...input.matchAll(regex)];
    return matches.map(([, , ip, hostname]) => [ip, hostname]);
};
export const createLock = () => {
    const lock = {};
    lock.p = new Promise((res, rej) => {
        lock.res = res;
        lock.rej = rej;
    });
    return lock;
};
export const useReadLine = (stdin, stdout) => {
    const rl = createInterface({ input: stdin, output: stdout });
    const asyncReadLine = async (question) => {
        const questionLock = createLock();
        rl.question(question, questionLock.res);
        return questionLock.p;
    };
    return asyncReadLine;
};
export const asyncProcess = (command, opts) => {
    const procLock = createLock();
    const subProc = spawn(command, opts);
    const { outputNeedsToEqual, ignoreErrors } = opts;
    if (outputNeedsToEqual) {
        subProc.stdout.on('data', data => {
            const strData = data.toString();
            console.log(strData);
            if (strData.includes(outputNeedsToEqual))
                procLock.res();
        });
    }
    else {
        subProc.on('exit', procLock.res);
        subProc.stdout.on('data', data => console.log(data.toString()));
    }
    subProc.stderr.on('data', (e) => {
        const strErr = e.toString();
        console.error(strErr);
        if (ignoreErrors)
            return;
        const nonErrors = [
            'Debugger attached.\n',
            'Waiting for the debugger to disconnect...\n',
            'DeprecationWarning:',
            'Cloning',
            'warning',
        ];
        for (const nonError of nonErrors) {
            if (strErr.includes(nonError))
                return;
        }
        procLock.rej(strErr);
    });
    return [procLock.p, subProc];
};
export const createKeyFileString = (input) => {
    let result = '';
    const inputKeys = Object.keys(input);
    for (const key of inputKeys) {
        result += `export const ${key} = '${input[key]}';\n`;
    }
    return result;
};
export const setupSSLKey = async (input, keyFileLocation, keyFileName) => {
    input = input.trim();
    const type = input.startsWith('-----BEGIN CERTIFICATE-----') &&
        input.endsWith('-----END CERTIFICATE-----')
        ? 'fullchain'
        : input.startsWith('-----BEGIN PRIVATE KEY-----') &&
            input.endsWith('-----END PRIVATE KEY-----')
            ? 'privkey'
            : 'bad input';
    if (type === 'bad input')
        throw 'Bad input, not writing key. If you need ssl, please put the keys under server/cert/privkey.pem and server/cert/fullchain.pem.\n Do not forget that the folder needs to have be chmoded to 700, the privkey needs to be chmoded to 600 and the fullchain needs to be chmoded to 644 for the server to work. ';
    keyFileLocation === undefined
        ? (keyFileLocation = join(__dirname, '../server/cert/'))
        : keyFileLocation;
    keyFileName === undefined
        ? (keyFileName = type === 'fullchain' ? 'fullchain.pem' : 'privkey.pem')
        : keyFileName;
    const keyFilePath = join(keyFileLocation, keyFileName);
    const keyFilePermission = type === 'fullchain' ? 644 : 600;
    const keyFileLocationPermission = 700;
    console.log(`Writing ${keyFileName} ...`);
    await mkdir(keyFileLocation);
    await writeFile(keyFilePath, input);
    console.log(`Wrote ${keyFileName}, updating permissions of ${keyFileName}`);
    await chmod(keyFileLocation, keyFileLocationPermission);
    console.log(`Set the permissions for the cert folder to ${keyFileLocationPermission}`);
    await chmod(keyFilePath, keyFilePermission);
    console.log(`Set the permissions for the (${keyFileName}) ssl key to ${keyFilePermission}`);
};
export const yesNoQuestion = async (question, asyncReadLine, { validateFn, ignoreDefaultValidation, truthyValidators, falsyValidators } = {}) => {
    let proceed = false, userAgreed = false, userInput;
    do {
        userInput = (await asyncReadLine(question)).trim();
        if (!ignoreDefaultValidation)
            switch (userInput) {
                case 'y':
                case 'ye':
                case 'yes':
                case 'Y':
                case 'Ye':
                case 'Yes':
                    proceed = true;
                    userAgreed = true;
                    break;
                case 'n':
                case 'no':
                case 'N':
                case 'No':
                    proceed = true;
                    break;
                default:
                    break;
            }
        if (falsyValidators)
            for (const validator of falsyValidators) {
                if (userInput !== validator.trim())
                    break;
                proceed = true;
            }
        if (truthyValidators)
            for (const validator of truthyValidators) {
                if (userInput !== validator.trim())
                    break;
                proceed = true;
                userAgreed = true;
            }
        if (validateFn) {
            [proceed, userAgreed] = validateFn(userInput);
        }
    } while (!proceed);
    return [userAgreed, userInput];
};
export const escapeRegex = (input) => input.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0VXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzY3JpcHRVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUE0QixNQUFNLGVBQWUsQ0FBQztBQUNoRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDdEQsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM1QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTNDLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxDQUFDLEtBQWEsRUFBb0MsRUFBRTtJQUM3RSxNQUFNLEtBQUssR0FBRyxtQ0FBbUMsQ0FBQztJQUNsRCxNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBRTNDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxBQUFELEVBQUcsRUFBRSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQzVELENBQUMsQ0FBQztBQVVGLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxHQUd4QixFQUFFO0lBQ0gsTUFBTSxJQUFJLEdBQW1DLEVBQUUsQ0FBQztJQUNoRCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBTyxDQUFtQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUNuRCxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQXFDLENBQUM7UUFDakQsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFvQyxDQUFDO0lBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ0gsT0FBTyxJQUE2QixDQUFDO0FBQ3RDLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUMxQixL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