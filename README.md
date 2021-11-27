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
Here are the package's repository on Github and its documentation:
- [Github Repo](https://github.com/xtrinch/fcm-django)
- [Documentation](https://fcm-django.readthedocs.io/en/latest/)

# Step 4: Install the `firebase-admin` Package
The `firebase-admin` is the official library from firebase that communicates with its services.
```bash
pip install firebase-admin
```

# Step 5: Add `fcm-django` and `firebase-admin` to Django Project


