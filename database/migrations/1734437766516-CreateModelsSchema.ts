import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateModelsSchema1734437766516 implements MigrationInterface {
    name = 'CreateModelsSchema1734437766516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`game_question\` (\`id\` int NOT NULL AUTO_INCREMENT, \`questionText\` varchar(255) NULL, \`gameId\` int NULL, \`questionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game_room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`uuid\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_402c3579a92c44107abeaa4cc8\` (\`uuid\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game_session\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`gameId\` int NULL, UNIQUE INDEX \`REL_e7b17991276f16736adfb7e124\` (\`gameId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` varchar(255) NOT NULL, \`difficulty\` int NULL DEFAULT '1', \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`categoryId\` int NULL, \`gameRoomId\` int NULL, \`winnerId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`category\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_9f16dbbf263b0af0f03637fa7b\` (\`title\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`question\` (\`id\` int NOT NULL AUTO_INCREMENT, \`text\` varchar(255) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`categoryId\` int NOT NULL, UNIQUE INDEX \`IDX_0c4095f2023b5c40ec3120b2ae\` (\`text\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`answer\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(255) NULL, \`text\` varchar(255) NOT NULL, \`is_correct\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`questionId\` int NOT NULL, UNIQUE INDEX \`IDX_b43889113d5427282a46ecd14c\` (\`text\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`question_result\` (\`id\` int NOT NULL AUTO_INCREMENT, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`gameQuestionId\` int NULL, \`answerId\` int NULL, \`userId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`isAdmin\` tinyint NOT NULL DEFAULT 0, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`total_points\` int NOT NULL DEFAULT '0', UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`game_users\` (\`user_id\` int NOT NULL, \`gameId\` int NOT NULL, INDEX \`IDX_ad0c25ad781c2e9ea9e1cf9f0a\` (\`user_id\`), INDEX \`IDX_90436c1708cd3d19c5b8d689c0\` (\`gameId\`), PRIMARY KEY (\`user_id\`, \`gameId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_rooms\` (\`userId\` int NOT NULL, \`gameRoomId\` int NOT NULL, INDEX \`IDX_b906271d7694fab17ee3dafc68\` (\`userId\`), INDEX \`IDX_229b9c045d80e2296239acc8b3\` (\`gameRoomId\`), PRIMARY KEY (\`userId\`, \`gameRoomId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`game_question\` ADD CONSTRAINT \`FK_d35bdfc9ff116d456dcad4a580e\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_question\` ADD CONSTRAINT \`FK_0040e663701d18ed9d1c49ecf6b\` FOREIGN KEY (\`questionId\`) REFERENCES \`question\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_session\` ADD CONSTRAINT \`FK_e7b17991276f16736adfb7e1247\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game\` ADD CONSTRAINT \`FK_3f10804f18297163a6189353e64\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game\` ADD CONSTRAINT \`FK_cc4bcf2a7341c51204735cfc909\` FOREIGN KEY (\`gameRoomId\`) REFERENCES \`game_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game\` ADD CONSTRAINT \`FK_cd57acb58d1147c23da5cd09cae\` FOREIGN KEY (\`winnerId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question\` ADD CONSTRAINT \`FK_b8dd754e373b56714ddfa8f545c\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answer\` ADD CONSTRAINT \`FK_a4013f10cd6924793fbd5f0d637\` FOREIGN KEY (\`questionId\`) REFERENCES \`question\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_4433dfd29fe36cae4563781e070\` FOREIGN KEY (\`gameQuestionId\`) REFERENCES \`game_question\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_2534fb13ae1e4a4a040e8c776d1\` FOREIGN KEY (\`answerId\`) REFERENCES \`answer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_97616e9d092dbfb4505ef51dcb7\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_users\` ADD CONSTRAINT \`FK_ad0c25ad781c2e9ea9e1cf9f0a1\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`game_users\` ADD CONSTRAINT \`FK_90436c1708cd3d19c5b8d689c08\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_rooms\` ADD CONSTRAINT \`FK_b906271d7694fab17ee3dafc681\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user_rooms\` ADD CONSTRAINT \`FK_229b9c045d80e2296239acc8b37\` FOREIGN KEY (\`gameRoomId\`) REFERENCES \`game_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_rooms\` DROP FOREIGN KEY \`FK_229b9c045d80e2296239acc8b37\``);
        await queryRunner.query(`ALTER TABLE \`user_rooms\` DROP FOREIGN KEY \`FK_b906271d7694fab17ee3dafc681\``);
        await queryRunner.query(`ALTER TABLE \`game_users\` DROP FOREIGN KEY \`FK_90436c1708cd3d19c5b8d689c08\``);
        await queryRunner.query(`ALTER TABLE \`game_users\` DROP FOREIGN KEY \`FK_ad0c25ad781c2e9ea9e1cf9f0a1\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_97616e9d092dbfb4505ef51dcb7\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_2534fb13ae1e4a4a040e8c776d1\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_4433dfd29fe36cae4563781e070\``);
        await queryRunner.query(`ALTER TABLE \`answer\` DROP FOREIGN KEY \`FK_a4013f10cd6924793fbd5f0d637\``);
        await queryRunner.query(`ALTER TABLE \`question\` DROP FOREIGN KEY \`FK_b8dd754e373b56714ddfa8f545c\``);
        await queryRunner.query(`ALTER TABLE \`game\` DROP FOREIGN KEY \`FK_cd57acb58d1147c23da5cd09cae\``);
        await queryRunner.query(`ALTER TABLE \`game\` DROP FOREIGN KEY \`FK_cc4bcf2a7341c51204735cfc909\``);
        await queryRunner.query(`ALTER TABLE \`game\` DROP FOREIGN KEY \`FK_3f10804f18297163a6189353e64\``);
        await queryRunner.query(`ALTER TABLE \`game_session\` DROP FOREIGN KEY \`FK_e7b17991276f16736adfb7e1247\``);
        await queryRunner.query(`ALTER TABLE \`game_question\` DROP FOREIGN KEY \`FK_0040e663701d18ed9d1c49ecf6b\``);
        await queryRunner.query(`ALTER TABLE \`game_question\` DROP FOREIGN KEY \`FK_d35bdfc9ff116d456dcad4a580e\``);
        await queryRunner.query(`DROP INDEX \`IDX_229b9c045d80e2296239acc8b3\` ON \`user_rooms\``);
        await queryRunner.query(`DROP INDEX \`IDX_b906271d7694fab17ee3dafc68\` ON \`user_rooms\``);
        await queryRunner.query(`DROP TABLE \`user_rooms\``);
        await queryRunner.query(`DROP INDEX \`IDX_90436c1708cd3d19c5b8d689c0\` ON \`game_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_ad0c25ad781c2e9ea9e1cf9f0a\` ON \`game_users\``);
        await queryRunner.query(`DROP TABLE \`game_users\``);
        await queryRunner.query(`DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`question_result\``);
        await queryRunner.query(`DROP INDEX \`IDX_b43889113d5427282a46ecd14c\` ON \`answer\``);
        await queryRunner.query(`DROP TABLE \`answer\``);
        await queryRunner.query(`DROP INDEX \`IDX_0c4095f2023b5c40ec3120b2ae\` ON \`question\``);
        await queryRunner.query(`DROP TABLE \`question\``);
        await queryRunner.query(`DROP INDEX \`IDX_9f16dbbf263b0af0f03637fa7b\` ON \`category\``);
        await queryRunner.query(`DROP TABLE \`category\``);
        await queryRunner.query(`DROP TABLE \`game\``);
        await queryRunner.query(`DROP INDEX \`REL_e7b17991276f16736adfb7e124\` ON \`game_session\``);
        await queryRunner.query(`DROP TABLE \`game_session\``);
        await queryRunner.query(`DROP INDEX \`IDX_402c3579a92c44107abeaa4cc8\` ON \`game_room\``);
        await queryRunner.query(`DROP TABLE \`game_room\``);
        await queryRunner.query(`DROP TABLE \`game_question\``);
    }

}
