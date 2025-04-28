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
      const ethereumProvider = await detectEthereumProvider();
      if (ethereumProvider) {
        // 检查是否是 MetaMask
        if (!ethereumProvider.isMetaMask) {
          console.error("Please use MetaMask wallet");
          return;
        }

        // @ts-ignore - MetaMask provider is compatible with Eip1193Provider
        const provider = new ethers.BrowserProvider(ethereumProvider);
        setProvider(provider);

        // Request account access
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        // Initialize contract
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MonadPixelABI,
          provider
        ) as unknown as MonadPixel;
        setContract(contract);

        // Load initial pixel data
        loadPixels();
      }
    };

    init();
  }, []);

  const loadPixels = async () => {
    if (!contract) return;

    const newPixels = [...pixels];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        try {
          const pixel = await contract.getPixel(x, y);
          const index = y * GRID_SIZE + x;
          newPixels[index] = {
            color: pixel.color || "#FFFFFF",
            owner: pixel.owner,
          };
        } catch (error) {
          // Pixel not minted yet
          const index = y * GRID_SIZE + x;
          newPixels[index] = { color: "#FFFFFF", owner: "" };
        }
      }
    }
    setPixels(newPixels);
  };

  const handlePixelClick = (index: number) => {
    setSelectedPixel(index);
  };

  const handleMint = async () => {
    if (!contract || selectedPixel === null) return;

    const x = selectedPixel % GRID_SIZE;
    const y = Math.floor(selectedPixel / GRID_SIZE);

    try {
      const signer = await provider?.getSigner();
      if (!signer) {
        console.error("No signer available");
        return;
      }

      const contractWithSigner = contract.connect(signer) as MonadPixel;
      const tx = await contractWithSigner.mint(x, y, {
        value: ethers.parseEther("0.001"),
      });
      await tx.wait();
      await loadPixels();
    } catch (error) {
      console.error("Error minting pixel:", error);
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
      await loadPixels();
    } catch (error) {
      console.error("Error painting pixel:", error);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Monad Pixel Universe</h1>

        <div className="mb-8">
          <p className="text-lg">Connected Account: {account}</p>
        </div>

        <div
          className="grid grid-cols-10 gap-[2px] mb-8 bg-gray-200 p-[2px] mx-auto"
          style={{
            width: `${CONTAINER_SIZE}px`,
            height: `${CONTAINER_SIZE}px`,
          }}
        >
          {pixels.map((pixel, index) => (
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
