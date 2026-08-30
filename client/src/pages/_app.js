import '@/styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function App({ Component, pageProps }) {
  const { initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Head>
        <title>College Complaint Management System</title>
        <meta
          name="description"
          content="Student complaint tracking platform for managing campus issues, assignments, status updates, and resolution workflows."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
