import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1730000000000 implements MigrationInterface {
  name = 'Init1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`users\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`email\` varchar(255) NOT NULL,
        \`password\` varchar(255) NOT NULL,
        \`role\` enum('admin', 'client') NOT NULL DEFAULT 'client',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_users_email\` (\`email\`)
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`products\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`name\` varchar(255) NOT NULL,
        \`price\` decimal(10, 2) NOT NULL,
        \`description\` text NULL,
        \`stock\` int NOT NULL DEFAULT 0,
        \`isDeleted\` tinyint NOT NULL DEFAULT 0,
        \`createdBy\` int NULL,
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_products_is_deleted\` (\`isDeleted\`),
        CONSTRAINT \`FK_products_created_by\`
          FOREIGN KEY (\`createdBy\`) REFERENCES \`users\` (\`id\`)
          ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`carts\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`userId\` int NOT NULL,
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`IDX_carts_user_id\` (\`userId\`),
        CONSTRAINT \`FK_carts_user\`
          FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`cart_items\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cartId\` int NOT NULL,
        \`productId\` int NOT NULL,
        \`quantity\` int NOT NULL,
        \`priceAtAdd\` decimal(10, 2) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE INDEX \`UQ_cart_items_cart_product\` (\`cartId\`, \`productId\`),
        INDEX \`IDX_cart_items_product\` (\`productId\`),
        CONSTRAINT \`FK_cart_items_cart\`
          FOREIGN KEY (\`cartId\`) REFERENCES \`carts\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT \`FK_cart_items_product\`
          FOREIGN KEY (\`productId\`) REFERENCES \`products\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`payments\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`cartId\` int NOT NULL,
        \`upiId\` varchar(255) NOT NULL,
        \`amount\` decimal(10, 2) NOT NULL,
        \`status\` enum('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
        \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        INDEX \`IDX_payments_cart\` (\`cartId\`),
        CONSTRAINT \`FK_payments_cart\`
          FOREIGN KEY (\`cartId\`) REFERENCES \`carts\` (\`id\`)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS `payments`');
    await queryRunner.query('DROP TABLE IF EXISTS `cart_items`');
    await queryRunner.query('DROP TABLE IF EXISTS `carts`');
    await queryRunner.query('DROP TABLE IF EXISTS `products`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
  }
}
