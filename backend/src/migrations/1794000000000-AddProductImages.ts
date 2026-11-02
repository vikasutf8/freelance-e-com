import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductImages1794000000000 implements MigrationInterface {
  name = 'AddProductImages1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\`
        ADD \`imageData\` longblob NULL,
        ADD \`imageMimeType\` varchar(50) NULL,
        ADD \`imageUpdatedAt\` datetime(6) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\`
        DROP COLUMN \`imageUpdatedAt\`,
        DROP COLUMN \`imageMimeType\`,
        DROP COLUMN \`imageData\`
    `);
  }
}
