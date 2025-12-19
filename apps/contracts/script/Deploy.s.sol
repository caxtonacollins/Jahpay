// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {RampAggregator} from "../src/RampAggregator.sol";
import {FeeCollector} from "../src/FeeCollector.sol";

contract DeployScript is Script {
    // Contract addresses will be set during deployment
    address public rampAggregator;
    address public feeCollector;
    
    // Roles
    address public defaultAdmin;
    address public pauser;
    
    // Environment variables
    string private constant RPC_URL = "https://forno.celo.org";
    
    function run() external {
        // Get deployer address from private key
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        defaultAdmin = vm.envAddress("DEFAULT_ADMIN");
        pauser = vm.envAddress("PAUSER");
        
        require(defaultAdmin != address(0), "DEFAULT_ADMIN not set");
        require(pauser != address(0), "PAUSER not set");
        
        console.log("Deploying contracts with the following parameters:");
        console.log("Network: Celo Mainnet");
        console.log("Deployer: ", vm.addr(deployerPrivateKey));
        console.log("Default Admin: ", defaultAdmin);
        console.log("Pauser: ", pauser);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy FeeCollector (takes no constructor parameters)
        console.log("\nDeploying FeeCollector...");
        FeeCollector feeCollectorContract = new FeeCollector();
        feeCollector = address(feeCollectorContract);
        console.log("FeeCollector deployed to:", feeCollector);
        
        // Deploy RampAggregator
        console.log("\nDeploying RampAggregator...");
        RampAggregator rampAggregatorContract = new RampAggregator(
            pauser,       // Backend signer
            feeCollector  // Fee collector address
        );
        rampAggregator = address(rampAggregatorContract);
        console.log("RampAggregator deployed to:", rampAggregator);
        
        // Transfer ownership of FeeCollector to RampAggregator
        console.log("\nSetting RampAggregator as fee collector owner...");
        feeCollectorContract.transferOwnership(defaultAdmin);  // Transfer to default admin instead of contract
        
        vm.stopBroadcast();
        
        console.log("Deployment complete!");
        console.log("Contract Addresses:");
        console.log("RampAggregator:", rampAggregator);
        console.log("FeeCollector:  ", feeCollector);
        
    }
}
