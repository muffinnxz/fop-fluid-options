//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAllPutOption.sol";
import {TradeablePutOption} from "./TradeablePutOption.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OptionPutFactory {
    mapping(address => address[]) public walletToPutOptions;

    address[] putOptions;

    function getPutOptions() public view returns (address[] memory) {
        return putOptions;
    }

    function getPutOptionsByWallet(address _wallet)
        public
        view
        returns (address[] memory)
    {
        return walletToPutOptions[_wallet];
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
        TradeablePutOption _option = new TradeablePutOption(
            owner,
            _name,
            _symbol,
            host,
            cfa,
            acceptedToken,
            dai
        );
        walletToPutOptions[owner].push(address(_option));
        putOptions.push(address(_option));
    }

    function changePutOptionOwner(
        address _option,
        address _from,
        address _to
    ) public {
        for (uint256 i = 0; i <= walletToPutOptions[_from].length; i++) {
            if (walletToPutOptions[_from][i] == _option) {
                walletToPutOptions[_from][i] = walletToPutOptions[_from][
                    walletToPutOptions[_from].length - 1
                ];
                walletToPutOptions[_from].pop();
                break;
            }
        }

        walletToPutOptions[_to].push(_option);
    }
}
