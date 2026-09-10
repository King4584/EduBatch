import React from 'react';
import { BrowserRouter } from 'react-router-dom';


export const App: React.FC = () => {
  return (
    <BrowserRouter>
        <div className="App">
            <h1>Welcome to EduBatch</h1>
        </div>
    </BrowserRouter>
  )
}


export default App;