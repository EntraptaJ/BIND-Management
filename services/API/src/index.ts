// API/src/index.ts
// Kristian Jones <me@kristianjones.xyz>
// Main startup of Docs Markdown API
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-koa';
import { verify } from 'jsonwebtoken';
import Koa from 'koa';
import jwt from 'koa-jwt';
import KoaRouter from 'koa-router';
import mongoose from 'mongoose';
import { createRouteExplorer } from 'altair-koa-middleware';
import { buildAPISchema } from './API';
import { Context } from './API/Context';
import { UserModel } from './Models/User';

const port = 80;

const startWeb = async (): Promise<Koa> => {
  const schema = await buildAPISchema();
  const app = new Koa();
  const router = new KoaRouter();

  process.setMaxListeners(10000);

  app.use(jwt({ secret: 'SECRET', passthrough: true }));

  const apiServer = new ApolloServer({
    schema,
    introspection: true,
    context: async ({ ctx, connection }): Promise<Context> => {
      if (connection) {
        if (!connection.context.authToken) return { user: undefined };
        try {
          const JWT = verify(connection.context.authToken, 'SECRET') as { id: string };
          if (!JWT.id) return { user: undefined };
          else return { user: await UserModel.findOne({ _id: JWT.id }) };
        } catch {
          return { user: undefined };
        }
      }
      if (ctx && ctx.state) {
        return { user: ctx.state.user ? await UserModel.findOne({ _id: ctx.state.user.id }) : undefined };
      }
    }
  });

  createRouteExplorer({
    url: '/altair',
    router,
    opts: {
      endpointURL: '/graphql'
    }
  });

  app.use(router.routes()).use(router.allowedMethods());

  apiServer.applyMiddleware({ app });
  const httpServer = await app.listen(port);
  apiServer.installSubscriptionHandlers(httpServer);
  return app;
};

const startAPI = async (): Promise<void> => {
  console.log('Starting API');
  await mongoose.connect(`mongodb://${process.env['DB_HOST']}:27017/BINDMAN`, { useNewUrlParser: true, useCreateIndex: true });

  const [app] = await Promise.all([startWeb()]);
  console.log(`Server listening on port ${port}`);
};

startAPI();
