"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var fs = require("fs");
var sharp = require("sharp");
var ffmpeg = require("fluent-ffmpeg");
var INPUT_DIR = "assets";
var TEMP_DIR = "temp";
var OUTPUT_DIR = "generated";
function main() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Hello there! Starting processing");
                    return [4 /*yield*/, generateFrames()];
                case 1:
                    _a.sent();
                    generateVideo();
                    return [2 /*return*/];
            }
        });
    });
}
function generateFrames() {
    return __awaiter(this, void 0, void 0, function () {
        var backgroundPath, i, leftImagePath, rightImagePath, outputFramePath, leftImage, rightImage;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Frame generation started 🏎");
                    backgroundPath = "./".concat(INPUT_DIR, "/background.png");
                    i = 1;
                    _a.label = 1;
                case 1:
                    if (!(i < 5)) return [3 /*break*/, 4];
                    leftImagePath = "./".concat(INPUT_DIR, "/left").concat(i, ".png");
                    rightImagePath = "./".concat(INPUT_DIR, "/right").concat(i, ".png");
                    outputFramePath = "./".concat(TEMP_DIR, "/output").concat(i, ".png");
                    leftImage = fs.readFileSync(leftImagePath);
                    rightImage = fs.readFileSync(rightImagePath);
                    return [4 /*yield*/, sharp(backgroundPath)
                            .composite([
                            { input: leftImage },
                            { input: rightImage },
                        ])
                            .toFile(outputFramePath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log("Frame generation finished 🏁!");
                    return [2 /*return*/];
            }
        });
    });
}
function generateVideo() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Video generation started 🏎");
            ffmpeg()
                .input("./".concat(TEMP_DIR, "/output%01d.png"))
                .loop(5)
                .fps(5)
                .on('end', function () { console.log("Video generation finished 🏁!"); })
                .save("./".concat(OUTPUT_DIR, "/output.webm"));
            return [2 /*return*/];
        });
    });
}
main();
