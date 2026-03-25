"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultOptions = createDefaultOptions;
const types_1 = require("../types");
function createDefaultOptions() {
    return {
        claude: {
            enabled: true,
            model: types_1.DEFAULT_MODELS.claude,
        },
        openai: {
            enabled: true,
            model: types_1.DEFAULT_MODELS.openai,
        },
        gemini: {
            enabled: true,
            model: types_1.DEFAULT_MODELS.gemini,
        },
        consolidate: true,
        timeout: 120,
        maxFileCharsPerModel: 2000,
        verbose: false,
    };
}
//# sourceMappingURL=options.js.map