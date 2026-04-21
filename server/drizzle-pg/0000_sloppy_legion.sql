CREATE TABLE "directions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	CONSTRAINT "directions_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "lesson_levels" (
	"lesson_id" integer NOT NULL,
	"level_id" integer NOT NULL,
	CONSTRAINT "lesson_levels_lesson_id_level_id_pk" PRIMARY KEY("lesson_id","level_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_teachers" (
	"lesson_id" integer NOT NULL,
	"teacher_id" integer NOT NULL,
	CONSTRAINT "lesson_teachers_lesson_id_teacher_id_pk" PRIMARY KEY("lesson_id","teacher_id")
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"day" text NOT NULL,
	"time" text NOT NULL,
	"end_time" text NOT NULL,
	"crosses_midnight" boolean DEFAULT false NOT NULL,
	"direction_id" integer NOT NULL,
	"poster" text
);
--> statement-breakpoint
CREATE TABLE "levels" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#f59e0b' NOT NULL,
	CONSTRAINT "levels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "studio_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"school_name" text NOT NULL,
	"logo_path" text
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lesson_levels" ADD CONSTRAINT "lesson_levels_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_levels" ADD CONSTRAINT "lesson_levels_level_id_levels_id_fk" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_teachers" ADD CONSTRAINT "lesson_teachers_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_teachers" ADD CONSTRAINT "lesson_teachers_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_direction_id_directions_id_fk" FOREIGN KEY ("direction_id") REFERENCES "public"."directions"("id") ON DELETE cascade ON UPDATE no action;