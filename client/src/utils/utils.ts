/*import { useAppBridge } from '@shopify/app-bridge-react';
import Client from 'shopify-buy';
import {
	CLIENT_CREATED,
	PRODUCTS_FETCHED,
	CHECKOUT_CREATED,
	SHOP_INFO_FETCHED,
} from '../store/shopify/types';

export const useBootStrapShopify = async () => {
	const app = useAppBridge();
	try {
		// client

		store.dispatch({ type: CLIENT_CREATED, payload: { client: app } });

		// products
		const products = await app.product.fetchAll();
		store.dispatch({
			type: PRODUCTS_FETCHED,
			payload: {
				products,
			},
		});

		// cart
		const cart = await app.checkout.create();
		store.dispatch({ type: CHECKOUT_CREATED, payload: { cart } });

		// shop
		const shop = await app.shop.fetchInfo();
		store.dispatch({ type: SHOP_INFO_FETCHED, payload: { shop } });

		// catch any errors thrown in bootstrapping process
	} catch (error) {
		// TODO: real error handling here, perhaps to real logs or do something else entirely
		console.log(error);
	}
};
*/
