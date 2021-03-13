import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider, useAppBridge } from '@shopify/app-bridge-react';
import { authenticatedFetch } from '@shopify/app-bridge-utils';
import '@shopify/polaris/dist/styles.css';
import translations from '@shopify/polaris/locales/en.json';

const App = () => {
	const app = useAppBridge();

	const client = new ApolloClient({
		fetch: authenticatedFetch(app),
		fetchOptions: {
			credentials: 'include',
		},
	});

	return (
		<AppProvider i18n={translations}>
			<AppBridgeProvider
				config={{
					apiKey: API_KEY,
					shopOrigin: shopOrigin,
					forceRedirect: true,
				}}>
				<ApolloProvider client={client}>
					<div>hello</div>
				</ApolloProvider>
			</AppBridgeProvider>
		</AppProvider>
	);
};

App.getInitialProps = async ({ ctx }) => {
	return {
		shopOrigin: ctx.query.shop,
	};
};

export default App;
