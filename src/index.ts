import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express = require('express');
import http = require('http')
import { createConnection } from 'typeorm';
import { ResolverMap } from './types/ResolverTypes';
import { User } from './entity/User';
const typeDefs = `
	type User{
		id : Int!
		firstName : String!
		lastName : String!
		age : Int!
		email : String!
	}
	type Query{
		hello(name : String):String!
		user(id : Int!):User!
		users:[User!]!
	}
	type Mutation{
		createUser(firstName : String!, lastName : String! , age : Int! , email  :String!) : User!
		updateUser(id : Int!,firstName : String, lastName : String , age : Int , email  :String) : Boolean
		deleteUser(id : Int!):Boolean
	}
`

const resolvers: ResolverMap = {
	Query: {
		hello: (_: any, { name }: any) => `hhello ${name || "World"}`,
		user: (_, { id }) => {
			return User.findOne({ where: { id: id } })
		},
		users: () => User.find()
	},
	Mutation: {
		createUser: async (_, args) => {
			const user = await User.create(args)
			User.save(user)
			return user;
		},
		updateUser: async (_, { id, ...args }) => {
			try {
				const user = await User.findOne({ id: id })
				if (user) {
					await User.update(id, args)
				}
			} catch (err) {
				console.log(err);
				return false;
			}

			return true;
		},
		deleteUser: async (_, { id }) => {
			try {
				await User.delete(id)
			} catch (e) {
				console.log(e)
				return false;
			}
			return true
		}
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
	createConnection().then(async () => {

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
	})

}

main(typeDefs, resolvers)