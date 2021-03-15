import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';
import Index from './components/Index';
import { useRef } from 'react';
import { createUploadLink } from 'apollo-upload-client';
import {
	NormalizedCacheObject,
	ApolloClient,
	InMemoryCache,
	ApolloProvider,
} from '@apollo/client';

const ShopifyProvider: React.FC = ({ children }) => {
	const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
		cache: new InMemoryCache(),
		credentials: 'include',
		link: createUploadLink({
			credentials: 'include',
			fetch: authenticatedFetch(useAppBridge()),
			//	uri: 'https://573f6160a7b6.ngrok.io/graphql',
		}),
	});

	//const clientRef = useRef(
	//	new ApolloClient({
	//		fetch: authenticatedFetch(useAppBridge()),
	//		fetchOptions: {
	//			credentials: 'include',
	//		},
	//	})
	//);
	//
	//console.log(clientRef);

	return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const App = () => {
	const shopOrigin = getCookie('shopOrigin');

	if (!shopOrigin) return <div>Error: No shopOrigin cookie has been set.</div>;

	return (
		<AppProvider i18n={translations}>
			<AppBridgeProvider
				config={{
					apiKey: SHOPIFY_API_KEY,
					shopOrigin,
					forceRedirect: true,
				}}>
				<ShopifyProvider>
					<Index></Index>
				</ShopifyProvider>
			</AppBridgeProvider>
		</AppProvider>
	);
};

const getCookie = (key: string) => {
	console.log(document.cookie);
	console.log(document);
	const b = document.cookie.match('(^|;)\\s*' + key + '\\s*=\\s*([^;]+)');
	return b ? b.pop() : undefined;
};

export default App;
