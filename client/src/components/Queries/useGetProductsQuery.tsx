import { gql, useQuery } from '@apollo/client';

export const productQuery = gql`
	query QueryProducts {
		products(first: 10) {
			edges {
				node {
					id
					description
					featuredImage {
						id
					}
					featuredMedia {
						alt
					}
				}
			}
		}
	}
`;

export type ProductQueryResult = {
	data: {
		products: {
			edges: [
				{
					node: {
						id: string;
						description: string;
						featuredImage: null | string;
						featuredMedia: null | string;
					};
				}
			];
		};
	} | null;
};
