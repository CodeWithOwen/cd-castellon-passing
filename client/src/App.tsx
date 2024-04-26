import './App.css';


import React, { useEffect, useState } from 'react';

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    fetch('/json').then((res) => res.json()).then((data) => {
      console.log("data", data)
    })
  }, []);

  return <div>{count}</div>;
};
export default App;