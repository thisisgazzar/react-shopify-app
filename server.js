//1
require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const { default: createShopifyAuth } = require('@shopify/koa-shopify-auth');
const { verifyRequest } = require('@shopify/koa-shopify-auth');
const session = require('koa-session');

dotenv.config();
//7
const { default: graphQLProxy } = require('@shopify/koa-shopify-graphql-proxy');
//11
const Router = require('koa-router');
const { receiveWebhook, registerWebhook } = require('@shopify/koa-shopify-webhooks');

//8
const { ApiVersion } = require('@shopify/koa-shopify-graphql-proxy');

//10
const getSubscriptionUrl = require('./server/getSubscriptionUrl');


const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

//11 = HOST only
const { SHOPIFY_API_SECRET_KEY, SHOPIFY_API_KEY, HOST } = process.env;

//2
app.prepare().then(() => {
    //3
    const server = new Koa();
    server.use(session({ secure: true, sameSite: 'none' }, server));
    server.keys = [SHOPIFY_API_SECRET_KEY];

    //4


    server.use(
        createShopifyAuth({
            apiKey: SHOPIFY_API_KEY,
            secret: SHOPIFY_API_SECRET_KEY,
            //scopes: ['read_products'],
            //9
            scopes: ['read_products', 'write_products'],
            async afterAuth(ctx) {

                const { shop, accessToken } = ctx.session;

                //6
                ctx.cookies.set('shopOrigin', shop, {
                    httpOnly: false,
                    secure: true,
                    sameSite: 'none'
                });

                //11
                const registration = await registerWebhook({
                    address: `${HOST}/webhooks/products/create`,
                    topic: 'PRODUCTS_CREATE',
                    accessToken,
                    shop,
                    apiVersion: ApiVersion.October19
                });

                if (registration.success) {
                    console.log('Successfully registered webhook!');
                } else {
                    console.log('Failed to register webhook', registration.result);
                }

                //10
                await getSubscriptionUrl(ctx, accessToken, shop);
            },
        }),
    );
    //12
    const webhook = receiveWebhook({ secret: SHOPIFY_API_SECRET_KEY });

    router.post('/webhooks/products/create', webhook, (ctx) => {
        console.log('received webhook: ', ctx.state.webhook);
    });
    //7
    //server.use(graphQLProxy());
    //8
    server.use(graphQLProxy({ version: ApiVersion.October19 }))

    //13

    router.get('*', verifyRequest(), async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
    });
    server.use(router.allowedMethods());
    server.use(router.routes());

    /*server.use(verifyRequest());

    //3
    server.use(async (ctx) => {
        await handle(ctx.req, ctx.res);
        ctx.respond = false;
        ctx.res.statusCode = 200;
        return
    });*/

    //5
    server.listen(port, () => {
        console.log(`> Ready on http://localhost:${port}`);
    });
});