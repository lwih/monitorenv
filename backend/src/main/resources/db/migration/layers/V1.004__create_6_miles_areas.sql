CREATE TABLE "public"."6_miles_areas" ( "ogc_fid" SERIAL, CONSTRAINT "6_miles_areas_pk" PRIMARY KEY ("ogc_fid") );
SELECT AddGeometryColumn('public','6_miles_areas','wkb_geometry',4326,'MULTILINESTRING',2);
CREATE INDEX "6_miles_areas_wkb_geometry_geom_idx" ON "public"."6_miles_areas" USING GIST ("wkb_geometry");
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "nature" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "type" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "descriptio" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "reference" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "beginlifes" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "territory" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "country" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "agency" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "neighbor" VARCHAR(254);
ALTER TABLE "public"."6_miles_areas" ADD COLUMN "inspireid" VARCHAR(254);
