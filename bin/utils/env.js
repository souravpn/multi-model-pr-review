"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
exports.validateApiKeys = validateApiKeys;
exports.getApiKey = getApiKey;
const dotenv = __importStar(require("dotenv"));
function loadEnv() {
    // Load from .env file if it exists
    dotenv.config();
    return {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    };
}
function validateApiKeys(keys, providers) {
    const keyMap = {
        claude: keys.ANTHROPIC_API_KEY,
        openai: keys.OPENAI_API_KEY,
        gemini: keys.GEMINI_API_KEY,
    };
    const missing = [];
    providers.forEach((provider) => {
        if (!keyMap[provider]) {
            missing.push(provider.toUpperCase());
        }
    });
    return {
        valid: missing.length === 0,
        missing,
    };
}
function getApiKey(provider) {
    const keys = loadEnv();
    switch (provider) {
        case 'claude':
            return keys.ANTHROPIC_API_KEY;
        case 'openai':
            return keys.OPENAI_API_KEY;
        case 'gemini':
            return keys.GEMINI_API_KEY;
        default:
            return undefined;
    }
}
//# sourceMappingURL=env.js.map