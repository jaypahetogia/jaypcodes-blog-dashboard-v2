import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, Clock, Eye, Calendar, User, RefreshCw, Plus, AlertCircle } from 'lucide-react';
import azureBlogService from '../services/azureService';

const BlogDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [approving, setApproving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  useEffect(() => {
    loadBlogs();
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      console.log('Checking Azure Functions connection...');
      const healthResult = await azureBlogService.healthCheck();
      console.log('Health check result:', healthResult);
      setConnectionStatus(healthResult.status);
    } catch (error) {
      console.error('Health check failed:', error);
      setConnectionStatus('error');
    }
  };

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading blogs from Azure Functions...');
      
      const blogData = await azureBlogService.fetchBlogDrafts();
      console.log('Received blog data:', blogData);
      
      // Safely process the blog data
      const processedBlogs = Array.isArray(blogData) ? blogData.map(processBlogItem) : [processBlogItem(blogData)];
      
      setBlogs(processedBlogs.filter(blog => blog !== null));
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError(`Failed to load blogs: ${error.message}`);
      
      // Fallback to mock data on error
      console.log('Loading fallback mock data...');
      const mockBlogs = azureBlogService.getMockBlogs();
      setBlogs(mockBlogs.map(processBlogItem));
    } finally {
      setLoading(false);
    }
  };

  // Safely process blog items to handle various data structures
  const processBlogItem = (blog) => {
    if (!blog || typeof blog !== 'object') {
      console.warn('Invalid blog item:', blog);
      return null;
    }

    try {
      return {
        id: blog.id || blog.guid || Math.random().toString(36).substr(2, 9),
        title: blog.title || blog.name || 'Untitled Blog Post',
        content: blog.content || blog.description || blog.summary || 'No content available',
        status: blog.status || 'draft',
        createdDate: blog.createdDate || blog.publishDate || blog.date || new Date().toISOString(),
        author: blog.author || 'JayPCodes',
        category: blog.category || blog.tags?.[0] || 'Technology',
        readTime: blog.readTime || '5 min read',
        // Handle tags safely - check if it exists and is an array
        tags: Array.isArray(blog.tags) ? blog.tags : (blog.tags ? [blog.tags] : []),
        // Handle any additional properties
        link: blog.link || blog.url,
        image: blog.image || blog.thumbnail
      };
    } catch (error) {
      console.error('Error processing blog item:', blog, error);
      return null;
    }
  };

  const handleApprove = async (blogId) => {
    try {
      setApproving(true);
      console.log('Approving blog:', blogId);
      
      const result = await azureBlogService.approveBlog(blogId);
      console.log('Approval result:', result);
      
      if (result.success) {
        // Update the blog status locally
        setBlogs(blogs.map(blog => 
          blog.id === blogId 
            ? { ...blog, status: 'published' }
            : blog
        ));
        alert('Blog approved successfully!');
      } else {
        alert(`Failed to approve blog: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving blog:', error);
      alert(`Error approving blog: ${error.message}`);
    } finally {
      setApproving(false);
    }
  };

  const handleGenerateTestBlog = async () => {
    try {
      setGenerating(true);
      console.log('Generating test blog...');
      
      const result = await azureBlogService.generateTestBlog();
      console.log('Generation result:', result);
      
      if (result.success) {
        alert('Test blog generated successfully!');
        // Reload blogs to show the new one
        await loadBlogs();
      } else {
        alert(`Failed to generate test blog: ${result.error}`);
      }
    } catch (error) {
      console.error('Error generating test blog:', error);
      alert(`Error generating test blog: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const ConnectionStatus = () => (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
      connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
      connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
      'bg-yellow-100 text-yellow-800'
    }`}>
      <div className={`w-2 h-2 rounded-full ${
        connectionStatus === 'connected' ? 'bg-green-500' :
        connectionStatus === 'error' ? 'bg-red-500' :
        'bg-yellow-500'
      }`} />
      Azure Functions: {
        connectionStatus === 'connected' ? 'Connected' :
        connectionStatus === 'error' ? 'Disconnected' :
        'Checking...'
      }
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JayPCodes Blog Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your automated blog posts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ConnectionStatus />
              <button
                onClick={handleGenerateTestBlog}
                disabled={generating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {generating ? 'Generating...' : 'Generate Test Blog'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading Blogs</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={loadBlogs}
                className="mt-2 text-red-800 underline hover:no-underline"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.filter(blog => blog.status === 'draft').length}
                </p>
                <p className="text-sm text-gray-600">Drafts</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {blogs.filter(blog => blog.status === 'published').length}
                </p>
                <p className="text-sm text-gray-600">Published</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blog List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Blog Posts</h2>
          </div>
          
          <div className="divide-y">
            {blogs.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                <p className="text-gray-600 mb-4">Generate a test blog to get started</p>
                <button
                  onClick={handleGenerateTestBlog}
                  disabled={generating}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  Generate Test Blog
                </button>
              </div>
            ) : (
              blogs.map((blog) => (
                <div key={blog.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{blog.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStatusColor(blog.status)}`}>
                          {getStatusIcon(blog.status)}
                          {blog.status || 'draft'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {blog.content.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {blog.author}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(blog.createdDate)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {blog.readTime}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setSelectedBlog(blog)}
                        className="flex items-center gap-1 px-3 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      
                      {blog.status === 'draft' && (
                        <button
                          onClick={() => handleApprove(blog.id)}
                          disabled={approving}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {approving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Blog Preview</h2>
              <button
                onClick={() => setSelectedBlog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="prose max-w-none">
                <h1 className="text-2xl font-bold mb-4">{selectedBlog.title}</h1>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                  <span>By {selectedBlog.author}</span>
                  <span>•</span>
                  <span>{formatDate(selectedBlog.createdDate)}</span>
                  <span>•</span>
                  <span>{selectedBlog.readTime}</span>
                </div>
                
                <div className="whitespace-pre-wrap">
                  {selectedBlog.content}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBlog.status)}`}>
                {getStatusIcon(selectedBlog.status)}
                {selectedBlog.status}
              </span>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedBlog.status === 'draft' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedBlog.id);
                      setSelectedBlog(null);
                    }}
                    disabled={approving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve & Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogDashboard;