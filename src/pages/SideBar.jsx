import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {userLogout} from '../api/authApi'

export default function SideBar() {
  // const { logout } = useAuthStore();

  // const handleLogout = async () => {
  //   try {
  //     const res = await userLogout();
  //     if (res.status === 200) {
  //       logout();
  //       console.log("Logout successful");
  //     } else{
  //       console.error("Logout failed with status:", res.status);
  //     }
  //   } catch (err) {
  //     console.error("Error logging out:", err);
  //   }
  // }

  return (
    <div className="SideBar">
      
    </div>
  )
}
