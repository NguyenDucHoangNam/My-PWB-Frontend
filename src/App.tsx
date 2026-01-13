import { useState } from 'react'
import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import LogoComponent from './component/logo/LogoComponent'
import { useDynamicFavicon } from './pages/UseDynamicFavicon'

function App() {
  const [count, setCount] = useState(0)
  useDynamicFavicon();
  return (
    <>
      <div>
        <a href="https://producer-workbench-media.s3.ap-southeast-1.amazonaws.com/logo/logo1.PNG" target="_blank">
          {/* <img src={viteLogo} className="logo" alt="Vite logo" /> */}
          <LogoComponent/>
        </a>
        <a href="https://producer-workbench-media.s3.ap-southeast-1.amazonaws.com/logo/logo1.PNG" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
