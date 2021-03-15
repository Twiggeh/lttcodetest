/* eslint-disable no-mixed-spaces-and-tabs */
/* eslint-disable indent */
import { useQuery } from '@apollo/client';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Cart } from '@shopify/app-bridge/actions';
import {
	Heading,
	Page,
	TextStyle,
	ResourceList,
	Card,
	Avatar,
	ResourceItem,
	Thumbnail,
} from '@shopify/polaris';
import { useEffect } from 'react';
import { useProductsQuery } from '../generated/graphql';
import { FallBackImage } from '../static/Images';
import { productQuery, ProductQueryResult } from './Queries/useGetProductsQuery';

const Index = () => {
	const app = useAppBridge();

	useEffect(() => {
		const cart = Cart.create(app);
		const unsubscribe = cart.subscribe(Cart.Action.UPDATE, payload => {
			console.log(payload);
		});
		return () => {
			unsubscribe();
		};
	});

	const { data: products, loading } = useProductsQuery();
	// const { loading: productsLoading, data: products } = useQuery<ProductQueryResult>(
	// productQuery
	// );

	const Products = products ? products.products.edges : ([] as undefined[]);

	return (
		<Page>
			<Heading>
				This is a shopify setup from scratch! Preact + Typescript + NodeJs 💥
			</Heading>
			<Card>
				<ResourceList
					resourceName={{ singular: 'product', plural: 'products' }}
					items={Products}
					loading
					renderItem={item => {
						if (!item) return null;
						const {
							node: { description, featuredImage, featuredMedia, id },
						} = item;

						const media = (
							<Thumbnail
								source={`${featuredImage ? featuredImage : FallBackImage}`}
								alt={description}
							/>
						);

						const shortcutActions = [
							{
								content: 'Add to Cart',
								accessibilityLabel: `Add ${''} to the cart.`,
								url: '',
							},
							{
								content: 'Use a Secret Password',
								accessibilityLabel: `Use a Secret Password on ${name}.`,
								url: '',
							},
						];

						return (
							<ResourceItem
								id={id ? id + '' : ''}
								url={''}
								media={media}
								accessibilityLabel={`View details for ${''}`}
								shortcutActions={shortcutActions}
								persistActions>
								<h3>
									<TextStyle variation='strong'>{''}</TextStyle>
								</h3>
								<div>{location}</div>
							</ResourceItem>
						);
					}}
				/>
			</Card>
		</Page>
	);
};

export default Index;
