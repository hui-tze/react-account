import React from 'react';

const BlogPosts = () => {
    return (
        <div className="container-fluid px-4">
            <div className="hk-pg-header">
                <div>
                    <h1 className="pg-title">Posts</h1>
                    <p className="text-muted">
                        Manage your blog posts.
                    </p>
                </div>
            </div>

            <div className="hk-pg-body">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">
                            Blog Posts
                        </h5>

                        <p className="card-text">
                            Your blog posts will appear here.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogPosts;