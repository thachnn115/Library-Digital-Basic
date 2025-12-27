// Department & Related Types
export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgram {
  id: number;
  name: string;
  code: string;
  description?: string;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface Specialization {
  id: number | string;
  name: string;
  code: string;
  description?: string;
  trainingProgram?: TrainingProgram;
  program?: TrainingProgram; // Backend may return 'program'
  department?: Department; // Backend returns department
  createdAt: string;
  updatedAt: string;
}

export interface Cohort {
  id: number | string;
  code: string;
  startYear: number;
  endYear?: number;
  description?: string;
  program?: TrainingProgram; // Backend returns 'program' not 'trainingProgram'
  createdAt: string;
  updatedAt: string;
}

export interface Classroom {
  id: number;
  name: string;
  code: string;
  trainingProgram?: TrainingProgram;
  specialization?: Specialization;
  cohort?: Cohort;
  course?: Course;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: number | string;
  title?: string; // Backend returns 'title'
  name?: string; // Legacy support
  code?: string; // Legacy support
  credits?: number;
  description?: string;
  department?: Department;
  classroom?: Classroom; // Backend returns classroom
  instructor?: {
    id: string;
    fullName: string;
    email: string;
  }; // Backend returns instructor as PublicUser
  createdAt: string;
  updatedAt: string;
}

export interface ResourceType {
  id: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
}

export interface CreateTrainingProgramRequest {
  name: string;
  code: string;
  description?: string;
}

export interface CreateSpecializationRequest {
  name: string;
  code: string;
  description?: string;
  programCode: string;
  departmentCode: string;
}

export interface CreateCohortRequest {
  code: string;
  programCode: string;
  startYear: number;
  endYear: number;
  description?: string;
}

export interface CreateClassroomRequest {
  name: string;
  code: string;
  specializationCode: string;
  cohortCode: string;
  description?: string;
}

export interface CreateCourseRequest {
  title: string;
  description?: string;
  classroomId: string;
  instructorId?: string;
}

export interface CreateResourceTypeRequest {
  name: string;
  code: string;
  description?: string;
}

