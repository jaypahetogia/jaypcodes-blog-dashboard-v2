// Azure Blob Storage Integration Service
// This service connects your dashboard to your Azure Functions and Blob Storage

const AZURE_FUNCTIONS = {
  RSS_READER: 'https://jaypcodes-blog-functions-v2.azurewebsites.net/api/RSSFeedReader',
  APPROVE_BLOG: 'https://jaypcodes-blog-functions-v2.azurewebsites.net/api/ApproveBlog',
  MOCK_GENERATOR: 'https://jaypcodes-blog-functions-v2.azurewebsites.net/api/MockBlogGenerator',
  SCHEDULER: 'https://jaypcodes-blog-functions-v2.azurewebsites.net/api/MonthlyBlogScheduler'
};

const FUNCTION_KEYS = {
  RSS_READER: '_A6sI4sP0n52Urqn1ELXhumTym6Iok80m-snS6bJYC35AzFu4jUm8g',
  APPROVE_BLOG: '6lwd4VMOXIcoPNMt2R_Ag3PRp1ytbT_6aG2rZI44XiYqAzFuKoJ_ag',
  MOCK_GENERATOR: 'bUCtFL243vwjxUcVQYaSh8_yHCLwWS1oGVAcrDQ4uWPbAzFuxKZ_Eg',
  SCHEDULER: 'Xm8pJSuXzFE2_HLKhH7Of-yeYMGRMpGyLSl3Twxkg7C7AzFudWu3Lw'
};

export class AzureBlogService {
  
  async fetchBlogDrafts() {
    try {
      const response = await fetch(`${AZURE_FUNCTIONS.RSS_READER}?action=listDrafts`, {
        method: 'GET',
        headers: {
          'x-functions-key': FUNCTION_KEYS.RSS_READER,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.blogs || [];
    } catch (error) {
      console.error('Error fetching blog drafts:', error);
      return this.getMockBlogs();
    }
  }

  async approveBlog(blogId) {
    try {
      const response = await fetch(AZURE_FUNCTIONS.APPROVE_BLOG, {
        method: 'POST',
        headers: {
          'x-functions-key': FUNCTION_KEYS.APPROVE_BLOG,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          blogId: blogId,
          action: 'approve'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error approving blog:', error);
      throw error;
    }
  }

  async generateTestBlog() {
    try {
      const response = await fetch(AZURE_FUNCTIONS.MOCK_GENERATOR, {
        method: 'POST',
        headers: {
          'x-functions-key': FUNCTION_KEYS.MOCK_GENERATOR,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trigger: 'manual',
          source: 'dashboard'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating test blog:', error);
      throw error;
    }
  }

  getMockBlogs() {
    return [
      {
        id: 'blog-2025-01-15-001',
        title: 'The Future of Cloud Computing: Azure Innovations in 2025',
        summary: 'Exploring the latest Azure features and innovations that are shaping the future of cloud computing...',
        content: `<h1>The Future of Cloud Computing: Azure Innovations in 2025</h1>
        
        <p>Cloud computing continues to evolve at an unprecedented pace, and Microsoft Azure is at the forefront of this transformation. In 2025, we're witnessing groundbreaking innovations that are reshaping how businesses approach digital infrastructure.</p>
        
        <h2>Key Innovations This Year</h2>
        <ul>
          <li><strong>Azure Quantum Computing Services</strong> - Making quantum computing accessible to developers</li>
          <li><strong>Enhanced AI Integration</strong> - Deeper integration with GPT models and custom AI solutions</li>
          <li><strong>Sustainability Initiatives</strong> - Carbon-negative cloud operations by 2030</li>
          <li><strong>Edge Computing Expansion</strong> - Bringing compute closer to users worldwide</li>
        </ul>
        
        <h2>Impact on Businesses</h2>
        <p>These innovations are enabling businesses to:</p>
        <ul>
          <li>Reduce operational costs by up to 40%</li>
          <li>Improve application performance and user experience</li>
          <li>Accelerate time-to-market for new products</li>
          <li>Enhance security and compliance capabilities</li>
        </ul>
        
        <p>As we move forward, the integration of AI, quantum computing, and edge technologies will continue to drive innovation across industries.</p>`,
        createdDate: '2025-01-15T09:00:00Z',
        status: 'draft',
        source: 'TechCrunch',
        tags: ['Azure', 'Cloud Computing', 'Innovation', 'AI']
      },
      {
        id: 'blog-2025-01-14-002',
        title: 'Serverless Architecture Best Practices with Azure Functions',
        summary: 'A comprehensive guide to building scalable serverless applications using Azure Functions...',
        content: `<h1>Serverless Architecture Best Practices with Azure Functions</h1>
        
        <p>Serverless computing has revolutionized how we build and deploy applications. Azure Functions provides a powerful platform for creating event-driven, scalable solutions without managing infrastructure.</p>
        
        <h2>Core Benefits of Serverless</h2>
        <ul>
          <li><strong>Cost Efficiency</strong> - Pay only for execution time</li>
          <li><strong>Automatic Scaling</strong> - Handle traffic spikes seamlessly</li>
          <li><strong>Reduced Maintenance</strong> - Focus on code, not infrastructure</li>
          <li><strong>Faster Development</strong> - Rapid prototyping and deployment</li>
        </ul>`,
        createdDate: '2025-01-14T14:30:00Z',
        status: 'draft',
        source: 'The Verge',
        tags: ['Serverless', 'Azure Functions', 'Architecture', 'Best Practices']
      },
      {
        id: 'blog-2025-01-13-003',
        title: 'Azure DevOps: Streamlining CI/CD Pipelines',
        summary: 'Learn how to create efficient CI/CD pipelines using Azure DevOps...',
        content: `<h1>Azure DevOps: Streamlining CI/CD Pipelines for Modern Development</h1>`,
        createdDate: '2025-01-13T11:15:00Z',
        status: 'published',
        source: 'Azure Blog',
        tags: ['DevOps', 'CI/CD', 'Azure Pipelines', 'Automation']
      }
    ];
  }

  async healthCheck() {
    const checks = [];
    
    for (const [name, url] of Object.entries(AZURE_FUNCTIONS)) {
      try {
        const response = await fetch(`${url}?healthCheck=true`, {
          method: 'GET',
          headers: {
            'x-functions-key': FUNCTION_KEYS[name] || FUNCTION_KEYS.RSS_READER
          }
        });
        
        checks.push({
          service: name,
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status
        });
      } catch (error) {
        checks.push({
          service: name,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return checks;
  }
}

export const azureBlogService = new AzureBlogService();