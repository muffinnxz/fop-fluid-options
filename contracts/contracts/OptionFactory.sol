//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {TradeableCashflowOption} from "./TradeableCashflowOption.sol";
import {TradeablePutOption} from "./TradeablePutOption.sol";

contract OptionFactory {
    mapping(address => address[]) public walletToPutOptions;
    mapping(address => address[]) public walletToCallOptions;

    address[] putOptions;
    address[] callOptions;

    function getPutOptions() public view returns(address[]){ return putOptions}
    function getCallOptions() public view returns(address[]){ return callOptions}

    function getPutOptionsByWallet(address _wallet) public view returns(address[]){ return walletToPutOptions[_wallet]}
    function getCallOptionsByWallet(address _wallet) public view returns(address[]){ return walletToCallOptions[_wallet]}


    function mintCallOption(
        address owner,
        string memory _name,
        string memory _symbol,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken,
        ERC20 dai
    ) public {
        _option = new TradeableCashflowOption(
            owner,
            _name,
            _symbol,
            host,
            cfa,
            acceptedToken,
            dai
        );
        walletToCallOptions.push(address(_option));
        callOptions.push(address(_option));
    }

    function mintPutOption(
         address owner,
        string memory _name,
        string memory _symbol,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken,
        ERC20 dai
    ) public {
        _option = new TradeablePutOption(owner,_name, _symbol,host,cfa,acceptedToken,dai);
        walletToPutOptions.push(address(_option));
        putOptions.push(address(_option));
    }


    function changePutOptionOwner(address _option,address _from, address _to) public{
         for (uint256 i = 0; i <= walletToPutOptions[_from].length; i++) {
            if (walletToPutOptions[_from][i] == _option) {
                walletToPutOptions[_from][i] = walletToPutOptions[_from][
                    walletToPutOptions[_from].length - 1
                ];
                walletToPutOptions[_from].pop();
                break;
            }
        }

        walletToPutOptions[_to].push(id);
    }

    function changeCallOptionOwner(address _option,address _from, address _to) public{
         for (uint256 i = 0; i <= walletToCallOptions[_from].length; i++) {
            if (walletToCallOptions[_from][i] == _option) {
                walletToCallOptions[_from][i] = walletToCallOptions[_from][
                    walletToCallOptions[_from].length - 1
                ];
                walletToCallOptions[_from].pop();
                break;
            }
        }

        walletToCallOptions[_to].push(id);
    }



}
