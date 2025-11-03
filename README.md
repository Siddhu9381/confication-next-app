# Speech Analysis Application

A comprehensive speech analysis platform built with Next.js that provides real-time speech recording, detailed analytics, and personalized feedback to help users improve their speaking skills.

## 🎯 Features

### Authentication & User Management
- **Secure Authentication** - Firebase Auth with email/password and Google OAuth
- **User Registration & Login** - Complete user onboarding flow
- **Session Management** - Persistent user sessions with token-based authentication

### Speech Recording & Analysis
- **Real-time Speech Recording** - High-quality audio capture with visual feedback
- **Advanced Speech Analytics** - Comprehensive analysis across multiple dimensions:
  - **Content Analysis** - Structure, clarity, and organization
  - **Delivery Analysis** - Pace, pauses, and engagement
  - **Language Analysis** - Fluency, grammar, and sentence structure

### Detailed Reporting
- **Interactive Score Cards** - Visual progress indicators with detailed breakdowns
- **Personalized Feedback** - Specific recommendations for improvement
- **Practice Drills** - Targeted exercises based on analysis results
- **Historical Reports** - Track progress over time

### User Experience
- **Responsive Design** - Optimized for desktop and mobile devices
- **Dark/Light Mode** - Customizable theme preferences
- **Intuitive Navigation** - Clean, user-friendly interface
- **Real-time Feedback** - Instant analysis and recommendations

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Audio Processing**: Web Audio API
- **State Management**: React Context API
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Firebase project with Authentication and Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd my-nextjs-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google providers)
   - Enable Firestore Database
   - Get your Firebase configuration

4. **Configure Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Update Firebase Configuration**
   Replace the configuration in `lib/firebase.js` with your Firebase project details.

### Development

1. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

2. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication pages
│   ├── register/
│   ├── session/           # Speech recording interface
│   ├── session-report/    # Analysis results
│   └── feedback/          # User feedback system
├── components/            # Reusable UI components
│   ├── Header.tsx         # Navigation components
│   ├── ScoreCard.tsx      # Analytics display
│   ├── TabSection.tsx     # Report tabs
│   └── ExpandableCard.tsx # Interactive cards
├── contexts/              # React Context providers
│   └── AuthContext.tsx    # Authentication state
└── lib/                   # Utility functions
    └── firebase.js        # Firebase configuration
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication Providers**
   - Enable Email/Password authentication
   - Enable Google OAuth provider
   - Configure authorized domains

2. **Firestore Database**
   - Create database in production mode
   - Set up security rules for user data protection

3. **Security Rules Example**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. **Connect your repository to Vercel**
   - Visit [Vercel](https://vercel.com)
   - Import your GitHub repository

2. **Configure environment variables**
   - Add all Firebase environment variables in Vercel dashboard
   - Set production Firebase configuration

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Alternative Deployment Options

- **Netlify**: Connect repository and configure build settings
- **Firebase Hosting**: Use Firebase CLI for deployment
- **AWS Amplify**: Full-stack deployment with backend services

## 📊 Features Overview

### Speech Analysis Dimensions

#### Content Analysis
- **Structure**: Organization and logical flow
- **Clarity**: Message clarity and coherence
- **Engagement**: Audience engagement techniques

#### Delivery Analysis  
- **Pace**: Speaking speed and rhythm
- **Pauses**: Well-timed and natural pauses
- **Energy**: Vocal energy and enthusiasm

#### Language Analysis
- **Fluency**: Smooth speech delivery
- **Grammar**: Correct grammar usage
- **Vocabulary**: Appropriate word choice

## 🔮 Roadmap

- [ ] Advanced AI-powered speech analysis
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Mobile app development
- [ ] Integration with video conferencing platforms

---

Built with ❤️ using Next.js and Firebase