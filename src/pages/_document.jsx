import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    // (NOTE): Forcing dark mode here, if we later want to enable switching we can
    <Html className="dark antialiased [font-feature-settings:'ss01']" lang="en">
      <Head></Head>
      <body className="bg-blue-1000">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
