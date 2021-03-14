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
	host: ' https://fef49cd92dda.ngrok.io',
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
const addEnvContent = newContent => void (envFileContent += newContent + '\n');
addEnvContent('NODE_ENV=development');
addEnvContent(`SERVER_DIR=${join(__dirname, '..')}`);
addEnvContent(`DOMAIN="${domain}"`);
addEnvContent(`SUBDOMAIN="${subDomain}"`);
addEnvContent(`DOMAINEXTENSION="${domainExt}"`);
addEnvContent(`SECURE_PORT="${securePort}"`);
addEnvContent(`DEV_PORT="${devPort}"`);
addEnvContent(`INSECURE_PORT="${insecurePort}"`);
addEnvContent(`SHOPIFY_API_KEY=${shopifyApiKey}`);
addEnvContent(`SHOPIFY_API_SECRET=${shopifyApiSecret}`);
addEnvContent(`SHOP=${shop}`);
addEnvContent(`SHOPIFY_APP_SCOPES=${scopes}`);
addEnvContent(`HOST=${host}`);
addEnvContent(`SHOPIFY_APP_URL=${host}`);
addEnvContent(`BACKEND_PROTOCOL="${backendProtocol}"`);
mkdirSync(join(__dirname, '../public/uploads'), { recursive: true });
mkdirSync(join(__dirname, '../dist/public/uploads'), { recursive: true });
writeFileSync(join(__dirname, '../.env'), envFileContent);
asyncProcess('tsc -w', { cwd: join(__dirname, '..'), shell: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkZWJ1Zy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxNQUFNLElBQUksQ0FBQztBQUM5QyxPQUFPLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNyQyxPQUFPLEVBQUUsR0FBRyxFQUFFLE1BQU0sS0FBSyxDQUFDO0FBQzFCLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFMUQsTUFBTSxlQUFlLEdBQUc7SUFDdkIsTUFBTSxFQUFFLFdBQVc7SUFDbkIsU0FBUyxFQUFFLEVBQUU7SUFDYixTQUFTLEVBQUUsRUFBRTtJQUNiLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLFlBQVksRUFBRSxNQUFNO0lBQ3BCLE9BQU8sRUFBRSxNQUFNO0lBQ2YsZUFBZSxFQUFFLE1BQU07SUFDdkIsYUFBYSxFQUFFLGtDQUFrQztJQUNqRCxnQkFBZ0IsRUFBRSx3Q0FBd0M7SUFDMUQsSUFBSSxFQUFFLHVCQUF1QjtJQUM3QixNQUFNLEVBQUUsbURBQW1EO0lBQzNELElBQUksRUFBRSwrQkFBK0I7Q0FDckMsQ0FBQztBQUVGLE1BQU0sU0FBUyxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBRXhFLE1BQU0sRUFDTCxNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxZQUFZLEVBQ1osT0FBTyxFQUNQLFVBQVUsRUFDVixlQUFlLEVBQ2YsYUFBYSxFQUNiLGdCQUFnQixFQUNoQixJQUFJLEVBQ0osTUFBTSxFQUNOLElBQUksR0FDSixHQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBRWpELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztBQUN4QixNQUFNLGFBQWEsR0FBRyxDQUFDLFVBQWtCLEVBQUUsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDO0FBR3pGLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0FBQ3RDLGFBQWEsQ0FBQyxjQUFjLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBR3JELGFBQWEsQ0FBQyxXQUFXLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDcEMsYUFBYSxDQUFDLGNBQWMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUMxQyxhQUFhLENBQUMsb0JBQW9CLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFHaEQsYUFBYSxDQUFDLGdCQUFnQixVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQzdDLGFBQWEsQ0FBQyxhQUFhLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDdkMsYUFBYSxDQUFDLGtCQUFrQixZQUFZLEdBQUcsQ0FBQyxDQUFDO0FBRWpELGFBQWEsQ0FBQyxtQkFBbUIsYUFBYSxFQUFFLENBQUMsQ0FBQztBQUNsRCxhQUFhLENBQUMsc0JBQXNCLGdCQUFnQixFQUFFLENBQUMsQ0FBQztBQUN4RCxhQUFhLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGFBQWEsQ0FBQyxzQkFBc0IsTUFBTSxFQUFFLENBQUMsQ0FBQztBQUM5QyxhQUFhLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlCLGFBQWEsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUt6QyxhQUFhLENBQUMscUJBQXFCLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFHdkQsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHdCQUF3QixDQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUcxRSxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsRUFBRSxjQUFjLENBQUMsQ0FBQztBQUUxRCxZQUFZLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMifQ==
