CREATE TYPE "public"."plan" AS ENUM('free', 'pro', 'business');--> statement-breakpoint
CREATE TABLE "active_refresh_tokens" (
	"id" varchar PRIMARY KEY NOT NULL,
	"userId" varchar NOT NULL,
	"refreshToken" varchar NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "active_refresh_tokens_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "click_events" (
	"id" varchar PRIMARY KEY NOT NULL,
	"linkId" varchar,
	"clickedAt" timestamp DEFAULT now() NOT NULL,
	"referer" varchar,
	"ip" varchar,
	"country" varchar,
	"city" varchar,
	"userAgent" varchar,
	"browser" varchar,
	"browserVersion" varchar,
	"os" varchar,
	"device" varchar,
	"isBot" boolean
);
--> statement-breakpoint
CREATE TABLE "links" (
	"id" varchar PRIMARY KEY NOT NULL,
	"shortCode" varchar NOT NULL,
	"originalUrl" text NOT NULL,
	"userId" varchar NOT NULL,
	"title" varchar NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "links_shortCode_unique" UNIQUE("shortCode")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"user_name" varchar(100) NOT NULL,
	"plan" "plan" DEFAULT 'free' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"isVerified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "active_refresh_tokens" ADD CONSTRAINT "active_refresh_tokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "click_events" ADD CONSTRAINT "click_events_linkId_links_id_fk" FOREIGN KEY ("linkId") REFERENCES "public"."links"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;