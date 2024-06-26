// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import TicTacToe from './components/game';
import { TttLandingPage } from './pages/ttt-landing-page';
import { ErrorPage } from './pages/error-page';
import { AccountProvider, SignIn, SignUp } from '@bb/auth-hook-lib';
import { GatewayProvider, useGateway } from '@bb/gateway-hook-lib';
import { WebsocketProvider } from '@bb/socket-hook-lib';

const router = createBrowserRouter([
  { path: '/', Component: TttLandingPage },
  { path: '/game/:id', element: <TicTacToe /> },
  { path: '/error', element: <ErrorPage /> },
  { path: '/signin', element: <SignIn /> },
  { path: '/signup', element: <SignUp /> },
]);

function GetHostForProviders() {
  const { getService, getHost } = useGateway();
  const [authHost, setAuthHost] = useState('');
  const [hostWs, setHostWs] = useState('');
  const [wsPath, setWsPath] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const ps = [
      getService(process.env.NX_AUTH_SERVICE_KEY || 'auth'),
      getService(process.env.NX_TTT_WS_KEY || 'ttt-ws-service'),
    ];

    Promise.all(ps).then(([auth, routeWs]) => {
      setAuthHost(`${getHost()}${auth.endpoint}`);
      setHostWs(`${getHost()}${routeWs.endpoint}`);
      setWsPath(routeWs.prefix || '');
      setLoading(false);
    });
  }, [getService, getHost]);

  if (loading) {
    return <div>Loading....</div>;
  }

  return (
    <AccountProvider host={authHost}>
      <WebsocketProvider
        host={hostWs}
        serviceKey={process.env.NX_TTT_WS_SERVICE_KEY || 'ttt-ws-service'}
      >
        <RouterProvider router={router} />
      </WebsocketProvider>
    </AccountProvider>
  );
}

export function App() {
  return (
    <GatewayProvider
      host={`${process.env.NX_GATEWAY_HOST}:${
        process.env.NX_GATEWAY_PORT || ''
      }`}
    >
      <GetHostForProviders />
    </GatewayProvider>
  );
}

export default App;
