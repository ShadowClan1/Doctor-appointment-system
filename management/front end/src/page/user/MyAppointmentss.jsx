import React, { useEffect, useState } from "react";
import AppointMentList from "../../components/AppointMentList";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/get-appointments", {
      method: "GET",
      headers: {
        'authtoken' : localStorage.getItem('token'),
        user: localStorage.getItem("userId"),
      },
    })
      .then((data) => data.json())
      .then((data) => {
       
        setAppointments(data.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const getDocName = async (idd) => {
//     const data = await fetch("http://localhost:5000/get-doc-des-from-id", {
//       method: "GET",
//       headers: {
//         id: idd,
//       },
//     })
//     .then((data) => data.json())
//     .then((data) => {
//       console.log(data.data.fName);///
// // return data.data.fName
//     })
//     .catch((err) => {
//       console.log(err);
//     });
  
 
  };

  return (
    <div>
      <div className="mt-5 ml-5 text-3xl">MAppointments : {appointments?.length === 0 && "no appointments found"}</div>

      <div className="flex flex-col mt-10 ">
      {appointments?.map((e) => {
          return (
        
          <AppointMentList key={Math.random()} e={e} />
             
          );
        })}
      </div>
      <hr />
    </div>
  );
}

export default MyAppointments;
