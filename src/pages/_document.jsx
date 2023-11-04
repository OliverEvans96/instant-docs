import { Head, Html, Main, NextScript } from 'next/document'

const gtagID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS

export default function Document() {
  return (
    <Html className="antialiased [font-feature-settings:'ss01']" lang="en">
      <Head>
        {/* Global Site Tag (gtag.js) - Google Analytics */}
        {gtagID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gtagID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtagID}', {
              page_path: window.location.pathname,
            });
          `,
              }}
            />
          </>
        )}
      </Head>
      <body className="bg-blue-1000">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
