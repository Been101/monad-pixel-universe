import { ethers } from "hardhat";

async function main() {
  try {
    // 检查环境变量
    if (!process.env.PRIVATE_KEY) {
      throw new Error("Please set your PRIVATE_KEY in the .env file");
    }

    // 获取部署者账户
    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY);
    console.log("Deploying contracts with the account:", deployer.address);

    // 获取合约工厂
    const MonadPixel = await ethers.getContractFactory("MonadPixel");

    // 部署合约
    console.log("Deploying MonadPixel contract...");
    const monadPixel = await MonadPixel.deploy();

    // 等待部署完成
    console.log("Waiting for deployment confirmation...");
    await monadPixel.waitForDeployment();

    // 获取合约地址
    const address = await monadPixel.getAddress();
    console.log("MonadPixel deployed to:", address);

    // 输出合约地址，方便复制
    console.log("\nContract address to use in frontend:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
