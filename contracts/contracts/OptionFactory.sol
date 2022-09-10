//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import {TradeableCallOption} from "./TradeableCallOption.sol";
import {ISuperToken, IConstantFlowAgreementV1, ISuperfluid} from "./RedirectAllPutOption.sol";
import {TradeablePutOption} from "./TradeablePutOption.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OptionFactory {
    mapping(address => address[]) public walletToPutOptions;
    mapping(address => address[]) public walletToCallOptions;

    address[] putOptions;
    address[] callOptions;

    function getPutOptions() public view returns (address[] memory) {
        return putOptions;
    }

    function getCallOptions() public view returns (address[] memory) {
        return callOptions;
    }

    function getPutOptionsByWallet(address _wallet)
        public
        view
        returns (address[] memory)
    {
        return walletToPutOptions[_wallet];
    }

    function getCallOptionsByWallet(address _wallet)
        public
        view
        returns (address[] memory)
    {
        return walletToCallOptions[_wallet];
    }

    function mintCallOption(
        address owner,
        string memory _name,
        string memory _symbol,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken,
        ERC20 dai
    ) public {
        TradeableCallOption _option = new TradeableCallOption(
            owner,
            _name,
            _symbol,
            host,
            cfa,
            acceptedToken,
            dai
        );
        walletToCallOptions[owner].push(address(_option));
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

    function changeCallOptionOwner(
        address _option,
        address _from,
        address _to
    ) public {
        for (uint256 i = 0; i <= walletToCallOptions[_from].length; i++) {
            if (walletToCallOptions[_from][i] == _option) {
                walletToCallOptions[_from][i] = walletToCallOptions[_from][
                    walletToCallOptions[_from].length - 1
                ];
                walletToCallOptions[_from].pop();
                break;
            }
        }

        walletToCallOptions[_to].push(_option);
    }
}
