import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Context2 from './components/context/Context2';
import Login from './page/user/Login'
import Home from './page/user/Home'
import SignUp from './page/user/SignUp'
import Prompt from './components/Prompt';
import { useContext } from 'react';
import Navbar from './page/user/Narbar';
import Appointments from './page/user/Appointment';
import DocSignup from './page/doc/DocSignup';
import FindDoc from './page/user/FindDoc';
import DoctorDesc from './page/doc/DoctorDesc';
import MyAppointments from './page/user/MyAppointmentss';
import DocLogin from './page/doc/DocLogin';
import DoctorDashBoard from './page/doc/DoctorDashBoard';
import DocHome from './page/doc/DocHome';
import UserDashBoard from './page/user/UserDashBoard';
function App() {
 
  return (
    <Context2>
    <div className='w-screen relative'>

    <BrowserRouter>

  <Prompt  />
    
    <Routes>
    
    
    
    <Route path='/*' element={<UserDashBoard/>} />
    <Route path='/login' element={<Login/>} />
    <Route path='/signup' element={<SignUp/>} />
 
    <Route path='/doc-signup' element={<DocSignup/>} />
   
    <Route path='/doc-login' element={<DocLogin/>} />
    <Route path='/doc-home/*' element={<DocHome/>} />



   
    
    </Routes>
    
    
    </BrowserRouter>



    </div>
    </Context2>
  );
}

export default App;
