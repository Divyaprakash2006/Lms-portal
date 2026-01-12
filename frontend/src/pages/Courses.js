import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const Courses = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('Full Course for Beginners');

    // ⚠️ REPLACE WITH YOUR ACTUAL API KEY
    const API_KEY = "AIzaSyBi6wTezYMhPVz3sNK6QK8UHYl3qjx2PLk";

    const fetchVideos = async (query) => {
        if (!API_KEY || API_KEY === "YOUR_YOUTUBE_API_KEY") {
            setError("Please configure your YouTube API Key in Courses.js");
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&maxResults=9&key=${API_KEY}`
            );
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            setVideos(data.items || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch videos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(searchTerm);
    }, []); // Run once on mount

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVideos(searchTerm);
    };

    return (
        <div className="container py-5" style={{ minHeight: '80vh' }}>
            <Helmet>
                <title>Courses | Nexus LMS</title>
                <meta name="description" content="Explore free educational courses and tutorials on Nexus LMS." />
            </Helmet>

            <h2 className="mb-4 fw-bold text-primary">Explore Courses</h2>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-5">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search for courses (e.g., React, Python, Data Science)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-primary px-4" type="submit">
                        Search
                    </button>
                </div>
            </form>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Video Grid */}
            <div className="row g-4">
                {!loading && videos.length > 0 && videos.map((video) => (
                    <div key={video.id.videoId} className="col-md-6 col-lg-4">
                        <div className="card h-100 shadow-sm border-0 hover-effect">
                            <img
                                src={video.snippet.thumbnails.high.url}
                                className="card-img-top"
                                alt={video.snippet.title}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title fs-6 fw-bold mb-2">
                                    {video.snippet.title}
                                </h5>
                                <p className="card-text text-muted small mb-3">
                                    {video.snippet.description.slice(0, 80)}...
                                </p>
                                <div className="mt-auto">
                                    <small className="text-secondary d-block mb-2">
                                        By: {video.snippet.channelTitle}
                                    </small>
                                    <a
                                        href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline-primary w-100 btn-sm"
                                    >
                                        Watch Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {!loading && !error && videos.length === 0 && (
                    <div className="text-center w-100">
                        <p className="text-muted">No videos found. Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courses;
