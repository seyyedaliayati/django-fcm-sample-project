const firebaseConfig = {
    // Replace this with your config; otherwise it will not work!
    apiKey: "AIzaSyDGU5p3PoV1e7CyATtK6llT6gSYCzcvcs8",
    authDomain: "djangofcm-aa5e1.firebaseapp.com",
    projectId: "djangofcm-aa5e1",
    storageBucket: "djangofcm-aa5e1.appspot.com",
    messagingSenderId: "729476541475",
    appId: "1:729476541475:web:c8c134008274621fa45596"
};

firebase.initializeApp(firebaseConfig);
console.log("Firebase initialized...");
// Firebase Messaging Service
const messaging = firebase.messaging();

function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
        // The API Endpoint will be explained at step 8
        $.ajax({
            url: "/api/devices/",
            method: "POST",
            async: false,
            data: {
                'registration_id': currentToken,
                'type': 'web'
            },
            success: function (data) {
                console.log(data);
                setTokenSentToServer(true);
            },
            error: function (err) {
                console.log(err);
                setTokenSentToServer(false);
            }
        });

    } else {
        console.log('Token already sent to server so won\'t send it again ' +
            'unless it changes');
    }
}

function isTokenSentToServer() {
    return window.localStorage.getItem("sentToServer") === "1";
}

function setTokenSentToServer(sent) {
    if (sent) {
        window.localStorage.setItem("sentToServer", "1");
    } else {
        window.localStorage.setItem("sentToServer", "0");
    }
}


function requestPermission() {
    messaging.requestPermission().then(function () {
        console.log("Has permission!");
        resetUI();
    }).catch(function (err) {
        console.log('Unable to get permission to notify.', err);
    });
}

function resetUI() {
    console.log("In reset ui");
    messaging.getToken().then(function (currentToken) {
        console.log(currentToken);
        if (currentToken) {
            sendTokenToServer(currentToken);
        } else {
            setTokenSentToServer(false);
        }
    }).catch(function (err) {
        console.log(err);
        setTokenSentToServer(false);
    });
}


$('document').ready(function () {
    // Document is ready.
    console.log("loaded index.js");
    // Setup AJAX
    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            function getCookie(name) {
                var cookieValue = null;
                if (document.cookie && document.cookie != '') {
                    var cookies = document.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = jQuery.trim(cookies[i]);
                        // Does this cookie string begin with the name we want?
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return cookieValue;
            }

            if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                // Only send the token to relative URLs i.e. locally.
                xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            }
        }
    });

    messaging.onTokenRefresh(function () {
        messaging.getToken().then(function (refreshedToken) {
            console.log("Token refreshed.");
            // Indicate that the new Instance ID token has not yet been sent to the
            // app server.
            setTokenSentToServer(false);
            // Send Instance ID token to app server.
            sendTokenToServer(refreshedToken);
            resetUI();
        }).catch(function (err) {
            console.log("Unable to retrieve refreshed token ", err);
        });
    });
    
    messaging.onMessage(function (payload) {
        payload = payload.data;
        // Create notification manually when user is focused on the tab
        const notificationTitle = payload.title;
        const notificationOptions = {
            body: payload.body,
            icon: payload.icon_url,
        };
    
        if (!("Notification" in window)) {
            console.log("This browser does not support system notifications");
        }
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            // If it's okay let's create a notification
            var notification = new Notification(notificationTitle, notificationOptions);
            notification.onclick = function (event) {
                event.preventDefault(); // prevent the browser from focusing the Notification's tab
                window.open(payload.url, '_blank');
                notification.close();
            }
        }
    });

    requestPermission();
});
