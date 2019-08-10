// API/src/API/index.ts
// Kristian Jones <me@kristianjones.xyz>
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { GraphQLSchema } from 'graphql';
import { getResolvers } from './loader';
import { authChecker } from './Middleware/AuthChecker';
import { pubSub } from '../Models/ACME';

export const buildAPISchema = async (): Promise<GraphQLSchema> =>
  buildSchema({
    resolvers: await getResolvers(),
    emitSchemaFile: '../../API.graphql',
    authChecker,
    pubSub
  });
