# Tạo LECTURER (SUB_ADMIN tự động gán khoa của mình):
    curl -X POST "http://localhost:8080/users" ^
    -H "Authorization: Bearer <TOKEN_SUB_ADMIN>" ^
    -H "Content-Type: application/json" ^
    -d "{
        \"email\":\"newlecturer@example.com\",
        \"password\":\"Pass1234\",
        \"fullName\":\"Lecturer A\",
        \"phone\":\"0901234567\"
    }"

# Tạo SUB_ADMIN (ADMIN bắt buộc kèm khoa):
    curl -X POST "http://localhost:8080/users" ^
    -H "Authorization: Bearer <TOKEN_ADMIN>" ^
    -H "Content-Type: application/json" ^
    -d "{
        \"email\":\"subadmin2@example.com\",
        \"password\":\"Pass1234\",
        \"fullName\":\"Sub Admin 2\",
        \"type\":\"SUB_ADMIN\",
        \"departmentId\":1
    }"

# Reset mật khẩu (ADMIN hoặc SUB_ADMIN trong cùng khoa, không áp dụng cho ADMIN):
    curl -X POST "http://localhost:8080/users/<USER_ID>/reset-password" ^
    -H "Authorization: Bearer <TOKEN_ADMIN_OR_SUBADMIN>" ^
    -H "Content-Type: application/json" ^
    -d "{
        \"newPassword\":\"NewPass123\"
    }"

# Xóa tài khoản (ADMIN bất kỳ; SUB_ADMIN chỉ trong khoa, không xóa ADMIN):
    curl -X DELETE "http://localhost:8080/users/<USER_ID>" ^
    -H "Authorization: Bearer <TOKEN_ADMIN_OR_SUBADMIN>"

# Cập nhật thông tin (ADMIN bất kỳ; SUB_ADMIN trong khoa; tự cập nhật dùng chính ID của mình):
    curl -X PUT "http://localhost:8080/users/<USER_ID>" ^
    -H "Authorization: Bearer <TOKEN_ADMIN_OR_SUBADMIN_OR_SELF>" ^
    -H "Content-Type: application/json" ^
    -d "{
        \"fullName\":\"Updated Name\",
        \"phone\":\"0912345678\",
        \"departmentId\":1
    }"

# Cập nhật avatar (ADMIN bất kỳ; SUB_ADMIN trong khoa; tự cập nhật dùng chính ID):
    curl -X PUT "http://localhost:8080/users/<USER_ID>/avatar" ^
    -H "Authorization: Bearer <TOKEN>" ^
    -F "file=@/path/to/avatar.png"

# Đổi mật khẩu của chính mình (mọi người đã đăng nhập):
    curl -X POST "http://localhost:8080/users/change-password" ^
    -H "Authorization: Bearer <TOKEN_SELF>" ^
    -H "Content-Type: application/json" ^
    -d "{
        \"currentPassword\":\"OldPass123\",
        \"newPassword\":\"NewPass456\"
    }"
### HỌC LIỆU CỦA TÔI
# Danh sách tài liệu đã upload 
curl -X GET "http://localhost:8080/resource/my-uploads" ^
  -H "Authorization: Bearer <TOKEN>"

# Danh sách tài liệu đã xem:
curl -X GET "http://localhost:8080/history/views" ^
  -H "Authorization: Bearer <TOKEN>"

# Danh sách tài liệu đã tải xuống:
curl -X GET "http://localhost:8080/history/downloads" ^
  -H "Authorization: Bearer <TOKEN>"

# API top các giảng viên tải lên nhiều tài liệu nhất (ADMIN xem cả hệ thống, SUB_ADMIN xem trong khoa của mình)
GET /stats/top-uploaders?limit=5

# API top các tài liệu được xem/tải xuống nhiều nhất (ADMIN xem cả hệ thống, SUB_ADMIN xem trong khoa của mình)
GET /stats/top-resources?sort=views|downloads|combined&limit=5

# API lịch sử tài liệu được tải lên theo thời gian gần nhất (ADMIN xem cả hệ thống, SUB_ADMIN xem trong khoa cảu mình)
GET /stats/recent-uploads?limit=10

# API dung lượng đã sử dựng (chỉ phân quyền cho ADMIN)
GET /stats/storage-usage

### Ví dụ cURL quản lý danh mục (Admin tổng, Admin phụ)
# Chương trình đào tạo (ADMIN)
  - Tạo: `curl -X POST http://localhost:8080/program -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"DH\",\"name\":\"Đại học\",\"description\":\"Chương trình đại học\"}"`
  - Sửa: `curl -X PUT http://localhost:8080/program/<PROGRAM_ID> -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"DH\",\"name\":\"Đại học\",\"description\":\"Cập nhật\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/program/<PROGRAM_ID> -H "Authorization: Bearer <ADMIN_TOKEN>"`

# Chuyên ngành (ADMIN)
  - Tạo: `curl -X POST http://localhost:8080/specialization -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"HTTT\",\"name\":\"Hệ thống thông tin\",\"programCode\":\"DH\",\"departmentCode\":\"K1\",\"description\":\"Chuyên ngành HTTT\"}"`
  - Sửa: `curl -X PUT http://localhost:8080/specialization/<SPEC_ID> -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"HTTT\",\"name\":\"Hệ thống thông tin\",\"programCode\":\"DH\",\"departmentCode\":\"K1\",\"description\":\"Cập nhật\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/specialization/<SPEC_ID> -H "Authorization: Bearer <ADMIN_TOKEN>"`

# Khóa (Cohort) (ADMIN)
  - Tạo: `curl -X POST http://localhost:8080/cohort -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"D12\",\"programCode\":\"DH\",\"startYear\":2022,\"endYear\":2026,\"description\":\"Khóa D12\"}"`
  - Sửa: `curl -X PUT http://localhost:8080/cohort/<COHORT_ID> -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"D12\",\"programCode\":\"DH\",\"startYear\":2022,\"endYear\":2026,\"description\":\"Cập nhật\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/cohort/<COHORT_ID> -H "Authorization: Bearer <ADMIN_TOKEN>"`

# Khoa (Department) (ADMIN)
  - Tạo: `curl -X POST http://localhost:8080/department -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"K1\",\"name\":\"CNTT\",\"description\":null}"`
  - Sửa: `curl -X PUT http://localhost:8080/department/1 -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"K1\",\"name\":\"Công nghệ thông tin\",\"description\":\"Cập nhật\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/department/1 -H "Authorization: Bearer <ADMIN_TOKEN>"`

# Lớp (Classroom) (ADMIN)
  - Tạo: `curl -X POST http://localhost:8080/classroom -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"CLASSHTTTD12\",\"name\":\"Lớp HTTT D12\",\"specializationCode\":\"HTTT\",\"cohortCode\":\"D12\",\"description\":\"Lớp HTTT khóa D12\"}"`
  - Sửa: `curl -X PUT http://localhost:8080/classroom/<CLASSROOM_ID> -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"CLASSHTTTD12\",\"name\":\"Lớp HTTT D12\",\"specializationCode\":\"HTTT\",\"cohortCode\":\"D12\",\"description\":\"Cập nhật\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/classroom/<CLASSROOM_ID> -H "Authorization: Bearer <ADMIN_TOKEN>"`

# Học phần (Course) (ADMIN hoặc SUB_ADMIN cùng khoa lớp)
  - Tạo: `curl -X POST http://localhost:8080/course -H "Authorization: Bearer <ADMIN_OR_SUB_TOKEN>" -H "Content-Type: application/json" -d "{\"title\":\"Cấu trúc dữ liệu\",\"description\":\"CTDL\",\"classroomId\":\"<CLASSROOM_ID>\",\"instructorId\":\"<LECTURER_ID>\"}"`
  - Sửa: `curl -X PUT http://localhost:8080/course/<COURSE_ID> -H "Authorization: Bearer <ADMIN_OR_SUB_TOKEN>" -H "Content-Type: application/json" -d "{\"title\":\"Cấu trúc dữ liệu\",\"description\":\"Cập nhật\",\"classroomId\":\"<CLASSROOM_ID>\",\"instructorId\":\"<LECTURER_ID>\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/course/<COURSE_ID> -H "Authorization: Bearer <ADMIN_OR_SUB_TOKEN>"`

# Loại học liệu (Resource Type) (ADMIN)
  - Tạo: `curl -X POST http://localhost:8080/resource-type -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"DOCS\",\"name\":\"Tài liệu tham khảo\",\"description\":\"Word/PDF\"}"`
  - Sửa: `curl -X PUT http://localhost:8080/resource-type/<TYPE_ID> -H "Authorization: Bearer <ADMIN_TOKEN>" -H "Content-Type: application/json" -d "{\"code\":\"DOCS\",\"name\":\"Tài liệu tham khảo\",\"description\":\"Cập nhật\"}"`
  - Xóa: `curl -X DELETE http://localhost:8080/resource-type/<TYPE_ID> -H "Authorization: Bearer <ADMIN_TOKEN>"`

# Xem / Tải xuống tài liệu (ADMIN xem tai lieu toan he thong; SUB_ADMIN/LECTURER chi xem tai lieu cung khoa)
  - Xem inline (xem tăng lượt view):
    curl -X GET "http://localhost:8080/resource/<RESOURCE_ID>/view" -H "Authorization: Bearer <ADMIN_OR_SUB_OR_LECTURER_TOKEN>" -OJ
  - Tải xuống (tăng lượt download):
    curl -X GET "http://localhost:8080/resource/<RESOURCE_ID>/download" -H "Authorization: Bearer <ADMIN_OR_SUB_OR_LECTURER_TOKEN>" -OJ



# Tim kiem tai lieu theo thu muc (LECTURER)
  - Cap 1 (chuong trinh): curl -X GET "http://localhost:8080/resource/browse" -H "Authorization: Bearer <LECTURER_TOKEN>"
  - Cap 2 (chuyen nganh trong chuong trinh): curl -X GET "http://localhost:8080/resource/browse?programCode=DH" -H "Authorization: Bearer <LECTURER_TOKEN>"
  - Cap 3 (hoc phan trong chuyen nganh): curl -X GET "http://localhost:8080/resource/browse?specializationCode=HTTT" -H "Authorization: Bearer <LECTURER_TOKEN>"
  - Cap 4 (giang vien cua hoc phan): curl -X GET "http://localhost:8080/resource/browse?courseId=<COURSE_ID>" -H "Authorization: Bearer <LECTURER_TOKEN>"
  - Cap 5 (lop giang vien da day hoc phan): curl -X GET "http://localhost:8080/resource/browse?courseId=<COURSE_ID>&lecturerId=<LECTURER_ID>" -H "Authorization: Bearer <LECTURER_TOKEN>"
  - Cap 6 (tai lieu cua lop do): curl -X GET "http://localhost:8080/resource/browse?courseId=<COURSE_ID>&lecturerId=<LECTURER_ID>&classroomId=<CLASSROOM_ID>" -H "Authorization: Bearer <LECTURER_TOKEN>"
