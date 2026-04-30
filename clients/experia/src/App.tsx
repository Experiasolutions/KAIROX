import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/quiz" element={<Quiz />} />
    </Routes>
  )
}

export default App
