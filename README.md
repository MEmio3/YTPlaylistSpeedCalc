# # Playlist TimeMaster 🚀

A sophisticated web application designed to analyze YouTube playlists, helping you plan your learning or binge-watching schedule effectively. Get detailed time-based analytics, calculate watch times at different speeds, and track your progress through any playlist.

![Playlist TimeMaster Screenshot](screenshot.png)
---

## ✨ Features

This isn't just a simple time calculator. Playlist TimeMaster is packed with features to give you full control over your viewing schedule.

* **📊 Comprehensive Analysis**: Instantly get key stats for any YouTube playlist, including:
    * Total number of videos.
    * Total playlist duration (`HH:MM:SS`).
    * Average video length.

* **⏱️ Advanced Speed Calculator**:
    * See pre-calculated watch times for common speeds (`1.25x`, `1.5x`, `1.75x`, `2x`).
    * Use an interactive **custom speed slider** (from `0.25x` to `3x`) to find the exact watch time for your preferred speed.

* **📚 Intelligent Study Planner**:
    * **Time Available Calculator**: Tell the app how many hours you have, and it will calculate what percentage of the playlist you can complete at a given speed.
    * **Required Speed Calculator**: Need to finish a playlist by a deadline? Enter the number of hours you have, and the app will tell you the exact playback speed you need to maintain.

* **📹 Video Progress Tracker**:
    * View a complete list of all videos in the playlist.
    * Mark videos as "watched" with a simple checkbox.
    * Visualize your completion with a dynamic progress bar.

* **💾 Save & Load Progress**:
    * **Save your progress** to a local JSON file at any time.
    * **Load your progress** from a file to continue where you left off, even on a different device.
    * Clear all progress to start fresh.

* **🎨 Sleek & Modern UI**:
    * A beautiful, Netflix-inspired dark theme.
    * Stylish "Glassmorphism" effects on all panels.
    * Fully responsive design that looks great on desktop, tablets, and mobile devices.

---

## 🛠️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

The project uses the **YouTube Data API v3** to fetch playlist information. You will need to get a free API key from the Google Cloud Console.

1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project.
3.  Enable the "YouTube Data API v3" for your project.
4.  Create credentials for a new **API key**.
5.  Copy the generated API key.

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/MEmio3/Playlist-TimeMaster.git](https://github.com/MEmio3/Playlist-TimeMaster.git)
    ```
    *(Replace with your actual repository URL if different)*

2.  **Navigate to the project directory:**
    ```sh
    cd Playlist-TimeMaster
    ```

3.  **Add your API Key:**
    * Open the `script.js` file in your code editor.
    * Find the following line (around line 2):
        ```javascript
        const API_KEY = 'AIzaSyB-ORiWM_LR7a_WsKtrgMIHKJOczNb_HIw'; 
        ```
    * Replace `'AIzaSyB-ORiWM_LR7a_WsKtrgMIHKJOczNb_HIw'` with your own YouTube Data API v3 key.

4.  **Run the application:**
    * Simply open the `index.html` file in your web browser. No web server is required for this project.

---

## 💻 How to Use

1.  **Paste URL**: Copy the URL of any public YouTube playlist and paste it into the input field.
2.  **Analyze**: Click the "Analyze Playlist" button. The app will fetch the data and display the results.
3.  **Explore**:
    * Review the total and average durations.
    * Play with the custom speed slider to see how it affects your total watch time.
    * Use the Study Planner to create a schedule.
    * Check off videos as you watch them in the Video Tracker section.
4.  **Save/Load**: Use the "Save Progress" button to download your tracking data. Use "Load Progress" to upload and restore it later.

---

## ⚙️ Technologies Used

* **HTML5**
* **CSS3** (with Flexbox & Grid for layout)
* **Vanilla JavaScript** (ES6+)
* **YouTube Data API v3**

---

## 📄 License

This project is licensed under the MIT License - see the `LICENSE` file for details.

---
Developed by [MEmio3](https://github.com/MEmio3).
