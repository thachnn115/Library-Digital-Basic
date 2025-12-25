package be.library_digital.demo.repository;

import be.library_digital.demo.common.ApprovalStatus;
import be.library_digital.demo.model.Resource;
import be.library_digital.demo.repository.projection.UploaderCountProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, String> {

    List<Resource> findByCourseId(String courseId);

    List<Resource> findByCourse_Classroom_Specialization_Department_Id(Long departmentId);

    List<Resource> findByUploadedBy_Id(String userId);

    List<Resource> findByApprovalStatus(ApprovalStatus status);

    List<Resource> findByCourse_Id(String courseId);

    List<Resource> findByCourse_IdAndUploadedBy_IdAndCourse_Classroom_Id(String courseId, String lecturerId, String classroomId);

    @Query("""
            select r.uploadedBy.id as userId,
                   r.uploadedBy.email as email,
                   r.uploadedBy.fullName as fullName,
                   r.uploadedBy.department.id as departmentId,
                   r.uploadedBy.department.name as departmentName,
                   count(r.id) as uploadCount
            from Resource r
            where (:deptId is null or r.course.classroom.specialization.department.id = :deptId)
            group by r.uploadedBy.id, r.uploadedBy.email, r.uploadedBy.fullName,
                     r.uploadedBy.department.id, r.uploadedBy.department.name
            order by uploadCount desc
            """)
    List<UploaderCountProjection> findTopUploaders(@Param("deptId") Long deptId, Pageable pageable);

    @Query("""
            select r from Resource r
            where (:deptId is null or r.course.classroom.specialization.department.id = :deptId)
            order by r.views desc
            """)
    List<Resource> findTopByViews(@Param("deptId") Long deptId, Pageable pageable);

    @Query("""
            select r from Resource r
            where (:deptId is null or r.course.classroom.specialization.department.id = :deptId)
            order by r.downloads desc
            """)
    List<Resource> findTopByDownloads(@Param("deptId") Long deptId, Pageable pageable);

    @Query("""
            select r from Resource r
            where (:deptId is null or r.course.classroom.specialization.department.id = :deptId)
            order by r.createdAt desc
            """)
    List<Resource> findRecentUploads(@Param("deptId") Long deptId, Pageable pageable);

    @Query("""
            select coalesce(sum(r.sizeBytes),0) from Resource r
            """)
    Long sumAllSizeBytes();
}
