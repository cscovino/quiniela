import { createBrowserRouter } from 'react-router-dom';

import Home from '@/views/Home';
import GroupStage from '@/views/GroupStage';
import Preview from '@/views/Preview';
import Playoffs from '@/views/Playoffs';
import NotFound from '@/views/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
    errorElement: <NotFound />,
  },
  {
    path: 'group-stage',
    element: <GroupStage />,
    errorElement: <NotFound />,
  },
  {
    path: 'group-stage/preview',
    element: <Preview />,
    errorElement: <NotFound />,
  },
  { path: 'playoffs', element: <Playoffs />, errorElement: <NotFound /> },
]);

export default router;
