import { Modal, Popover, Button, Text } from "@nextui-org/react";
import { useState } from "react";
import UDLogin from '../ud-login'
import ConnectWallet from "../ConnectButton";

const LoginButton = () => {
  const [isWalletSelected, setIsWalletSelected] = useState(false)
  const [visible, setVisible] = useState(false);
  const [isUDwalletSelected, setIsUDwalletSelected] = useState(true);

  const handler = () => setVisible(true);

  const closeHandler = () => {
    setVisible(false);
    console.log("closed");
  };

  const handleWalletSelection = (e) => {
    if (e.target.name === 'rainbow') {
      setIsUDwalletSelected(false)
    }
    setIsWalletSelected(true)
  }  
  if (!isWalletSelected) {
    return (
      <div>
        <Button auto shadow onClick={handler}>
          Choose wallet
        </Button>
      <Modal
          closeButton
          aria-labelledby="modal-title"
          open={visible}
          onClose={closeHandler}
        >
          <Modal.Header>
          <Text id="modal-title" size={18}>
            Choose wallet <Text b size={18}>
              connection
            </Text>
          </Text>
        </Modal.Header>
        <Modal.Body>
          <Button color="success" onPress={handleWalletSelection} name='rainbow'>
            <Text b size={18}>
               Rainbow kit
            </Text>  
          </Button>
          <Button onPress={handleWalletSelection} name='ud'>
            <Text b size={18}>
                UD wallet
            </Text>  
          </Button>
        </Modal.Body>
      </Modal>
      </div>
    );
  }

  if(isWalletSelected) {
    if(isUDwalletSelected) {
      return <UDLogin/>
    }
    return <ConnectWallet/>
  }
  
}

export default LoginButton