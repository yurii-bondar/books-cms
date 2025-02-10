import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialData1739185936243 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO permissions (permission_id, name)
      VALUES 
        (1, 'all'), 
        (2, 'create'), 
        (3, 'update'), 
        (4, 'read'), 
        (5, 'delete'), 
        (6, 'comment');
    `);

    await queryRunner.query(`
      INSERT INTO roles (role_id, name, permissions)
      VALUES 
        (1, 'senior', ARRAY[1]),
        (2, 'middle', ARRAY[2,3,4,5,6]),
        (3, 'junior', ARRAY[2,3,4,6]),
        (4, 'trainee', ARRAY[4,6]);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles;`);
    await queryRunner.query(`DELETE FROM permissions;`);
  }
}
