package be.library_digital.demo.repository.projection;

public interface UploaderCountProjection {
    String getUserId();
    String getEmail();
    String getFullName();
    Long getDepartmentId();
    String getDepartmentName();
    Long getUploadCount();
}
