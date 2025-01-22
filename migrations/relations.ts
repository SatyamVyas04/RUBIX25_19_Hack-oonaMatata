import { relations } from "drizzle-orm/relations";
import { users, passwords, sessions, notifications, albums, images, authenticators, accounts } from "./schema";

export const passwordsRelations = relations(passwords, ({one}) => ({
	user: one(users, {
		fields: [passwords.user_id],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	passwords: many(passwords),
	sessions: many(sessions),
	notifications: many(notifications),
	albums: many(albums),
	images: many(images),
	authenticators: many(authenticators),
	accounts: many(accounts),
}));

export const sessionsRelations = relations(sessions, ({one}) => ({
	user: one(users, {
		fields: [sessions.user_id],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.notif_owner],
		references: [users.id]
	}),
}));

export const albumsRelations = relations(albums, ({one}) => ({
	user: one(users, {
		fields: [albums.mainowner],
		references: [users.id]
	}),
}));

export const imagesRelations = relations(images, ({one}) => ({
	user: one(users, {
		fields: [images.owner],
		references: [users.id]
	}),
}));

export const authenticatorsRelations = relations(authenticators, ({one}) => ({
	user: one(users, {
		fields: [authenticators.user_id],
		references: [users.id]
	}),
}));

export const accountsRelations = relations(accounts, ({one}) => ({
	user: one(users, {
		fields: [accounts.user_id],
		references: [users.id]
	}),
}));