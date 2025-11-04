import { useAuth } from "../context/AuthContext";
import React, { useEffect, useState } from "react";

export default function Home() {
    const { user_logged_in, user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && loggedIn)
        {
            fetchPosts();
        }
    }, [authLoading, loggedIn]);

    async function fetchPosts() {
        try {
            const res = await fetch("/api/posts", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch posts");
            const data = await res.json();
            setPosts(data.posts);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    
    if (authLoading || loading) return <p>Loading...</p>;

    return (
        <>
        <h1 class="text-center">Welcome to the Blog Post's Main Page!</h1>
        {user_logged_in ? (
        <>
        <h2 class="text-center">Create a Blog Post Here:</h2>
        <div class="cust-max-screen-width-900">
        <form action="/submit" method="POST">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Blog Title" id="blogtitle" name="blogtitle" required> 
            </div>
            <div class="input-group">
                <textarea class="form-control" placeholder="Write Blog content here..." id="blogcontent" name="blogcontent" aria-label="With textarea" required></textarea> 
            </div>
            <div class="py-3 d-flex justify-content-center align-items-center">
                <p>Currently Posting as <i>{user?.name || "err"}</i>.</p>
            </div>

            <div class="d-flex justify-content-center">
                <button class="btn btn-primary custom-button-padding" type="submit">Submit</button>
            </div>
        </form>
        </>
        ) : (
            <>
            <div class="cust-max-screen-width-900">
            <p class="text-center">You are currently not signed in to make any Blog Posts.</p>
            </>
        )}
        </div>
        <br><br>
        <h2 class="text-center">Current Blogs:</h2>
        {/* <%if (data.length !== 0) { %> */}
        {posts.length !== 0 ? (
            // <% data.forEach(blog => { %>
                            
                <div class="card text-center card-body cust-max-screen-width-1000">
                    <h3 class="card-title"><%= blog.title %></h3>
                    <h4 class="card-subtitle">Written by <i><%= blog.creator_name %></i></h4>
                    <div class="card-text"><%= blog.body %></div>
                    <div class="inline-buttons d-flex justify-content-center custom-button-padding">
                        <form action="/edit/<%= blog.blog_id %>" method="GET">  
                            <button class="btn btn-secondary" type="submit" id=<%= blog.blog_id %>
                                <%if (user_logged_in && current_user.user_id === blog.creator_user_id) { %>
                                <% } else {%>
                                    disabled
                                <% } %>
                                >Edit</button>
                        </form>
                        <form action="/delete/<%= blog.blog_id %>?_method=DELETE" method="POST">  
                            <button class="btn btn-danger" type="submit" id=<%= blog.blog_id %>
                                <%if (user_logged_in && current_user.user_id === blog.creator_user_id) { %>
                                <% } else {%>
                                    disabled
                                <% } %>
                                >Delete</button>
                        </form>
                    </div>
                    <div class="card-footer text-body-secondary">
                        <%if (blog.edited) { %> 
                            Edited 
                        <% } else { %> 
                            Posted 
                        <% } %> 
                            on <i><%= blog.date_created %></i>
                    </div>
                </div>
            <% }) %>
        // <% } else { %>
        ) : (
            <h3 class="text-center">There are no blog posts. (Try making one!)</h3>
        // <% } %>
        }
    </>
    );
}