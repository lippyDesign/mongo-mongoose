const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../src/user');
const BlogPost = require('../src/blogPost');

describe('Middleware', () => {
    let joe, blogPost;

    beforeEach((done) => {
        joe = new User({ name: 'Joe' });
        blogPost = new BlogPost({ title: 'JS is great', content: 'Yeah, oh yeah' });

        joe.blogPosts.push(blogPost);

        // ES 6 magic (combine all 3 promises and get a single .then statement once all have been saved)
        Promise.all([joe.save(), blogPost.save()])
            .then(() => done());
    });

    it("clean up dangling blog posts when user's account is removed", (done) => {
        joe.remove()
            .then(() => BlogPost.count())
            .then((count) => {
                assert(count === 0);
                done();
            })
    });
});