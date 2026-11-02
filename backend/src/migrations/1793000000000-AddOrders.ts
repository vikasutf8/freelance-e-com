import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrders1793000000000 implements MigrationInterface {
  name = 'AddOrders1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`orders\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`paymentId\` int NOT NULL,
        \`total\` decimal(10, 2) NOT NULL,
        \`status\` enum('paid') NOT NULL DEFAULT 'paid',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`UQ_orders_payment_id\` (\`paymentId\`),
        INDEX \`IDX_orders_user_created\` (\`userId\`, \`createdAt\`),
        CONSTRAINT \`FK_orders_user\`
          FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_orders_payment\`
          FOREIGN KEY (\`paymentId\`) REFERENCES \`payments\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`order_items\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`orderId\` int NOT NULL,
        \`productId\` int NULL,
        \`productName\` varchar(255) NOT NULL,
        \`unitPrice\` decimal(10, 2) NOT NULL,
        \`quantity\` int NOT NULL,
        \`subtotal\` decimal(10, 2) NOT NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_order_items_order\` (\`orderId\`),
        INDEX \`IDX_order_items_product\` (\`productId\`),
        CONSTRAINT \`FK_order_items_order\`
          FOREIGN KEY (\`orderId\`) REFERENCES \`orders\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_order_items_product\`
          FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `order_items`');
    await queryRunner.query('DROP TABLE IF EXISTS `orders`');
  }
}
