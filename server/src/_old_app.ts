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
import session from 'koa-session';

dotenv.config();
const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));
const PROJECT_ROOT = resolve(__dirname, '../../');

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

Shopify.Context.initialize({
	API_KEY: process.env.SHOPIFY_API_KEY,
	API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
	SCOPES: process.env.SCOPES.split(','),
	HOST_NAME: process.env.HOST.replace(/https:\/\//, ''),
	API_VERSION: ApiVersion.October20,
	IS_EMBEDDED_APP: true,
	// This should be replaced with your preferred storage strategy
	SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS: Record<string, string> = {};

const server = new Koa();

// server.use(session(server));

const router = new Router();
server.keys = [Shopify.Context.API_SECRET_KEY];

router.get('/', async ctx => {
	const shop = ctx.query.shop;

	// This shop hasn't been seen yet, go through OAuth to create a session
	if (!Array.isArray(shop) && ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
		ctx.redirect(`/auth?shop=${shop}`);
	} else {
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

router.post('/graphql', async (ctx, next) => {
	await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
});

router.get('(/public/*)', sendFile); // Static content is clear
router.get('(.*)', ctx => {
	sendFile(ctx);
}); // Everything else must have sessions

server
	.use(
		createShopifyAuth({
			accessMode: 'offline',
			async afterAuth(ctx) {
				console.log('------\n------\nauth done\n------\n------');

				// Access token and shop available in ctx.state.shopify
				const { shop, accessToken, scope } = ctx.state.shopify;
				ACTIVE_SHOPIFY_SHOPS[shop] = scope;

				console.log({ ACTIVE_SHOPIFY_SHOPS });

				const response = await Shopify.Webhooks.Registry.register({
					shop,
					accessToken,
					path: '/webhooks',
					topic: 'APP_UNINSTALLED',
					webhookHandler: async (topic, shop, body) =>
						void delete ACTIVE_SHOPIFY_SHOPS[shop],
				});

				// ctx.cookies.set('shopOrigin', shop, { httpOnly: false });

				if (!response.success) {
					console.log(`Failed to register APP_UNINSTALLED webhook: ${response.result}`);
				}

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
