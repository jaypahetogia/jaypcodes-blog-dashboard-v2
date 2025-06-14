import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Calendar, User, RefreshCw, Plus, AlertCircle } from 'lucide-react';
import { azureBlogService } from '../services/azureService';

const BlogDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [approving, setApproving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const blogData = await azureBlogService.fetchBlogDrafts();
      setBlogs(blogData);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError('Failed to load blogs. Using offline data.');
      setBlogs(azureBlogService.getMockBlogs());
    } finally {
      setLoading(false);
    }
  };

  const approveBlog = async (blogId) => {
    setApproving(true);
    try {
      await azureBlogService.approveBlog(blogId);
      setBlogs(blogs.map(blog => 
        blog.id === blogId ? { ...blog, status: 'published' } : blog
      ));
      setSelectedBlog(null);
      setError(null);
    } catch (error) {
      console.error('Error approving blog:', error);
      setError('Failed to approve blog. Please try again.');
    } finally {
      setApproving(false);
    }
  };

  const generateTestBlog = async () => {
    setGenerating(true);
    try {
      await azureBlogService.generateTestBlog();
      setTimeout(() => loadBlogs(), 2000);
    } catch (error) {
      console.error('Error generating test blog:', error);
      setError('Failed to generate test blog.');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'text-green-600 bg-green-100';
      case 'draft': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JayPCodes Blog Dashboard</h1>
                <p className="text-gray-600">Review and manage automated blog posts</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={generateTestBlog}
                disabled={generating}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Test Blog
                  </>
                )}
              </button>
              <button
                onClick={loadBlogs}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedBlog ? (
          /* Blog Preview Modal */
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Blog Preview</h2>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBlog.status)}`}>
                    {getStatusIcon(selectedBlog.status)}
                    <span className="ml-2 capitalize">{selectedBlog.status}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {formatDate(selectedBlog.createdDate)}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Source: {selectedBlog.source}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedBlog.tags.map((tag, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Blog Content */}
              <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />

              {/* Action Buttons */}
              {selectedBlog.status === 'draft' && (
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setSelectedBlog(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => approveBlog(selectedBlog.id)}
                    disabled={approving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {approving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Publish
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Blog List */
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">Blog Posts</h2>
              <p className="text-gray-600">
                {blogs.filter(b => b.status === 'draft').length} draft(s) awaiting review, 
                {' '}{blogs.filter(b => b.status === 'published').length} published
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <div key={blog.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(blog.status)}`}>
                        {getStatusIcon(blog.status)}
                        <span className="ml-1 capitalize">{blog.status}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(blog.createdDate)}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {blog.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4">
                      {blog.summary}
                    </p>
                    
                    <div className="mb-4">
                      <div className="text-xs text-gray-500 mb-2">
                        Source: {blog.source}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="inline-block text-gray-400 text-xs px-2 py-1">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setSelectedBlog(blog)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {blog.status === 'draft' ? 'Review & Approve' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {blogs.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts found</h3>
                <p className="text-gray-600 mb-4">Blog posts will appear here once generated by your automation system.</p>
                <button
                  onClick={generateTestBlog}
                  disabled={generating}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Generate Test Blog
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogDashboard;