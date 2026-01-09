import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Layout } from '../Layout/Layout';
import { useAuth } from '../../contexts/AuthContext';

interface Material {
    id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'doc' | 'other';
    subject: string;
    file_url: string;
    file_size?: string;
    downloads: number;
    tutor_id: string;
    created_at: string;
    tutor_name?: string; // We'll join this fetch
}

interface StudentMaterialsPageProps {
    isEmbedded?: boolean;
}

export const StudentMaterialsPage: React.FC<StudentMaterialsPageProps> = ({ isEmbedded = false }) => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterSubject, setFilterSubject] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadMaterials();
    }, [user]);

    const loadMaterials = async () => {
        try {
            setLoading(true);

            // Fetch materials
            const { data: materialsData, error } = await supabase
                .from('materials')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            // Prepare mock data if no data exists (FOR DEMO PURPOSES)
            if (!materialsData || materialsData.length === 0) {
                const mockMaterials: Material[] = [
                    {
                        id: '1',
                        title: 'Grade 10 Mathematics - Algebra Basics',
                        description: 'Comprehensive notes on algebraic expressions and equations.',
                        type: 'pdf',
                        subject: 'Mathematics',
                        file_url: '#',
                        file_size: '2.4 MB',
                        downloads: 125,
                        tutor_id: 'tutor1',
                        created_at: new Date().toISOString(),
                        tutor_name: 'Mr. Smith'
                    },
                    {
                        id: '2',
                        title: 'Physics - Newton\'s Laws',
                        description: 'Summary of Newton\'s three laws of motion with examples.',
                        type: 'doc',
                        subject: 'Physical Sciences',
                        file_url: '#',
                        file_size: '1.1 MB',
                        downloads: 89,
                        tutor_id: 'tutor2',
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        tutor_name: 'Mrs. Dlamini'
                    },
                    {
                        id: '3',
                        title: 'English Poetry Analysis',
                        description: 'Guide to analyzing setwork poems for Grade 12.',
                        type: 'pdf',
                        subject: 'English',
                        file_url: '#',
                        file_size: '3.5 MB',
                        downloads: 204,
                        tutor_id: 'tutor3',
                        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                        tutor_name: 'Ms. Johnson'
                    },
                    {
                        id: '4',
                        title: 'Introduction to Accounting',
                        description: 'Basic accounting equation and double-entry system.',
                        type: 'video',
                        subject: 'Accounting',
                        file_url: '#',
                        file_size: 'N/A',
                        downloads: 56,
                        tutor_id: 'tutor4',
                        created_at: new Date(Date.now() - 259200000).toISOString(),
                        tutor_name: 'Mr. Nkosi'
                    }
                ];
                setMaterials(mockMaterials);
            } else {
                // In a real app, we would also fetch tutor names here or use a join
                setMaterials(materialsData as Material[]);
            }

        } catch (error) {
            console.error('Error loading materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return (
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
            case 'video':
                return (
                    <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'doc':
                return (
                    <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                );
        }
    };

    const filteredMaterials = materials.filter(material => {
        const matchesSubject = filterSubject === 'All' || material.subject === filterSubject;
        const matchesSearch = material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            material.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSubject && matchesSearch;
    });

    const subjects = ['All', ...Array.from(new Set(materials.map(m => m.subject)))];

    const Content = () => (
        <div className={isEmbedded ? "" : "p-6"}>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Materials</h1>
                <p className="text-gray-600">Access study guides, notes, and past papers for your subjects.</p>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
                <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0">
                    {subjects.map(subject => (
                        <button
                            key={subject}
                            onClick={() => setFilterSubject(subject)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${filterSubject === subject
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {subject}
                        </button>
                    ))}
                </div>
            </div>

            {/* Materials Grid */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <div key={material.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    {getFileIcon(material.type)}
                                </div>
                                <span className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-md">
                                    {material.subject}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{material.title}</h3>
                            <p className="text-gray-500 text-sm mb-4 line-clamp-2">{material.description}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400">Added by</span>
                                    <span className="text-sm font-medium text-gray-700">{material.tutor_name || 'Tutor'}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-400 block">{material.file_size || 'N/A'}</span>
                                    <span className="text-xs text-gray-400">{material.downloads} downloads</span>
                                </div>
                            </div>

                            <button
                                className="w-full mt-4 bg-gray-900 text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                onClick={() => alert('Download functionality would connect to storage bucket here.')}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900">No materials found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
    );

    if (isEmbedded) {
        return <Content />;
    }

    return (
        <Layout>
            <Content />
        </Layout>
    );
};
