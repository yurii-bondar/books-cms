import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1739185936243 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO permissions (name)
      VALUES 
        ('all'), 
        ('create'), 
        ('update'), 
        ('read'), 
        ('delete'), 
        ('comment');
    `);

    await queryRunner.query(`
      INSERT INTO roles (name, permissions)
      VALUES 
        ('senior', ARRAY[1]),
        ('middle', ARRAY[2,3,4,5,6]),
        ('junior', ARRAY[2,3,4,6]),
        ('trainee', ARRAY[4,6]);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles;`);
    await queryRunner.query(`DELETE FROM permissions;`);
  }
}
