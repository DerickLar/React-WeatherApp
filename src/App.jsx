import React, {useState } from 'react'
import Weather from './components/Weather';
import './index.css';

const App = () => {
  const [bgGradient, setBgGradient] = useState("linear-gradient(45deg, #80a3d6, #ddbe7c)");
  return (
    <div className='app' style={{backgroundImage: bgGradient}}>
      <Weather setBgGradient={setBgGradient}/>
    </div>
  )
}

export default App
