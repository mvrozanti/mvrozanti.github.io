import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#13140d" />
        <link rel="stylesheet" href="/theme.css" />
        <script src="/theme.js" defer data-endpoint="https://api.mvr.ac/theme" data-credentials="omit" data-poll="60" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
