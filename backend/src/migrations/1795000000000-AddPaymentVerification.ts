import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentVerification1795000000000
  implements MigrationInterface
{
  name = 'AddPaymentVerification1795000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`payments\`
        ADD \`utr\` varchar(64) NULL,
        ADD \`failureReason\` varchar(255) NULL,
        ADD \`reviewedAt\` datetime(6) NULL,
        ADD \`reviewedBy\` int NULL,
        ADD UNIQUE INDEX \`UQ_payments_utr\` (\`utr\`),
        ADD INDEX \`IDX_payments_status\` (\`status\`),
        ADD CONSTRAINT \`FK_payments_reviewed_by\`
          FOREIGN KEY (\`reviewedBy\`) REFERENCES \`users\` (\`id\`)
          ON DELETE SET NULL ON UPDATE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`payments\`
        DROP FOREIGN KEY \`FK_payments_reviewed_by\`,
        DROP INDEX \`IDX_payments_status\`,
        DROP INDEX \`UQ_payments_utr\`,
        DROP COLUMN \`reviewedBy\`,
        DROP COLUMN \`reviewedAt\`,
        DROP COLUMN \`failureReason\`,
        DROP COLUMN \`utr\`
    `);
  }
}
