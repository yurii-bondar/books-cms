const SENIOR_USER_ID: number = 1;
enum RoleEnum {
  SENIOR = 1,
  MIDDLE = 2,
  JUNIOR = 3,
  TRAINEE = 4,
}
const ROLE_NAMES: Record<RoleEnum, string> = {
  [RoleEnum.SENIOR]: 'senior',
  [RoleEnum.MIDDLE]: 'middle',
  [RoleEnum.JUNIOR]: 'junior',
  [RoleEnum.TRAINEE]: 'trainee',
};

export {
  SENIOR_USER_ID,
  ROLE_NAMES,
  RoleEnum
}