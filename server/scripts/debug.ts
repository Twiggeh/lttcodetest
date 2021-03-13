import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { URL } from 'url';
import { processParams } from './processParameters.js';
import { asyncProcess } from '../../utils/scriptUtils.js';

const defaultDebugCfg = {
	domain: 'localhost',
	domainExt: '',
	subDomain: '',
	securePort: '8080',
	insecurePort: '8081',
	devPort: '5050',
	backendProtocol: 'http',
	shopifyApiKey: '066b67aac669378981327ff18febac59',
	shopifyApiSecret: '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',
	shop: 'ltttest.myshopify.com',
	scopes: 'write_products,write_customers,write_draft_orders',
	host: 'https://7d556a03ca0d.ngrok.io',
};

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));

const {
	domain,
	subDomain,
	domainExt,
	insecurePort,
	devPort,
	securePort,
	backendProtocol,
	shopifyApiKey,
	shopifyApiSecret,
	shop,
	scopes,
	host,
} = processParams(process.argv, defaultDebugCfg);

let envFileContent = '';
const addEnvContent = (newContent: string) => void (envFileContent += newContent + '\n');
// Set all environment variables, then run nodemon

addEnvContent('NODE_ENV=development');
addEnvContent(`SERVER_DIR=${join(__dirname, '..')}`);

// DOMAINS
addEnvContent(`DOMAIN="${domain}"`);
addEnvContent(`SUBDOMAIN="${subDomain}"`);
addEnvContent(`DOMAINEXTENSION="${domainExt}"`);

// PORTS
addEnvContent(`SECURE_PORT="${securePort}"`);
addEnvContent(`DEV_PORT="${devPort}"`);
addEnvContent(`INSECURE_PORT="${insecurePort}"`);

addEnvContent(`SHOPIFY_API_KEY=${scopes}`);
addEnvContent(`SHOPIFY_API_SECRET=${shop}`);
addEnvContent(`SHOP=${shopifyApiSecret}`);
addEnvContent(`SCOPES=${shopifyApiKey}`);
addEnvContent(`HOST=${host}`);

// TODO : add config for production to not use maps

// PROTOCOL
addEnvContent(`BACKEND_PROTOCOL="${backendProtocol}"`);

// DIRECTORIES
mkdirSync(join(__dirname, '../public/uploads'), { recursive: true });
mkdirSync(join(__dirname, '../dist/public/uploads'), { recursive: true });

// Write env file
writeFileSync(join(__dirname, '../.env'), envFileContent);

asyncProcess('tsc -w', { cwd: join(__dirname, '..'), shell: true });
