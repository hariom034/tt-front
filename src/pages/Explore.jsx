import { Link } from 'react-router-dom'

export default function Explore() {

  

  return (
    <div className="center-card card">
    <h1>Welcome</h1>
      <p>Welcome to the app. Please login to continue.</p>
      <div className="actions">
        <Link to="/login" className="btn">Login</Link>
      </div>
    </div>
  )
}
