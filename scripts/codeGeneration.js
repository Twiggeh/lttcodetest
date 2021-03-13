import { dirname, relative } from 'path';
import { stat, readFile } from 'fs/promises';
import { escapeRegex } from '../utils/scriptUtils.js';
const signifierKeyedGenBlocks = (selectedGenBlocks) => {
    const result = {
        extension: {},
        injection: {},
    };
    const types = ['injection', 'extension'];
    for (const selectedGenBlock of selectedGenBlocks) {
        for (const codeGenBlock of selectedGenBlock) {
            for (const type of types) {
                codeGenBlock[`${type}Code`].forEach((code) => {
                    if (result[type][code.signifier]) {
                        result[type][code.signifier].push(code);
                    }
                    result[type][code.signifier] = [code];
                });
            }
        }
    }
    return result;
};
const codeGenData = [
    {
        string: '__twig_generation',
        startSignifier: '[',
        stopSignifier: ']',
    },
    {
        string: '__twig_extension',
        type: 'override',
        startSignifier: '[',
        stopSignifier: ']',
    },
];
const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const appPath = '../server/src/app.js';
const keyPath = '../server/keys/keys.js';
const scriptUtilsPath = '../utils/scriptUtils.js';
const serverUtils = '../server/utils/utils.js';
const availableImports = {
    default: {
        session: 'express-session',
        MongDBStoreConstructor: 'connect-mongodb-session',
    },
    named: {
        MemoryStore: 'express-session',
        sessionSecret: keyPath,
        mongoSessionCollectionName: keyPath,
        yesNoQuestion: scriptUtilsPath,
        createUriWithCollectionName: serverUtils,
    },
};
/**
 * @param availableImportsPath - Access the availableImports Object with e.g. "default.session"
 * @param importIntoFilePath - Absolute File Path to the file that is going to receive the import
 */
const getRelativeImportPath = (availableImportsPath, importIntoFilePath) => {
    const [type, toBeImported] = availableImportsPath.split('.');
    const pathFromCodeGen = availableImports[type][toBeImported];
    if (pathFromCodeGen === undefined)
        throw `No such default import exists (type: ${type}, toBeImported: ${toBeImported})`;
    if (!pathFromCodeGen.startsWith('./'))
        return [pathFromCodeGen, { defaultImport: toBeImported }];
    const relativeImportPath = relative(importIntoFilePath, pathFromCodeGen);
    return [
        relativeImportPath,
        type === 'default' ? { defaultImport: toBeImported } : { namedImport: toBeImported },
    ];
};
const processFiles = (directories) => {
    const signifierSortedCodegen = signifierKeyedGenBlocks(selectedGenBlocks);
    const processFile = async (filepath) => {
        // does file exist
        try {
            await stat(filepath);
        }
        catch (e) {
            console.error(e);
            if (e.code === 'ENOENT')
                throw "File doesn't exist";
        }
        const fileData = {
            imports: { defaultImports: {}, namedImports: {} },
            injections: [],
            extensions: [],
        };
        // build already added imports
        try {
            const importRegex = /import\s*(\S* as \w*|\w*),?\s*(?:\{([\w\s,]*)\})?\s*from\s*["'](.*)["'][\n;]/g;
            const file = (await readFile(filepath)).toString();
            [...file.matchAll(importRegex)].forEach(([, defaultImport, namedImports, importedFrom]) => {
                // get all named imports
                const parsedNamedImports = namedImports
                    .split(',')
                    .map(namedImport => namedImport.trim());
                // populate the imports section of fileData
                if (defaultImport) {
                    if (fileData.imports.defaultImports[defaultImport])
                        throw `duplicate default import: ${defaultImport}`;
                    fileData.imports.defaultImports[defaultImport] = importedFrom;
                }
                if (namedImports)
                    for (const namedImport of parsedNamedImports) {
                        if (fileData.imports.namedImports[namedImport])
                            throw `duplicate named import: ${defaultImport}`;
                        fileData.imports.namedImports[namedImport] = importedFrom;
                    }
            });
            // Create Regex out all injection / extension / etc data
            const holdRegexData = ['/**s*', [], 's**/'];
            codeGenData.forEach(({ startSignifier, stopSignifier, string }) => {
                holdRegexData[1].push(`${escapeRegex(string + startSignifier)}(.*)${escapeRegex(stopSignifier)}`);
            });
            const injectExtendRegex = new RegExp(`${escapeRegex(holdRegexData[0])}(?:${holdRegexData[1].join('|')})${escapeRegex(holdRegexData[2])}`);
            const runCodeGen = (file, codegenData) => {
                let fileToParse = file;
                while (true) {
                    const result = injectExtendRegex.exec(fileToParse);
                    if (result === null)
                        break;
                    const [matched, injection, extension] = result;
                    if (injection) {
                        const topPart = fileToParse.substr(0, result.index);
                        const botPart = fileToParse.substring(result.index + matched.length);
                        const codeGenBlocksArr = signifierSortedCodegen.injection[injection];
                        for (const codeGenBlocks of codeGenBlocksArr) {
                            for (const codeGenBlock of codeGenBlocks) {
                                codeGenBlock;
                            }
                        }
                        // fileToParse = topPart + plsGenMe + botPart;
                    }
                }
                return fileToParse;
            };
            const processedFile = runCodeGen(file, codeGenData);
        }
        catch (error) {
            console.error(error);
        }
    };
    for (const directory of directories) {
        processFile(directory);
    }
};
var selectedGenBlocks = [useMongoDBSessions];
var useMongoDBSessions = [
    {
        requiredPackages: [
            'express-session',
            'connect-mongodb-session',
            'mongoose',
            'express',
        ],
        injectionCode: [
            {
                requiredImports: ['named.yesNoQuestion'],
                signifier: 'Setup Sessions',
                code: `try {
      console.clear();
      if (dontReadKey('mongoSessionCollectionName'))
        throw 'Session Collection Name present, Skipping ...';
    
      const [writeSessionName, sessionName] = await yesNoQuestion(
        \`Would you like to change the default collection (\${keys.mongoSessionCollectionName}) where your sessions are going to be stored under ?
    (n / typeInTheSessionCollectionName)\`,
        asyncReadLine,
        {
          ignoreDefaultValidation: true,
          validateFn: anyNonFalsyUserResponse,
        }
      );
    
      if (writeSessionName) keys.mongoSessionCollectionName = sessionName;
    
      console.clear();
    } catch (e) {
      console.log('Failed to read Session Name');
      console.error(e);
    }
`,
            },
            {
                requiredImports: ['default.MongDBStoreConstructor'],
                signifier: 'Mongoose Session',
                code: `const MongoDBStore = MongoDBStoreConstructor(session);

app.use(
	session({
		secret: sessionSecret,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			sameSite: 'lax',
		},
		store:
			mongooseKey === ''
				? new MemoryStore()
				: new MongoDBStore({
						uri: createUriWithCollectionName(mongooseKey, mongoSessionCollectionName),
						collection: 'sessions',
						connectionOptions: {
							useNewUrlParser: true,
							useUnifiedTopology: true,
						},
				  }),
	})
);
`,
            },
        ],
    },
    {
        extensionCode: [
            {
                requiredImports: ['named.yesNoQuestion'],
                signifier: 'Default Keys',
                code: { mongoSessionCollectionName: 'sessions' },
            },
        ],
    },
];
