import 'isomorphic-fetch';
import Koa from 'koa';
import session from 'koa-session';
import shopifyAuthMaster from '@shopify/koa-shopify-auth';
const shopifyAuth = shopifyAuthMaster.default;
import dotenv from 'dotenv';

import { existsSync, readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';

const __dirname = decodeURI(dirname(new URL(import.meta.url).pathname));

dotenv.config();

const app = new Koa();

const port = 3000;

app.keys = [process.env.SHOPIFY_API_SECRET];

const PROJECT_ROOT = resolve(__dirname, '../../');

app
	// sets up secure session data on each request
	.use(session(app))

	// sets up shopify auth
	.use(
		shopifyAuth({
			apiKey: process.env.SHOPIFY_API_KEY,
			secret: process.env.SHOPIFY_API_SECRET,
			scopes: ['write_orders, write_products'],
			afterAuth(ctx) {
				const { shop, accessToken } = ctx.session;
				console.log('We did it!', accessToken);
				ctx.redirect('/');
			},
		})
	)

	// example to put something in body of application using a middleware
	.use(ctx => {
		if (ctx.path.includes('sockjs-node')) {
			ctx.status = 404;
			return;
		}

		const filePath = join(PROJECT_ROOT, '/client/dist/', ctx.path);

		if (existsSync(filePath) && ctx.path.includes('public')) {
			console.log('PUBLIC');
			// mime.lookup()
			ctx.type = filePath.match(/\.[^\.]+$/);
			ctx.body = readFileSync(filePath).toString();
			return;
		}
		ctx.type = '.html';
		ctx.body = readFileSync(join(PROJECT_ROOT, '/client/dist/index.html')).toString();
		console.log(filePath);
	})
	.listen(port, () => console.log(`App is listening on ${port}`));
