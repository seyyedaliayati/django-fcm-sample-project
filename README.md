# Adding Firebase Cloud Messaging Service into a Django Project
The aim of this repository is to provide a step-by-step guide and a basic project sample to implement FCM (Firebase Cloud Messaging) feature into a django-based project.

# Step 1: Create a Firebase Project
Goto [firebase console](https://console.firebase.google.com/) and click on `Add project` to create a new firebase project. Since the goal of using firebase is its cloud messaging feature, you can disable Google Analytics.

# Step 2: Download a JSON File Including Project's Credentials
Next to the `Project Overview` on the left menu there is a gear icon which redirects you to the project settings page.

![Click on the gear icon and select `Project settings`](images/project_settings.png)

Then, click on `Service accounts` and then click on `Generate new private key`. Download and store the JSON file on your device.

**Security Note: Do NOT keep this file inside the project root and never publish it on Github, Gitlab,...**

# Step 3: Install the `fcm-django` App
You can use any other package, or you can develope a custom app yourself, but, I prefer `fcm-django` because it is simple and single responsible!
```bash
pip install fcm-django
```
For communicating through API it is necessary to install Django Rest Framework:
```bash
pip install djangorestframework
```
Here are the package's repository on Github and its documentation:
- [Github Repo](https://github.com/xtrinch/fcm-django)
- [Documentation](https://fcm-django.readthedocs.io/en/latest/)

# Step 4: Install the `firebase-admin` Package
The `firebase-admin` is the official library from firebase that communicates with its services.
```bash
pip install firebase-admin
```

# Step 5: Modifying Django Settings

Import `initialize_app` from `firebase_admin` in your setting file:
```python
from firebase_admin import initialize_app
```

Add `fcm_django` and `rest_framework` to the `INSTALLED_APPS`:
```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # You Apps Here...
    'rest_framework', # For Rest API
    'fcm_django', # New
]
```
Add required configs for `fcm-django` app:
```python
# Optional ONLY IF you have initialized a firebase app already:
# Visit https://firebase.google.com/docs/admin/setup/#python
# for more options for the following:
# Store an environment variable called GOOGLE_APPLICATION_CREDENTIALS
# which is a path that point to a json file with your credentials.
# Additional arguments are available: credentials, options, name
FIREBASE_APP = initialize_app()
# To learn more, visit the docs here:
# https://cloud.google.com/docs/authentication/getting-started>

FCM_DJANGO_SETTINGS = {
     # default: _('FCM Django')
    "APP_VERBOSE_NAME": "[string for AppConfig's verbose_name]",
     # true if you want to have only one active device per registered user at a time
     # default: False
    "ONE_DEVICE_PER_USER": True/False,
     # devices to which notifications cannot be sent,
     # are deleted upon receiving error response from FCM
     # default: False
    "DELETE_INACTIVE_DEVICES": True/False,
}
```

Run the migrate command before running the server:
```bash
python manage.py migrate
```

**Note:** Before running the project make sure to set an environment variable named `GOOGLE_APPLICATION_CREDENTIALS` to the path of your downloaded JSON file from firebase in Step 2.

# Step 6: The Default Service Worker
For handling background notifications, when user is not focused on tab, it is required to have a service worker. Just create a file named `firebase-messaging-sw.js` and put it in root, so it should be accessible by `/firebase-messaging-sw.js/` URL. In django you can put this file in `templates` and add following line of code in your root `urls.py`:
```python
from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    ...,
    path("firebase-messaging-sw.js",
        TemplateView.as_view(
            template_name="firebase-messaging-sw.js",
            content_type="application/javascript",
        ),
        name="firebase-messaging-sw.js"
    ),
    ...
]
```

So the content of `templates/firebase-messaging-sw.js` is:
```javascript
// [START initialize_firebase_in_sw]
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
  // Replace messagingSenderId with yours
  'messagingSenderId': '504975596104'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();
// [END initialize_firebase_in_sw]

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// [START background_handler]
messaging.setBackgroundMessageHandler(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  payload = payload.data;
  const notificationTitle = payload.title;
  const notificationOptions = {
    body: payload.body,
    icon: payload.icon_url,
  };

  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    clients.openWindow(payload.url);
  });

  return self.registration.showNotification(notificationTitle,
      notificationOptions);
});
// [END background_handler]
```
# Step 7: Register User Devices
Registering the user device can be done by some JavaScript code which communicates with Firebase API. You can write a better, cleaner and more secure version of this code yourself. This is just for educational purposes.

```html
<!-- Firebase JS -->
<script src="https://www.gstatic.com/firebasejs/4.1.2/firebase.js"></script>
<script>
    // Initialize Firebase
    // Firebase Console --> Settings --> General
    // --> Register App --> Copy firebaseConfig
    const firebaseConfig = {
        ...
    };


    firebase.initializeApp(firebaseConfig);

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
</script>
```

# Step 8: Prepare Create Device Endpoint
Simply you can add following code snippet to your root `urls.py`:
```python
from fcm_django.api.rest_framework import FCMDeviceAuthorizedViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register('devices', FCMDeviceAuthorizedViewSet)

urlpatterns = [
    # URLs will show up at <api_root>/devices
    # DRF browsable API which lists all available endpoints
    path('api/', include(router.urls)),
    # ...
]
```

# Step 9: Sending Messages
Sending message to users is quite straightforward. First, create a `Message` object with your customized data, then send it to target devices:
```python
from firebase_admin.messaging import Message
from fcm_django.models import FCMDevice

message_obj = Message(
    data={
        "Nick" : "Mario",
        "body" : "great match!",
        "Room" : "PortugalVSDenmark"
   },
)

# You can still use .filter() or any methods that return QuerySet (from the chain)
device = FCMDevice.objects.all().first()
# send_message parameters include: message, dry_run, app
device.send_message(message_obj)
# Boom!
```

# Step 10: Important Notes
- **In the sample project login and register are not the responsibility of the notifications app.** I just put it there for the sake of simplicity! So, please be careful in your real-life projects!

- Users should login at least one time in order to receive notifications.

- These code snippets and the sample project is just a tutorial to implement FCM in django project. You should consider your use-cases and read the documentations carefully.


- Finally, if this tutorial was helpful to you, give me a star ⭐ and share it with your friends.