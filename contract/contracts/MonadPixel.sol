// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MonadPixel {
    uint256 private constant GRID_SIZE = 10;
    uint256 private constant PRICE = 0.001 ether;

    struct Pixel {
        string color;
        address owner;
    }

    // 存储所有像素信息
    mapping(uint256 => mapping(uint256 => Pixel)) private pixels;

    // 事件
    event PixelMinted(uint256 x, uint256 y, address owner);
    event PixelUpdated(uint256 x, uint256 y, string color, address owner);
    event PixelInfo(uint256 x, uint256 y, string color, address owner);

    // 购买格子
    function mint(uint256 x, uint256 y, string memory color) public payable {
        require(x < GRID_SIZE && y < GRID_SIZE, "Coordinates out of bounds");
        require(msg.value >= PRICE, "Insufficient payment");
        require(pixels[x][y].owner == address(0), "Pixel already minted");

        pixels[x][y] = Pixel(color, msg.sender);
        emit PixelMinted(x, y, msg.sender);
        emit PixelInfo(x, y, color, msg.sender);
    }

    // 设置格子颜色
    function paint(uint256 x, uint256 y, string memory color) public {
        require(x < GRID_SIZE && y < GRID_SIZE, "Coordinates out of bounds");
        require(pixels[x][y].owner == msg.sender, "Not the owner");

        pixels[x][y].color = color;
        emit PixelUpdated(x, y, color, msg.sender);
        emit PixelInfo(x, y, color, msg.sender);
    }

    // 获取格子信息
    function getPixel(uint256 x, uint256 y) public view returns (string memory color, address owner) {
        require(x < GRID_SIZE && y < GRID_SIZE, "Coordinates out of bounds");
        return (pixels[x][y].color, pixels[x][y].owner);
    }

    // 获取所有格子信息
    function getAllPixels() public view returns (Pixel[10][10] memory) {
        Pixel[10][10] memory result;
        for (uint256 x = 0; x < GRID_SIZE; x++) {
            for (uint256 y = 0; y < GRID_SIZE; y++) {
                result[x][y] = pixels[x][y];
            }
        }
        return result;
    }

    // 打印所有格子信息
    function printAllPixels() public {
        for (uint256 x = 0; x < GRID_SIZE; x++) {
            for (uint256 y = 0; y < GRID_SIZE; y++) {
                emit PixelInfo(x, y, pixels[x][y].color, pixels[x][y].owner);
            }
        }
    }

    // 提取合约余额
    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
