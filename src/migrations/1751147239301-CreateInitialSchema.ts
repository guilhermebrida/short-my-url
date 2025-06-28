import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialSchema1751147239301 implements MigrationInterface {
    name = 'CreateInitialSchema1751147239301'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "short_urls" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "originalUrl" text NOT NULL, "shortCode" character varying(6) NOT NULL, "clickCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid, CONSTRAINT "UQ_2756f6a30137d1d6a268ada4b1c" UNIQUE ("shortCode"), CONSTRAINT "PK_0bee0ef97594699927c1b7c81a3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "short_urls" ADD CONSTRAINT "FK_a5ba995252a5de71f022a4ec917" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "short_urls" DROP CONSTRAINT "FK_a5ba995252a5de71f022a4ec917"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "short_urls"`);
    }

}
