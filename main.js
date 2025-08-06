/**
 * @file Main application logic for the Emel TV Tizen Web App.
 * @author Emel TV Team
 * @version 2.0.0
 */

(function() {
    'use strict';

    /**
     * Initializes the application, sets up listeners, and starts playback.
     */
    function init() {
        console.info('Application initialized.');
        registerKeys();
        document.addEventListener('visibilitychange', onVisibilityChange);
        createPlayerObject();
        setTimeout(startPlayback, 100);
    }

    /**
     * Creates the AVPlay <object> element and appends it to the player container if it doesn't exist.
     */
    function createPlayerObject() {
        var container = document.getElementById('player-container');
        if (container.querySelector('object')) {
            return; // Player object already exists.
        }
        var avPlayer = document.createElement('object');
        avPlayer.type = 'application/avplayer';
        container.appendChild(avPlayer);
    }

    /**
     * Fetches the stream URL by providing client IP and User-Agent to the backend,
     * then prepares and starts the AVPlay instance.
     */
    function startPlayback() {
        var userAgent = navigator.userAgent;

        fetch('https://api.ipify.org?format=json')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('IP service responded with status: ' + response.status);
                }
                return response.json();
            })
            .then(function(ipData) {
                var clientIp = ipData.ip;
                if (!clientIp) {
                    throw new Error('Could not parse IP address from ipify response.');
                }
                // Fetch the stream URL from the application backend.
                return fetch('https://emeltv-backend.vercel.app/stream-url?device=samsung', {
                    headers: {
                        'x-client-ip': clientIp,
                        'User-Agent': userAgent
                    }
                });
            })
            .then(function(streamApiResponse) {
                if (!streamApiResponse.ok) {
                    throw new Error('Application backend responded with status: ' + streamApiResponse.status);
                }
                return streamApiResponse.json();
            })
            .then(function(streamApiData) {
                var streamUrl = streamApiData.stream_url;
                if (!streamUrl) {
                    throw new Error('Backend response did not contain a valid stream_url.');
                }

                var avPlayerListener = {
                    onbufferingstart: function() { console.info('Buffering started...'); },
                    onbufferingcomplete: function() { console.info('Buffering complete.'); },
                    onstreamcompleted: function() {
                        console.info('Stream completed.');
                        cleanupPlayer();
                    },
                    onerror: function(err) { console.error('Player error:', JSON.stringify(err)); }
                };

                webapis.avplay.open(streamUrl);

                // Set the same User-Agent for the AVPlay instance to prevent mismatches.
                // This must be called after open() and before prepareAsync().
                try {
                    webapis.avplay.setStreamingProperty('USER_AGENT', userAgent);
                } catch (e) {
                    console.error('Failed to set custom User-Agent for AVPlay:', e.message);
                }
                
                webapis.avplay.setListener(avPlayerListener);
                webapis.avplay.setDisplayRect(0, 0, 1920, 1080);
                
                webapis.avplay.prepareAsync(function() {
                    console.info('Prepare complete. Starting playback.');
                    webapis.avplay.play();
                }, function(err) {
                    console.error('Prepare async error:', JSON.stringify(err));
                });
            })
            .then(null, function(e) {
                // This catches any error from the entire promise chain above.
                console.error('A critical error occurred in the playback setup chain:', e.message);
            });
    }

    /**
     * Gracefully stops and closes the AVPlay instance to release hardware resources.
     */
    function cleanupPlayer() {
        var state = webapis.avplay.getState();
        if (state !== 'IDLE' && state !== 'NONE') {
            try {
                webapis.avplay.stop();
                webapis.avplay.close();
                console.info('Player closed successfully.');
            } catch (e) {
                console.error('Error during player cleanup:', e.message);
            }
        }
    }

    /**
     * Registers remote control key event listeners for standard media controls.
     */
    function registerKeys() {
        document.addEventListener('keydown', function(e) {
            switch (e.keyCode) {
                case 10009: // Return/Back
                    cleanupPlayer();
                    try {
                        tizen.application.getCurrentApplication().exit();
                    } catch (err) {
                        console.error('Error exiting application:', err.message);
                    }
                    break;
                
                case 415:   // Play
                case 10252: // Play/Pause (Samsung specific)
                    if (webapis.avplay.getState() === 'PAUSED') {
                        webapis.avplay.play();
                    }
                    break;
                
                case 19:    // Pause
                    if (webapis.avplay.getState() === 'PLAYING') {
                        webapis.avplay.pause();
                    }
                    break;
                
                case 413:   // Stop
                    cleanupPlayer();
                    break;
                
                // Volume Controls
                case 447: // Volume Up
                    tizen.tvaudiocontrol.setVolumeUp();
                    break;
                
                case 448: // Volume Down
                    tizen.tvaudiocontrol.setVolumeDown();
                    break;
                
                case 449: // Mute
                    tizen.tvaudiocontrol.setMute(!tizen.tvaudiocontrol.isMute());
                    break;
            }
        });
    }

    /**
     * Handles application visibility changes (e.g., user presses Home key).
     */
    function onVisibilityChange() {
        if (document.hidden) {
            // App is now hidden, release player resources to be a good citizen.
            cleanupPlayer();
        } else {
            // App is visible again, re-create the player and start playback.
            createPlayerObject();
            setTimeout(startPlayback, 100);
        }
    }

    // Register the 'init' function to run when the page is fully loaded.
    window.onload = init;

})();