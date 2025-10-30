# Enspek Expo App

A modern, minimal React Native app built with Expo Router, TypeScript, and NativeWind for the Enspek inspection services platform.

## Features

### Client Home Screen
- **AppBar**: Clean header with notifications
- **Hero CTA**: Prominent "Create RFI" button
- **KPIs**: Open RFIs, Bids Received, Payments Due
- **Services Chips**: Quick access to Enspek service categories
- **RFIs List**: Active inspection requests with status
- **Support Card**: Help and documentation access

### Inspector Home Screen
- **AppBar**: Header with online/offline toggle
- **KPIs**: Active Jobs, Pending Bids, Rating
- **Quick Actions**: Nearby, My Bids, Upload Report
- **Nearby Jobs**: Available inspection opportunities
- **Continue Work**: Resume active inspections

## Tech Stack

- **Expo Router**: File-based navigation
- **TypeScript**: Type safety
- **NativeWind**: Tailwind CSS for React Native
- **React Query**: Data fetching and caching
- **FlashList**: High-performance lists
- **AsyncStorage**: Local data persistence

## Design System

### Color Palette
- **Background**: `#0B0B0C` (Dark)
- **Surface**: `#121214` (Card backgrounds)
- **Elevated**: `#16181A` (Raised elements)
- **Border**: `#2A2D30` (Borders and dividers)
- **Text**: `#F5F7FA` (Primary text)
- **Muted**: `#A8B0B9` (Secondary text)
- **Primary**: `#3B82F6` (Brand blue)
- **Success**: `#10B981` (Green)
- **Warning**: `#F59E0B` (Orange)
- **Danger**: `#EF4444` (Red)

### Design Principles
- Minimal, airy layouts
- Clear hierarchy with large touch targets (≥44dp)
- Subtle motion only (no heavy parallax)
- Dark-first design with accessible contrast
- High-quality card design and spacing

## Project Structure

```
app/
├── (tabs)/
│   ├── client/
│   │   └── index.tsx          # Client Home Screen
│   ├── inspector/
│   │   └── index.tsx          # Inspector Home Screen
│   └── _layout.tsx            # Tab Navigation
├── (stack)/
│   └── _layout.tsx            # Stack Navigation
├── (modals)/
│   └── _layout.tsx            # Modal Navigation
└── _layout.tsx                # Root Layout

src/
├── api/
│   ├── client.ts              # API Client with auth
│   └── hooks/
│       ├── useClient.ts       # Client API hooks
│       └── useInspector.ts    # Inspector API hooks
```

## API Integration

The app integrates with the Enspek ERP API:
- **Base URL**: `https://erpbeta.enspek.com/api`
- **Authentication**: JWT Bearer tokens
- **Endpoints**: Client requests, nearby jobs, bids, payments

### Key API Hooks
- `useClientRequests()`: Fetch client RFIs and stats
- `useNearbyJobs()`: Fetch available inspection jobs
- `useMyBids()`: Inspector bid management
- `usePendingInvoices()`: Payment tracking

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Run on device**:
   ```bash
   npm run ios     # iOS
   npm run android # Android
   ```

## Navigation

The app uses Expo Router for file-based navigation:

- **Tabs**: Main app sections (Client/Inspector)
- **Stack**: Detail screens (RFI/Job details)
- **Modals**: Overlay screens (Upload, Filters)

## State Management

- **React Query**: Server state and caching
- **AsyncStorage**: Local authentication tokens
- **React State**: Component-level UI state

## Performance

- **FlashList**: Optimized list rendering
- **React Query**: Intelligent caching and background updates
- **Pull-to-refresh**: Manual data refresh
- **Skeleton loading**: Smooth loading states

## Accessibility

- High contrast dark theme
- Large touch targets (44dp minimum)
- Clear visual hierarchy
- Screen reader friendly

## Future Enhancements

- Real-time notifications
- Offline support
- Push notifications
- Advanced filtering
- Video calling integration
- File upload progress
- Biometric authentication

## Development Notes

- All API calls include proper error handling
- Safe optional access prevents crashes
- TypeScript ensures type safety
- NativeWind provides consistent styling
- FlashList optimizes list performance
