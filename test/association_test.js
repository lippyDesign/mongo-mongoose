const assert = require('assert');
const mongoose = require('mongoose');
const User = require('../src/user');
const Comment = require('../src/comment');
const BlogPost = require('../src/blogPost');

describe('Associations', () => {
    let joe, blogPost, comment;

    beforeEach((done) => {
        joe = new User({ name: 'Joe' });
        blogPost = new BlogPost({ title: 'JS is great', content: 'Yeah, oh yeah' });
        comment = new Comment({ content: 'Congrats on a new post' });

        joe.blogPosts.push(blogPost);
        blogPost.comments.push(comment);
        comment.user = joe;

        joe.save();

        // ES 6 magic (combine all 3 promises and get a single .then statement once all have been saved)
        Promise.all([joe.save(), blogPost.save(), comment.save()])
            .then(() => done());
    });

    it('Saves a relation between a user and a blog post', (done) => {
        User.findOne({name: 'Joe'})
            .populate('blogPosts')
            .then((user) => {
                assert(user.blogPosts[0].title === 'JS is great');
                done();
            });
    });

    it('Saves a full relation graph', (done) => {
        User.findOne({name: 'Joe'})
            .populate({
                path: 'blogPosts', // find the blogPosts property and load up all associated blog posts
                populate: {
                    path: 'comments', // in the blog posts, find the comments property and load up all associated comments
                    model: 'comment',
                    populate: {
                        path: 'user', // in each comment find the author and load up the author
                        model: 'user'
                    }
                }
            })
            .then((user) => {
                assert(user.name === 'Joe');
                assert(user.blogPosts[0].title === 'JS is great');
                assert(user.blogPosts[0].comments[0].content === 'Congrats on a new post');
                assert(user.blogPosts[0].comments[0].user.name === 'Joe');
                done();
            })
    })
});