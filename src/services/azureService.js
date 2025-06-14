import axios from 'axios';

class AzureBlogService {
  constructor() {
    // Use relative URLs - Static Web Apps will proxy to linked Function App
    this.baseURL = '/api';
    
    // No need for function keys when using linked Function App
    // Static Web Apps handles authentication automatically
    
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`Making API call to: ${config.baseURL}${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`API response from ${response.config.url}:`, response.status);
        return response;
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Test connection to linked Function App
  async healthCheck() {
    try {
      // Try to call RSSFeedReader as a health check
      const response = await this.axiosInstance.get('/RSSFeedReader');
      console.log('Health check successful:', response.data);
      return { status: 'connected', data: response.data };
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  // Fetch blog drafts from Azure Blob Storage via RSSFeedReader
  async fetchBlogDrafts() {
    try {
      console.log('Fetching blog drafts from linked Function App...');
      
      // Call your RSSFeedReader function which reads from blob storage
      const response = await this.axiosInstance.get('/RSSFeedReader');
      
      if (response.data) {
        // Transform the response to match your dashboard format
        const blogs = Array.isArray(response.data) ? response.data : [response.data];
        
        return blogs.map(blog => ({
          id: blog.id || Math.random().toString(36).substr(2, 9),
          title: blog.title || 'Untitled Blog Post',
          content: blog.content || blog.description || 'No content available',
          status: blog.status || 'draft',
          createdDate: blog.createdDate || blog.publishDate || new Date().toISOString(),
          author: blog.author || 'JayPCodes',
          category: blog.category || 'Technology',
          readTime: blog.readTime || '5 min read'
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching blog drafts:', error);
      
      // Fallback to mock data if real API fails
      console.log('Falling back to mock data...');
      return this.getMockBlogs();
    }
  }

  // Approve a blog post using ApproveBlog function
  async approveBlog(blogId) {
    try {
      console.log(`Approving blog with ID: ${blogId}`);
      
      const response = await this.axiosInstance.post('/ApproveBlog', {
        blogId: blogId,
        action: 'approve'
      });
      
      console.log('Blog approved successfully:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error approving blog:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Generate a test blog using MockBlogGenerator
  async generateTestBlog() {
    try {
      console.log('Generating test blog...');
      
      const response = await this.axiosInstance.post('/MockBlogGenerator', {
        topic: 'Azure Development',
        generateContent: true
      });
      
      console.log('Test blog generated:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error generating test blog:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Trigger monthly blog scheduler
  async triggerMonthlyScheduler() {
    try {
      console.log('Triggering monthly blog scheduler...');
      
      const response = await this.axiosInstance.post('/MonthlyBlogScheduler');
      
      console.log('Monthly scheduler triggered:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error triggering monthly scheduler:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  }

  // Mock data fallback (same as before)
  getMockBlogs() {
    return [
      {
        id: 'mock-1',
        title: 'Building Scalable Azure Functions for Blog Automation',
        content: `This blog post explores how to create robust Azure Functions that can automatically process RSS feeds and generate blog content. We'll cover best practices for serverless architecture, error handling, and integration with Azure Storage...`,
        status: 'draft',
        createdDate: '2025-06-14T10:30:00Z',
        author: 'JayPCodes',
        category: 'Azure Development',
        readTime: '8 min read'
      },
      {
        id: 'mock-2', 
        title: 'React Dashboard Integration with Azure Static Web Apps',
        content: `Learn how to build a professional dashboard that integrates seamlessly with Azure Functions. This comprehensive guide covers authentication, API integration, and deployment strategies...`,
        status: 'draft',
        createdDate: '2025-06-13T15:45:00Z',
        author: 'JayPCodes',
        category: 'Frontend Development',
        readTime: '6 min read'
      },
      {
        id: 'mock-3',
        title: 'Automated Content Generation with AI and Azure',
        content: `Discover how to leverage AI services within Azure to automatically generate engaging blog content. We'll explore OpenAI integration, content quality controls, and automated publishing workflows...`,
        status: 'published',
        createdDate: '2025-06-12T09:15:00Z',
        author: 'JayPCodes',
        category: 'AI & Machine Learning',
        readTime: '10 min read'
      }
    ];
  }
}

// Export singleton instance
export default new AzureBlogService();