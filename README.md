# DocsPlus - Enhanced Google Docs Clone

A powerful alternative frontend for Google Docs with enhanced features including advanced document management, tagging, categorization, and collaboration tools.

## Features

### 🚀 Core Features
- **Google Docs Integration**: Seamless connection with Google Docs API
- **Enhanced Document Management**: Advanced filtering, tagging, and categorization
- **Real-time Collaboration**: Built on Convex for real-time updates
- **Smart Organization**: Categories, tags, priorities, and custom metadata
- **Advanced Search**: Full-text search across documents and metadata
- **Document Analytics**: Word count, reading time, and usage statistics

### 📊 Enhanced Features
- **Document Versioning**: Track changes and maintain version history
- **Smart Tagging**: Organize documents with custom tags and categories
- **Priority Management**: Set document priorities (low, medium, high)
- **Status Tracking**: Track document status (draft, review, final)
- **Due Date Management**: Set and track document deadlines
- **Star System**: Mark important documents for quick access
- **Archive System**: Archive old documents while keeping them accessible

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Dark/Light Mode**: Automatic theme switching
- **Advanced Filters**: Filter by category, tags, status, priority, and more
- **Quick Actions**: Star, archive, and open documents with one click
- **Document Stats**: View word count, reading time, and modification dates

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (real-time database and serverless functions)
- **Authentication**: Convex Auth with Google OAuth
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **API Integration**: Google Docs API, Google Drive API

## Getting Started

### Prerequisites

1. **Google Cloud Console Setup**:
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google Docs API and Google Drive API
   - Create OAuth 2.0 credentials (Web application)
   - Add authorized redirect URIs: `http://localhost:3000/auth/google/callback`

2. **Convex Setup**:
   - Sign up at [Convex](https://convex.dev/)
   - Create a new project

### Installation

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd docsplus
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Configure Environment Variables**:
   ```env
   # Convex (will be set automatically)
   CONVEX_DEPLOYMENT=
   NEXT_PUBLIC_CONVEX_URL=

   # Google OAuth
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Start Development**:
   ```bash
   npm run dev
   ```

   This will:
   - Start the Next.js development server
   - Start the Convex development backend
   - Open the Convex dashboard
   - Run the setup script for authentication

5. **Access the Application**:
   - Open [http://localhost:3000](http://localhost:3000)
   - Sign up/Sign in with email and password
   - Connect your Google account to access your documents

## Project Structure

```
├── app/                          # Next.js app directory
│   ├── auth/google/callback/     # Google OAuth callback
│   ├── page.tsx                  # Main dashboard
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── DocumentCard.tsx          # Document display card
│   ├── DocumentGrid.tsx          # Document grid layout
│   ├── DocumentFilters.tsx       # Filtering interface
│   └── GoogleAuthButton.tsx      # Google authentication
├── convex/                       # Convex backend
│   ├── schema.ts                 # Database schema
│   ├── google.ts                 # Google API integration
│   ├── documents.ts              # Document management
│   ├── auth.ts                   # Authentication
│   └── http.ts                   # HTTP routes
├── lib/                          # Utility functions
│   └── utils.ts                  # Helper functions
└── README.md                     # This file
```

## Key Features Explained

### Document Management
- **Automatic Sync**: Documents are automatically synced from Google Drive
- **Enhanced Metadata**: Add tags, categories, priorities, and custom fields
- **Smart Organization**: Filter and search across all metadata
- **Quick Actions**: Star, archive, and open documents with one click

### Real-time Collaboration
- **Live Updates**: Changes sync in real-time across all connected clients
- **Conflict Resolution**: Built-in conflict resolution for concurrent edits
- **Presence Indicators**: See who's currently viewing/editing documents

### Advanced Search & Filtering
- **Full-text Search**: Search document titles, content, and metadata
- **Multi-criteria Filtering**: Filter by tags, categories, status, priority
- **Saved Filters**: Save frequently used filter combinations
- **Smart Suggestions**: Auto-complete for tags and categories

### Analytics & Insights
- **Document Statistics**: Word count, reading time, modification history
- **Usage Analytics**: Track document access and collaboration patterns
- **Productivity Metrics**: Monitor writing progress and team collaboration

## API Integration

### Google Docs API
- **Document Access**: Read and write Google Docs content
- **Real-time Sync**: Sync changes between Google Docs and DocsPlus
- **Batch Operations**: Efficiently handle multiple document operations

### Convex Backend
- **Real-time Database**: Store enhanced metadata and user preferences
- **Serverless Functions**: Handle API calls and business logic
- **Authentication**: Secure user authentication and authorization

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue on GitHub or contact the development team.

---

**DocsPlus** - Enhancing your Google Docs experience with powerful organization and collaboration tools.