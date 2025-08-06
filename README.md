# Emel TV - Tizen Stream Player

A simple and robust Tizen web application designed to play a full-screen HLS video stream on Samsung Smart TVs. This project serves as a lightweight yet powerful template for TV-based streaming applications, incorporating essential lifecycle management, remote control handling, and common troubleshooting fixes.

---

## ✨ Key Features

-   **HLS Streaming**: Plays a specified HLS (`.m3u8`) stream immediately on launch.
-   **Full-Screen Playback**: Utilizes the entire screen for an immersive viewing experience.
-   **Remote Control Ready**: Handles essential remote control events (**Play**, **Pause**, **Return/Exit**).
-   **Robust App Lifecycle Management**: Correctly pauses the stream when the app is hidden and cleans up resources on exit to prevent common `AVPlay` errors on the TV.
-   **Black Screen Fix**: Includes the necessary `setDisplayRect` API calls to prevent the common "black screen with audio" issue on Tizen TVs.
-   **Error Handling**: Basic listeners to handle stream and player errors.

---

## 🛠️ Tech Stack

-   **HTML5**: Core application structure.
-   **CSS3**: Minimal styling for the player container.
-   **JavaScript (ES6+)**: All application logic.
-   **Tizen Web API**:
    -   `webapis.avplay` for media playback.
    -   `tizen.application` for application lifecycle control.
    -   `tizen.tvinputdevice` for registering remote control keys.

---

## 📂 Project Structure

The project follows a standard Tizen web application structure.

```
.
├── css/
│   └── style.css       # Styles for the player object and body
├── js/
│   └── main.js         # Main application logic
├── config.xml          # Tizen app configuration, privileges, and metadata
├── icon.png            # Application icon
└── index.html          # HTML entry point of the application
```


---

## 🚀 Getting Started

Follow these instructions to get the project running on your own Samsung TV.

### Prerequisites

-   [**Tizen Studio**](https://developer.tizen.org/development/tizen-studio/download) installed (with TV extensions).
-   A **Samsung Smart TV** connected to the same network as your computer, with **Developer Mode** enabled.
-   A **Samsung Developer Certificate** configured in Tizen Studio.

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone [https://your-repository-url.git](https://your-repository-url.git)
    cd emel-tv
    ```

2.  **Import into Tizen Studio:**
    -   Open Tizen Studio.
    -   Go to `File > Import...`.
    -   Select `Tizen > Tizen Project` and browse to the cloned repository folder.
    -   Check the project and click `Finish`.

3.  **Configure the Stream URL:**
    -   Open the `js/main.js` file.
    -   Change the `STREAM_URL` constant to your desired `.m3u8` stream link.
        ```javascript
        // The URL of the HLS stream to be played.
        const STREAM_URL = "https://your-stream-url.m3u8";
        ```

4.  **Build and Run:**
    -   Connect your Samsung TV to Tizen Studio using the **Device Manager**.
    -   Right-click the project in the **Project Explorer**.
    -   Select **Run As > Tizen Web Application**.
    -   Ensure your TV is selected as the target. The app will be installed and launched automatically.

---

## 🎮 Controls

The application responds to the following remote control keys:

| Key            | Action                  |
| -------------- | ----------------------- |
| **Play/Pause** | Toggles between play and pause. |
| **Return** | Exits the application.  |
| **Exit** | Exits the application.  |

---

## 💡 Troubleshooting

-   **Black Screen with Audio:** This is a common issue where the video is not rendered. This template fixes it by correctly setting the video display area using `webapis.avplay.setDisplayRect()`.
-   **"Player not available" Error:** This often happens if you try to use `AVPlay` APIs after the app has been closed or before it's ready. The lifecycle management in `main.js` (`application.hide` and `visibilitychange` listeners) is designed to prevent this by properly closing the player.
-   **Connection Issues:** Ensure your computer and TV are on the **same network** and that you've entered your computer's IP address correctly in the TV's Developer Mode settings.