import App from 'next/app';
import type { AppProps, AppContext } from 'next/app';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

MyApp.getInitialProps = async (context: AppContext) => {
  const ctx = await App.getInitialProps(context);
  return { ...ctx };
};
