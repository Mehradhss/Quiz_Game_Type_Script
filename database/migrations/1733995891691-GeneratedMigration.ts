import { MigrationInterface, QueryRunner } from "typeorm";

export class GeneratedMigration1733995891691 implements MigrationInterface {
    name = 'GeneratedMigration1733995891691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`questionId\` \`gameQuestionId\` int`);
        await queryRunner.query(`CREATE TABLE \`game_question\` (\`id\` int NOT NULL AUTO_INCREMENT, \`gameId\` int NULL, \`questionId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`game\` DROP FOREIGN KEY \`FK_3f10804f18297163a6189353e64\``);
        await queryRunner.query(`ALTER TABLE \`game\` CHANGE \`categoryId\` \`categoryId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`answer\` CHANGE \`title\` \`title\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_2534fb13ae1e4a4a040e8c776d1\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_97616e9d092dbfb4505ef51dcb7\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`gameQuestionId\` \`gameQuestionId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`answerId\` \`answerId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`userId\` \`userId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_c73f7764e95527350b753fd9fc7\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`leaderBoardId\` \`leaderBoardId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`game_question\` ADD CONSTRAINT \`FK_d35bdfc9ff116d456dcad4a580e\` FOREIGN KEY (\`gameId\`) REFERENCES \`game\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game_question\` ADD CONSTRAINT \`FK_0040e663701d18ed9d1c49ecf6b\` FOREIGN KEY (\`questionId\`) REFERENCES \`question\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`game\` ADD CONSTRAINT \`FK_3f10804f18297163a6189353e64\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_4433dfd29fe36cae4563781e070\` FOREIGN KEY (\`gameQuestionId\`) REFERENCES \`game_question\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_2534fb13ae1e4a4a040e8c776d1\` FOREIGN KEY (\`answerId\`) REFERENCES \`answer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_97616e9d092dbfb4505ef51dcb7\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_c73f7764e95527350b753fd9fc7\` FOREIGN KEY (\`leaderBoardId\`) REFERENCES \`leaderboard\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP FOREIGN KEY \`FK_c73f7764e95527350b753fd9fc7\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_97616e9d092dbfb4505ef51dcb7\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_2534fb13ae1e4a4a040e8c776d1\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` DROP FOREIGN KEY \`FK_4433dfd29fe36cae4563781e070\``);
        await queryRunner.query(`ALTER TABLE \`game\` DROP FOREIGN KEY \`FK_3f10804f18297163a6189353e64\``);
        await queryRunner.query(`ALTER TABLE \`game_question\` DROP FOREIGN KEY \`FK_0040e663701d18ed9d1c49ecf6b\``);
        await queryRunner.query(`ALTER TABLE \`game_question\` DROP FOREIGN KEY \`FK_d35bdfc9ff116d456dcad4a580e\``);
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`leaderBoardId\` \`leaderBoardId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`user\` ADD CONSTRAINT \`FK_c73f7764e95527350b753fd9fc7\` FOREIGN KEY (\`leaderBoardId\`) REFERENCES \`leaderboard\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`answerId\` \`answerId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`gameQuestionId\` \`gameQuestionId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_97616e9d092dbfb4505ef51dcb7\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`question_result\` ADD CONSTRAINT \`FK_2534fb13ae1e4a4a040e8c776d1\` FOREIGN KEY (\`answerId\`) REFERENCES \`answer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`answer\` CHANGE \`title\` \`title\` varchar(255) NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`game\` CHANGE \`categoryId\` \`categoryId\` int NULL DEFAULT 'NULL'`);
        await queryRunner.query(`ALTER TABLE \`game\` ADD CONSTRAINT \`FK_3f10804f18297163a6189353e64\` FOREIGN KEY (\`categoryId\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE \`game_question\``);
        await queryRunner.query(`ALTER TABLE \`question_result\` CHANGE \`gameQuestionId\` \`questionId\` int NULL DEFAULT 'NULL'`);
    }

}
