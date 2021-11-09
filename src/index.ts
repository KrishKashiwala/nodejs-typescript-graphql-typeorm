import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
const express = require('express')
const http = require('http')


const typeDefs = `
	type Query{
		hello(name : String!) : String!
	}
`

const resolvers = {
	Query: {
		hello: (_: any, { name }: any) => `hhello ${name || "World"}`
	}
};

async function main(typeDefs: any, resolvers: any) {
	// Required logic for integrating with Express
	const app = express();
	const httpServer = http.createServer(app);

	// Same ApolloServer initialization as before, plus the drain plugin.
	const server = new ApolloServer({
		typeDefs,
		resolvers,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
	});

	// More required logic for integrating with Express
	await server.start();
	server.applyMiddleware({
		app,

		// By default, apollo-server hosts its GraphQL endpoint at the
		// server root. However, *other* Apollo Server packages host it at
		// /graphql. Optionally provide this to match apollo-server.
		path: '/'
	});

	// Modified server startup
	await new Promise<void>(resolve => httpServer.listen({ port: 4000 }, resolve));
	console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}
main(typeDefs, resolvers)