import type { NextPage } from 'next';
import Head from 'next/head';

import OrderBookWidget from '../components/orderbook/OrderBookWidget';
import ErrorBoundary from '../components/common/ErrorBoundary';

const Home: NextPage = () => {

  return (
    <div>
      <Head>
        <title>Order Book</title>
        <meta name="description" content="Responsive Order Book" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <ErrorBoundary>
          <OrderBookWidget />
        </ErrorBoundary>
      </main>

    </div>
  )
}

export default Home
