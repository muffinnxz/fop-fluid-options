import React from 'react'
import UAuth from '@uauth/js'
import { Button, Tooltip } from "@nextui-org/react";
import { useState } from 'react';
import { ethers } from 'ethers';
import { Avatar } from '@nextui-org/react';
import { Text } from "@nextui-org/react";

// this config has to be completely match when congig a provider
const uauth = new UAuth({
  clientID: "1cf2e143-b474-43df-a001-1a68d77b8a57",
  redirectUri: "https://fop-fluid-options.herokuapp.com/",
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

  
  if (!isConnected) {

    return <div className='m-2'>
      <Button size="sm" color="primary" onPress={login}>
        <Text color='white' weight="bold">
          UD connect
        </Text>
        </Button>
    </div>
  }

  const addressCheckSummed = ethers.utils.getAddress(address);
  console.log(addressCheckSummed)
  return (
    <div className='flex bg-blue-200 shadow-md p-2 rounded-lg space-x-1'>
          <Avatar 
              text="UD" 
              color="primary" 
              textColor="white" />
          <Tooltip content={"log out ?"} rounded color="primary" placement='bottom'>
            <Button auto flat onPress={logout}>
              {`${addressCheckSummed.slice(0,5)}...${address.slice(-4,addressCheckSummed.length)}`}
            </Button>
          </Tooltip>
    </div>

  )
}

export default UDlogin