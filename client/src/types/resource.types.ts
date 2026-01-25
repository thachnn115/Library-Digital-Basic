// Resource Types
export interface Resource {
  id: string;
  title: string;
  description?: string;
  courseId?: string;
  course?: Course;
  type?: ResourceType;
  fileUrl?: string;
  sizeBytes?: number;
  createdAt: string;
  uploadedBy?: PublicUser;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  stats?: ResourceStats;
}

export interface ResourceStats {
  views?: number;
  downloads?: number;
  comments?: CommentResponse[];
  ratingCount?: number;
  ratingAverage?: number;
}

export interface CommentResponse {
  id: string;
  content: string;
  resourceId: string;
  author?: PublicUser;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role?: string;
  userIdentifier?: string;
  gender?: string;
  dateOfBirth?: string;
  phone?: string;
  type?: string;
  status?: string;
  avatarUrl?: string;
  department?: DepartmentResponse;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
}

export interface ResourceType {
  id: string;
  code: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Classroom {
  id: number;
  name: string;
  code: string;
  trainingProgram?: TrainingProgram;
  specialization?: Specialization;
  cohort?: Cohort;
  course?: Course;
}

export interface TrainingProgram {
  id: number;
  name: string;
  code: string;
  description?: string;
}

export interface Specialization {
  id: number;
  name: string;
  code: string;
  description?: string;
  programs?: TrainingProgram[];
  trainingProgram?: TrainingProgram;
  program?: TrainingProgram;
}

export interface Cohort {
  id: number;
  name: string;
  code: string;
  startYear: number;
  endYear?: number;
}

export interface Course {
  id: number | string;
  code: string;
  title: string;
  department?: DepartmentResponse;
}

export interface ResourceSearchParams {
  courseKeyword?: string;
  programCode?: string[];
  specializationCode?: string[];
  cohortCode?: string[];
  classroomId?: string[];
  lecturerId?: string[];
  typeId?: string[];
}

export type ResourceSortOption = 
  | 'newest' // Mới -> Cũ (mặc định)
  | 'oldest' // Cũ -> Mới
  | 'year' // Năm (theo năm của createdAt)
  | 'downloads' // Lượt tải
  | 'alphabetical' // Bảng chữ cái
  | 'lecturer'; // Giảng viên (theo tên)

export interface ResourceUploadRequest {
  title: string;
  description?: string;
  courseId: string;
  resourceTypeId: string;
}

export interface ResourceBrowseParams {
  programCode?: string;
  specializationCode?: string;
  courseTitle?: string;
  lecturerId?: string;
  classroomId?: string;
}

export interface ResourceFolderResponse {
  level: 'PROGRAM' | 'SPECIALIZATION' | 'COURSE' | 'LECTURER' | 'CLASSROOM' | 'RESOURCE';
  nodes?: FolderNodeResponse[];
  resources?: Resource[];
  currentUrl?: string;
  nextParam?: string;
  parentUrl?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export interface FolderNodeResponse {
  type: 'PROGRAM' | 'SPECIALIZATION' | 'COURSE' | 'LECTURER' | 'CLASSROOM' | 'RESOURCE';
  id: string;
  code?: string;
  name: string;
  extra?: string;
}

export interface BreadcrumbItem {
  label: string;
  url: string;
}

