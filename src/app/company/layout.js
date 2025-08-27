'use client';

import { SubscriptionProvider } from '@/context/SubscriptionContext';

export default function RootLayout({ children }) {
    return (
        <SubscriptionProvider> {/* Ensure this is wrapped around the app */}
            {children}
        </SubscriptionProvider>
    );
}
