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
        <title>Agentflow_AI | Agentic AI Operations Automation Platform</title>
        <meta
          name="description"
          content="Autonomous multi-agent operations automation platform for enterprise visual workflows, tool orchestration, and real-time execution streaming."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
