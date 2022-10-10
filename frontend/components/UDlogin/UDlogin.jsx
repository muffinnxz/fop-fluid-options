import React from 'react'
import { Button } from "@nextui-org/react";
import { login, logout } from "../../hooks/UDlogin/UD";

const UDlogin = () => {
  return (
    <div>
        <div className='flex'>
            <Button size="sm" flat bordered color="success" onClick={login}>log in</Button>
            <Button size="sm" flat bordered color="success" onClick={logout}>log out</Button>
        </div>
    </div>
  )
}

export default UDlogin