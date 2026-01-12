import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run once on mount

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVideos(searchTerm);
    };

    return (
        <div className="container py-5" style={{ minHeight: '80vh' }}>


            <h2 className="mb-4 fw-bold text-primary">Explore Courses</h2>

            {/* Search Bar */}
            {/* Search Bar */}
            <StyledWrapper className="mb-5">
                <form className="form" onSubmit={handleSearch}>
                    <button type="submit">
                        <svg width={17} height={16} fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
                            <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" strokeWidth="1.333" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <input
                        className="input"
                        placeholder="Search for courses (e.g., React, Python)..."
                        required
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="reset" type="button" onClick={() => setSearchTerm('')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </form>
            </StyledWrapper>

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
                        <div className="card h-100  border-0 hover-effect">
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

const StyledWrapper = styled.div`
  /* From uiverse.io by @satyamchaudharydev */
  /* removing default style of button */

  .form button {
    border: none;
    background: none;
    color: #8b8ba7;
  }
  /* styling of whole input container */
  .form {
    --timing: 0.3s;
    --width-of-input: 100%; /* Adjusted to be responsive */
    --height-of-input: 50px;
    --border-height: 2px;
    --input-bg: #fff;
    --border-color: #2f2ee9;
    --border-radius: 30px;
    --after-border-radius: 1px;
    position: relative;
    width: var(--width-of-input);
    height: var(--height-of-input);
    display: flex;
    align-items: center;
    padding-inline: 0.8em;
    border-radius: var(--border-radius);
    transition: border-radius 0.5s ease;
    background: var(--input-bg,#fff);
    box-shadow: 0 4px 10px rgba(0,0,0,0.05); /* Added slight shadow */
  }
  /* styling of Input */
  .input {
    font-size: 0.9rem;
    background-color: transparent;
    width: 100%;
    height: 100%;
    padding-inline: 0.5em;
    padding-block: 0.7em;
    border: none;
  }
  /* styling of animated border */
  .form:before {
    content: "";
    position: absolute;
    background: var(--border-color);
    transform: scaleX(0);
    transform-origin: center;
    width: 100%;
    height: var(--border-height);
    left: 0;
    bottom: 0;
    border-radius: 1px;
    transition: transform var(--timing) ease;
  }
  /* Hover on Input */
  .form:focus-within {
    border-radius: var(--after-border-radius);
  }

  input:focus {
    outline: none;
  }
  /* here is code of animated border */
  .form:focus-within:before {
    transform: scale(1);
  }
  /* styling of close button */
  /* == you can click the close button to remove text == */
  .reset {
    border: none;
    background: none;
    opacity: 0;
    visibility: hidden;
    cursor: pointer;
  }
  /* close button shown when typing */
  input:not(:placeholder-shown) ~ .reset {
    opacity: 1;
    visibility: visible;
  }
  /* sizing svg icons */
  .form svg {
    width: 17px;
    margin-top: 3px;
  }`;
