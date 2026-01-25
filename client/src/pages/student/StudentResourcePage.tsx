import { useState, useMemo } from "react";
import { Card } from "antd";
import { useQuery } from "@tanstack/react-query";
import { resourceApi } from "@/api/resource.api";
import { ResourceSearchBox } from "@/components/modules/resource/ResourceSearchBox";
import { ResourceList } from "@/components/modules/resource/ResourceList";
import {
    FolderGrid,
    type FolderItem,
} from "@/components/modules/resource/FolderGrid";
import { ResourceViewer } from "@/components/modules/resource/ResourceViewer";
import type { Resource } from "@/types/resource.types";
import { downloadFile } from "@/utils/file.utils";
import { message } from "antd";
import {
    ArrowLeftOutlined,
} from "@ant-design/icons";

const StudentResourcePage: React.FC = () => {
    // State
    const [searchKeyword, setSearchKeyword] = useState("");
    const [viewingResource, setViewingResource] = useState<Resource | null>(null);

    // Browse state
    // If currentFolder is null -> Viewing Course List (Root)
    // If currentFolder is set -> Viewing Resources in that Course
    const [currentCourseTitle, setCurrentCourseTitle] = useState<string | null>(null);

    // --- Queries ---

    // 1. Browse/Search Folders (Courses)
    // Only fetch this when we are at Root level (currentCourseTitle is null)
    const { data: folderData } = useQuery({
        queryKey: ["student", "folders", searchKeyword],
        queryFn: () => {
            // If keyword exists, use search endpoint, otherwise browse endpoint
            if (searchKeyword.trim()) {
                return resourceApi.searchFoldersForStudent(searchKeyword);
            }
            return resourceApi.browseFoldersForStudent(null);
        },
        enabled: !currentCourseTitle, // Only fetch folders when at root
    });

    // 2. Browse Resources (in a Course)
    // Only fetch when a course is selected
    const { data: resourceData, isLoading: isLoadingResources } = useQuery({
        queryKey: ["student", "resources", currentCourseTitle],
        queryFn: () => resourceApi.browseFoldersForStudent(currentCourseTitle!),
        enabled: !!currentCourseTitle,
    });

    // --- Handlers ---

    const handleSearch = (keyword: string) => {
        setSearchKeyword(keyword);
        // If searching, we reset to root view to show folder results
        setCurrentCourseTitle(null);
    };

    const handleFolderClick = (folder: FolderItem) => {
        // Folder ID in this context is the Course Title
        setCurrentCourseTitle(folder.title); // Using title as ID for next level
    };

    const handleBackToFolders = () => {
        setCurrentCourseTitle(null);
        setViewingResource(null);
    };

    const handleViewResource = (resource: Resource) => {
        setViewingResource(resource);
    };

    const handleDownload = async (resource: Resource) => {
        try {
            await downloadFile(resource.id, resource.title);
            message.success("Bắt đầu tải xuống...");
        } catch (error) {
            message.error("Lỗi khi tải xuống");
        }
    };

    // --- Render Helpers ---

    // Transform backend folder nodes to FolderItem[]
    const folderItems: FolderItem[] = useMemo(() => {
        if (!folderData?.nodes) return [];
        return folderData.nodes.map((node: any) => ({
            id: node.id,
            title: node.name, // Map name to title
            type: "custom", // Use valid type from FolderItem interface
            itemCount: undefined,
        }));
    }, [folderData]);

    const resources = resourceData?.resources || [];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Modern Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                <div className="flex-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        Trung tâm học tập
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                        {currentCourseTitle ? (
                            <span className="flex items-center gap-3">
                                <span className="text-slate-400">Học liệu:</span> {currentCourseTitle}
                            </span>
                        ) : (
                            "Cấu trúc Môn học"
                        )}
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">
                        {currentCourseTitle
                            ? "Duyệt qua danh sách học liệu khoa học được tổ chức cho môn học này"
                            : "Hệ thống các môn học được đồng bộ theo lớp của bạn"}
                    </p>
                </div>

                {currentCourseTitle && (
                    <Button
                        onClick={handleBackToFolders}
                        icon={<ArrowLeftOutlined />}
                        className="rounded-lg h-10 px-5 font-bold text-slate-600 border-slate-200 hover:text-blue-600 hover:border-blue-600 transition-all flex items-center justify-center"
                    >
                        Quay lại danh sách
                    </Button>
                )}
            </div>

            {/* Viewer Modal */}
            {viewingResource && (
                <ResourceViewer
                    resource={viewingResource}
                    open={!!viewingResource}
                    onClose={() => setViewingResource(null)}
                />
            )}

            {/* Integrated Content Container */}
            <div className="scientific-card p-4 md:p-8 bg-white/50 backdrop-blur-sm">
                <div className="space-y-8">
                    {/* Search & Statistics Bar */}
                    {!currentCourseTitle && (
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-slate-100/50 p-6 rounded-2xl border border-slate-200/40">
                                <ResourceSearchBox
                                    onChange={handleSearch}
                                    placeholder="Tìm nhanh mã hoặc tên môn học..."
                                    value={searchKeyword}
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation Indicator for Folder View */}
                    {!currentCourseTitle && folderItems.length > 0 && (
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Danh sách môn học ({folderItems.length})
                            </span>
                        </div>
                    )}

                    {/* Content Area Rendering */}
                    <div className="min-h-[400px]">
                        {!currentCourseTitle ? (
                            <FolderGrid
                                folders={folderItems}
                                onFolderClick={handleFolderClick}
                            />
                        ) : (
                            <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
                                <ResourceList
                                    resources={resources}
                                    loading={isLoadingResources}
                                    onView={handleViewResource}
                                    onDownload={handleDownload}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentResourcePage;
