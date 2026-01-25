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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {currentCourseTitle ? `Học liệu: ${currentCourseTitle}` : "Học liệu của lớp"}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {currentCourseTitle
                            ? "Danh sách tài liệu trong môn học này"
                            : "Danh sách các môn học có tài liệu cho lớp của bạn"}
                    </p>
                </div>
                {currentCourseTitle && (
                    <button
                        onClick={handleBackToFolders}
                        className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100"
                    >
                        <ArrowLeftOutlined /> Quay lại danh sách môn
                    </button>
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

            {/* Main Content */}
            <Card className="shadow-sm border-slate-200/60">
                <div className="space-y-6">
                    {/* Search Bar - Only show at Root level for now (or strictly for searching courses) */}
                    {!currentCourseTitle && (
                        <div className="max-w-2xl mx-auto">
                            <ResourceSearchBox
                                onChange={handleSearch}
                                placeholder="Tìm kiếm môn học..."
                                value={searchKeyword}
                            />
                        </div>
                    )}

                    {/* Content Area */}
                    <div className="min-h-[400px]">
                        {!currentCourseTitle ? (
                            /* Folder Grid View */
                            <FolderGrid
                                folders={folderItems}
                                onFolderClick={handleFolderClick}
                            />
                        ) : (
                            /* Resource List View */
                            <ResourceList
                                resources={resources}
                                loading={isLoadingResources}
                                onView={handleViewResource}
                                onDownload={handleDownload}
                            />
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default StudentResourcePage;
