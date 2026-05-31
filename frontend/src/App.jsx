/**
 * App.jsx — Root application with React Router and global layout.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard     from './pages/Dashboard'
import Markets       from './pages/Markets'
import Crypto        from './pages/Crypto'
import News          from './pages/News'
import Opportunities from './pages/Opportunities'
import Guide         from './pages/Guide'
import Earn          from './pages/Earn'
import AutoEarn      from './pages/AutoEarn'
import JobHunter     from './pages/JobHunter'
import ContentStudio from './pages/ContentStudio'
import Tutorial      from './pages/Tutorial'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/"               element={<Dashboard />}     />
          <Route path="/markets"        element={<Markets />}        />
          <Route path="/crypto"         element={<Crypto />}         />
          <Route path="/news"           element={<News />}           />
          <Route path="/opportunities"  element={<Opportunities />}  />
          <Route path="/earn"           element={<Earn />}           />
          <Route path="/autoearn"       element={<AutoEarn />}       />
          <Route path="/guide"          element={<Guide />}          />
          <Route path="/jobs"           element={<JobHunter />}      />
          <Route path="/content"        element={<ContentStudio />}  />
          <Route path="/tutorial"       element={<Tutorial />}       />
          <Route path="*"               element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
