import UAuth from '@uauth/js'

const uauth = new UAuth({
    clientID: "3e3d3559-8e71-41af-b9b6-466d136163b5",
    redirectUri: "http://localhost:3000",
    scope: "openid wallet"
  })

export const login = async () => {
    try {
      const authorization = await uauth.loginWithPopup()
   
      console.log(authorization)
    } catch (error) {
      console.error(error)
    }
  }

export const logout = async () => {
await uauth.logout()
console.log('Logged out with Unstoppable')
}