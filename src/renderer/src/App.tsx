import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';

import Home from './pages/Home';
import { ProjectsProvider } from './context/Projects';
import { PageHeaderProvider } from './context/PageHeader';
import Create from './pages/Create';
import Project from './pages/Project';
import Load from './pages/Load';

const App: React.FC = () => {

  return (<Dashboard>
    <PageHeaderProvider>
      <Navbar />
      <ProjectsProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/load" element={<Load />} />
          <Route path="/project" element={<Project />} />
        </Routes>
      </ProjectsProvider>
    </PageHeaderProvider>
  </Dashboard>
  );
}

export default App
