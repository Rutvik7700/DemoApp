// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import cookieParser from "cookie-parser";
import { Shopify, LATEST_API_VERSION } from "@shopify/shopify-api";

import applyAuthMiddleware from "./middleware/auth.js";
import verifyRequest from "./middleware/verify-request.js";
import { setupGDPRWebHooks } from "./gdpr.js";
import productCreator from "./helpers/product-creator.js";
import redirectToAuth from "./helpers/redirect-to-auth.js";
import { BillingInterval } from "./helpers/ensure-billing.js";
import { AppInstallations } from "./app_installations.js";
import connectDB from "./mongoDB/db/connectdb.js";
import { getStudunt } from "./mongoDB/controllers/studentController.js";

const USE_ONLINE_TOKENS = false;

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const DATABASE_URL = process.env.DATABASE_URL || "mongodb://0.0.0.0:27017"
// TODO: There should be provided by env vars
const DEV_INDEX_PATH = `${process.cwd()}/frontend/`;
const PROD_INDEX_PATH = `${process.cwd()}/frontend/dist/`;

// const DB_PATH = `${process.cwd()}/database.sqlite`;

Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SCOPES.split(","),
  HOST_NAME: process.env.HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: process.env.HOST.split("://")[0],
  API_VERSION: LATEST_API_VERSION,
  IS_EMBEDDED_APP: true,
  // This should be replaced with your preferred storage strategy
  // See note below regarding using CustomSessionStorage with this template.
  // SESSION_STORAGE: new Shopify.Session.SQLiteSessionStorage(DB_PATH),
  ...(process.env.SHOP_CUSTOM_DOMAIN && { CUSTOM_SHOP_DOMAINS: [process.env.SHOP_CUSTOM_DOMAIN] }),
});
// console.log("scope",process.env.SCOPES)
// NOTE: If you choose to implement your own storage strategy using
// Shopify.Session.CustomSessionStorage, you MUST implement the optional
// findSessionsByShopCallback and deleteSessionsCallback methods.  These are
// required for the app_installations.js component in this template to
// work properly.

Shopify.Webhooks.Registry.addHandler("APP_UNINSTALLED", {
  path: "/api/webhooks",
  webhookHandler: async (_topic, shop, _body) => {
    await AppInstallations.delete(shop);
  },
});

// The transactions with Shopify will always be marked as test transactions, unless NODE_ENV is production.
// See the ensureBilling helper to learn more about billing in this template.
const BILLING_SETTINGS = {
  required: false,
  // This is an example configuration that would do a one-time charge for $5 (only USD is currently supported)
  // chargeName: "My Shopify One-Time Charge",
  // amount: 5.0,
  // currencyCode: "USD",
  // interval: BillingInterval.OneTime,
};

// This sets up the mandatory GDPR webhooks. You’ll need to fill in the endpoint
// in the “GDPR mandatory webhooks” section in the “App setup” tab, and customize
// the code when you store customer data.
//
// More details can be found on shopify.dev:
// https://shopify.dev/apps/webhooks/configuration/mandatory-webhooks
setupGDPRWebHooks("/api/webhooks");

// export for test use only
export async function createServer(
  root = process.cwd(),
  isProd = process.env.NODE_ENV === "production",
  billingSettings = BILLING_SETTINGS
) {
  const app = express();
  const jsonParser = express.json()
  app.use(jsonParser);
  app.set("use-online-tokens", USE_ONLINE_TOKENS);
  app.use(cookieParser(Shopify.Context.API_SECRET_KEY));

  applyAuthMiddleware(app, {
    billing: billingSettings,
  });

  connectDB(DATABASE_URL);

  // Do not call app.use(express.json()) before processing webhooks with
  // Shopify.Webhooks.Registry.process().
  // See https://github.com/Shopify/shopify-api-node/blob/main/docs/usage/webhooks.md#note-regarding-use-of-body-parsers
  // for more details.
  app.post("/api/webhooks", async (req, res) => {
    try {
      await Shopify.Webhooks.Registry.process(req, res);
      console.log(`Webhook processed, returned status code 200`);
    } catch (e) {
      console.log(`Failed to process webhook: ${e.message}`);
      if (!res.headersSent) {
        res.status(500).send(e.message);
      }
    }
  });

  // All endpoints after this point will require an active session
  app.use(
    "/api/*",
    verifyRequest(app, {
      billing: billingSettings,
    })
  );

  app.get("/api/products/count", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    const { Product } = await import(
      `@shopify/shopify-api/dist/rest-resources/${Shopify.Context.API_VERSION}/index.js`
    );

    const countData = await Product.count({ session });
    res.status(200).send(countData);
  });

  app.get("/api/products/create", async (req, res) => {
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    let status = 200;
    let error = null;

    try {
      await productCreator(session);
    } catch (e) {
      console.log(`Failed to process products/create: ${e.message}`);
      status = 500;
      error = e.message;
    }
    res.status(status).send({ success: status === 200, error });
  });


  //  Ccustome app api call

  app.post("/api/products-create", async (req, res) => {
    try {
      // console.log("object ==================")

      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );

      // console.log("object 2",session)

      // console.log("object 1")
      // console.log("object")

      const client = new Shopify.Clients.Graphql(session?.shop, session?.accessToken);
      const { qty, title } = req.body
      console.log("aaa ==========", req.body)

      for (let i = 0; i < qty; i++) {
        var x = Math.floor((Math.random() * 20) + 1);
        var y = Math.floor((Math.random() * 100) + 1);
        console.log("y=====", y)
        console.log("x=====", x)
        let result = '';
        let result2 = ''
        const title = Math.random().toString(36).substring(2, x);
        // const characterss       = '0123456789';
        // const characterssLength = characterss.length;
        // for ( let i = 0; i < x; i++ ) {
        //   result += characters.charAt(Math.floor(Math.random() * charactersLength));

        // }
        // for ( let i = 0; i < y; i++ ) {
        //   result2 += characterss.charAt(Math.floor(Math.random() * characterssLength));

        // }
        console.log("title : ", title)
        console.log("price : ", y)



        console.log("product add===>", i)
        const hero = await client.query({
          data: {
            query: `mutation productCreate($input: ProductInput!) {
                productCreate(input: $input) {
                  product {
                    title
                  }
                
                  userErrors {
                    field
                    message
                  }
                }
              }
              ` ,
            variables: {
              input: {
                title: title,
                tags: [
                  "app_tag"
                ],
                variants: [
                  {
                    price: y,
                  }
                ],

              }
            },

          },
        });


      }
      res.status(200).send({ success: true });

    } catch (error) {
      console.log(error)
    }

  });







  app.post("/api/collection-create", async (req, res) => {
    try {
      // console.log("object ==================")

      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );

      // console.log("object 2",session)

      // console.log("object 1")
      // console.log("object")

      const client = new Shopify.Clients.Graphql(session?.shop, session?.accessToken);
      
      const { key } = req.body
      console.log("QTY=====", key)
let arr_val_col = []
      for (let i = 0; i < key; i++) {
        var x = Math.floor((Math.random() * 20) + 1);
        console.log("x=====", x)
        let result2 = '';
        const characters = 'qwertyuioplkjhgfdsazxcvbnm';
        const characterssLength = characters.length;
        for (let j = 0; j < x; j++) {
          result2 += characters.charAt(Math.floor(Math.random() * characterssLength));

        }
        console.log("title : ", result2)

        // console.log("Collection add===>",i)
        const hero2 = await client.query({
          data: {
            query: `mutation collectionCreate($input: CollectionInput!) {
                collectionCreate(input: $input) {
                  collection {
                    id
                  }
                  userErrors {
                    field
                    message
                  }
                }
              }
              
              ` ,
            variables: {
              input: {
                descriptionHtml: "This is sample collection for testing purpose.",
                // handle: "",
                // "image": {
                //   "altText": "",
                //   "id": "",
                //   "src": ""
                // },
                // products: [
                //   ""
                // ],
                title: result2,
              }
            },
          },
        });

console.log("REsponse data", hero2.body.data.collectionCreate.collection.id);
arr_val_col.push(hero2.body.data.collectionCreate.collection.id)
}
getStudunt(req,res, arr_val_col)
      res.status(200).json( {success:true, arr_val_col} );
      console.log("object",arr_val_col)

    } catch (error) {
      console.log(error)
    }

  });


  app.post("/api/customer-create", async (req, res) => {
    try {
    
      const session = await Shopify.Utils.loadCurrentSession(
        req,
        res,
        app.get("use-online-tokens")
      );
      // console.log("Second Log")
      const client = new Shopify.Clients.Graphql(session?.shop, session?.accessToken)
      const { key } = req.body
      console.log("QTY=====", key)
// let arr_val_col = []
      for (let i = 0; i < key; i++) {
        var x = Math.floor((Math.random() * 10) + 1);
        var x1 = Math.floor((Math.random() * 5) + 1);
        var digits = Math.floor(Math.random() * 90000000) + 10000000;
        // console.log("x=====", digits)
        let result2 = '';
        let result1 = '';
        const characters = 'qwertyuioplkjhgfdsazxcvbnm';
        const characterssLength = characters.length;
        for (let j = 0; j < x; j++) {
          result2 += characters.charAt(Math.floor(Math.random() * characterssLength));
        }
        const num = '1234567890';
        const numLength = num.length;
        for (let j = 0; j < x; j++) {
          result1 += num.charAt(Math.floor(Math.random() * numLength));
        }
        // console.log("title : ", result2)
        // console.log("title2 : ", result1)
        const hero2 = await client.query({
          data: {
            query: `mutation customerCreate($input: CustomerInput!) {
              customerCreate(input: $input) {
                customer {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }`,
            variables: {
              "input": {
                "firstName": `${result2}`,
                "lastName": `${result2}`,
                "email": `${result2}66@gmail.com`,
                "phone": `98${digits}`,
              }
            },
          },
        });

        console.log("object===",hero2.body.data.customerCreate.customer)
      }
      res.status(200).json({success:true});
// getStudunt(req,res, arr_val_col)
    } catch (error) {
      console.log("error==",error)
      // res.status(200).json( {success:false,error} );
    }
});




app.post("/api/order-create", async (req, res) => {
  try {
  
    const session = await Shopify.Utils.loadCurrentSession(
      req,
      res,
      app.get("use-online-tokens")
    );
    console.log("Second Log")
    const client = new Shopify.Clients.Graphql(session?.shop, session?.accessToken)
    const { key } = req.body
    console.log("QTY=====", key)
// let arr_val_col = []
    for (let i = 0; i < key; i++) {
      var x = Math.floor((Math.random() * 10) + 1);
      var x1 = Math.floor((Math.random() * 5) + 1);
      var digits = Math.floor(Math.random() * 90000000) + 10000000;
      // console.log("x=====", digits)
      let result2 = '';
      let result1 = '';
      const characters = 'qwertyuioplkjhgfdsazxcvbnm';
      const characterssLength = characters.length;
      for (let j = 0; j < x; j++) {
        result2 += characters.charAt(Math.floor(Math.random() * characterssLength));
      }
      const num = '1234567890';
      const numLength = num.length;
      for (let j = 0; j < x; j++) {
        result1 += num.charAt(Math.floor(Math.random() * numLength));
      }
      // console.log("title : ", result2)
      // console.log("title2 : ", result1)
      const hero2 = await client.query({
        data: {
          query: `mutation draftOrderCreate($input: DraftOrderInput!) {
            draftOrderCreate(input: $input) {
              draftOrder {
                id
              }
            }
          }`,
          variables: {
            "input": {
              "note": "Test draft order",
              "email": "test.user@shopify.com",
              "taxExempt": true,
              "tags": [
                "foo",
                "bar"
              ],
              "shippingLine": {
                "title": "Custom Shipping",
                "price": 4.55
              },
              "shippingAddress": {
                "address1": "123 Main St",
                "city": "Waterloo",
                "province": "Ontario",
                "country": "Canada",
                "zip": "A1A 1A1"
              },
              "billingAddress": {
                "address1": "456 Main St",
                "city": "Toronto",
                "province": "Ontario",
                "country": "Canada",
                "zip": "Z9Z 9Z9"
              },
              "appliedDiscount": {
                "description": "damaged",
                "value": 5,
                "amount": 5,
                "valueType": "FIXED_AMOUNT",
                "title": "Custom"
              },
              "lineItems": [
                {
                  "title": "Custom product",
                  "originalUnitPrice": 14.99,
                  "quantity": 5,
                  "appliedDiscount": {
                    "description": "wholesale",
                    "value": 5,
                    "amount": 3.74,
                    "valueType": "PERCENTAGE",
                    "title": "Fancy"
                  },
                  "weight": {
                    "value": 1,
                    "unit": "KILOGRAMS"
                  },
                  "customAttributes": [
                    {
                      "key": "color",
                      "value": "Gold"
                    },
                    {
                      "key": "material",
                      "value": "Plastic"
                    }
                  ]
                },
                {
                  "variantId": "gid://shopify/ProductVariant/42358174843051",
                  "quantity": 2
                }
              ],
              "customAttributes": [
                {
                  "key": "name",
                  "value": "Achilles"
                },
                {
                  "key": "city",
                  "value": "Troy"
                }
              ]
            }
          },
        },
      });

      // console.log("object===",hero2.body.data)
    }
    res.status(200).json({success:true});
// getStudunt(req,res, arr_val_col)
  } catch (error) {
    console.log("error==",error)
    // res.status(200).json( {success:false,error} );
  }
});



  // All endpoints after this point will have access to a request.body
  // attribute, as a result of the express.json() middleware
  app.use(express.json());

  app.use((req, res, next) => {
    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    if (Shopify.Context.IS_EMBEDDED_APP && shop) {
      res.setHeader(
        "Content-Security-Policy",
        `frame-ancestors https://${encodeURIComponent(
          shop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader("Content-Security-Policy", `frame-ancestors 'none';`);
    }
    next();
  });

  if (isProd) {
    const compression = await import("compression").then(
      ({ default: fn }) => fn
    );
    const serveStatic = await import("serve-static").then(
      ({ default: fn }) => fn
    );
    app.use(compression());
    app.use(serveStatic(PROD_INDEX_PATH, { index: false }));
  }

  app.use("/*", async (req, res, next) => {
    if (typeof req.query.shop !== "string") {
      res.status(500);
      return res.send("No shop provided");
    }

    const shop = Shopify.Utils.sanitizeShop(req.query.shop);
    const appInstalled = await AppInstallations.includes(shop);

    if (!appInstalled && !req.originalUrl.match(/^\/exitiframe/i)) {
      return redirectToAuth(req, res, app);
    }

    if (Shopify.Context.IS_EMBEDDED_APP && req.query.embedded !== "1") {
      const embeddedUrl = Shopify.Utils.getEmbeddedAppUrl(req);

      return res.redirect(embeddedUrl + req.path);
    }

    const htmlFile = join(
      isProd ? PROD_INDEX_PATH : DEV_INDEX_PATH,
      "index.html"
    );

    return res
      .status(200)
      .set("Content-Type", "text/html")
      .send(readFileSync(htmlFile));
  });

  return { app };
}

createServer().then(({ app }) => app.listen(PORT));
