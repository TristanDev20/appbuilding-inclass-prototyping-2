import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';

const BlogPostSearch = ({ 
  onSearchResult, 
  showResult = true, 
  className = "",
  variant = "primary"
}) => {
  const [searchId, setSearchId] = useState('');
  const [loading, setLoading] = useState(false);
  const [blogPost, setBlogPost] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchId.trim()) {
      setError('Please enter a blog post ID');
      return;
    }

    setLoading(true);
    setError('');
    setBlogPost(null);

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/getBlogPost/${searchId.trim()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Blog post not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search result:', data);
      
      // Handle different response formats
      let foundBlogPost;
      if (data.blogPost) {
        foundBlogPost = data.blogPost;
      } else if (data.data) {
        foundBlogPost = data.data;
      } else {
        foundBlogPost = data;
      }

      setBlogPost(foundBlogPost);
      
      // Call the callback function if provided
      if (onSearchResult) {
        onSearchResult(foundBlogPost);
      }

    } catch (error) {
      console.error('Error searching blog post:', error);
      setError(error.message || 'Failed to search blog post');
      setBlogPost(null);
      
      // Call callback with null if search fails
      if (onSearchResult) {
        onSearchResult(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setBlogPost(null);
    setError('');
    if (onSearchResult) {
      onSearchResult(null);
    }
  };

  return (
    <div className={className}>
      <Form.Group className="mb-3">
        <Form.Label>Search blogpost by ID</Form.Label>
        <div className="d-flex gap-2">
          <Form.Control
            type="text"
            placeholder="Enter blog post ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <Button
            variant={variant}
            onClick={handleSearch}
            disabled={loading || !searchId.trim()}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Searching...
              </>
            ) : (
              'Search'
            )}
          </Button>
          {(blogPost || error) && (
            <Button
              variant="outline-secondary"
              onClick={clearSearch}
              disabled={loading}
            >
              Clear
            </Button>
          )}
        </div>
      </Form.Group>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {showResult && blogPost && (
        <Card className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Blog Post Found</h5>
            <small className="text-muted">ID: {blogPost._id}</small>
          </Card.Header>
          <Card.Body>
            <Card.Title>{blogPost.title}</Card.Title>
            <Card.Text>
              <strong>Author:</strong> {blogPost.author}
            </Card.Text>
            <Card.Text>
              {blogPost.content && blogPost.content.length > 200 
                ? `${blogPost.content.substring(0, 200)}...` 
                : blogPost.content
              }
            </Card.Text>
            <div className="d-flex justify-content-between text-muted">
              <small>
                Created: {blogPost.createdOn ? new Date(blogPost.createdOn).toLocaleDateString() : 'N/A'}
              </small>
              {blogPost.updatedOn && (
                <small>
                  Updated: {new Date(blogPost.updatedOn).toLocaleDateString()}
                </small>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default BlogPostSearch;