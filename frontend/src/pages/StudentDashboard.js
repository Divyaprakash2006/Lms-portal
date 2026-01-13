import React, { useState, useEffect, useContext } from 'react';

import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);

    const [trendingVideos, setTrendingVideos] = useState([]);
    const [videosLoading, setVideosLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);

    // YouTube API Configuration
    const YOUTUBE_CONFIG = {
        API_KEY: "AIzaSyBi6wTezYMhPVz3sNK6QK8UHYl3qjx2PLk", // Replace with your actual API key
        BASE_URL: 'https://www.googleapis.com/youtube/v3',
        CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        MAX_RESULTS: 8
    };

    // Educational topics that rotate daily
    const SEARCH_TOPICS = [
        'programming tutorial 2025',
        'web development full course',
        'machine learning tutorial',
        'react js complete guide',
        'python programming',
        'data science course',
        'javascript advanced',
        'aws cloud computing',
        'cybersecurity fundamentals',
        'full stack development'
    ];

    useEffect(() => {

        fetchTrendingVideos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    // Get daily topic based on day of year
    const getDailyTopic = () => {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 0);
        const diff = now - startOfYear;
        const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
        const topicIndex = dayOfYear % SEARCH_TOPICS.length;
        return SEARCH_TOPICS[topicIndex];
    };

    // Check if cached data is valid
    const getCachedVideos = () => {
        try {
            const cacheKey = `youtube_videos_${new Date().toDateString()}`;
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                const parsedData = JSON.parse(cached);
                console.log('Using cached YouTube videos');
                return parsedData;
            }
            return null;
        } catch (error) {
            console.error('Error reading cache:', error);
            return null;
        }
    };

    // Save videos to cache
    const cacheVideos = (videos) => {
        try {
            const cacheKey = `youtube_videos_${new Date().toDateString()}`;
            localStorage.setItem(cacheKey, JSON.stringify(videos));

            // Clean up old cache entries
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('youtube_videos_') && key !== cacheKey) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Error caching videos:', error);
        }
    };

    // Fetch trending educational videos from YouTube
    const fetchTrendingVideos = async (customTopic = null) => {
        try {
            // Check cache first if no custom topic provided
            if (!customTopic) {
                const cachedVideos = getCachedVideos();
                if (cachedVideos) {
                    setTrendingVideos(cachedVideos);
                    setVideosLoading(false);
                    return;
                }
            }

            setVideosLoading(true);

            // Get topic
            const searchQuery = customTopic || getDailyTopic();
            console.log('Fetching YouTube videos for topic:', searchQuery);

            // Step 1: Search for videos
            const searchResponse = await axios.get(
                `${YOUTUBE_CONFIG.BASE_URL}/search`,
                {
                    params: {
                        part: 'snippet',
                        q: searchQuery,
                        type: 'video',
                        order: 'relevance',
                        maxResults: YOUTUBE_CONFIG.MAX_RESULTS,
                        videoDuration: 'medium',
                        videoDefinition: 'high',
                        relevanceLanguage: 'en',
                        safeSearch: 'strict',
                        key: YOUTUBE_CONFIG.API_KEY
                    }
                }
            );

            if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
                throw new Error('No videos found');
            }

            // Step 2: Get video details (duration, views, etc.)
            const videoIds = searchResponse.data.items
                .map(item => item.id.videoId)
                .join(',');

            const detailsResponse = await axios.get(
                `${YOUTUBE_CONFIG.BASE_URL}/videos`,
                {
                    params: {
                        part: 'contentDetails,statistics',
                        id: videoIds,
                        key: YOUTUBE_CONFIG.API_KEY
                    }
                }
            );

            // Step 3: Combine and format data
            const formattedVideos = searchResponse.data.items.map((item, index) => {
                const details = detailsResponse.data.items[index];

                return {
                    id: item.id.videoId,
                    title: item.snippet.title,
                    channel: item.snippet.channelTitle,
                    thumbnail: item.snippet.thumbnails.high.url,
                    duration: formatDuration(details.contentDetails.duration),
                    views: formatViews(details.statistics.viewCount),
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                    publishedAt: item.snippet.publishedAt
                };
            });

            // Cache the results
            cacheVideos(formattedVideos);
            setTrendingVideos(formattedVideos);
            console.log('Successfully fetched and cached YouTube videos');

        } catch (error) {
            console.error('YouTube API Error:', error.response?.data || error.message);

            // Use fallback videos on error
            const fallbackVideos = getFallbackVideos();
            setTrendingVideos(fallbackVideos);
            console.log('Using fallback videos due to API error');
        } finally {
            setVideosLoading(false);
        }
    };

    // Format ISO 8601 duration (PT1H30M15S) to readable format (1:30:15)
    const formatDuration = (duration) => {
        try {
            const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
            if (!match) return '0:00';

            const hours = (match[1] || '').replace('H', '');
            const minutes = (match[2] || '').replace('M', '');
            const seconds = (match[3] || '').replace('S', '');

            if (hours) {
                return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
            }
            return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
        } catch (error) {
            return '0:00';
        }
    };

    // Format view count (1500000 -> 1.5M views)
    const formatViews = (viewCount) => {
        try {
            const views = parseInt(viewCount);
            if (views >= 1000000) {
                return `${(views / 1000000).toFixed(1)}M views`;
            } else if (views >= 1000) {
                return `${(views / 1000).toFixed(1)}K views`;
            }
            return `${views} views`;
        } catch (error) {
            return '0 views';
        }
    };

    // Fallback videos when API fails or quota exceeded
    const getFallbackVideos = () => {
        return [
            {
                id: 'fallback1',
                title: 'Complete Web Development Bootcamp 2025',
                channel: 'freeCodeCamp.org',
                thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=480&h=270&fit=crop',
                duration: '10:30:45',
                views: '2.5M views',
                url: 'https://www.youtube.com/results?search_query=web+development+course'
            },
            {
                id: 'fallback2',
                title: 'Python Programming Full Course',
                channel: 'Programming with Mosh',
                thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=480&h=270&fit=crop',
                duration: '6:14:20',
                views: '5.2M views',
                url: 'https://www.youtube.com/results?search_query=python+programming'
            },
            {
                id: 'fallback3',
                title: 'Machine Learning Crash Course',
                channel: 'Google Developers',
                thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=480&h=270&fit=crop',
                duration: '8:45:30',
                views: '1.8M views',
                url: 'https://www.youtube.com/results?search_query=machine+learning'
            },
            {
                id: 'fallback4',
                title: 'React JS Complete Tutorial',
                channel: 'Traversy Media',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=480&h=270&fit=crop',
                duration: '4:20:15',
                views: '3.2M views',
                url: 'https://www.youtube.com/results?search_query=react+js+tutorial'
            },
            {
                id: 'fallback5',
                title: 'AWS Cloud Practitioner Certification',
                channel: 'FreeCodeCamp',
                thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=480&h=270&fit=crop',
                duration: '12:15:30',
                views: '1.5M views',
                url: 'https://www.youtube.com/results?search_query=aws+cloud'
            },
            {
                id: 'fallback6',
                title: 'Cybersecurity Full Course',
                channel: 'NetworkChuck',
                thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=480&h=270&fit=crop',
                duration: '7:30:20',
                views: '2.1M views',
                url: 'https://www.youtube.com/results?search_query=cybersecurity'
            },
            {
                id: 'fallback7',
                title: 'Data Structures and Algorithms',
                channel: 'CS Dojo',
                thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=480&h=270&fit=crop',
                duration: '5:45:00',
                views: '1.9M views',
                url: 'https://www.youtube.com/results?search_query=data+structures'
            },
            {
                id: 'fallback8',
                title: 'JavaScript ES6 Tutorial',
                channel: 'The Net Ninja',
                thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=480&h=270&fit=crop',
                duration: '3:20:45',
                views: '890K views',
                url: 'https://www.youtube.com/results?search_query=javascript+es6'
            }
        ];
    };

    const handleRefresh = () => {
        const randomTopic = SEARCH_TOPICS[Math.floor(Math.random() * SEARCH_TOPICS.length)];
        fetchTrendingVideos(randomTopic);
    };

    const handleVideoClick = (video) => {
        setSelectedVideo(video);
    };

    const closeVideoModal = () => {
        setSelectedVideo(null);
    };



    // Trending Technologies Data
    const trendingTech = [
        {
            id: 1,
            name: 'Artificial Intelligence & Machine Learning',
            description: 'Master AI/ML concepts and build intelligent applications',
            color: '#667eea',
            image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop'
        },
        {
            id: 2,
            name: 'Cloud Computing (AWS, Azure, GCP)',
            description: 'Learn cloud architecture and deployment strategies',
            color: '#f093fb',
            image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop'
        },
        {
            id: 3,
            name: 'Cybersecurity',
            description: 'Protect systems and networks from digital threats',
            color: '#4facfe',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop'
        },
        {
            id: 4,
            name: 'Web3 & Blockchain',
            description: 'Explore decentralized applications and smart contracts',
            color: '#43e97b',
            image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=250&fit=crop'
        },
        {
            id: 5,
            name: 'DevOps & CI/CD',
            description: 'Automate software development and deployment',
            color: '#fa709a',
            image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=400&h=250&fit=crop'
        },
        {
            id: 6,
            name: 'React & Modern Frontend',
            description: 'Build dynamic user interfaces with latest frameworks',
            color: '#764ba2',
            image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'
        }
    ];

    // Learning Resources Data
    const learningResources = [
        {
            id: 1,
            title: 'Interactive Coding Challenges',
            platform: 'LeetCode',
            description: 'Practice algorithms and data structures',
            color: '#FFA116',
            url: 'https://leetcode.com'
        },
        {
            id: 2,
            title: 'Free Certification Courses',
            platform: 'Coursera',
            description: 'University-level courses with certificates',
            color: '#0056D2',
            url: 'https://www.coursera.org'
        },
        {
            id: 3,
            title: 'Tech Documentation',
            platform: 'MDN Web Docs',
            description: 'Comprehensive web development resources',
            color: '#000000',
            url: 'https://developer.mozilla.org'
        },
        {
            id: 4,
            title: 'Developer Community',
            platform: 'Stack Overflow',
            description: 'Get help from expert developers',
            color: '#F48024',
            url: 'https://stackoverflow.com'
        }
    ];

    return (
        <div className="student-dashboard" style={{
            backgroundColor: '#fff',
            minHeight: '100vh',
            paddingBottom: '60px'
        }}>
            <div className="container py-5">
                {/* Welcome Header */}
                <div className="text-dark mb-5">
                    <h1 className="display-4 mb-3">Welcome back, {user?.name}!</h1>
                    <p className="lead text-muted">Continue your learning journey and explore new technologies</p>
                </div>

                {/* My Assessments Section */}
                {/* Learning Resources Section */}
                <div className="mb-4">
                    <h2 className="h3 mb-4 text-dark border-bottom pb-3">Learning Resources</h2>
                    <div className="row g-4">
                        {learningResources.map(resource => (
                            <div key={resource.id} className="col-md-6 col-lg-3">
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none"
                                >
                                    <div
                                        className="card h-100 text-center shadow-sm hover-card"
                                        style={{
                                            background: `linear-gradient(135deg, ${resource.color}15, ${resource.color}05)`,
                                            border: `2px solid ${resource.color}30`
                                        }}
                                    >
                                        <div className="card-body">
                                            <h5
                                                className="card-title mb-3"
                                                style={{ color: resource.color, fontWeight: '700' }}
                                            >
                                                {resource.platform}
                                            </h5>
                                            <p className="card-text text-muted">{resource.description}</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trending Videos Section */}
                <div className="card  mb-4 border-0">
                    <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                            <h2 className="card-title h3 mb-0">Trending Learning Videos</h2>
                            <span
                                className="badge bg-danger px-3 py-2"
                                style={{ cursor: 'pointer' }}
                                onClick={handleRefresh}
                                title="Click to refresh videos"
                            >
                                Daily Updates <i className="bi bi-arrow-clockwise ms-1"></i>
                            </span>
                        </div>

                        {videosLoading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-danger" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading trending videos...</p>
                            </div>
                        ) : (
                            <div className="scrolling-wrapper">
                                <div className="scrolling-content">
                                    {[...trendingVideos, ...trendingVideos].map((video, index) => (
                                        <div key={`${video.id}-${index}`} className="video-card-item">
                                            <div
                                                className="text-decoration-none"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => handleVideoClick(video)}
                                            >
                                                <div className="card h-100 shadow-sm border-0 hover-card">
                                                    <div className="position-relative">
                                                        <img
                                                            src={video.thumbnail}
                                                            className="card-img-top"
                                                            alt={video.title}
                                                            style={{ height: '180px', objectFit: 'cover' }}
                                                        />
                                                        <span className="badge bg-dark position-absolute bottom-0 end-0 m-2">
                                                            {video.duration}
                                                        </span>
                                                        <div
                                                            className="position-absolute top-50 start-50 translate-middle play-button"
                                                            style={{
                                                                width: '60px',
                                                                height: '60px',
                                                                background: 'rgba(255,0,0,0.9)',
                                                                borderRadius: '50%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontSize: '1.5rem'
                                                            }}
                                                        >
                                                            ▶
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        <h6 className="card-title video-title">
                                                            {video.title}
                                                        </h6>
                                                        <p className="card-text text-muted mb-1">
                                                            <small>{video.channel}</small>
                                                        </p>
                                                        <p className="card-text text-muted mb-0">
                                                            <small>{video.views}</small>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Trending Technologies Section */}
                <div className="card  mb-4 border-0">
                    <div className="card-body p-4">
                        <h2 className="card-title h3 mb-4">Trending Technologies</h2>
                        <div className="row g-4">
                            {trendingTech.map(tech => (
                                <div key={tech.id} className="col-md-6 col-lg-4">
                                    <div className="card h-100 shadow-sm border-0 hover-card">
                                        <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                                            <img
                                                src={tech.image}
                                                className="card-img-top"
                                                alt={tech.name}
                                                style={{ height: '100%', width: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title" style={{ color: tech.color }}>
                                                {tech.name}
                                            </h5>
                                            <p className="card-text text-muted">{tech.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Learning Resources Section */}

            </div>

            {/* Video Modal */}
            {selectedVideo && (
                <div className="modal-overlay" onClick={closeVideoModal}>
                    <div className="modal-content-custom" onClick={e => e.stopPropagation()}>
                        <div className="d-flex justify-content-between align-items-center mb-3 text-white">
                            <h5 className="m-0 text-truncate pe-3">{selectedVideo.title}</h5>
                            <button className="btn btn-close btn-close-white" onClick={closeVideoModal}></button>
                        </div>
                        <div className="ratio ratio-16x9">
                            <iframe
                                src={`https://www.youtube.com/embed/${selectedVideo.id}?autoplay=1`}
                                title={selectedVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.85);
                    z-index: 1050;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 1rem;
                    backdrop-filter: blur(5px);
                }

                .modal-content-custom {
                    width: 100%;
                    max-width: 900px;
                    background: transparent;
                    position: relative;
                }

                .scrolling-wrapper {
                    overflow: hidden;
                    width: 100%;
                    position: relative;
                }

                .scrolling-content {
                    display: flex;
                    gap: 1.5rem;
                    animation: scroll 40s linear infinite;
                    width: max-content;
                }

                .scrolling-content:hover {
                    animation-play-state: paused;
                }

                .video-card-item {
                    width: 300px;
                    flex-shrink: 0;
                }

                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .hover-card {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                
                .hover-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2) !important;
                }

                .play-button {
                    transition: transform 0.3s ease;
                }

                .hover-card:hover .play-button {
                    transform: translate(-50%, -50%) scale(1.1);
                }

                .video-title {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    min-height: 3em;
                    line-height: 1.5em;
                }
            `}</style>
        </div >
    );
};

export default StudentDashboard;