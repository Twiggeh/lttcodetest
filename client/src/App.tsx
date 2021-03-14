import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';

const ShopifyProvider: React.FC = ({ children }) => {
	const app = useAppBridge();

	const client = new ApolloClient({
		fetch: authenticatedFetch(app),
		fetchOptions: {
			credentials: 'include',
		},
	});
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
					<div>hello</div>
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
