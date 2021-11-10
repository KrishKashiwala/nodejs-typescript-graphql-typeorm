import 'reflect-metadata'
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import express = require('express');
import http = require('http')
import { createConnection } from 'typeorm';
import { ResolverMap } from './types/ResolverTypes';
import { Users } from './entity/User';
import { Profile } from './entity/Profile';



const typeDefs = `
  type User {
    id: Int!
    firstName: String!
    profileId : Int
    profile: Pro
  }
  type Pro {
    favoriteColor: String
  }
  type Query {
    hello(id : Int!): User
    user(id: Int!): User!
    users: [User!]!
  }
  input ProfileInput {
    favoriteColor: String!
  }
  type Mutation {
    createUser(firstName: String!, profile: ProfileInput): User!
    updateUser(id: Int!, changeId : Int,firstName: String ): Boolean
    deleteUser(id: Int!): Boolean
  }
`;

const resolvers: ResolverMap = {

	Query: {
		hello: async (_, { id }) => {
			const user: any = await Users.find({ where: (id) })
			console.log(user)
			return user;
		},
		user: async (_, { id }) => {
			const user = await Users.findOne(id);
			console.log(user);

			return user;
		},
		users: async () => {
			const users = await Users.find({ relations: ["profile"] });

			console.log(users);
			return users;
		}
	},
	Mutation: {
		createUser: async (_, args) => {
			const profile = new Profile()
			profile.favoriteColor = args.profile.favoriteColor
			await Profile.save(profile);
			console.log(`Profile : ${profile}`)
			const user = new Users()
			user.firstName = args.firstName
			user.profile = profile
			user.profileId = profile.id

			await Users.save(user)

			console.log(user);

			return { user }
		},
		updateUser: async (_, { id, ...args }) => {
			try {
				const user = await Users.findOne({ id: id })
				if (user) {
					await Users.update(id, { ...args })
				}
			} catch (err) {
				console.log(err);
				return false;
			}

			return true;
		},
		deleteUser: async (_, { id }) => {
			try {
				await Users.delete(id);
			} catch (err) {
				console.log(err);
				return false;
			}

			return true;
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

