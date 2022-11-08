import { createBrowserRouter } from 'react-router-dom';

import Home from '@/views/Home';
import GroupStage from '@/views/GroupStage';
import Preview from '@/views/Preview';
import Playoffs from '@/views/Playoffs';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: 'group-stage',
    element: <GroupStage />,
  },
  {
    path: 'group-stage/preview',
    element: <Preview />,
  },
  { path: 'playoffs', element: <Playoffs /> },
]);

export default router;
