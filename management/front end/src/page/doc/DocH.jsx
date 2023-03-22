import React, { useEffect, useState } from 'react'

function DocH() {
    const [month, setMonth] = useState("")
    const [total, setTotal] = useState("")
    
    useEffect(() => {

fetch('http://localhost:5000/doc-earning-total',{
    method: 'GET',
    headers: {
     'docid' : localStorage.getItem('doc-userId')   
    }
}).then((data)=>data.json()).then((data)=>{
    console.log(data)
    setTotal(data.data[0].sum)
}).catch((err)=>{
    console.log(err)
})


fetch('http://localhost:5000/doc-earning-month',{
    method: 'GET',
    headers: {
     'docid' : localStorage.getItem('doc-userId')   
    }
}).then((data)=>data.json()).then((data)=>{
    console.log(data)
   setMonth(data.data[0].sum)
    

}).catch((err)=>{
    console.log(err)
})


}, [])



  return (
    <div className='w-screen' >

<div className='flex flex-row justify-evenly mt-10'>
    <div>

This month earning :
<div className='bg-black text-white h-32 w-32 text-center items-center flex justify-center text-xl rounded-xl hover:scale-105' style={{transitionDuration: '0.3s'}}> &#8377;{month}</div>
    </div>
    <div>

    Your total earning :
<div className='bg-black text-white h-32 w-32 text-center items-center flex justify-center text-xl rounded-xl hover:scale-105' style={{transitionDuration: '0.3s'}}>

&#8377; { total }


</div>
    </div>


</div>

        
    </div>
  )
}

export default DocH