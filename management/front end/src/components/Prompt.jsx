import React, { useContext } from 'react'
import Context1 from './context/Context1'

function Prompt() {
    const {prompt, setPrompt} = useContext(Context1)
  return (
    <>
   {prompt.display && <div className='absolute top-0 right-0 left-0 bottom-0 flex flex-col items-center justify-center bg-white bg-opacity-20'>
    <div className='bg-white h-24 w-64 ouline outline oultine-1 relative'>
        <button className='absolute top-0 right-0' onClick={()=>{
 setPrompt({display : false, message: "", button: ""})


        }} >close </button>  
<div>{prompt.message}</div>
<button>{prompt.button}</button>

    </div>
    </div>}
    </>
  )
}

export default Prompt