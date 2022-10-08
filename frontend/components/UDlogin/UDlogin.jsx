import React from 'react'
import { login, logout } from "../../hooks/UDlogin/UD";

const UDlogin = () => {
  return (
    <div>
        <div>
            <button onClick={login}>log in</button>
            <button onClick={logout}>log out</button>
        </div>
    </div>
  )
}

export default UDlogin