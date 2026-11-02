import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentSettings1796000000000 implements MigrationInterface {
  name = 'AddPaymentSettings1796000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`payment_settings\` (
        \`id\` tinyint NOT NULL,
        \`qrImageData\` longblob NULL,
        \`qrImageMimeType\` varchar(50) NULL,
        \`qrImageUpdatedAt\` datetime(6) NULL,
        \`updatedBy\` int NULL,
        \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
          ON UPDATE CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        CONSTRAINT \`FK_payment_settings_updated_by\`
          FOREIGN KEY (\`updatedBy\`) REFERENCES \`users\` (\`id\`)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`payment_settings\``);
  }
}
