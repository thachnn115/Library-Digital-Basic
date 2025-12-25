package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.CourseRequest;
import be.library_digital.demo.dto.response.CourseResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.model.Course;
import be.library_digital.demo.model.Classroom;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.CourseRepository;
import be.library_digital.demo.repository.ClassroomRepository;
import be.library_digital.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j(topic = "COURSE-SERVICE")
public class CourseService {

    private final CourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    private static final String MESSAGE_NOT_FOUND = "Course not found";

    public CourseResponse create(CourseRequest request, User currentUser) {
        if (request.getClassroomId() == null || request.getClassroomId().isBlank()) {
            throw new BadRequestException("ClassroomId is required");
        }

        Classroom classroom = classroomRepository.findById(request.getClassroomId().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        if (classroom.getSpecialization() == null || classroom.getSpecialization().getDepartment() == null) {
            throw new BadRequestException("Classroom must be linked to a specialization with department");
        }

        if (currentUser != null && UserType.SUB_ADMIN.equals(currentUser.getType())) {
            if (currentUser.getDepartment() == null ||
                    classroom.getSpecialization() == null ||
                    classroom.getSpecialization().getDepartment() == null ||
                    !classroom.getSpecialization().getDepartment().getId().equals(currentUser.getDepartment().getId())) {
                throw new ForbiddenException("You don't have permission to create course for this department");
            }
        }

        // Enforce course title unique per specialization
        if (classroom.getSpecialization() != null &&
                courseRepository.existsByClassroom_Specialization_IdAndTitleIgnoreCase(classroom.getSpecialization().getId(), request.getTitle().trim())) {
            throw new BadRequestException("Course title already exists in this specialization");
        }

        User instr = null;
        if (request.getInstructorId() != null) {
            instr = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        }

        Course course = new Course();
        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setClassroom(classroom);
        course.setInstructor(instr);

        Course saved = courseRepository.save(course);
        log.info("Created course id={}", saved.getId());
        return CourseResponse.fromCourse(saved);
    }

    public CourseResponse update(String id, CourseRequest request, User currentUser) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        Classroom classroom = course.getClassroom();
        // Authorization: ADMIN can update any; SUB_ADMIN can update only courses in their department via classroom->specialization->department
        if (currentUser != null && !UserType.ADMIN.equals(currentUser.getType())) {
            if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
                if (course.getClassroom() == null || course.getClassroom().getSpecialization() == null ||
                        course.getClassroom().getSpecialization().getDepartment() == null ||
                        currentUser.getDepartment() == null ||
                        !course.getClassroom().getSpecialization().getDepartment().getId().equals(currentUser.getDepartment().getId())) {
                    throw new ForbiddenException("You don't have permission to update this course");
                }
            } else {
                throw new ForbiddenException("You don't have permission to update this course");
            }
        } else {
            if(request.getClassroomId() != null && !request.getClassroomId().isBlank()) {
                classroom = classroomRepository.findById(request.getClassroomId().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));
            }
        }

        if (classroom == null) {
            throw new BadRequestException("ClassroomId is required");
        }

        if (classroom.getSpecialization() != null &&
                courseRepository.existsByClassroom_Specialization_IdAndTitleIgnoreCaseAndIdNot(
                        classroom.getSpecialization().getId(), request.getTitle().trim(), id)) {
            throw new BadRequestException("Course title already exists in this specialization");
        }

        User instr = null;
        if (request.getInstructorId() != null) {
            instr = userRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        }

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setClassroom(classroom);
        course.setInstructor(instr);

        Course saved = courseRepository.save(course);
        log.info("Updated course id={}", saved.getId());
        return CourseResponse.fromCourse(saved);
    }

    public CourseResponse getById(String id, User currentUser) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        if (!canView(currentUser, course)) {
            throw new ForbiddenException("You don't have permission to view this course");
        }

        return CourseResponse.fromCourse(course);
    }

    public List<CourseResponse> getAll(User currentUser, String cohortCode, String specializationCode, String title, String departmentCode) {
        String cohortFilter = cohortCode != null ? cohortCode.trim().toLowerCase() : "";
        String specFilter = specializationCode != null ? specializationCode.trim().toLowerCase() : "";
        String titleFilter = title != null ? title.trim().toLowerCase() : "";
        String deptFilter = departmentCode != null ? departmentCode.trim().toLowerCase() : "";

        List<Course> courses = courseRepository.findAll();

        return courses.stream()
                .filter(c -> {
                    // role-based visibility
                    if (currentUser == null || currentUser.getType() == null) return false;
                    if (UserType.ADMIN.equals(currentUser.getType())) {
                        return true;
                    }
                    if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
                        if (currentUser.getDepartment() == null) return false;
                        return c.getClassroom() != null &&
                                c.getClassroom().getSpecialization() != null &&
                                c.getClassroom().getSpecialization().getDepartment() != null &&
                                currentUser.getDepartment().getId().equals(c.getClassroom().getSpecialization().getDepartment().getId());
                    }
                    if (UserType.LECTURER.equals(currentUser.getType())) {
                        return c.getInstructor() != null && c.getInstructor().getId().equals(currentUser.getId());
                    }
                    return false;
                })
                .filter(c -> cohortFilter.isEmpty() || (c.getClassroom() != null && c.getClassroom().getCohort() != null &&
                        c.getClassroom().getCohort().getCode() != null && c.getClassroom().getCohort().getCode().toLowerCase().contains(cohortFilter)))
                .filter(c -> specFilter.isEmpty() || (c.getClassroom() != null && c.getClassroom().getSpecialization() != null &&
                        c.getClassroom().getSpecialization().getCode() != null &&
                        c.getClassroom().getSpecialization().getCode().toLowerCase().contains(specFilter)))
                .filter(c -> titleFilter.isEmpty() || (c.getTitle() != null && c.getTitle().toLowerCase().contains(titleFilter)))
                .filter(c -> {
                    if (!UserType.ADMIN.equals(currentUser.getType())) {
                        return true;
                    }
                    if (deptFilter.isEmpty()) return true;
                    return c.getClassroom() != null &&
                            c.getClassroom().getSpecialization() != null &&
                            c.getClassroom().getSpecialization().getDepartment() != null &&
                            c.getClassroom().getSpecialization().getDepartment().getCode() != null &&
                            c.getClassroom().getSpecialization().getDepartment().getCode().toLowerCase().contains(deptFilter);
                })
                .map(CourseResponse::fromCourse)
                .collect(Collectors.toList());
    }

    public void delete(String id, User currentUser) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        // Authorization: ADMIN can delete any; SUB_ADMIN can delete only courses in their department via classroom->specialization->department
        if (currentUser != null && !UserType.ADMIN.equals(currentUser.getType())) {
            if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
                if (course.getClassroom() == null || course.getClassroom().getSpecialization() == null ||
                        course.getClassroom().getSpecialization().getDepartment() == null ||
                        currentUser.getDepartment() == null ||
                        !course.getClassroom().getSpecialization().getDepartment().getId().equals(currentUser.getDepartment().getId())) {
                    throw new ForbiddenException("You don't have permission to delete this course");
                }
            } else {
                throw new ForbiddenException("You don't have permission to delete this course");
            }
        }

        courseRepository.delete(course);
        log.info("Deleted course id={}", id);
    }

    private boolean canView(User user, Course course) {
        if (user == null || user.getType() == null || course == null) {
            return false;
        }
        if (UserType.ADMIN.equals(user.getType())) {
            return true;
        }
        if (UserType.SUB_ADMIN.equals(user.getType())) {
            return user.getDepartment() != null &&
                    course.getClassroom() != null &&
                    course.getClassroom().getSpecialization() != null &&
                    course.getClassroom().getSpecialization().getDepartment() != null &&
                    user.getDepartment().getId().equals(course.getClassroom().getSpecialization().getDepartment().getId());
        }
        if (UserType.LECTURER.equals(user.getType())) {
            return course.getInstructor() != null &&
                    user.getId().equals(course.getInstructor().getId());
        }
        return false;
    }
}
