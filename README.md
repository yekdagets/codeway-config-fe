# Config Management Frontend

This is the frontend application for the Config Management system. It allows users to manage configuration parameters through a user-friendly interface, including country-specific configurations.

## System Functionality

- **Pages**:
  - `Sign In`: Authenticate users using Firebase.
  - `Home`: Manage configurations, including country-specific configurations.

- **Authentication**:
  - Firebase Authentication is used for user login.

- **API Integration**:
  - Communicates with the backend REST API to perform CRUD operations on configurations.

- **Country-Specific Configurations**:
  - Users can manage country-specific configurations by selecting a country from the dropdown and adding/editing configurations specific to that country.

## Deployment Steps

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yekdagets/config-management-frontend.git
   cd config-management-frontend

**2.Install dependencies:**
npm install

**3.Set up environment variables:**
Create a .env file in the root directory with the following content:
VUE_APP_API_BASE_URL=https://your-backend-app.herokuapp.com/api
VUE_APP_FIREBASE_API_KEY=your-firebase-api-key
VUE_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
VUE_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
VUE_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
VUE_APP_FIREBASE_APP_ID=your-firebase-app-id
VUE_APP_MEASUREMENT_ID=your-firebase-measurement-id

**4.Run the application locally:**
npm run serve

**5.Build the project:**
npm run build

**6.Deploy to Heroku:**
heroku create your-frontend-app-name
heroku config:set VUE_APP_API_BASE_URL=https://your-backend-app.herokuapp.com/api
heroku config:set VUE_APP_FIREBASE_API_KEY=your-firebase-api-key
heroku config:set VUE_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
heroku config:set VUE_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
heroku config:set VUE_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
heroku config:set VUE_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
heroku config:set VUE_APP_FIREBASE_APP_ID=your-firebase-app-id
heroku config:set VUE_APP_MEASUREMENT_ID=your-firebase-measurement-id
git push heroku main


