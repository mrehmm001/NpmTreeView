import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { NPMSearchPage } from './pages/SearchPage'
import { NPMTreeViewPage } from './pages/NPMTreeViewPage'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function App() {
  const queryClient = new QueryClient()
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<NPMSearchPage />} />
            <Route path="/npm-tree-view/:packageName?/:version?" element={<NPMTreeViewPage />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </div>
  )
}

export default App
