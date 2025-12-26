
export interface RouterType {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any;
  role: RoleEnum;
  path: string;
  name: string;
  element: React.ComponentType;
  layout?: React.ComponentType<{ children: React.ReactNode }>;
}
export enum RoleEnum {
  ADMIN = "ADMIN",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface LayoutProps {
  children: React.ComponentType;
}

