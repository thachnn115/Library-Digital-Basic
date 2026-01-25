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
  programs?: TrainingProgram[];
  trainingProgram?: TrainingProgram;
  program?: TrainingProgram; // Legacy support (derived from programs)
  department?: Department; // Legacy support
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
  code: string;
  title: string;
  department?: Department;
  classroom?: Classroom;
  instructor?: {
    id: string;
    fullName: string;
    email: string;
  };
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
  programCodes: string[];
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
  code: string;
  title: string;
  departmentCode: string;
}

export interface CreateResourceTypeRequest {
  name: string;
  code: string;
  description?: string;
}

