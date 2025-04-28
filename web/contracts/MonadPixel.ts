import { Contract, ContractTransactionResponse } from "ethers";

export interface MonadPixel extends Contract {
  mint: (
    x: number,
    y: number,
    overrides?: { value: bigint }
  ) => Promise<ContractTransactionResponse>;
  paint: (
    x: number,
    y: number,
    color: string
  ) => Promise<ContractTransactionResponse>;
  getPixel: (
    x: number,
    y: number
  ) => Promise<{
    exists: boolean;
    owner: string;
    color: string;
    tokenId: bigint;
  }>;
}

export const MonadPixelABI = [
  "function mint(uint256 x, uint256 y) public payable",
  "function paint(uint256 x, uint256 y, string memory color) public",
  "function getPixel(uint256 x, uint256 y) public view returns (tuple(bool exists, address owner, string color, uint256 tokenId))",
  "event PixelMinted(uint256 x, uint256 y, address owner, uint256 tokenId)",
  "event PixelUpdated(uint256 x, uint256 y, string color, address owner)",
];

export const MonadPixelBytecode = "0x..."; // 这里需要填入编译后的合约字节码
