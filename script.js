        // API Configuration
        const API_KEY = 'AIzaSyB-ORiWM_LR7a_WsKtrgMIHKJOczNb_HIw';
        const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

        // DOM Elements
        const form = document.getElementById('playlistForm');
        const playlistUrlInput = document.getElementById('playlistUrl');
        const analyzeBtn = document.getElementById('analyzeBtn');
        const loading = document.getElementById('loading');
        const results = document.getElementById('results');
        const errorMessage = document.getElementById('errorMessage');
        const customSpeedSlider = document.getElementById('customSpeedSlider');
        const customSpeedValue = document.getElementById('customSpeedValue');
        const customSpeedTime = document.getElementById('customSpeedTime');
        const videoListContainer = document.getElementById('videoList');

        // Store data
        let storedTotalSeconds = 0;
        let videoData = [];
        let watchedVideos = {};

        // Extract Playlist ID from URL
        function extractPlaylistId(url) {
            const patterns = [
                /[?&]list=([a-zA-Z0-9_-]+)/,
                /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
                /youtube\.com\/watch\?v=.+&list=([a-zA-Z0-9_-]+)/
            ];

            for (const pattern of patterns) {
                const match = url.match(pattern);
                if (match && match[1]) {
                    return match[1];
                }
            }
            return null;
        }

        // Get All Video IDs and Titles from Playlist
        async function getAllVideoData(playlistId) {
            const videos = [];
            let nextPageToken = null;

            do {
                let url = `${API_BASE_URL}/playlistItems?part=contentDetails,snippet&playlistId=${playlistId}&key=${API_KEY}&maxResults=50`;
                
                if (nextPageToken) {
                    url += `&pageToken=${nextPageToken}`;
                }

                const response = await fetch(url);
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'Failed to fetch playlist items');
                }

                const data = await response.json();

                if (!data.items || data.items.length === 0) {
                    break;
                }

                data.items.forEach(item => {
                    if (item.contentDetails?.videoId) {
                        videos.push({
                            id: item.contentDetails.videoId,
                            title: item.snippet?.title || 'Untitled Video'
                        });
                    }
                });

                nextPageToken = data.nextPageToken;
            } while (nextPageToken);

            return videos;
        }

        // Get Video Durations (with batching)
        async function getVideoDurations(videoIds) {
            const durations = [];
            const batchSize = 50;

            for (let i = 0; i < videoIds.length; i += batchSize) {
                const batch = videoIds.slice(i, i + batchSize);
                const ids = batch.join(',');

                const url = `${API_BASE_URL}/videos?part=contentDetails&id=${ids}&key=${API_KEY}`;
                const response = await fetch(url);

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error?.message || 'Failed to fetch video durations');
                }

                const data = await response.json();

                if (data.items) {
                    data.items.forEach(item => {
                        if (item.contentDetails?.duration) {
                            durations.push(item.contentDetails.duration);
                        }
                    });
                }
            }

            return durations;
        }

        // Parse ISO 8601 Duration to Seconds
        function parseISO8601Duration(duration) {
            const match = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
            
            if (!match) {
                return 0;
            }

            const days = parseInt(match[1]) || 0;
            const hours = parseInt(match[2]) || 0;
            const minutes = parseInt(match[3]) || 0;
            const seconds = parseInt(match[4]) || 0;

            return days * 86400 + hours * 3600 + minutes * 60 + seconds;
        }

        // Format Seconds to HH:MM:SS
        function formatDuration(totalSeconds) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);

            return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        // Show Error Message
        function showError(message) {
            errorMessage.textContent = message;
            errorMessage.classList.add('active');
            setTimeout(() => {
                errorMessage.classList.remove('active');
            }, 5000);
        }

        // Update Results Display
        function updateResults(videoCount, totalSeconds) {
            storedTotalSeconds = totalSeconds;

            document.getElementById('totalVideos').textContent = videoCount;
            document.getElementById('totalDuration').textContent = formatDuration(totalSeconds);

            const avgSeconds = videoCount > 0 ? totalSeconds / videoCount : 0;
            document.getElementById('avgDuration').textContent = formatDuration(avgSeconds);

            document.getElementById('speed125').textContent = formatDuration(totalSeconds / 1.25);
            document.getElementById('speed150').textContent = formatDuration(totalSeconds / 1.5);
            document.getElementById('speed175').textContent = formatDuration(totalSeconds / 1.75);
            document.getElementById('speed200').textContent = formatDuration(totalSeconds / 2);

            updateCustomSpeed();
            results.classList.add('active');
        }

        // Update Custom Speed Time
        function updateCustomSpeed() {
            const speed = parseFloat(customSpeedSlider.value);
            customSpeedValue.textContent = `${speed.toFixed(2)}x`;
            
            if (storedTotalSeconds > 0) {
                const customTime = storedTotalSeconds / speed;
                customSpeedTime.textContent = formatDuration(customTime);
            }
        }

        // Render Video List
        function renderVideoList() {
            videoListContainer.innerHTML = '';
            
            videoData.forEach((video, index) => {
                const videoItem = document.createElement('div');
                videoItem.className = `video-item ${watchedVideos[video.id] ? 'watched' : ''}`;
                
                videoItem.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="video-checkbox" 
                        id="video-${video.id}"
                        ${watchedVideos[video.id] ? 'checked' : ''}
                        onchange="toggleVideo('${video.id}')"
                    >
                    <div class="video-number">#${index + 1}</div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-duration">${video.durationFormatted}</div>
                    </div>
                `;
                
                videoListContainer.appendChild(videoItem);
            });

            updateProgressBar();
        }

        // Toggle Video Watched Status
        function toggleVideo(videoId) {
            if (watchedVideos[videoId]) {
                delete watchedVideos[videoId];
            } else {
                watchedVideos[videoId] = true;
            }
            renderVideoList();
        }

        // Update Progress Bar
        function updateProgressBar() {
            const totalVideos = videoData.length;
            const watchedCount = Object.keys(watchedVideos).length;
            const percentage = totalVideos > 0 ? (watchedCount / totalVideos) * 100 : 0;

            document.getElementById('progressText').textContent = 
                `${watchedCount} of ${totalVideos} videos completed`;
            document.getElementById('progressPercentage').textContent = 
                `${Math.round(percentage)}%`;
            document.getElementById('progressFill').style.width = `${percentage}%`;
        }

        // Save Progress as JSON
        function saveProgress() {
            const progressData = {
                playlistUrl: playlistUrlInput.value,
                watchedVideos: watchedVideos,
                savedAt: new Date().toISOString()
            };

            const dataStr = JSON.stringify(progressData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `playlist-progress-${Date.now()}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
        }

        // Load Progress from JSON
        function loadProgress(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const progressData = JSON.parse(e.target.result);
                    watchedVideos = progressData.watchedVideos || {};
                    renderVideoList();
                    alert('Progress loaded successfully!');
                } catch (error) {
                    alert('Error loading progress file. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }

        // Clear All Progress
        function clearProgress() {
            if (confirm('Are you sure you want to clear all progress? This cannot be undone.')) {
                watchedVideos = {};
                renderVideoList();
            }
        }

        // Calculate Completion Percentage
        function calculateCompletion() {
            const hours = parseFloat(document.getElementById('availableHours').value);
            const speed = parseFloat(document.getElementById('availableSpeed').value);

            if (!hours || !speed || storedTotalSeconds === 0) {
                alert('Please enter valid values and analyze a playlist first.');
                return;
            }

            const availableSeconds = hours * 3600;
            const watchTimeAtSpeed = storedTotalSeconds / speed;
            const percentage = Math.min((availableSeconds / watchTimeAtSpeed) * 100, 100);
            const videosCanWatch = Math.floor((videoData.length * percentage) / 100);

            document.getElementById('completionResult').style.display = 'block';
            document.getElementById('completionPercentage').textContent = `${percentage.toFixed(1)}%`;
            document.getElementById('completionVideos').textContent = 
                `≈ ${videosCanWatch} out of ${videoData.length} videos`;
        }

        // Calculate Required Speed
        function calculateRequiredSpeed() {
            const targetHours = parseFloat(document.getElementById('targetHours').value);

            if (!targetHours || storedTotalSeconds === 0) {
                alert('Please enter valid hours and analyze a playlist first.');
                return;
            }

            const targetSeconds = targetHours * 3600;
            const requiredSpeed = storedTotalSeconds / targetSeconds;

            document.getElementById('speedResult').style.display = 'block';
            document.getElementById('requiredSpeed').textContent = `${requiredSpeed.toFixed(2)}x`;

            let note = '';
            if (requiredSpeed > 2.5) {
                note = '⚠️ This speed is very fast! Consider more time.';
            } else if (requiredSpeed > 2) {
                note = '⚡ This speed is challenging but possible.';
            } else if (requiredSpeed < 1) {
                note = '✅ You have plenty of time! You can watch at normal speed.';
            } else {
                note = '✅ This speed is comfortable and achievable.';
            }

            document.getElementById('speedNote').textContent = note;
        }

        // Custom Speed Slider Event Listener
        customSpeedSlider.addEventListener('input', updateCustomSpeed);

        // Main Form Submit Handler
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
                showError('Please add your YouTube API key in the script.');
                return;
            }

            const url = playlistUrlInput.value.trim();

            if (!url) {
                showError('Please enter a YouTube playlist URL');
                return;
            }

            const playlistId = extractPlaylistId(url);

            if (!playlistId) {
                showError('Invalid YouTube playlist URL. Please check and try again.');
                return;
            }

            loading.classList.add('active');
            results.classList.remove('active');
            errorMessage.classList.remove('active');
            analyzeBtn.disabled = true;

            try {
                const videos = await getAllVideoData(playlistId);

                if (videos.length === 0) {
                    throw new Error('No videos found in this playlist.');
                }

                const videoIds = videos.map(v => v.id);
                const durations = await getVideoDurations(videoIds);

                let totalSeconds = 0;
                videoData = videos.map((video, index) => {
                    const durationSeconds = parseISO8601Duration(durations[index] || 'PT0S');
                    totalSeconds += durationSeconds;
                    return {
                        ...video,
                        duration: durationSeconds,
                        durationFormatted: formatDuration(durationSeconds)
                    };
                });

                updateResults(videos.length, totalSeconds);
                renderVideoList();

            } catch (error) {
                console.error('Error:', error);
                showError(error.message || 'An error occurred. Please try again.');
            } finally {
                loading.classList.remove('active');
                analyzeBtn.disabled = false;
            }
        });