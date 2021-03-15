import 'isomorphic-fetch';

import dotenv from 'dotenv';
import createShopifyAuthMaster from '@shopify/koa-shopify-auth';

// @ts-ignore
const {
	verifyRequest,
}: {
	verifyRequest: any;
} = createShopifyAuthMaster;
// @ts-ignore
const createShopifyAuth: typeof createShopifyAuthMaster = createShopifyAuthMaster.default;

import ShopifyMaster from '@shopify/shopify-api';

// @ts-ignore
const { ApiVersion }: { ApiVersion: any } = ShopifyMaster;

// @ts-ignore
const Shopify: typeof ShopifyMaster = ShopifyMaster.default;

import Koa, { Context } from 'koa';
import Router from 'koa-router';
import { dirname, join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { URL } from 'url';
import mime from 'mime';
import cors from '@koa/cors';
import session from 'koa-session';

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const PROJECT_ROOT = resolve(__dirname, '../../');

dotenv.config();

const sendFile = (ctx: Context) => {
	if (ctx.path.includes('sockjs-node')) {
		ctx.status = 404;
		return;
	}

	const filePath = join(PROJECT_ROOT, '/client/dist/', ctx.path);

	if (existsSync(filePath) && ctx.path.includes('public')) {
		console.log('PUBLIC');

		ctx.type = mime.getType(ctx.path);
		ctx.body = readFileSync(filePath).toString();
		return;
	}
	ctx.type = '.html';
	ctx.body = readFileSync(join(PROJECT_ROOT, '/client/dist/index.html')).toString();
	console.log(filePath);
};

const port = 3000;

// initializes the library
Shopify.Context.initialize({
	API_KEY: process.env.SHOPIFY_API_KEY,
	API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
	SCOPES: process.env.SHOPIFY_APP_SCOPES.split(','),
	HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/^https:\/\//, ''),
	API_VERSION: ApiVersion.October20,
	IS_EMBEDDED_APP: true,
	// More information at https://github.com/Shopify/shopify-node-api/blob/main/docs/issues.md#notes-on-session-handling
	SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS: Record<string, boolean> = {};

const server = new Koa();
const router = new Router();
server.keys = [Shopify.Context.API_SECRET_KEY];

// app.use(cors);

router.get('/', async ctx => {
	const shop = ctx.query.shop;

	// If this shop hasn't been seen yet, go through OAuth to create a session
	if (typeof shop === 'string' && ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
		ctx.redirect(`/auth?shop=${shop}`);
	} else {
		// Load app skeleton. Don't include sensitive information here!
		//ctx.body = '🎉';
		sendFile(ctx);
	}
});

router.post('/webhooks', async ctx => {
	try {
		await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
		console.log(`Webhook processed, returned status code 200`);
	} catch (error) {
		console.log(`Failed to process webhook: ${error}`);
	}
});

router.post(
	'/graphql',
	/* verifyRequest({ accessMode: 'offline' }), */ async (ctx, next) => {
		await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
	}
);

router.get(
	'(/public/*)',
	() => {
		console.log('sending file over public transport');
	},
	sendFile
); // Static content is clear
// Everything else must have sessions
router.get(
	'(.*)',
	/* verifyRequest({ accessMode: 'offline' }),*/ async ctx => {
		// Your application code goes here
		sendFile(ctx);
	}
);

// Sets up shopify auth
server
	.use(
		createShopifyAuth({
			//	accessMode: 'offline',
			async afterAuth(ctx) {
				const { shop, accessToken } = ctx.state.shopify;
				ACTIVE_SHOPIFY_SHOPS[shop] = true;

				// Your app should handle the APP_UNINSTALLED webhook to make sure merchants go through OAuth if they reinstall it
				const response = await Shopify.Webhooks.Registry.register({
					shop,
					accessToken,
					path: '/webhooks',
					topic: 'APP_UNINSTALLED',
					webhookHandler: async (topic, shop, body) =>
						void delete ACTIVE_SHOPIFY_SHOPS[shop],
				});

				if (!response.success) {
					console.log(`Failed to register APP_UNINSTALLED webhook: ${response.result}`);
				}

				ctx.cookies.set('shopOrigin', shop, {
					httpOnly: false,
					overwrite: true,
					sameSite: 'none',
					secure: true,
				});

				// Redirect to app with shop parameter upon auth
				ctx.redirect(`/?shop=${shop}`);
			},
		})
	)
	.use(router.allowedMethods())
	.use(router.routes());

server.listen(port, () => {
	console.log(`> Ready on http://localhost:${port}`);
});
