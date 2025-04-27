# LangGraph Next.js Template

A starter template for building chat applications using LangGraph and Next.js. This template provides a foundation for creating AI-powered chat experiences with streaming capabilities and modern UI components.

## Features

- 🚀 Built with Next.js 15.2
- 🎨 Modern UI using Radix UI components
- 🔄 Real-time message streaming
- 🌳 Conversation branching support
- 🎯 State management with LangGraph
- 🎨 Tailwind CSS for styling
- 📱 Responsive design
- 🌙 Dark mode support

## Prerequisites

Before you begin, ensure you have:

- Node.js (version 18 or higher)
- LangGraph Platform
- LangGraph Server running locally

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/langgraph-nextjs-template.git
cd langgraph-nextjs-template
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── components/     # React components
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout component
│   └── page.tsx        # Main chat interface
├── public/            # Static assets
└── package.json       # Project dependencies
```

## Key Features Explained

### Message Streaming
The template uses the `useStream()` React hook from LangGraph SDK to handle real-time message streaming. This provides:
- Automatic message chunk concatenation
- Loading states management
- Error handling

### Conversation Branching
Users can:
- Edit previous messages to create new conversation branches
- Request regeneration of AI responses
- Switch between different conversation branches

### UI Components
The template includes a comprehensive set of UI components from Radix UI:
- Dialog boxes
- Dropdowns
- Navigation menus
- Form elements
- And more...

## Configuration

The main configuration for the LangGraph connection is in the chat component:

```typescript
const thread = useStream<{ messages: Message[] }>({
  apiUrl: "http://localhost:2024",
  assistantId: "agent",
  messagesKey: "messages",
});
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

## Dependencies

Key dependencies include:
- `@langchain/langgraph-sdk` - LangGraph SDK for React
- `@langchain/core` - Core LangGraph functionality
- Next.js and React for the frontend
- Radix UI components for the interface
- TailwindCSS for styling

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- LangGraph team for the excellent SDK
- Radix UI for the component library
- Next.js team for the framework
