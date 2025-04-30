"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import detectEthereumProvider from "@metamask/detect-provider";
import { MonadPixel, MonadPixelABI } from "../contracts/MonadPixel";

const GRID_SIZE = 10;
const PIXEL_SIZE = 20;
const GRID_GAP = 2;
const CONTAINER_SIZE =
  GRID_SIZE * PIXEL_SIZE + (GRID_SIZE - 1) * GRID_GAP + GRID_GAP * 2; // 218px

// 合约地址配置
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x123..."; // 替换为你的合约地址

// 添加 MetaMask 类型定义
declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>("");
  const [contract, setContract] = useState<MonadPixel | null>(null);
  const [pixels, setPixels] = useState<Array<{ color: string; owner: string }>>(
    Array(GRID_SIZE * GRID_SIZE).fill({ color: "#FFFFFF", owner: "" })
  );
  const [selectedPixel, setSelectedPixel] = useState<number | null>(null);
  const [color, setColor] = useState<string>("#000000");

  useEffect(() => {
    const init = async () => {
      try {
        // 检测以太坊提供者
        const provider = await detectEthereumProvider();
        if (!provider) {
          console.error("Please install MetaMask!");
          return;
        }

        // 请求账户访问
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);

        // 初始化合约
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await ethersProvider.getSigner();
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
          MonadPixelABI,
          signer
        ) as unknown as MonadPixel;

        setContract(contract);

        // 监听事件
        contract.on("PixelMinted", (x, y, owner) => {
          console.log("Pixel minted:", { x, y, owner });
        });

        contract.on("PixelUpdated", (x, y, color, owner) => {
          console.log("Pixel updated:", { x, y, color, owner });
        });

        contract.on("PixelInfo", (x, y, color, owner) => {
          console.log("Pixel info:", { x, y, color, owner });
        });

        // 加载初始像素数据
        loadPixels(contract);
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    init();

    // 清理事件监听器
    return () => {
      if (contract) {
        contract.removeAllListeners("PixelMinted");
        contract.removeAllListeners("PixelUpdated");
        contract.removeAllListeners("PixelInfo");
      }
    };
  }, []);

  const loadPixels = async (contract: MonadPixel) => {
    if (!contract) return;

    try {
      const allPixels = await contract.getAllPixels();
      console.log("allPixels", allPixels);
      const newPixels = Array(GRID_SIZE * GRID_SIZE).fill({
        color: "#FFFFFF",
        owner: "",
      });

      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          const index = y * GRID_SIZE + x;
          const pixel = allPixels[x][y];
          console.log("pixel", pixel);
          console.log("pixel", pixel.color);
          newPixels[index] = {
            color: pixel.color || "#FFFFFF",
            owner: pixel.owner,
          };
        }
      }

      console.log("newPixels", newPixels);
      setPixels(newPixels);
    } catch (error) {
      console.error("Error loading pixels:", error);
    }
  };

  const handlePixelClick = async (index: number) => {
    setSelectedPixel(index);
  };

  const handleMint = async () => {
    if (!selectedPixel || !color) return;

    try {
      // 检查 MetaMask 是否已安装
      if (!window.ethereum) {
        alert("请安装 MetaMask 钱包");
        return;
      }

      // 请求账户访问
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length === 0) {
        alert("请先连接 MetaMask 钱包");
        return;
      }

      // 获取合约实例
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
        MonadPixelABI,
        signer
      ) as unknown as MonadPixel;

      // 调用 mint 函数，传入坐标和颜色
      const tx = await contract.mint(
        selectedPixel % GRID_SIZE,
        Math.floor(selectedPixel / GRID_SIZE),
        color,
        {
          value: ethers.parseEther("0.001"),
        }
      );

      await tx.wait();
      alert("像素铸造成功！");

      // 更新像素数据
      const pixelData = await contract.getPixel(
        selectedPixel % GRID_SIZE,
        Math.floor(selectedPixel / GRID_SIZE)
      );
      const newPixels = pixels.map((pixel, index) => {
        if (index === selectedPixel) {
          pixel.color = pixelData.color;
          pixel.owner = pixelData.owner;
        }

        return pixel;
      });

      setPixels(newPixels);
    } catch (error) {
      console.error("铸造失败:", error);
      alert("铸造失败，请重试");
    }
  };

  const handlePaint = async () => {
    if (!contract || selectedPixel === null) return;

    try {
      const signer = await provider?.getSigner();
      if (!signer) {
        console.error("No signer available");
        return;
      }

      console.log("signer", signer);

      const contractWithSigner = contract.connect(signer) as MonadPixel;
      const x = selectedPixel % GRID_SIZE;
      const y = Math.floor(selectedPixel / GRID_SIZE);

      const tx = await contractWithSigner.paint(x, y, color);
      await tx.wait();
      await loadPixels(contract);
    } catch (error) {
      console.error("Error painting pixel:", error);
    }
  };

  const printAllPixels = async () => {
    if (!contract) return;
    try {
      await contract.printAllPixels();
    } catch (error) {
      console.error("Error printing pixels:", error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Monad Pixel Universe</h1>

        <div className="mb-8">
          <p className="text-lg">Connected Account: {account}</p>
        </div>

        <div className="mb-4">
          <button
            onClick={printAllPixels}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Print All Pixels
          </button>
        </div>

        <div
          className="grid grid-cols-10 gap-[2px] mb-8 bg-gray-200 p-[2px] mx-auto"
          style={{
            width: `${CONTAINER_SIZE}px`,
            height: `${CONTAINER_SIZE}px`,
          }}
        >
          {pixels?.map((pixel, index) => (
            <div
              key={index}
              className="cursor-pointer"
              style={{
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                backgroundColor: pixel.color,
                minWidth: `${PIXEL_SIZE}px`,
                minHeight: `${PIXEL_SIZE}px`,
              }}
              onClick={() => handlePixelClick(index)}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-[20px] h-[20px] p-0 cursor-pointer"
              style={{
                padding: 0,
                border: "none",
                backgroundColor: "transparent",
              }}
            />
            <div className="space-x-4">
              <button
                onClick={handleMint}
                disabled={selectedPixel === null}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mint (0.001 ETH)
              </button>
              <button
                onClick={handlePaint}
                disabled={selectedPixel === null}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Paint
              </button>
            </div>
          </div>
          {selectedPixel !== null && (
            <>
              <p>Selected Pixel: {selectedPixel}</p>
              <p>Owner: {pixels[selectedPixel].owner}</p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
