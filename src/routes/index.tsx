import { createBrowserRouter } from 'react-router-dom';

import Home from '@/views/Home';
import GroupStage from '@/views/GroupStage';
import Playoffs from '@/views/Playoffs';
import NotFound from '@/views/NotFound';
import ParticipantsTable from '@/views/ParticipantsTable';

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
  { path: 'playoffs', element: <Playoffs />, errorElement: <NotFound /> },
  { path: 'participants', element: <ParticipantsTable />, errorElement: <NotFound /> },
]);

export default router;
