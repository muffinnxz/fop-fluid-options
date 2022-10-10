import React from 'react'
import UAuth from '@uauth/js'
import { Button } from "@nextui-org/react";
import { useState } from 'react';

// this config has to be completely match when congig a provider
const uauth = new UAuth({
  clientID: "3e3d3559-8e71-41af-b9b6-466d136163b5",
  redirectUri: "http://localhost:3000",
  scope: "openid wallet"
})

const UDlogin = () => {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const login = async () => {
      try {
        const authorization = await uauth.loginWithPopup()
        console.log(`address:${authorization.idToken.wallet_address} login`)
        setIsConnected(true)
        setAddress(authorization.idToken.wallet_address)
      } catch (error) {
        console.error(error)
      }
    }

  const logout = async () => {
      await uauth.logout()
      setIsConnected(false)
      setAddress(null)
      console.log('Logged out with Unstoppable')
      }
  return (
    <div>
        <div>
          {isConnected && <div>{address}</div>}
        </div>
        <div className='flex'>
            {!isConnected ? <Button size="sm" flat bordered color="success" onPress={login}>log in</Button> :
            <Button size="sm" flat bordered color="success" onPress={logout}>log out</Button> }
        </div>
    </div>
  )
}

export default UDlogin