// Export all types
// Note: Import from specific files to avoid naming conflicts
export * from './api.types';

// Auth types
export type {
  LoginRequest,
  LoginResponse,
  UserInfo,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyOtpRequest,
} from './auth.types';
export type { UserRole as AuthUserRole } from './auth.types';

// User types
export type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilterParams,
} from './user.types';
export type { UserRole, Department as UserDepartment } from './user.types';

// Resource types
export type {
  Resource,
  ResourceUploader,
  ResourceCategory,
  ResourceSearchParams,
  ResourceUploadRequest,
  ResourceBrowseParams,
  ResourceFolderNode,
} from './resource.types';
export type {
  ResourceType as ResourceResourceType,
  Classroom as ResourceClassroom,
  TrainingProgram as ResourceTrainingProgram,
  Specialization as ResourceSpecialization,
  Cohort as ResourceCohort,
  Course as ResourceCourse,
} from './resource.types';

// Department types (main definitions)
export type {
  Department,
  TrainingProgram,
  Specialization,
  Cohort,
  Classroom,
  Course,
  ResourceType,
  CreateDepartmentRequest,
  CreateTrainingProgramRequest,
  CreateSpecializationRequest,
  CreateCohortRequest,
  CreateClassroomRequest,
  CreateCourseRequest,
  CreateResourceTypeRequest,
} from './department.types';

// History types
export type {
  History,
  HistoryAction,
  HistoryFilterParams,
} from './history.types';

// Comment types
export type {
	Comment,
	CreateCommentRequest,
	UpdateCommentRequest,
} from "./comment.types";

// Rating types
export type {
	Rating,
	CreateRatingRequest,
	UpdateRatingRequest,
} from "./rating.types";

// Stats types
export type {
  TopUploaderResponse,
  TopResourceResponse,
} from './stats.types';

