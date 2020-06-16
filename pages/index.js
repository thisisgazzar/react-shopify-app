//import { Layout, Page, TextStyle } from '@shopify/polaris';
import { EmptyState, Layout, Page } from '@shopify/polaris';
import { ResourcePicker, TitleBar } from '@shopify/app-bridge-react';
import store from 'store-js';
import ResourceListWithProducts from '../components/ResourceList';

/*<TextStyle variation="positive">
    Sample app using React and Next.js
            </TextStyle>*/
const img = 'https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg';

class Index extends React.Component {
    state = { open: false };

    render() {
        const emptyState = !store.get('ids');

        return (
            <Page>
                <TitleBar
                    primaryAction={{
                        content: 'Select products',
                        onAction: () => this.setState({ open: true }),
                    }}
                />
                <ResourcePicker
                    resourceType="Product"
                    showVariants={false}
                    open={this.state.open}
                    onSelection={(resources) => this.handleSelection(resources)}
                    onCancel={() => this.setState({ open: false })}
                />
                {emptyState ? (
                    <Layout>
                        <EmptyState
                            heading="Select products to start"
                            action={{
                                content: 'Select products',
                                onAction: () => this.setState({ open: true }),
                            }}
                            image={img}
                        >
                            <p>Select products and change their price temporarily</p>
                        </EmptyState>
                    </Layout>
                ) : (
                        <ResourceListWithProducts />
                    )}
            </Page>
        );
    }
    handleSelection = (resources) => {
        const idsFromResources = resources.selection.map((product) => product.id);
        this.setState({ open: false })
        //console.log(resources)
        //console.log(idsFromResources)
        store.set('ids', idsFromResources);
    };
}

export default Index;
//npm install ngrok -g https localhost
//whitelist https://2168eb0a1990.ngrok.io/auth/callback
//SHOPIFY_API_KEY='YOUR API KEY FROM SHOPIFY PARTNERS DASHBOARD'
//SHOPIFY_API_SECRET_KEY='YOUR API SECRET KEY FROM SHOPIFY PARTNERS DASHBOARD'
//.gitignore file