package be.library_digital.demo.service;

import be.library_digital.demo.dto.request.CourseRequest;
import be.library_digital.demo.dto.response.CourseResponse;
import be.library_digital.demo.exception.BadRequestException;
import be.library_digital.demo.exception.ResourceNotFoundException;
import be.library_digital.demo.exception.ForbiddenException;
import be.library_digital.demo.common.UserType;
import be.library_digital.demo.model.Course;
import be.library_digital.demo.model.Department;
import be.library_digital.demo.model.User;
import be.library_digital.demo.repository.CourseRepository;
import be.library_digital.demo.repository.DepartmentRepository;
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
    private final DepartmentRepository departmentRepository;

    private static final String MESSAGE_NOT_FOUND = "Course not found";

    public CourseResponse create(CourseRequest request, User currentUser) {
        if (request.getDepartmentCode() == null || request.getDepartmentCode().isBlank()) {
            throw new BadRequestException("DepartmentCode is required");
        }

        Department department = departmentRepository.findByCodeIgnoreCase(request.getDepartmentCode().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));

        if (courseRepository.existsByCodeIgnoreCase(request.getCode().trim())) {
            throw new BadRequestException("Course code already exists");
        }

        if (currentUser != null && UserType.SUB_ADMIN.equals(currentUser.getType())) {
            if (currentUser.getDepartment() == null ||
                    !currentUser.getDepartment().getId().equals(department.getId())) {
                throw new ForbiddenException("You don't have permission to create course for this department");
            }
        }

        Course course = new Course();
        course.setCode(request.getCode().trim());
        course.setTitle(request.getTitle().trim());
        course.setDepartment(department);

        Course saved = courseRepository.save(course);
        log.info("Created course id={}", saved.getId());
        return CourseResponse.fromCourse(saved);
    }

    public CourseResponse update(String id, CourseRequest request, User currentUser) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        Department department = course.getDepartment();
        if (request.getDepartmentCode() != null && !request.getDepartmentCode().isBlank()) {
            department = departmentRepository.findByCodeIgnoreCase(request.getDepartmentCode().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        }

        // Authorization: ADMIN can update any; SUB_ADMIN can update only courses in their department
        if (currentUser != null && !UserType.ADMIN.equals(currentUser.getType())) {
            if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
                if (currentUser.getDepartment() == null ||
                        department == null ||
                        !currentUser.getDepartment().getId().equals(department.getId())) {
                    throw new ForbiddenException("You don't have permission to update this course");
                }
            } else {
                throw new ForbiddenException("You don't have permission to update this course");
            }
        }

        if (courseRepository.existsByCodeIgnoreCaseAndIdNot(request.getCode().trim(), id)) {
            throw new BadRequestException("Course code already exists");
        }

        course.setCode(request.getCode().trim());
        course.setTitle(request.getTitle().trim());
        course.setDepartment(department);

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

    public List<CourseResponse> getAll(User currentUser, String code, String title, String departmentCode) {
        String codeFilter = code != null ? code.trim().toLowerCase() : "";
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
                        return c.getDepartment() != null &&
                                currentUser.getDepartment().getId().equals(c.getDepartment().getId());
                    }
                    if (UserType.LECTURER.equals(currentUser.getType())) {
                        return c.getDepartment() != null &&
                                currentUser.getDepartment() != null &&
                                currentUser.getDepartment().getId().equals(c.getDepartment().getId());
                    }
                    return false;
                })
                .filter(c -> codeFilter.isEmpty() || (c.getCode() != null && c.getCode().toLowerCase().contains(codeFilter)))
                .filter(c -> titleFilter.isEmpty() || (c.getTitle() != null && c.getTitle().toLowerCase().contains(titleFilter)))
                .filter(c -> {
                    if (!UserType.ADMIN.equals(currentUser.getType())) {
                        return true;
                    }
                    if (deptFilter.isEmpty()) return true;
                    return c.getDepartment() != null &&
                            c.getDepartment().getCode() != null &&
                            c.getDepartment().getCode().toLowerCase().contains(deptFilter);
                })
                .map(CourseResponse::fromCourse)
                .collect(Collectors.toList());
    }

    public void delete(String id, User currentUser) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(MESSAGE_NOT_FOUND));

        // Authorization: ADMIN can delete any; SUB_ADMIN can delete only courses in their department
        if (currentUser != null && !UserType.ADMIN.equals(currentUser.getType())) {
            if (UserType.SUB_ADMIN.equals(currentUser.getType())) {
                if (currentUser.getDepartment() == null ||
                        course.getDepartment() == null ||
                        !course.getDepartment().getId().equals(currentUser.getDepartment().getId())) {
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
                    course.getDepartment() != null &&
                    user.getDepartment().getId().equals(course.getDepartment().getId());
        }
        if (UserType.LECTURER.equals(user.getType())) {
            return user.getDepartment() != null &&
                    course.getDepartment() != null &&
                    user.getDepartment().getId().equals(course.getDepartment().getId());
        }
        return false;
    }
}
